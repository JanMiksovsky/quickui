evaluateControlJson = (json, logicalParent) ->
  for firstKey of json
    break
  return json  if firstKey isnt "html" and firstKey isnt "control"
  reservedKeys = {}
  reservedKeys[firstKey] = true
  stripped = copyExcludingKeys(json, reservedKeys)
  properties = evaluateControlJsonProperties(stripped, logicalParent)
  control = undefined
  if firstKey is "html"
    html = json.html
    html = "<" + html + ">"  if /^\w+$/.test(html)
    control = Control(html).properties(properties)
  else
    control = Control.getClass(json.control).create(properties)
  if json.id
    logicalParentClass = logicalParent.constructor
    elementReference = "$" + json.id
    unless logicalParentClass::[elementReference]
      logicalParentClass::[elementReference] = (elements) ->
        @referencedElement elementReference, elements
    logicalParent.referencedElement elementReference, control
  control
evaluateControlJsonProperties = (json, logicalParent) ->
  json = content: json  unless $.isPlainObject(json)
  properties = {}
  for key of json
    properties[key] = evaluateControlJsonValue(json[key], logicalParent)
  properties
evaluateControlJsonValue = (value, logicalParent) ->
  result = undefined
  if $.isArray(value)
    result = []
    i = 0

    while i < value.length
      item = value[i]
      itemValue = evaluateControlJsonValue(item, logicalParent)
      itemValue = itemValue[0]  if itemValue instanceof jQuery
      result.push itemValue
      i++
  else if $.isPlainObject(value)
    result = evaluateControlJson(value, logicalParent)
  else
    result = value
  result
copyExcludingKeys = (obj, excludeKeys) ->
  copy = {}
  for key of obj
    copy[key] = obj[key]  unless excludeKeys[key]
  copy
isElementInDocument = (element) ->
  !!document.body and (document.body is element or $.contains(document.body, element))
findMethodImplementation = (methodFn, classFn) ->
  prototype = classFn::
  for key of prototype
    if prototype[key] is methodFn
      methodInherited = (if classFn.superclass then prototype[key] is classFn.superclass::[key] else false)
      unless methodInherited
        return (
          classFn: classFn
          fnName: key
        )
  (if classFn.superclass then findMethodImplementation(methodFn, classFn.superclass) else null)
$.fn.control = (arg1, arg2) ->
  if arg1 is `undefined`
    $cast = Control(this).cast(jQuery)
    (if ($cast instanceof Control) then $cast else null)
  else if $.isFunction(arg1)
    controlClass = arg1
    properties = arg2
    controlClass.createAt this, properties
  else
    Control(this).cast().properties arg1

$.expr[":"].control = (elem) ->
  controlClass = Control(elem)._controlClass()
  (if controlClass then controlClass is Control or controlClass:: instanceof Control else false)

