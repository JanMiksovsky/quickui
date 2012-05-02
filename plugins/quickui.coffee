###
CoffeeScript plugin for QuickUI.

This allows creation of Control subclasses (and, generally speaking, jQuery
subclasses) in CoffeeScript using its built-in "extend" syntax for classes.
This plugin is only necessary to *create* control classes in CoffeeScript;
controls can be instantiated in CoffeeScript without this.
  
To create a QuickUI control class in CoffeeScript, a boilerplate constructor
is required. The constructor should look like the second line below:
  
  class window.MyControl extends Control
    constructor: -> return @coffee arguments...

NOTE: The routines here are not generally called by QuickUI users. This support
deals primarily with instantiating a jQuery (QuickUI) object from a selector.
E.g., given the class definition above, a collection of MyControl instances on
the page could be obtained via

  myControls = MyControl ".MyControl"           # CoffeeScript
  var myControls = MyControl( ".MyControl" )    // JavaScript

The ".MyControl" uses MyControl's corresponding CSS class to find all instances
of that control, and the static MyControl constructor ensures the result is an
instanceof MyControl. However, calls like the above are comparatively rare in
actual use. The QuickUI idiom that produces the same result is

  myControls = $( ".MyControl" ).control()      # CoffeeScript
  var myControls = $( ".MyControl" ).control()  // JavaScript

which has the benefit that the result type doesn't have to be known ahead of
time; the $.control plugin will cast the result to the correct type.   
###


###
Top-level window method invoked from the boilerplate constructor (see top). 
If one invokes a CoffeeScript-based control class statically, e.g.:

  var c = MyControl( elem )
  
this will cause the coffee() method to be invoked on the window object.
This delegates handling to the class whose constructor called the coffee method.
  
Note that the args parameter is not an "args..." splat. To keep the boilerplate
constructor as concise as possible, we allow it to pass "arguments" as a single
parameter, instead of "arguments...". So the routine here ends up with the
calling arguments in a single args parameter (an array holding a subarray). 
###
window.coffee = ( args )->
  # Figure out which control's constructor invoked us.
  # Warning: this uses the deprecated "caller" method, which is not permitted
  # in strict mode.
  classFn = arguments.callee.caller
  if ( $.isFunction classFn ) and ( classFn:: ) instanceof Control
    return coffeeControl classFn, args...
  throw "window.coffee was invoked some context other than a control class' constructor, which is unsupported."


###
Control instance method invoked from the boilerplate constructor (see top).
If one invokes a CoffeeScript-based class with "new", e.g.:

  var c = new MyControl( elem )

then this will invoke the coffee() method on the class' prototype. This is a
somewhat rarer way to create a jQuery object, but is supported for completeness.

See notes at window.coffee for why the args parameter is not a splat.
###
Control::coffee = ( args ) ->
  args = args ? []
  return coffeeControl @constructor, args...


###
Create a new instance of a CoffeeScript control class, checking first to
ensure the class has been treated to be jQuery- and QuickUI-compatible.
This function is for internal use, and is not intended to be invoked directly.
###
coffeeControl = ( classFn, args... ) ->
  makeCompatible classFn unless isCompatible classFn
  new classFn::init args...


###
Return true if the given class is jQuery and QuickUI compatible.
###
isCompatible = ( classFn ) ->
  # Quick check: look for the superclass member, which jQuery creates/expects.
  classFn.superclass is classFn.__super__.constructor


###
Make the class compatibile with jQuery and QuickUI.
###
makeCompatible = ( classFn ) ->
  makeJQueryCompatible classFn
  makeQuickUICompatible classFn


###
Make the given CoffeeScript class compatible with jQuery.
  
CoffeeScript and jQuery have a roughly equivalent subclassing mechanism,
although jQuery's is far more byzantine. Among other things, jQuery class
constructors actually return an instance of a helper class called init. This
method doctors up the CoffeeScript class to make it function the same as a
class created with $.sub().
###
makeJQueryCompatible = ( classFn ) ->
  
  # CoffeeScript sets __super__ as a pointer to the superclass' prototype,
  # but QuickUI wants superclass, a pointer to the superclass itself. 
  classFn.superclass = superclass = classFn.__super__.constructor
  
  if superclass.__super__ and not isCompatible superclass
    # Make CoffeeScript-based superclass compatible first.
    makeCompatible superclass 

  # This is the same init helper class that $.sub() creates.
  classFn::init = ( selector, context ) ->
    if ( context && context instanceof jQuery && !( context instanceof jQuerySub ) )
      context = jQuerySub( context )
    return jQuery::init.call( this, selector, context, rootjQuerySub )
  
  # jQuery classes use fn as a synonym for prototype.
  classFn.fn = classFn::
    
  # The init object is what jQuery actually instantiates, so we need to make
  # sure it's got the right prototype.
  classFn::init.prototype = classFn::
    
  # This is used in the closure for the init() function defined above.
  # Per jQuery.sub(), this must be declared *after* the init.prototype is
  # set above, or else the this() constructor won't work.
  rootjQuerySub = classFn document

  
###
Make the given CoffeeScript class compatible with QuickUI.
###
makeQuickUICompatible = ( classFn ) ->

  className = if classFn.name
    # Modern browser.
    classFn.name
  else
    # Get the class name from the class' constructor's string definition.
    [ match, className ] = /function\s+([^\(]*)/.exec( classFn.toString() )
  classFn.className = className
  classFn.classHierarchy = className + " " + classFn.superclass.classHierarchy
  
  if classFn::genericSupport
    # Class supports generic styling
    classFn.genericIfClassIs = className
