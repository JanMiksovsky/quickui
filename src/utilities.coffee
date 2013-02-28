###
Utilities
###


jQuery.extend Control,

  ###
  Given a value, returns a corresponding class:
  - A string value returns the global class with that string name.
  - A function value returns that function as is.
  - An object value returns a new anonymous class created from that JSON.
  ###
  getClass: ( value ) ->
    if value is null or value == ""
      # Special cases used to clear class-valued properties.
      return null
    else if jQuery.isPlainObject value
      # Create a new class from the supplied Control JSON.
      return Control.sub value

    classFn = if jQuery.isFunction value
      value # Value is already a class
    else
      window[ value ] # Look up class using value as a string class name.
    throw "Unable to find a class called #{value}." unless classFn

    classFn


  # Return true if the given element is a control.
  # TODO: Remove in favor of ":control"?
  isControl: ( element ) ->
    Control( element ).control() isnt undefined


###
Selector for ":control": reduces the set of matched elements to the ones
which are controls.
 
With this, $foo.is( ":control" ) returns true if at least one element in $foo
is a control, and $foo.filter( ":control" ) returns just the controls in $foo.
###
jQuery.expr[":"].control = ( elem ) ->
  controlClass = ( new Control( elem ) ).controlClass()
  ( if controlClass then controlClass is Control or controlClass:: instanceof Control else false )


Control::extend


  ###
  Return the array of elements cast to their closest JavaScript class ancestor.
  E.g., a jQuery $( ".foo" ) selector might pick up instances of control classes
  A, B, and C. If B and C are subclasses of A, this will return an instance of
  class A. So Control( ".foo" ).cast() does the same thing as A( ".foo" ), but without
  having to know the type of the elements in advance.
  
  The highest ancestor class this will return is the current class, even for plain
  jQuery objects, in order to allow Control methods ( like content() ) to be applied to
  the result.
  ###
  cast: ( defaultClass ) ->
    defaultClass = defaultClass or @constructor
    setClass = undefined
    for $e in @.segments()
      elementClass = $e.controlClass() ? defaultClass
      setClass = elementClass if setClass is undefined or ( setClass:: ) instanceof elementClass
    setClass ?= defaultClass  # In case "this" had no elements.
    new setClass @


  ###
  Execute a function once for each control in the array. The callback should
  look like
  
    $controls.eachControl( function( index, control ) {
      ...
    });
    
  This is similar to $.each(), but preserves type, so "this" and the control
  parameter passed to the callback are of the correct control class.
  
  NB: Unlike Control.segments(), this looks up the specific control class for each
  element being processed, rather than assuming the containing control's class
  is shared by all elements. If eachControl() is applied to a mixture of controls,
  the callback will be invoked with each control in turn using that specific
  control's class. 
  ###
  eachControl: ( fn ) ->
    for element, i in @
      control = ( new Control( element ) ).cast()
      result = fn.call control, i, control
      break if result is false
    @


  # Allow controls have an element ID specified on them in markup.
  id: ( id ) ->
    @attr "id", id


  ###
  Experimental function like eq, but faster because it doesn't manipulate
  the selector stack.
  ###
  nth: ( index ) ->
    new @constructor @[ index ]


  ###
  Invoke the indicated setter functions on the control to
  set control properties. E.g.,
  
     $c.properties( { foo: "Hello", bar: 123 } );
  
  is shorthand for $c.foo( "Hello" ).bar( 123 ).
  ###
  properties: ( properties ) ->
    for propertyName of properties
      if @[ propertyName ] is undefined
        throw "Tried to set undefined property #{@className}.#{propertyName}()."
      value = properties[ propertyName ]
      @[ propertyName ].call @, value
    @


  ###
  Get/set the given property on multiple elements at once. If called
  as a getter, an array of the property's current values is returned.
  If called as a setter, that property of each element will be set to
  the corresponding defined member of the values array. (Array values
  which are undefined will not be set.)
  ###
  propertyVector: ( propertyName, values ) ->
    propertyFn = @[ propertyName ]
    if values is undefined
      # Collect results of invoking property getter on each control. 
      ( propertyFn.call $control for $control in @segments() )
    else
      # Invoke property setter on each control using corresponding value
      length = @length
      for $control, i in @segments()
        if i >= length
          break # Didn't receive values for all the controls we have
        propertyFn.call $control, values[i] if values[i] isnt undefined
      @
      
      
  ###
  Save or retrieve an element associated with the control using the given ref
  key. The getter form of this maps the array of control(s) to a collection of
  the corresponding element(s) that were previously saved under the given ref.
  The setter form has several effects:
  1. It saves a pointer to the indicated element in the control's data.
  2. It adds the ref as a CSS class to the target element.
  3. It generates an element reference function for the present control's class
     that permits future access to referenced elements.
  This function is generally for internal use, and is invoked during processing
  of Control JSON, or (in its getter form) from the generated element reference
  function mentioned in point #3.   
  ###
  referencedElement: ( ref, elements ) ->
    if elements is undefined
      # Map a collection of control instances to the given element
      # defined for each instance.
      elements = ( $control.data ref for $control in @segments() when ( $control.data ref ) isnt undefined )
      $result = ( new Control( elements ) ).cast()
      # To make the element function $.end()-able, we want to call
      # jQuery's public pushStack() API. Unfortunately, that call
      # won't allow us to both a) return a result of the proper class
      # AND b) ensure that the result of calling end() will be of
      # the proper class. So, we directly set the internal prevObject
      # member used by end().
      $result.prevObject = @
      $result
    else
      createElementReferenceFunction this.constructor, ref
      elements.addClass ref
      for $control, i in @segments()
        $control.data ref, elements[i]
      @


  ###
  Return the controls in "this" as an array of subarrays, each of which holds
  a single control of the same class as the current control. E.g., if "this"
  contains a control object with
  
    [ control1, control2, control3, ... ]
    
  Then calling segments() returns
  
    [ [control1], [control2], [control3], ... ]
  
  This is useful in for loops and list comprehensions, and avoids callbacks.
  It is more sophisticated than simply looping over the control as a jQuery
  object, because that just loops over plain DOM elements, whereas segements()
  lets us loop over jQuery/Control objects that retain type information and,
  thus, direct access to class members.
  ###
  segments: ->
    ( new @constructor element for element in @ )


  ###
  The tabindex of the control.
  ###
  tabindex: ( tabindex ) ->
    if tabindex is undefined
      @prop "tabindex"
    else
      @prop "tabindex", tabindex


  ###
  Extra information about an element; e.g., to show as a ToolTip. This maps
  to the standard HTML title property on the control's top-level element.
  ###
  title: ( title ) ->
    if title is undefined
      @prop "title"
    else
      @prop "title", title


###
Define a function on the given class that will retrieve elements with the given
reference. Example: defining an element reference function on class Foo and
reference "bar" will create Foo.prototype.$bar(), which returns the element(s)
created with reference "bar".
This has no effect if the class already has a function with the given name.
###
createElementReferenceFunction = ( classFn, ref ) ->
  fnName = "$" + ref
  unless classFn::[ fnName ]
    classFn::[ fnName ] = ( elements ) ->
      @referencedElement ref, elements
