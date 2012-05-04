###
QuickUI
Version 0.8.9
Modular web control framework
http:#quickui.org/

Copyright (c) 2009-2012 Jan Miksovsky
Licensed under the MIT license.
###

    
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
Control subclass of jQuery.
This is used as the base class for all QuickUI controls.
###
Control = $.sub()
$.extend Control,


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
  The name of the data element used to store a reference to an element's control class.
  ###
  _controlClassData: "_controlClass"

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
Control instance methods.
###
Control::extend

  ###
  The name of the control's class.
  This shorthand is useful for quickly getting the name in the debugger
  when one is holding a reference to a control.
  ###
  className: ->
    @constructor.className

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

  ### Control has no settings that need to be applied on render.###
  inherited: null

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


# Expose Control class as a global.
window.Control = Control