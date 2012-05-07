###
_super() method invocation unit tests
###

$ ->
  
  test "_super()", ->
    A = Control.subclass className: "A"
    B = A.subclass className: "B"
    C = B.subclass className: "C"
    A::extend
      decorate: ( s ) -> "( a: #{s} )"
      calc: ( x ) -> x * 2
  
    B::extend
      decorate: ( s ) -> "( b: #{@_super( s )} )"
      calc: ( x ) ->
        @_super( x ) + 1
  
    C::extend
      decorate: ( s ) -> "( c: #{@_super( s )} )"
  
    c = C()
    equal c.decorate( "Hello" ), "( c: ( b: ( a: Hello ) ) )"
    equal c.calc( 3 ), 7
    b = B()
    equal b.decorate( "Hello" ), "( b: ( a: Hello ) )"
    equal b.calc( 3 ), 7
    a = A()
    equal a.decorate( "Hello" ), "( a: Hello )"
    equal a.calc( 3 ), 6
