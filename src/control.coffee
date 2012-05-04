###
QuickUI
Version 0.8.9
Modular web control framework
http:#quickui.org/

Copyright (c) 2009-2012 Jan Miksovsky
Licensed under the MIT license.
###

  
###
Utilities
###

###
Return a copy of the given object, skipping the indicated keys.
Keys should be provided as a dictionary with true values. E.g., the dictionary
{ a: true, b: true } specifies that keys "a" and "b" should be excluded
from the result.
###
copyExcludingKeys = (obj, excludeKeys) ->
  copy = {}
  for key of obj
    copy[key] = obj[key]  unless excludeKeys[key]
  copy
  
###
Return true if the document body contains the indicated element, or if
if the element *isthe document body.
###
isElementInDocument = (element) ->
  !!document.body and (document.body is element or $.contains(document.body, element))
  
###
Find which class implements the given method, starting at the given
point in the class hierarchy and walking up.

At each level, we enumerate all class prototype members to search for a
function identical to the method we're looking for.

Returns the class that implements the function, and the name of the class
member that references it. Returns null if the class was not found.
###
findMethodImplementation = (methodFn, classFn) ->
    # See if this particular class defines the function.
  prototype = classFn::
  for key of prototype
    if prototype[key] is methodFn
            # Found the function implementation.
            # Check to see whether it's really defined by this class,
            # or is actually inherited.
      methodInherited = (if classFn.superclass then prototype[key] is classFn.superclass::[key] else false)
      unless methodInherited
                # This particular class defines the function.
        return (
          classFn: classFn
          fnName: key
        )
    # Didn't find the function in this class.
    # Look in parent classes (if any).
  (if classFn.superclass then findMethodImplementation(methodFn, classFn.superclass) else null)
    
###
QuickUI "control" jQuery extension to create and manipulate
controls via a regular jQuery instance.

Usage:

$( element ).control()
  Returns the control that was created on that element.

$( element ).control( { content: "Hello" } );
  Sets the content property of the control at this element.

$( element ).control( MyControlClass );
  Creates a new instance of MyControlClass around the element(s).

$( element ).control( MyControlClass, { content: "Hello" } );
  Creates new control instance(s) and sets its (their) content property.

NOTE: the forms that create new control instances may return a jQuery array
of elements other than the ones which were passed in. This occurs whenever
the control class wants a different root tag than the tag on the supplied
array of elements.
###
$.fn.control = (arg1, arg2) ->
  if arg1 is `undefined`
        # Return the controls bound to these element(s), cast to the correct class.
    $cast = Control(this).cast(jQuery)
    (if ($cast instanceof Control) then $cast else null)
  else if $.isFunction(arg1)
        # Create a new control around the element(s).
    controlClass = arg1
    properties = arg2
    controlClass.createAt this, properties
  else
        # Set properties on the control(s).
    Control(this).cast().properties arg1

###
Selector for ":control": reduces the set of matched elements to the ones
which are controls.
 
With this, $foo.is(":control") returns true if at least one element in $foo
is a control, and $foo.filter(":control") returns just the controls in $foo.
###
$.expr[":"].control = (elem) ->
  controlClass = Control(elem)._controlClass()
  (if controlClass then controlClass is Control or controlClass:: instanceof Control else false)

