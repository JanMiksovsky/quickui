###
CoffeeScript plugin for QuickUI.

This allows creation of Control subclasses (and, generally speaking, jQuery
subclasses) in CoffeeScript using its built-in "extend" syntax for classes.
This plugin is only necessary to *create* control classes in CoffeeScript;
controls can be instantiated in CoffeeScript without this.
  
To create a QuickUI control class in CoffeeScript, a boilerplate constructor
is required. The constructor should look like the second line below:
  
  class window.MyControl extends Control
    constructor: -> return Control.coffee arguments...

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
Returns a new instance of a CoffeeScript-based QuickUI control class, ensuring
that the class has been properly set up for jQuery and QuickUI. This method
should be invoked from the boilerplate constructor (see top) of any CoffeeScript
control class.

For full jQuery compatibility, a control class should be able to handle two forms
of instantiation:
  
  var c = MyControl( selector )       // Static form
  var c = new MyControl( selector )   // New form
  
The static form will invoke the MyControl() constructor (and therefore this
method) with "this" as the global window object. This means we have to jump
through some hoops to figure out which class we're instantiating.
  
Note that the args parameter is not an "args..." splat. To keep the boilerplate
constructor as concise as possible, we allow it to pass "arguments" as a single
parameter, instead of "arguments...". So the routine here ends up with the
calling arguments in a single args parameter (an array holding a subarray). 
###
Control.coffee = ( args ) ->
  # Figure out which class' constructor invoked us.
  # Warning: this uses the deprecated "caller" method, which is not permitted
  # in strict mode.
  classFn = arguments.callee.caller
  if not ( $.isFunction classFn ) and ( classFn:: ) instanceof Control
    throw "Control.coffee was invoked some context other than a control class' constructor, which is unsupported."
  # Ensure the class has been treated to be jQuery- and QuickUI-compatible.
  makeCompatible classFn unless isCompatible classFn
  # Actually create an instance of the init helper class per standard jQuery.
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

  # Get class name from function in modern browser, otherwise parse constructor.
  className = classFn.name ? /function\s+([^\(]*)/.exec( classFn.toString() )[1]
  classFn.className = className
  classFn.classHierarchy = className + " " + classFn.superclass.classHierarchy
  
  if classFn::genericSupport
    # Class supports generic styling
    classFn.genericIfClassIs = className
