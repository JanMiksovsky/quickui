###
Helpers to efficiently define control class properties.
QuickUI properties are jQuery-style getter/setter functions.
###


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
  creates a curried setter/getter function equivalent to css( "display", value ).
  ###
  chain: ->
        # Check for a side effect function as last parameter.
    args = arguments
    sideEffectFn = undefined
    if $.isFunction( args[args.length - 1] )
            # Convert arguments to a real array in order to grab last param.
      args = [].slice.call( arguments )
      sideEffectFn = args.pop()
        # Identify function names and optional parameters.
    functionNames = []
    functionParams = []
    i = 0
    length = args.length

    while i < length
            # Check for optional parameter.
      parts = arguments[i].split( "/" )
      functionNames[i] = parts.shift()
      functionParams[i] = parts
      i++
        # Generate a function that executes the chain.
    chain = ( value ) ->
      result = this
      i = 0
      length = functionNames.length

      while i < length
        fn = result[functionNames[i]]
        params = functionParams[i]
                    # Invoke last function as setter.
        params = params.concat( [ value ] )  if value isnt `undefined` and i is length - 1
        if fn is `undefined`
          message = "Control class \"" + @className() + "\" tried to chain to an undefined getter/setter function \"" + functionNames[i] + "\"."
          throw message
        result = fn.apply( result, params )
        i++
      if value is `undefined`
                # Chain invoked as getter.
        result
      else
                    # Carry out side effect.
        sideEffectFn.call this, value  if sideEffectFn
        this


  ###
  Return a function that applies another function to each control in a
  jQuery array.
  
  If the inner function returns a defined value, then the function is
  assumed to be a property getter, and that result is return immediately.
  Otherwise, "this" is returned to permit chaining.
  ###
  iterator: ( fn ) ->
    ->
      args = arguments
      iteratorResult = undefined
      @eachControl ( index, $control ) ->
        result = fn.apply( $control, args )
        if result isnt `undefined`
          iteratorResult = result
          false
      if iteratorResult != `undefined`
        iteratorResult # Getter
      else
        this # Method or setter


  ###
  Generic factory for a property getter/setter.
  ###
  property: ( sideEffectFn, defaultValue, converterFunction ) ->
    backingPropertyName = "_property" + Control.property._symbolCounter++
    ( value ) ->
      result = undefined
      if value is `undefined`
        # Getter
        result = @data( backingPropertyName )
        ( if ( result is `undefined` ) then defaultValue else result )
      else
        # Setter. Allow chaining.
        @eachControl ( index, $control ) ->
          result = ( if ( converterFunction ) then converterFunction.call( $control, value ) else value )
          $control.data backingPropertyName, result
          sideEffectFn.call $control, result  if sideEffectFn


###
Factories for getter/setters of various types.
###
$.extend Control.property,

    # A boolean property.
  bool: ( sideEffectFn, defaultValue ) ->
                # Convert either string or bool to bool.
    Control.property sideEffectFn, defaultValue, convertToBool = ( value ) ->
      String( value ) is "true"

  ###
  A class-valued property.
  This accepts either a function (the class) or a class name as a string.
  ###
  class: ( sideEffectFn, defaultValue ) ->
    Control.property sideEffectFn, defaultValue, Control.getClass

  # A date-valued property. Accepts a JavaScript date or parseable date string.
  date: ( sideEffectFn, defaultValue ) ->
    Control.property sideEffectFn, defaultValue, convertToDate = ( value ) ->
      ( if ( value instanceof Date or not value? ) then value else new Date( Date.parse( value ) ) )

  # An integer property.
  integer: ( sideEffectFn, defaultValue ) ->
    Control.property sideEffectFn, defaultValue, parseInt

  # Used to generate symbols to back new properties.
  _symbolCounter: 0