###
Control subclass of jQuery.
This is used as the base class for all QuickUI controls.
###
Control = $.sub()
$.extend Control,

  ###
  Given an array of functions, repeatedly invoke them as a chain.
  
  This function allows the compact definition of getter/setter functions
  for Control classes that are delegated to aspects of the control or
  elements within its DOM.
  
  For example:
  
      MyControl.prototype.foo = Control.chain( "$foo", "content" );
  
  will create a function foo() on all MyControl instances that sets or gets
  the content of the elements returned by the element function $foo(),
  which in turn likely means any element with id "#foo" inside the control.
  
  The parameters to chain are the names of functions that are invoked in
  turn to produce the result. The last parameter may be an optional side
  effect function that will be invoked whenever the chain function is
  invoked as a setter.
  
  The function names passed as parameters may also define an optional
  string-valued parameter that will be passed in. So chain( "css/display" )
  creates a curried setter/getter function equivalent to css("display", value ).
  ###
  chain: ->
        # Check for a side effect function as last parameter.
    args = arguments
    sideEffectFn = undefined
    if $.isFunction(args[args.length - 1])
            # Convert arguments to a real array in order to grab last param.
      args = [].slice.call(arguments)
      sideEffectFn = args.pop()
        # Identify function names and optional parameters.
    functionNames = []
    functionParams = []
    i = 0
    length = args.length

    while i < length
            # Check for optional parameter.
      parts = arguments[i].split("/")
      functionNames[i] = parts.shift()
      functionParams[i] = parts
      i++
        # Generate a function that executes the chain.
    chain = (value) ->
      result = this
      i = 0
      length = functionNames.length

      while i < length
        fn = result[functionNames[i]]
        params = functionParams[i]
                    # Invoke last function as setter.
        params = params.concat([ value ])  if value isnt `undefined` and i is length - 1
        if fn is `undefined`
          message = "Control class \"" + @className() + "\" tried to chain to an undefined getter/setter function \"" + functionNames[i] + "\"."
          throw message
        result = fn.apply(result, params)
        i++
      if value is `undefined`
                # Chain invoked as getter.
        result
      else
                    # Carry out side effect.
        sideEffectFn.call this, value  if sideEffectFn
        this

  ###
  A class' "classHierarchy" member reflects the names of all classes
  in its class hierarchy, from most specific to most general class.
  This member is automatically built by Control.subclass().
  
  Example: If a control class Foo has superclasses Bar and Control,
  this member will be "Foo Bar Control".
  ###
  classHierarchy: "Control"

  ###
  Each control class knows its own name.
  We'd prefer to use "name" for this, but something (the browser? jQuery?)
  creates a "name" property on jQuery instances that's unchangeable.
  ###
  className: "Control"
    
  ###
  Create an instance of this control class around a specific element (or
  multiple instances around a set of elements).
  ###
  create: (properties) ->
    @createAt null, properties

  ###
  Create instance(s) of this control class around the given target(s).
  
  If the tag associated with the given class differs from the tag on the
  target(s), a new element (or set of elements) will be created and used to
  replace the existing element(s). E.g., if one creates a button-based
  control on a div, the exiting div will get replaced with a button element.
  This will work for any existing element other than the document body,
  which will of course be left as a body element. Event handlers or CSS
  classes on the old element(s) will not be transferred to the new one(s).
  
  If properties are supplied, they will be set on the new controls.
  If the properties argument is a single string, it will be passed to
  the controls' content() property.
  ###
  createAt: (target, properties) ->
    defaultTarget = "<" + @::tag + "/>"
        # Instantiate the control class.
    $controls = undefined
    oldContents = undefined
    if target is null
            # Create a default element.
      $controls = this(defaultTarget)
      oldContents = []
    else
            # Grab the existing contents of the target elements.
      $controls = this(target)
      oldContents = $controls._significantContents()
      existingTag = $controls[0].nodeName.toLowerCase()
                # Tags don't match; replace with elements with the right tag.
      $controls = @_replaceElements($controls, this(defaultTarget))  if existingTag isnt @::tag.toLowerCase() and existingTag isnt "body"
            # Plain string becomes control content
    properties = content: properties  if typeof properties is "string"
            # Save a reference to the controls' class.

            # Apply all class names in the class hierarchy as style names.
            # This lets the element pick up styles defined by those classes.

            # Render controls as DOM elements.

            # Pass in the target's old contents (if any).

            # Set any requested properties.
    $controls._controlClass(this).addClass(@classHierarchy).render().propertyVector("content", oldContents).properties properties
        # Apply generic style if class supports that.
    $controls.generic true  if @genericIfClassIs is @className
        # Tell the controls they're ready.
    i = 0
    length = $controls.length

    while i < length
      $controls.nth(i).initialize()
      i++
    $controls

  ###
  Given a value, returns a corresponding class:
  - A string value returns the global class with that string name.
  - A function value returns that function as is.
  - An object value returns a new anonymous class created from that JSON.
  ###
  getClass: (value) ->
    classFn = undefined
    if value is null or value is ""
            # Special cases used to clear class-valued properties.
      classFn = null
    else if $.isFunction(value)
      classFn = value
    else if $.isPlainObject(value)
      classFn = Control.subclass(value)
    else
      classFn = window[value]
      throw "Unable to find a class called \"" + value + "\"."  unless classFn
    classFn

    # Return true if the given element is a control.
  isControl: (element) ->
    Control(element).control() isnt `undefined`

  ###
  Return a function that applies another function to each control in a
  jQuery array.
  
  If the inner function returns a defined value, then the function is
  assumed to be a property getter, and that result is return immediately.
  Otherwise, "this" is returned to permit chaining.
  ###
  iterator: (fn) ->
    ->
      args = arguments
      iteratorResult = undefined
      @eachControl (index, $control) ->
        result = fn.apply($control, args)
        if result isnt `undefined`
          iteratorResult = result
          false
      if iteratorResult != `undefined`
        iteratorResult # Getter
      else
        this # Method or setter
  
  ###
  Create a subclass of this class.
  ###
  subclass: (json) ->
    superclass = this
    newClass = superclass.sub()
        # $.sub uses $.extend to copy properties from super to subclass, so
        # we have to blow away class properties that shouldn't have been copied.
    delete newClass._initializeQueue

    if json
      if json.className
        newClass.extend
          className: json.className
          classHierarchy: json.className + " " + superclass.classHierarchy
      newClass.genericIfClassIs = json.className  if json.genericSupport        
      ###
           Create a copy of the JSON that doesn't include the reserved keys
           (which go on the class). We use the remaining JSON values as
           "inherited" on the class' prototype for use by render(). 
      ###
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
            # Clear copied or inherited values.
      newClass.className = `undefined`
      newClass::inherited = null
    newClass

  ###
  An element may have been added to the document; see if it's a control that's
  waiting to be notified of that via Control.prototype.inDocument().
  ### 
  _checkForElementInsertion: (event) ->
    callbacksReady = []
    i = 0
    while i < Control._elementInsertionCallbacks.length
      element = Control._elementInsertionCallbacks[i].element
      if isElementInDocument(element)
                # The element has been inserted into the document. Move it
                # into the list of callbacks which we can now invoke.
        callbacksReady = callbacksReady.concat(Control._elementInsertionCallbacks[i])
                # Now remove it from the pending list. We remove it from the list
                # *beforewe invoke the callback -- because the callback
                # itself might do DOM manipulations that trigger more DOM
                # mutation events.
        Control._elementInsertionCallbacks.splice i, 1
      else
        i++
            # No more elements to wait for.
    Control._stopListeningForElementInsertion()  if Control._elementInsertionCallbacks.length is 0
    i = 0
    while i < callbacksReady.length
      element = callbacksReady[i].element
      $control = Control(element).control()
      callback = callbacksReady[i].callback
      callback.call $control
      i++

  ###
  The name of the data element used to store a reference to an element's control class.
  ###
  _controlClassData: "_controlClass"
    # Controls waiting (via an inDocument call) to be added to the body.
  _elementInsertionCallbacks: []
    # True if Control is currently listening for DOM insertions.
  _listeningForElementInsertion: false
    # True if we can rely on DOM mutation events to detect DOM changes. 
  _mutationEvents: ->
        # Since the only QuickUI-supported browser that doesn't support
        # mutation events is IE8, we just look for that. If need be, we
        # could programmatically detect support using something like
        # Diego Perini's NWMatcher approach.
    not $.browser.msie or parseInt($.browser.version) >= 9

  ###
  Replace the indicated existing element(s) with copies of the indicated
  replacement element. During this operation, preserve element IDs.
  
  This is used if, say, we need to convert a bunch of divs to buttons.
  ###
  _replaceElements: ($existing, $replacement) ->
        # Gather the existing IDs.
    ids = $existing.map((index, element) ->
      $(element).prop "id"
    )
    $new = $replacement.replaceAll($existing)
        # Put IDs onto new elements.
    $new.each (index, element) ->
      id = ids[index]
      $(element).prop "id", ids[index]  if id and id.length > 0

    $new

  ###
  Start listening for insertions of elements into the document body.
  
  On modern browsers, we use the DOMNodeInserted mutation event (which, as of
  7/2011, had better browser coverage than DOMNodeinDocument).
  Mutation events are slow, but the only way to reliably detect insertions
  that are created outside the document and then later added in. The events
  aren't used when we can avoid it, and the event is unbound once all known
  pending controls have been added.
   
  IE8 doesn't support mutation events, so we have to set up our own polling
  interval to check to see whether a control has been added. Again, we avoid
  doing this at all costs, but this apparently is the only way we can
  determine when elements have been added in IE8.
  ###    
  _startListeningForElementInsertion: ->
    if Control._mutationEvents()
            # Use mutation events.
      if document.body
                # The document's ready for us to wire up mutation event handlers.
        jQuery("body").on "DOMNodeInserted", Control._checkForElementInsertion
        Control._listeningForElementInsertion = true
      else unless Control._deferredElementInsertionListening
                # We can't sink events yet, so things get messy. We have to
                # queue up a ready() callback that can wire up the events.
        jQuery("body").ready ->
                    # Check pending callbacks.
          Control._checkForElementInsertion()
                    # If any callbacks are left, start listening.
          Control._startListeningForElementInsertion()  if Control._elementInsertionCallbacks.length > 0
          Control._deferredElementInsertionListening = false

                # Make note that we've already deferred, so we don't do it again.
        Control._deferredElementInsertionListening = true
    else
            # Use timer
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


