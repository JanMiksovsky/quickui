###
Main Control class definition and jQuery plugin.
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
  Creates a new instance of MyControlClass around the element( s ).

$( element ).control( MyControlClass, { content: "Hello" } );
  Creates new control instance( s ) and sets its ( their ) content property.

NOTE: the forms that create new control instances may return a jQuery array
of elements other than the ones which were passed in. This occurs whenever
the control class wants a different root tag than the tag on the supplied
array of elements.
###
jQuery.fn.control = ( arg1, arg2 ) ->
  if arg1 is undefined
    # Return the controls bound to these element(s), cast to the correct class.
    $cast = ( new Control( this ) ).cast jQuery
    if $cast instanceof Control
      $cast
    else
      null
  else if jQuery.isFunction arg1
    # Create a new control around the element(s).
    controlClass = arg1
    properties = arg2
    controlClass.createAt this, properties
  else
    # Set properties on the control(s).
    ( new Control( this ) ).cast().properties arg1


###
Control class: the base class for all QuickUI controls.

This is defined as a subclass of jQuery so that all control objects can also
have jQuery methods applied to them.
###
class Control extends jQuery


  ###
  The Control constructor has to accommodate the fact that Control subclasses
  jQuery, which happens to have a rather unusual constructor. jQuery raises two
  issues, one of which we can work around, the other we can't.

  First issue: The base jQuery() constructor doesn't actually return a new
  instance of the jQuery class, but instead returns a new instance of a helper
  class called jQuery.prototype.init. That is, the jQuery constructor is an
  "other typed" constructor: it returns something other than an instance of the
  class which was requested. Such constructors are not supported in CoffeeScript
  as of CoffeeScript 1.5. To work around that, we invoke jQuery's constructor,
  get back an instance of the helper class, then copy the values from that
  intermediate result to the new object we're constructing.

  Second issue: For conciseness, jQuery wants to support static constructors,
  that is, creation of a new jQuery object without actually needing to use the
  "new" keyword. So the following are equivalent:

    var $elements = $("div");
    var $elements = new $("div");

  The constructor does this regardless of whether it's called with "new" or not,
  so it can produce the results above. The problem is that the above technique
  is similarly prohibited by CoffeeScript. As a result, Control classes should
  always be instantiated with the formal use of "new".
  ###
  constructor: ( args... ) ->
    if @ is window
      throw "Control constructor must be invoked with 'new'."
    else
      # Invoke the base jQuery constructor to get an intermediate result.
      result = super args...
      if result.length > 1
        # Copy the values from the intermediate result to this object. jQuery
        # provides a helper function to do exactly what we need here.
        jQuery.merge @, result

    
  ###
  Create an instance of this control class around a specific element (or
  multiple instances around a set of elements).
  ###
  @create: ( properties ) ->
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
  @createAt: ( target, properties ) ->
    
    defaultTarget = "<" + @::tag + "/>"
    
    # Instantiate the control class.
    $controls = undefined
    
    oldContents = undefined
    if target is null
      # Create a default element.
      $controls = new @ defaultTarget
      oldContents = []
    else
      # Grab the existing contents of the target elements.
      $controls = new @ target
      oldContents = ( significantContent( element ) for element in $controls )
      existingTag = $controls[0].nodeName.toLowerCase()
      if existingTag isnt @::tag.toLowerCase() and existingTag isnt "body"
        # Tags don't match; replace with elements with the right tag.
        $controls = replaceElements $controls, new @ defaultTarget

    if properties isnt undefined and !$.isPlainObject( properties )
      # Property value implicitly handed to content() property.
      properties = content: properties

    $controls
      # Save a reference to the controls' class.
      .controlClass( this )
      # Apply all class names in the class hierarchy as style names.
      # This lets the element pick up styles defined by those classes.
      .addClass( cssClasses this )
      # Render controls as DOM elements.
      .render()
      # Pass in the target's old contents ( if any ).
      .propertyVector( "content", oldContents )
      # Set any requested properties.
      .properties properties

    # Let each control initialize itself.
    initialize this, $control for $control in $controls.segments()
    
    # Return the new controls
    $controls

  
  ###
  Create a subclass of this class. The new class' prototype is extended with
  the indicated members in the options parameter.

  Normally, jQuery subclasses must be created with the $.sub() plugin. However,
  the Control constructor already works around the most common case that plugin
  handles, and the other case that plugin handles (static instantations without
  the "new" keyword) is not supported for Control.
  ###
  @sub: ( options ) ->

    superclass = this
    class subclass extends superclass

    subclass::extend options if options?

    # Give the new class all the class methods of the superclass.
    jQuery.extend true, subclass, superclass

    # jQuery classes define a "superclass" member that points to the superclass;
    # CoffeeScript classes define a "__super__" member that points to the
    # superclass' prototype. Both of these will have been copied by the call to
    # $.extend() above. Now update them with the real values.
    subclass.superclass = superclass
    subclass.__super__ = superclass::

    # jQuery classes use fn as a synonym for prototype.
    subclass.fn = subclass::

    subclass


  # jQuery wants its subclasses to have a "superclass" member.
  @superclass: jQuery


  ###
  The CSS classes that should be applied to new instances of this class. This is
  normally not set directly, but a default value is automatically constructed
  the first time the control class is instantiated. The default value for this
  includes the names of all control classes in the class' inheritance
  hierarchy. Example: If a control class Foo has superclasses Bar and Control,
  this member will be "Foo Bar Control".
  ###
  classes: "Control"


  ###
  Each control class knows its own name.
  We'd prefer to use "name" for this, but this is a reserved word.
  ###
  className: "Control"


  ###
  Get/set the reference for the actual class for these control( s ). This may
  differ from the class of the jQuery object used to access this function:
    
    $e = Control "<button>"   # $e is now of type Control
    e.control( BasicButton )  # Turns the element into a BasicButton 
    $e.className              # Returns "Control"
    $e.controlClass()         # Returns the BasicButton class
    
  ###
  controlClass: ( classFn ) ->
    # A change in jQuery 1.7.1 made a difference in calling $.data() with an
    # second parameter of "undefined" versus leaving leaving off the second
    # parameter, so if classFn is undefined, we have to explicitly call $.data()
    # with only one parameter.
    if classFn
      @data controlClassData, classFn
    else
      @data controlClassData


  ###
  Control itself has no settings that need to be applied on render.
  ###
  inherited: null

  
  ###
  Invoked when the control has finished rendering.
  Subclasses can override this to perform their own post-rendering work
  (e.g., wiring up events).
  ###    
  initialize: ->


  ###
  Rendering a control lets each class in the control class' hierarchy,
  starting at the *top*. Each class' "inherited" settings are passed to
  property setters on that class' superclass. That is, each class defines
  itself in the semantics of its superclass.
  ###    
  render: ->
    classFn = @constructor
    if classFn isnt Control
      superclass = classFn.superclass
      rendered = ( new superclass( @ ) ).render() # Superclass renders first.
      if classFn::hasOwnProperty "inherited"
        # Apply the class' desired values using superclass's setters.
        rendered.json classFn::inherited, @
    @


  ###
  By default, the root tag of the control will be a div.
  Control classes can override this: <Control name="Foo" tag="span">
  ###
  tag: "div"


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
  transmute: ( newClass, preserveContent, preserveClasses, preserveEvents ) ->
    
    classFn = Control.getClass newClass
    oldClasses = ( if preserveClasses then @prop( "class" ) else null )

    # If the old class was listening to inDocument, stop listening now.
    removeElementFromInDocumentCallbacks element for element in @

    # Reset everything.
    @empty() unless preserveContent
    @removeClass()
    @removeData()
    @off() unless preserveEvents

    $controls = classFn.createAt this

    if oldClasses
      # Ensure Control class ends up rightmost
      $controls.removeClass( "Control" ).addClass( oldClasses ).addClass "Control"
    $controls

  
  ###
  The current version of QuickUI.
  ###
  quickui: "0.9.3"


