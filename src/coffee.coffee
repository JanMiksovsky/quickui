###
CoffeeScript support.

This allows creation of Control subclasses (and, generally speaking, jQuery
subclasses) in CoffeeScript using its built-in "extend" syntax for classes.
This plugin is only necessary to *create* control classes in CoffeeScript;
controls can be instantiated in CoffeeScript without this.
  
To create a QuickUI control class in CoffeeScript, a boilerplate constructor
is required. The constructor should look like the second line below:
  
  class window.MyControl extends Control
    constructor: -> return Control.coffee()

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
###
Control.coffee = ->
  # Figure out which class' constructor invoked us. Warning: this uses the
  # deprecated "caller" method, which is not permitted in strict mode.
  classFn = arguments.callee.caller
  if not ( jQuery.isFunction classFn ) and ( classFn:: ) instanceof Control
    throw "Control.coffee was invoked some context other than a control class' constructor, which is unsupported."
  # Ensure the class has been treated to be jQuery- and QuickUI-compatible.
  makeCompatible classFn unless isCompatible classFn
  # Get the arguments passed to the class' constructor. This is quite
  # unorthodox, but lets us keep the required boilerplate as short as possible. 
  args = classFn.arguments
  # Actually create an instance of the init helper class per standard jQuery.
  new classFn::init args...