###
Control instance methods.
###
$.extend Control::,

  ###
  Get/set whether the indicated class(es) are applied to the elements.
  This effectively combines $.hasClass() and $.toggleClass() into a single
  getter/setter.
  ###
  applyClass: (classes, value) ->
    (if (value is `undefined`) then @hasClass(classes) else @toggleClass(classes, String(value) is "true"))

  ###
  Return the array of elements cast to their closest JavaScript class ancestor.
  E.g., a jQuery $(".foo") selector might pick up instances of control classes
  A, B, and C. If B and C are subclasses of A, this will return an instance of
  class A. So Control(".foo").cast() does the same thing as A(".foo"), but without
  having to know the type of the elements in advance.
  
  The highest ancestor class this will return is the current class, even for plain
  jQuery objects, in order to allow Control methods (like content()) to be applied to
  the result.
  ###
  cast: (defaultClass) ->
    defaultClass = defaultClass or @constructor
    setClass = undefined
    i = 0
    length = @length

    while i < length
      $element = @nth(i)
      elementClass = $element._controlClass() or defaultClass
      setClass = elementClass  if setClass is `undefined` or ( setClass:: ) instanceof elementClass
      i++
    setClass = setClass or defaultClass  # In case "this" had no elements.
    setClass this

  ###
  The set of classes on the control's element.
  If no value is supplied, this gets the current list of classes.
  If a value is supplied, the specified class name(s) are *added*
  to the element. This is useful for allowing a class to be added
  at design-time to an instance, e.g., <Foo class="bar"/>. The
  resulting element will end up with "bar" as a class, as well as
  the control's class hierarchy: <div class="Foo Control bar">.
  ###
  class: (classList) ->
    (if (classList is `undefined`) then @attr("class") else @toggleClass(classList, true))

  ###
  The name of the control's class.
  This shorthand is useful for quickly getting the name in the debugger
  when one is holding a reference to a control.
  ###
  className: ->
    @constructor.className

  ###
  Get/set the content of an HTML element.
  
  Like $.contents(), but you can also set content, not just get it.
  You can set content to a single item, an array of items, or a set
  of items listed as parameters. Setting multiple items at a time
  is an important case in compiled QuickUI markup. Input elements
  are also handled specially: their value (val) is their content.
  
  This function attempts to return contents in a canonical form, so
  that setting contents with common parameter types is likely to
  return those values back in the same form. If there is only one
  content element, that is returned directly, instead of returning
  an array of one element. If the element being returned is a text node,
  it is returned as a string.
  
  Usage:
   $element.content("Hello")              # Simple string
   $element.content(["Hello", "world"])   # Array
   $element.content("Hello", "world")     # Parameters
   Control("<input type='text'/>").content("Hi")   # Sets text value
  
  This is used as the default implementation of a control's content
  property. Controls can override this behavior.
  ###
  content: (value) ->
    if value is `undefined`
            # Getting contents. Just process first element.
      $element = @nth(0)
      result = undefined
      if $element.isInputElement()
                # Return input element value.
        result = $element.val()
      else
                # Return HTML contents in a canonical form.
        resultContainsStrings = false
        result = $element.contents().map((index, item) ->
          if item.nodeType is 3
                        # Return text as simple string
            resultContainsStrings = true
            item.nodeValue
          else
            item
        )
                    # Return the single string instead of an array.
        result = result[0]  if resultContainsStrings and result.length is 1
      result
    else
            # Setting contents.
            
            # Cast arguments to an array.
            
                 # set of parameters
                 
                 # convert jQuery object to array 
                 
                 # single array parameter
                 # singleton parameter
      array = (if (arguments.length > 1) then arguments else (if value instanceof jQuery then value.get() else (if $.isArray(value) then value else [ value ])))
      @each (index, element) ->
        $element = Control(element)
        if $element.isInputElement()
                    # Set input element value.
          $element.val value
        else
                    # Set HTML contents.

                    # We're about to blow away the contents of the element
                    # via $empty(), but the new content value might actually
                    # already be deeper in the element's existing content.
                    # To ensure that data, etc., get preserved, first detach
                    # the existing contents.
          $element.children().detach()
                    # Use apply() to feed array to $.append() as params.
          $element.empty().append.apply $element, array

  ###
  The control's culture.
  If jQuery Globalize is present, this defaults to the current culture.
  This can be overridden on a per-control basis, e.g., for testing purposes.
  
  Control classes can override this method to respond immediately to an
  explicit change in culture. They should invoke their base class' culture
  method, do whatever work they want (if the culture parameter is defined),
  then return the result of the base class call.
  ###
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

  ###
  Execute a function once for each control in the array.
  Inside the function, "this" refers to the single control.
  ###
  eachControl: (fn) ->
    i = 0
    length = @length

    while i < length
      $control = @nth(i).control()
      result = fn.call($control, i, $control)
      break  if result is false
      i++
    this

    # Allow controls have an element ID specified on them in markup.
  id: (id) ->
    @attr "id", id

  ###
  Invoked when the control has finished rendering.
  Subclasses can override this to perform their own post-rendering work
  (e.g., wiring up events).
  ###    
  initialize: ->

  ###
  A (new) control is asking to have a callback invoked when the control
  has been inserted into the document body. This is useful because
  the initialize event is often invoked before the control has actually
  been added to the document, and therefore doesn't have height or width,
  doesn't have any externally-imposed styles applied to it, etc.
  
  If the control is already in the document, the callback is executed
  immediately.
  
  If no callback function is supplied, this returns true if all controls
  are in the document, and false if not.
  
  Callbacks will be invoked in reserve document order to ensure that
  the callback of a child will be invoked before the callback of a parent.
  This lets the parent proceed knowing that its children have already had
  the chance to set themselves up.
  ###
  inDocument: (callback) ->
    if callback is `undefined`
                # The empty condition is defined as being *notin the document.
      return false  if @length is 0
            # See if controls are in document.
      i = 0

      while i < @length
        return false  unless isElementInDocument(this[i])                     # At least one control is not in the document.

        i++
            # All controls are in the document.
      true
    else
            # Invoke callback immediately for controls already in document,
            # queue a callback for those which are not.
      callbacks = []
      i = 0

      while i < @length
        $element = @nth(i)
        element = $element[0]
        if isElementInDocument(element)
                    # Element already in document
          callback.call $element
        else
                    # Add element to the list we're waiting to see inserted.
          callbacks.push
            element: element
            callback: callback
        i++
      if callbacks.length > 0
        Control._elementInsertionCallbacks = callbacks.concat(Control._elementInsertionCallbacks)
        Control._startListeningForElementInsertion()  unless Control._listeningForElementInsertion
      this

  ###
  Return true if the (first) element is an input element (with a val).
  Note that buttons are not considered input elements, because typically
  when one is setting their contents, one wants to set their label, not
  their "value".
  ###
  isInputElement: ->
    inputTags = [ "input", "select", "textarea" ]
    (if @length is 0 then false else ($.inArray(this[0].nodeName.toLowerCase(), inputTags) >= 0))

  ###
  Apply the indicated JSON to the control. Each key in the JSON will
  invoke the corresponding setter function in a function chain. E.g.,
  the JSON dictionary
  
       {
           foo: "Hello",
           bar: "World"
       }
  
  will invoke this.foo("Hello").bar("World").
  
  If a dictionary value is itself a JSON object, it will be reconstituted
  into HTML, or controls, or an array.
  
  This is similar to properties(), but that function doesn't attempt any
  processing of the values.
  
  The logicalParent parameter is intended for internal use only.
  ###
  json: (json, logicalParent) ->
    logicalParent = logicalParent or this
    i = 0
    length = @length

    while i < length
      control = @nth(i)
      properties = evaluateControlJsonProperties(json, logicalParent.nth(i))
      control.properties properties
      i++

  ###
  Experimental function like eq, but faster because it doesn't manipulate
  the selector stack.
  ###
  nth: (index) ->
    @constructor this[index]

  ###
  Save or retrieve an element associated with the control using the
  given key. For a collection of controls, the getter maps the collection
  to a collection of the corresponding elements.
  ###
  referencedElement: (key, elements) ->
    if elements is `undefined`
            # Map a collection of control instances to the given element
            # defined for each instance.
      elements = []
      i = 0
      length = @length

      while i < length
        element = $(this[i]).data(key)
        elements.push element  if element isnt `undefined`
        i++
      $result = Control(elements).cast()
            # To make the element function $.end()-able, we want to call
            # jQuery's public pushStack() API. Unfortunately, that call
            # won't allow us to both a) return a result of the proper class
            # AND b) ensure that the result of calling end() will be of
            # the proper class. So, we directly set the internal prevObject
            # member used by end().
      $result.prevObject = this
      $result
    else
      i = 0
      length = @length

      while i < length
        $(this[i]).data key, elements[i]
        i++
      this

  ###
  Rendering a control lets each class in the control class' hierarchy,
  starting at the *top*. Each class' "inherited" settings are passed to
  property setters on that class' superclass. That is, each class defines
  itself in the semantics of its superclass.
  ###    
  render: render = ->
    classFn = @constructor
    if classFn isnt Control
      superclass = classFn.superclass
                # Superclass renders first.

                # Apply the class' settings using superclass's setters.
      superclass(this).render().json @inherited, this
    this

  ###
  Invoke the indicated setter functions on the control to
  set control properties. E.g.,
  
     $c.properties( { foo: "Hello", bar: 123 } );
  
  is shorthand for $c.foo( "Hello" ).bar( 123 ).
  ###
  properties: (properties) ->
    for propertyName of properties
      if this[propertyName] is `undefined`
        message = "Tried to set undefined property " + @className() + "." + propertyName + "()."
        throw message
      value = properties[propertyName]
      this[propertyName].call this, value
    this

  ###
  Get/set the given property on multiple elements at once. If called
  as a getter, an array of the property's current values is returned.
  If called as a setter, that property of each element will be set to
  the corresponding defined member of the values array. (Array values
  which are undefined will not be set.)
  ###
  propertyVector: (propertyName, values) ->
    propertyFn = this[propertyName]
    if values is `undefined`
            # Getter
      results = []
      i = 0
      length = @length

      while i < length
        results[i] = propertyFn.call(@nth(i))
        i++
      results
    else
            # Setter
      i = 0
      length1 = @length
      length2 = values.length

      while i < length1 and i < length2
        propertyFn.call @nth(i), values[i]  unless not values[i]
        i++
      this

  ### Control has no settings that need to be applied on render.###
  inherited: null
  
  ###
  Sets/gets the style of matching elements.
  This lets one specify a style attribute in QuickUI markup for a control instance;
  the style will apply to the control's root element.
  ###
  style: (style) ->
    @attr "style", style

  ###
  The tabindex of the control.
  ###
  tabindex: (tabindex) ->
    @attr "tabindex", tabindex

  ###
  Replace this control with an instance of the given class and properties.
  Unlike a normal Control.create() call, existing control contents are
  *not* preserved. Event handlers, however, remain attached;
  use a separate call to $.off() to remove them if desired.
  
  If preserveClasses is true, the existing class hierarchy will be left
  on the "class" attribute, although the class "Control" will remain the
  rightmost class. Suppose the class hierarchy looks like
       class="Foo Control"
  If we're switching to class Bar, the hierarchy will end up like
       class="Bar Foo Control"
  
  TODO: This function have evolved to overlap quite a bit with $.control().
  The latter's ability to preserve element content in Control.createAt() 
  perhaps should be deprecated. Callers could rely on transmute() if they
  need to preserve existing content.
  ###
  transmute: (newClass, preserveContent, preserveClasses, preserveEvents) ->
    classFn = Control.getClass(newClass)
    oldContents = (if preserveContent then @_significantContents() else null)
    oldClasses = (if preserveClasses then @prop("class") else null)
        # Reset everything.
    @empty().removeClass().removeData()
    @off()  unless preserveEvents
    $controls = classFn.createAt(this)
    $controls.propertyVector "content", oldContents  if oldContents
    $controls.removeClass("Control").addClass(oldClasses).addClass "Control"  if oldClasses       # Ensures Control ends up rightmost
    $controls

  ###
  By default, the root tag of the control will be a div.
  Control classes can override this: <Control name="Foo" tag="span">
  ###
  tag: "div"
  
  ###
  The current version of QuickUI.
  ###
  quickui: "0.8.9"

  ###
  Toggle the element's visibility.
  Like $.toggle(), but if no value is supplied, the current visibility is returned
  (rather than toggling the element's visibility).
  ###
  visibility: (value) ->
    (if (value is `undefined`) then @is(":visible") else @toggle(String(value) is "true"))

  ###
  Get/set the reference for the class for these control(s).
  ###
  _controlClass: (classFn) ->
    (if classFn then @data(Control._controlClassData, classFn) else @data(Control._controlClassData))

  ###
  Return the control's "significant" contents: contents which contain
  at least one node that's something other than whitespace or comments.
  If an element has no significant contents, return null for that element.
  ###
  _significantContents: ->
        # Use base implementation of content().
    contents = Control(this).propertyVector("content")
    significantContents = $.map(contents, (content) ->
      return content  if $.trim(content).length > 0  if typeof content is "string"                     # Found significant text
            # Content is an array
      i = 0
      length = content.length

      while i < length
        c = content[i]
        if typeof c is "string"
          return content  if $.trim(c).length > 0                 # Found significant text
        # Comment node
        else return content  if c.nodeType isnt 8                     # Found some real element
        i++
      null
    )
    significantContents    # Didn't find anything significant

  ###
  Call a function of the same name in a superclass.
  
  E.g., if A is a superclass of B, then:
  
       A.prototype.calc = function ( x ) {
           return x 2;
       }
       B.prototype.calc = function ( x ) {
           return this._super( x ) + 1;
       }
  
       var b = new B();
       b.calc( 3 );         # = 7
    
  This assumes a standard prototype-based class system in which all classes have
  a member called "superclass" pointing to their parent class, and all instances
  have a member called "constructor" pointing to the class which created them.
  
  This routine has to do some work to figure out which class defined the
  calling function. It will have to walk up the class hierarchy and,
  if we're running in IE, do a bunch of groveling through function
  definitions. To speed things up, the first call to _super() within a
  function creates a property called "_superFn" on the calling function;
  subsequent calls to _super() will use the memoized answer.
  
  Some prototype-based class systems provide a _super() function through the
  use of closures. The closure approach generally creates overhead whether or
  not _super() will ever be called. The approach below adds no overhead if
  _super() is never invoked, and adds minimal overhead if it is invoked.
  This code relies upon the JavaScript .caller method, which many claims
  has slow performance because it cannot be optimized. However, "slow" is
  a relative term, and this approach might easily have acceptable performance
  for many applications.
  ###
  _super: _super = ->
        # Figure out which function called us.
        
                     # Modern browser
                     
                       # IE9 and earlier
    callerFn = (if (_super and _super.caller) then _super.caller else arguments.callee.caller)
    return `undefined`  unless callerFn
        # Have we called super() within the calling function before?
    superFn = callerFn._superFn
    unless superFn
            # Find the class implementing this method.
      classInfo = findMethodImplementation(callerFn, @constructor)
      if classInfo
        classFn = classInfo.classFn
        callerFnName = classInfo.fnName
                # Go up one level in the class hierarchy to get the superfunction.
        superFn = classFn.superclass::[callerFnName]
                # Memoize our answer, storing the value on the calling function,
                # to speed things up next time.
        callerFn._superFn = superFn
    (if superFn then superFn.apply(this, arguments) else `undefined`)  # Invoke superfunction

# Expose Control class as a global.
window.Control = Control