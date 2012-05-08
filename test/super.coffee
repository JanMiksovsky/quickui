###
_super() method invocation unit tests
###

$ ->
  
  test "_super(): invoke superclass functions", ->
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
  
    c = C.create()
    equal c.decorate( "Hello" ), "( c: ( b: ( a: Hello ) ) )"
    equal c.calc( 3 ), 7
    b = B.create()
    equal b.decorate( "Hello" ), "( b: ( a: Hello ) )"
    equal b.calc( 3 ), 7
    a = A.create()
    equal a.decorate( "Hello" ), "( a: Hello )"
    equal a.calc( 3 ), 6

  test "_super(): superclass function undefined", ->
    A = Control.subclass className: "A"
    B = A.subclass className: "B"
    B::foo = -> @_super()
    b = B.create()
    raises ->
      b.foo()