###
Private helpers
###


# Name of data element used to store a reference to an element's control class.
controlClassData = "_controlClass"


###
Return a class' "classes" member, which reflects the CSS classes that should be
applied to new instances of that control class. If a class doesn't yet define
this member for itself, a default value is calculated which includes the
control class' own name, followed by the "classes" member of its superclass.
###
cssClasses = ( classFn ) ->
  if !classFn::hasOwnProperty "classes"
    classFn::classes = classFn::className + " " + ( cssClasses classFn.superclass )
  classFn::classes


###
Invoke the initialize() method of each class in the control's class hierarchy,
starting with the base class and working down.
###
initialize = ( classFn, $control ) ->
  # Initialize base class first.
  superclass = classFn.superclass
  initialize superclass, $control if superclass isnt jQuery
  # Now do control class' own initialization (if present).
  classFn::initialize.call $control if classFn::hasOwnProperty "initialize"


###
Replace the indicated existing element(s) with the indicated replacements and
return the new elements. This is used if, say, we need to convert a bunch of
divs to buttons. Significantly, this preserves element IDs.
###
replaceElements = ( $existing, $replacement ) ->
  # Gather the existing IDs.
  ids = ( $( element ).prop "id" for element in $existing )
  $new = $replacement.replaceAll( $existing )
  # Put IDs onto new elements.
  for element, i in $new
    id = ids[i]
    $( element ).prop "id", id if id and id.length > 0
  $new
    
    
###
Return an element's "significant" contents: contents which contain
at least one child that's something other than whitespace or comments.
If the element has no significant contents, return undefined.
###
significantContent = ( element ) ->
  content = new Control( element ).content() # Use base implementation.
  if typeof content is "string" and jQuery.trim( content ).length > 0
    return content  # Element is text node with non-empty text  
  # Content is an array
  for node in content when node.nodeType != 8 # Comment
    if typeof node != "string" or jQuery.trim( node ).length > 0
      return content # HTML element or text node with non-empty text
  undefined # Didn't find anything significant


# Explicitly define Control as a window member if we have a window.
# The check is in case we're running in a headless state, e.g., Node.
window?.Control = Control

