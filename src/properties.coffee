###
Helpers to efficiently define control class properties.
QuickUI properties are jQuery-style getter/setter functions.
###

###
Generic factory for a property getter/setter.
###
Control.property = (sideEffectFn, defaultValue, converterFunction) ->
  backingPropertyName = "_property" + Control.property._symbolCounter++
  (value) ->
    result = undefined
    if value is `undefined`
      # Getter
      result = @data(backingPropertyName)
      (if (result is `undefined`) then defaultValue else result)
    else
      # Setter. Allow chaining.
      @eachControl (index, $control) ->
        result = (if (converterFunction) then converterFunction.call($control, value) else value)
        $control.data backingPropertyName, result
        sideEffectFn.call $control, result  if sideEffectFn


###
Factories for getter/setters of various types.
###
$.extend Control.property,

    # A boolean property.
  bool: (sideEffectFn, defaultValue) ->
                # Convert either string or bool to bool.
    Control.property sideEffectFn, defaultValue, convertToBool = (value) ->
      String(value) is "true"

  ###
  A class-valued property.
  This accepts either a function (the class) or a class name as a string.
  ###
  class: (sideEffectFn, defaultValue) ->
    Control.property sideEffectFn, defaultValue, Control.getClass

  # A date-valued property. Accepts a JavaScript date or parseable date string.
  date: (sideEffectFn, defaultValue) ->
    Control.property sideEffectFn, defaultValue, convertToDate = (value) ->
      (if (value instanceof Date or not value?) then value else new Date(Date.parse(value)))

  # An integer property.
  integer: (sideEffectFn, defaultValue) ->
    Control.property sideEffectFn, defaultValue, parseInt

  # Used to generate symbols to back new properties.
  _symbolCounter: 0
