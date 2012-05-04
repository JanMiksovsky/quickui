###
Helper function by which a method can invoke the identically-named method
on a base class. Signficantly, it is not necessary for the invoking method to
pass in the current class, the base class, or the method name.
###


###
Call a function of the same name in a superclass.

E.g., if A is a superclass of B, then:

     A.prototype.calc = function ( x ) {
         return x 2;
     }
     B.prototype.calc = function ( x ) {
         return this._super( x ) + 1;
     }

     var b = new B();
     b.calc( 3 );         # = 7
  
This assumes a standard prototype-based class system in which all classes have
a member called "superclass" pointing to their parent class, and all instances
have a member called "constructor" pointing to the class which created them.

This routine has to do some work to figure out which class defined the
calling function. It will have to walk up the class hierarchy and,
if we're running in IE, do a bunch of groveling through function
definitions. To speed things up, the first call to _super() within a
function creates a property called "_superFn" on the calling function;
subsequent calls to _super() will use the memoized answer.

Some prototype-based class systems provide a _super() function through the
use of closures. The closure approach generally creates overhead whether or
not _super() will ever be called. The approach below adds no overhead if
_super() is never invoked, and adds minimal overhead if it is invoked.
This code relies upon the JavaScript .caller method, which many claims
has slow performance because it cannot be optimized. However, "slow" is
a relative term, and this approach might easily have acceptable performance
for many applications.
###
Control::_super = ->
  
  # Figure out which function called us.
  ###
  TODO: As of 1.3.1, CoffeeScript doesn't permit the creation of named
  functions. So the standard approach below doesn't work, and we have to resort
  to using the deprecated arguments.callee. Need to work around this.
  
  if _super and _super.caller
    _super.caller # Modern browser
  else
    arguments.callee.caller # IE9 and earlier
  ###
  callerFn = arguments.callee.caller
  unless callerFn
    throw "Tried to invoke _super(), but couldn't find the calling function."
    
  # Have we called super() within the calling function before?
  superFn = callerFn._superFn
  unless superFn
    # Find the class implementing this method.
    classInfo = findMethodImplementation(callerFn, @constructor)
    if classInfo
      classFn = classInfo.classFn
      callerFnName = classInfo.fnName
      # Go up one level in the class hierarchy to get the superfunction.
      superFn = classFn.superclass::[callerFnName]
      # Memoize our answer, storing the value on the calling function,
      # to speed things up next time.
      callerFn._superFn = superFn

  unless superFn
    throw "Tried to invoke _super(), but couldn't find a function of the same name in the base class."

  # Invoke superfunction
  superFn.apply(this, arguments)


###
Find which class implements the given method, starting at the given
point in the class hierarchy and walking up.

At each level, we enumerate all class prototype members to search for a
function identical to the method we're looking for.

Returns the class that implements the function, and the name of the class
member that references it. Returns null if the class was not found.
###
findMethodImplementation = (methodFn, classFn) ->
  # See if this particular class defines the function.
  prototype = classFn::
  for key of prototype
    if prototype[key] is methodFn
      # Found the function implementation.
      # Check to see whether it's really defined by this class,
      # or is actually inherited.
      methodInherited = (if classFn.superclass then prototype[key] is classFn.superclass::[key] else false)
      unless methodInherited
        # This particular class defines the function.
        return (
          classFn: classFn
          fnName: key
        )
  # Didn't find the function in this class.
  # Look in parent classes (if any).
  (if classFn.superclass then findMethodImplementation(methodFn, classFn.superclass) else null)
