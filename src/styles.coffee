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
  True if the control wants its generic appearance. The default value of this
  property is the control class' genericDefault member. 
  ###
  generic: ( generic ) ->
    @applyClass "generic", generic
    
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
