###
Helper functions for working with control styles.
###

Control::extend

  ###
  Get/set whether the indicated class(es) are applied to the elements.
  This effectively combines $.hasClass() and $.toggleClass() into a single
  getter/setter.
  ###
  applyClass: ( classes, value ) ->
    if value is undefined
      @hasClass classes
    else
      @toggleClass classes, String( value ) is "true"

  ###
  The set of classes on the control's element.
  If no value is supplied, this gets the current list of classes.
  If a value is supplied, the specified class name(s) are *added*
  to the element. This is useful for allowing a class to be added
  at design-time to an instance, e.g., <Foo class="bar"/>. The
  resulting element will end up with "bar" as a class, as well as
  the control's class hierarchy: <div class="Foo Control bar">.
  ###
  class: ( classList ) ->
    if classList is undefined
      @attr "class"
    else
      @toggleClass classList, true

  ###
  Sets/gets whether the control is showing a generic appearance.
  We use a property with a side-effect, rather than a binding to
  applyClass/generic, in order for the default value to be "undefined".
  ###
  generic: Control.property.bool ( generic ) ->
    @applyClass "generic", generic
  
  ###
  Sets the generic property to true if the control's most specific
  class (i.e., its constructor) is the indicated class. Controls that
  want to define a generic appearance should invoke this in their
  initialize handler, passing in the control class.
  
  The assumption is that subclasses want to define their own appearance,
  and therefore do *notwant an inherited generic appearance. E.g.,
  a class Foo could ask for generic appearance, but a subclass of Foo
  called Bar will not get the generic appearance unless it calls this
  function via this.genericIfClassIs( Bar ).
  ###
  genericIfClassIs: ( classFn ) ->
    for control in @segments()
      control.generic true if control.constructor is classFn and control.generic() is undefined
    @
    
  ###
  Sets/gets the style of matching elements.
  This lets one specify a style attribute in QuickUI markup for a control instance;
  the style will apply to the control's root element.
  ###
  style: ( style ) ->
    @attr "style", style

  ###
  Toggle the element's visibility.
  Like $.toggle(), but if no value is supplied, the current visibility is returned
  (rather than toggling the element's visibility).
  ###
  visibility: ( value ) ->
    if value is undefined
      @is( ":visible" )
    else
      @toggle String( value ) == "true"