Control = $.sub()
$.extend Control,
  chain: ->
    args = arguments
    sideEffectFn = undefined
    if $.isFunction(args[args.length - 1])
      args = [].slice.call(arguments)
      sideEffectFn = args.pop()
    functionNames = []
    functionParams = []
    i = 0
    length = args.length

    while i < length
      parts = arguments[i].split("/")
      functionNames[i] = parts.shift()
      functionParams[i] = parts
      i++
    chain = (value) ->
      result = this
      i = 0
      length = functionNames.length

      while i < length
        fn = result[functionNames[i]]
        params = functionParams[i]
        params = params.concat([ value ])  if value isnt `undefined` and i is length - 1
        if fn is `undefined`
          message = "Control class \"" + @className() + "\" tried to chain to an undefined getter/setter function \"" + functionNames[i] + "\"."
          throw message
        result = fn.apply(result, params)
        i++
      if value is `undefined`
        result
      else
        sideEffectFn.call this, value  if sideEffectFn
        this

  classHierarchy: "Control"
  className: "Control"
  create: (properties) ->
    @createAt null, properties

  createAt: (target, properties) ->
    defaultTarget = "<" + @::tag + "/>"
    $controls = undefined
    oldContents = undefined
    if target is null
      $controls = this(defaultTarget)
      oldContents = []
    else
      $controls = this(target)
      oldContents = $controls._significantContents()
      existingTag = $controls[0].nodeName.toLowerCase()
      $controls = @_replaceElements($controls, this(defaultTarget))  if existingTag isnt @::tag.toLowerCase() and existingTag isnt "body"
    properties = content: properties  if typeof properties is "string"
    $controls._controlClass(this).addClass(@classHierarchy).render().propertyVector("content", oldContents).properties properties
    $controls.generic true  if @genericIfClassIs is @className
    i = 0
    length = $controls.length

    while i < length
      $controls.nth(i).initialize()
      i++
    $controls

  getClass: (value) ->
    classFn = undefined
    if value is null or value is ""
      classFn = null
    else if $.isFunction(value)
      classFn = value
    else if $.isPlainObject(value)
      classFn = Control.subclass(value)
    else
      classFn = window[value]
      throw "Unable to find a class called \"" + value + "\"."  unless classFn
    classFn

  isControl: (element) ->
    Control(element).control() isnt `undefined`

  iterator: (fn) ->
    ->
      args = arguments
      iteratorResult = undefined
      @eachControl (index, $control) ->
        result = fn.apply($control, args)
        if result isnt `undefined`
          iteratorResult = result
          false

      (if (iteratorResult isnt `undefined`) then iteratorResult else this)

  property: (sideEffectFn, defaultValue, converterFunction) ->
    backingPropertyName = "_property" + Control.property._symbolCounter++
    (value) ->
      result = undefined
      if value is `undefined`
        result = @data(backingPropertyName)
        (if (result is `undefined`) then defaultValue else result)
      else
        @eachControl (index, $control) ->
          result = (if (converterFunction) then converterFunction.call($control, value) else value)
          $control.data backingPropertyName, result
          sideEffectFn.call $control, result  if sideEffectFn

  subclass: (json) ->
    superclass = this
    newClass = superclass.sub()
    delete newClass._initializeQueue

    if json
      if json.className
        newClass.extend
          className: json.className
          classHierarchy: json.className + " " + superclass.classHierarchy
      newClass.genericIfClassIs = json.className  if json.genericSupport
      inherited = copyExcludingKeys(json,
        className: true
        genericSupport: true
        prototype: true
        tag: true
      )
      jQuery.extend newClass::, json::,
        inherited: inherited
        tag: json.tag
    else
      newClass.className = `undefined`
      newClass::inherited = null
    newClass

  _checkForElementInsertion: (event) ->
    callbacksReady = []
    i = 0
    while i < Control._elementInsertionCallbacks.length
      element = Control._elementInsertionCallbacks[i].element
      if isElementInDocument(element)
        callbacksReady = callbacksReady.concat(Control._elementInsertionCallbacks[i])
        Control._elementInsertionCallbacks.splice i, 1
      else
        i++
    Control._stopListeningForElementInsertion()  if Control._elementInsertionCallbacks.length is 0
    i = 0
    while i < callbacksReady.length
      element = callbacksReady[i].element
      $control = Control(element).control()
      callback = callbacksReady[i].callback
      callback.call $control
      i++

  _controlClassData: "_controlClass"
  _elementInsertionCallbacks: []
  _listeningForElementInsertion: false
  _mutationEvents: ->
    not $.browser.msie or parseInt($.browser.version) >= 9

  _replaceElements: ($existing, $replacement) ->
    ids = $existing.map((index, element) ->
      $(element).prop "id"
    )
    $new = $replacement.replaceAll($existing)
    $new.each (index, element) ->
      id = ids[index]
      $(element).prop "id", ids[index]  if id and id.length > 0

    $new

  _startListeningForElementInsertion: ->
    if Control._mutationEvents()
      if document.body
        jQuery("body").on "DOMNodeInserted", Control._checkForElementInsertion
        Control._listeningForElementInsertion = true
      else unless Control._deferredElementInsertionListening
        jQuery("body").ready ->
          Control._checkForElementInsertion()
          Control._startListeningForElementInsertion()  if Control._elementInsertionCallbacks.length > 0
          Control._deferredElementInsertionListening = false

        Control._deferredElementInsertionListening = true
    else
      self = this
      Control._elementInsertionInterval = window.setInterval(->
        self._checkForElementInsertion()
      , 10)

  _stopListeningForElementInsertion: ->
    if Control._mutationEvents()
      jQuery("body").off "DOMNodeInserted", Control._checkForElementInsertion
      Control._listeningForElementInsertion = false
    else
      window.clearInterval Control._elementInsertionInterval
      Control._elementInsertionInterval = null

