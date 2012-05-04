###
Helper functions for working with control styles.
###


###
Sets/gets whether the control is showing a generic appearance.
We use a property with a side-effect, rather than a binding to
applyClass/generic, in order for the default value to be "undefined".
###
Control::generic = Control.property.bool((generic) ->
  @applyClass "generic", generic
)

###
Sets the generic property to true if the control's most specific
class (i.e., its constructor) is the indicated class. Controls that
want to define a generic appearance should invoke this in their
initialize handler, passing in the control class.

The assumption is that subclasses want to define their own appearance,
and therefore do *notwant an inherited generic appearance. E.g.,
a class Foo could ask for generic appearance, but a subclass of Foo
called Bar will not get the generic appearance unless it calls this
function via this.genericIfClassIs(Bar).
###
Control::genericIfClassIs = (classFn) ->
  @eachControl (index, $control) ->
    $control.generic true  if $control.constructor is classFn and $control.generic() is `undefined`
