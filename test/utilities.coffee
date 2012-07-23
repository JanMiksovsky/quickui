###
Utilities unit tests
###

$ ->
  
  test "Utilities: cast: control() on plain jQuery reference returns null", ->
    $element = $( "<div/>" )
    equal $element.control(), null
  
  test "Utilities: cast: two control classes derive from same superclass", ->
    A = Control.sub className: "A"
    B = A.sub className: "B"
    C = A.sub className: "C"
    $a = A.create()
    $b = B.create()
    $c = C.create()
    $set = Control( "<div/>" ).append( $b ).append( $a ).append( $c )
    $cast = $set.children().cast()
    equal $cast instanceof A, true
  
  test "Utilities: cast: control and jQuery mix", ->
    A = Control.sub className: "A"
    $a = A.create()
    $set = Control( "<div/>" ).append( $a ).append(  $ "<div/>"  )
    $cast = $set.children().cast()
    equal $cast instanceof Control, true
  
  test "Utilities: eachControl", ->
    # Create two instances of different classes.
    Foo = Control.sub className: "Foo"
    Foo::content = -> "foo"
    $foo = Foo.create()
    Bar = Control.sub className: "Bar"
    Bar::content = -> "bar"
    $bar = Bar.create()
    $c = Control().add( $foo ).add( $bar )
    results = []
    # eachControl should invoke the specific content functions.
    $c.eachControl ( index, $control ) ->
      results.push $control.content()
    deepEqual results, [ "foo", "bar" ]

  test "Utilities: referencedElement: Element function definition", ->
    createGreetClass()
    $c = Greet.create()
    equal $c.$name().html(), "Ann"
    equal $c.referencedElement( "name" )[0], $c.find( ".name" )[0]
    $c.$name().html "Bob"
    equal $c.text(), "Hello Bob"
  
  test "Utilities: referencedElement: Element functions $.end()-able", ->
    createGreetClass()
    $c = Greet.create()
    $result = $c.$name().end()
    equal $result, $c
    ok $result instanceof Greet
    ok $c.$name() instanceof Control
  
  test "Utilities: propertyVector", ->
    $a = Control.create "one"
    $b = Control.create "two"
    $c = $a.add( $b )
    vector = $c.propertyVector "content"
    deepEqual vector, [ "one", "two" ]
    $c.propertyVector "content", [ "un", "deux" ]
    equal $a.content(), "un"
    equal $b.content(), "deux"

  test "Utilities: segments", ->
    c = $(  "<div>Ann</div><div>Bob</div>"  ).control Control;
    segments = c.segments();
    ok segments instanceof Array
    equal segments.length, 2
    equal segments[0].content(), "Ann"
    equal segments[1].content(), "Bob"