$.extend Control.property,
  bool: (sideEffectFn, defaultValue) ->
    Control.property sideEffectFn, defaultValue, convertToBool = (value) ->
      String(value) is "true"

  class: (sideEffectFn, defaultValue) ->
    Control.property sideEffectFn, defaultValue, Control.getClass

  date: (sideEffectFn, defaultValue) ->
    Control.property sideEffectFn, defaultValue, convertToDate = (value) ->
      (if (value instanceof Date or not value?) then value else new Date(Date.parse(value)))

  integer: (sideEffectFn, defaultValue) ->
    Control.property sideEffectFn, defaultValue, parseInt

  _symbolCounter: 0

$.extend Control::,
  applyClass: (classes, value) ->
    (if (value is `undefined`) then @hasClass(classes) else @toggleClass(classes, String(value) is "true"))

  cast: (defaultClass) ->
    defaultClass = defaultClass or @constructor
    setClass = undefined
    i = 0
    length = @length

    while i < length
      $element = @nth(i)
      elementClass = $element._controlClass() or defaultClass
      setClass = elementClass  if setClass is `undefined` or setClass:: instanceof elementClass
      i++
    setClass = setClass or defaultClass
    setClass this

  checkForSizeChange: ->
    @trigger "sizeChanged"  if @_updateSavedSize()
    this

  class: (classList) ->
    (if (classList is `undefined`) then @attr("class") else @toggleClass(classList, true))

  className: ->
    @constructor.className

  content: (value) ->
    if value is `undefined`
      $element = @nth(0)
      result = undefined
      if $element.isInputElement()
        result = $element.val()
      else
        resultContainsStrings = false
        result = $element.contents().map((index, item) ->
          if item.nodeType is 3
            resultContainsStrings = true
            item.nodeValue
          else
            item
        )
        result = result[0]  if resultContainsStrings and result.length is 1
      result
    else
      array = (if (arguments.length > 1) then arguments else (if value instanceof jQuery then value.get() else (if $.isArray(value) then value else [ value ])))
      @each (index, element) ->
        $element = Control(element)
        if $element.isInputElement()
          $element.val value
        else
          $element.children().detach()
          $element.empty().append.apply $element, array

  culture: (culture) ->
    cultureDataMember = "_culture"
    controlCulture = undefined
    if culture is `undefined`
      controlCulture = @data(cultureDataMember)
      controlCulture or (if window.Globalize then Globalize.culture() else null)
    else
      controlCulture = (if (typeof culture is "string") then Globalize.findClosestCulture(culture) else culture)
      @data cultureDataMember, controlCulture
      this

  eachControl: (fn) ->
    i = 0
    length = @length

    while i < length
      $control = @nth(i).control()
      result = fn.call($control, i, $control)
      break  if result is false
      i++
    this

  generic: Control.property.bool((generic) ->
    @applyClass "generic", generic
  )
  genericIfClassIs: (classFn) ->
    @eachControl (index, $control) ->
      $control.generic true  if $control.constructor is classFn and $control.generic() is `undefined`

  id: (id) ->
    @attr "id", id

  initialize: ->

  inDocument: (callback) ->
    if callback is `undefined`
      return false  if @length is 0
      i = 0

      while i < @length
        return false  unless isElementInDocument(this[i])
        i++
      true
    else
      callbacks = []
      i = 0

      while i < @length
        $element = @nth(i)
        element = $element[0]
        if isElementInDocument(element)
          callback.call $element
        else
          callbacks.push
            element: element
            callback: callback
        i++
      if callbacks.length > 0
        Control._elementInsertionCallbacks = callbacks.concat(Control._elementInsertionCallbacks)
        Control._startListeningForElementInsertion()  unless Control._listeningForElementInsertion
      this

  isInputElement: ->
    inputTags = [ "input", "select", "textarea" ]
    (if @length is 0 then false else ($.inArray(this[0].nodeName.toLowerCase(), inputTags) >= 0))

  json: (json, logicalParent) ->
    logicalParent = logicalParent or this
    i = 0
    length = @length

    while i < length
      control = @nth(i)
      properties = evaluateControlJsonProperties(json, logicalParent.nth(i))
      control.properties properties
      i++

  nth: (index) ->
    @constructor this[index]

  referencedElement: (key, elements) ->
    if elements is `undefined`
      elements = []
      i = 0
      length = @length

      while i < length
        element = $(this[i]).data(key)
        elements.push element  if element isnt `undefined`
        i++
      $result = Control(elements).cast()
      $result.prevObject = this
      $result
    else
      i = 0
      length = @length

      while i < length
        $(this[i]).data key, elements[i]
        i++
      this

  render: render = ->
    classFn = @constructor
    if classFn isnt Control
      superclass = classFn.superclass
      superclass(this).render().json @inherited, this
    this

  properties: (properties) ->
    for propertyName of properties
      if this[propertyName] is `undefined`
        message = "Tried to set undefined property " + @className() + "." + propertyName + "()."
        throw message
      value = properties[propertyName]
      this[propertyName].call this, value
    this

  propertyVector: (propertyName, values) ->
    propertyFn = this[propertyName]
    if values is `undefined`
      results = []
      i = 0
      length = @length

      while i < length
        results[i] = propertyFn.call(@nth(i))
        i++
      results
    else
      i = 0
      length1 = @length
      length2 = values.length

      while i < length1 and i < length2
        propertyFn.call @nth(i), values[i]  unless not values[i]
        i++
      this

  inherited: null
  style: (style) ->
    @attr "style", style

  tabindex: (tabindex) ->
    @attr "tabindex", tabindex

  transmute: (newClass, preserveContent, preserveClasses, preserveEvents) ->
    classFn = Control.getClass(newClass)
    oldContents = (if preserveContent then @_significantContents() else null)
    oldClasses = (if preserveClasses then @prop("class") else null)
    @empty().removeClass().removeData()
    @off()  unless preserveEvents
    $controls = classFn.createAt(this)
    $controls.propertyVector "content", oldContents  if oldContents
    $controls.removeClass("Control").addClass(oldClasses).addClass "Control"  if oldClasses
    $controls

  tag: "div"
  quickui: "0.8.9"
  visibility: (value) ->
    (if (value is `undefined`) then @is(":visible") else @toggle(String(value) is "true"))

  _controlClass: (classFn) ->
    (if classFn then @data(Control._controlClassData, classFn) else @data(Control._controlClassData))

  _significantContents: ->
    contents = Control(this).propertyVector("content")
    significantContents = $.map(contents, (content) ->
      return content  if $.trim(content).length > 0  if typeof content is "string"
      i = 0
      length = content.length

      while i < length
        c = content[i]
        if typeof c is "string"
          return content  if $.trim(c).length > 0
        else return content  if c.nodeType isnt 8
        i++
      null
    )
    significantContents

  _super: _super = ->
    callerFn = (if (_super and _super.caller) then _super.caller else arguments.callee.caller)
    return `undefined`  unless callerFn
    superFn = callerFn._superFn
    unless superFn
      classInfo = findMethodImplementation(callerFn, @constructor)
      if classInfo
        classFn = classInfo.classFn
        callerFnName = classInfo.fnName
        superFn = classFn.superclass::[callerFnName]
        callerFn._superFn = superFn
    (if superFn then superFn.apply(this, arguments) else `undefined`)

  _updateSavedSize: ->
    previousSize = @data("_size") or {}
    size =
      height: @height()
      width: @width()

    return false  if size.height is previousSize.height and size.width is previousSize.width
    @data "_size", size
    true

$.event.special.layout =
  add: (handleObj) ->
    layout = $.event.special.layout
    layout._trackedElements = layout._trackedElements.add(this)
    Control(this).inDocument ->
      handler = handleObj.handler
      event = new jQuery.Event("layout")
      handler.call this, event

  handle: (event) ->
    control = Control(this)
    return  unless control.inDocument()
    return  unless control.checkForSizeChange()
    event.handleObj.handler.apply this, arguments

  setup: ->
    layout = $.event.special.layout
    unless layout._trackingResizeEvent
      $(window).resize ->
        layout._windowResized()

      layout._trackingResizeEvent = true

  teardown: ->
    $.event.special.layout._trackedElements = $.event.special.layout._trackedElements.not(this)

  _trackedElements: $()
  _windowResized: ->
    $.event.special.layout._trackedElements.trigger "layout"

window.Control = Control