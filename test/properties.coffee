###
Control property declaration unit tests
###

$ ->
  
  test "Properties: chain: root content", ->
    createGreetClass()
    Greet::foo = Control.chain "content"
    $c = Greet.create()
    result = $c.foo()
    equal result[0], "Hello "
    equal $( result[1] ).html(), "Ann"
    $c.foo "world"
    equal $c.html(), "world"
  
  test "Properties: chain: element", ->
    createGreetClass()
    Greet::name = Control.chain "$name"
    $c = Greet.create()
    $element = $c.$name()
    equal $element[0], $c.find( ".name" )[0]
    equal $element.html(), "Ann"
  
  test "Properties: chain: element content", ->
    createGreetClass()
    Greet::name = Control.chain "$name", "content"
    $c = Greet.create()
    equal $c.name(), "Ann"
    $c.name "Bob"
    equal $c.text(), "Hello Bob"
  
  test "Properties: chain: subcontrol property", ->
    createGreetClass()
    Greet::name = Control.chain "$name", "content"
    MyControl = Control.sub
      className: "MyControl"
      inherited:
        content:
          control: "Greet"
          ref: "greet"
    MyControl::name = Control.chain "$greet", "name"
    $c = MyControl.create()
    equal $c.name(), "Ann"
    $c.name "Bob"
    equal $c.$greet().text(), "Hello Bob"
  
  test "Properties: chain: element content with iteration", ->
    createGreetClass()
    Greet::name = Control.chain "$name", "content"
    $inner1 = Greet.create name: "Ann"
    $inner2 = Greet.create name: "Bob"
    $c = Control.create content: [ $inner1, "/", $inner2 ]
    equal $c.text(), "Hello Ann/Hello Bob"
    $g = Greet $c.find ".Greet"
    equal $g.name(), "Ann"
    $g.name "Carol"
    equal $c.text(), "Hello Carol/Hello Carol"
  
  test "Properties: chain: element content with side effect function", ->
    createGreetClass()
    Greet::name = Control.chain "$name", "content", ( name ) ->
      @data "_name", name
    $c = Greet.create()
    $c.name "Ann"
    equal $c.name(), "Ann"
    equal $c.data( "_name" ), "Ann"
  
  test "Properties: chain: chaining", ->
    createGreetClass()
    Greet::extend
      foo: Control.chain "content"
      bar: Control.chain "prop/display"
  
    $c = Greet.create()
    result = $c.foo( "Hello" ).bar( "inline" )
    equal $c.content(), "Hello"
    equal $c.prop( "display" ), "inline"
    equal result, $c
  
  test "Properties: chain: functions with parameters", ->
    MyControl = Control.sub className: "MyControl"
    MyControl::display = Control.chain "css/display"
    $c = MyControl.create()
    $c.css "display", "block"
    equal $c.display(), "block"
    $c.display "none"
    equal $c.css( "display" ), "none"
    equal $c.display(), "none"
    
  test "Properties: chain: function undefined", ->
    MyControl = Control.sub className: "MyControl"
    MyControl::foo = Control.chain "bar" # Chains to undefined bar() function
    $c = MyControl.create()
    raises ->
      $c.foo()

  test "Properties: Define method", ->
    MyControl = Control.sub className: "MyControl"
    MyControl::foo = ->
      @data "_calledFoo", true
    $elements = Control( "<div/>" ).add( "<div/>" )
    $c = $elements.control MyControl
    result = $c.foo()
    equal result, $c # returns "this"
    equal $c.eq( 0 ).data( "_calledFoo" ), true
    equal $c.eq( 1 ).data( "_calledFoo" ), true
  
  test "Properties: Define method with iterator()", ->
    MyControl = Control.sub className: "MyControl"
    MyControl::foo = Control.iterator ->
        @data "_calledFoo", true
    $elements = Control( "<div/>" ).add( "<div/>" )
    $c = $elements.control MyControl
    methodResult = $c.foo()
    equal methodResult, $c # i.e., should return "this"
    equal $c.eq( 0 ).data( "_calledFoo" ), true
    equal $c.eq( 1 ).data( "_calledFoo" ), true
  
  test "Properties: Define getter/setter with iterator()", ->
    MyControl = Control.sub className: "MyControl"
    MyControl::foo = Control.iterator ( value ) ->
      @data "_property", value
    $elements = Control( "<div/>" ).add( "<div/>" )
    $c = $elements.control MyControl
    $c.foo "bar"
    equal $c.eq( 0 ).control().data( "_property" ), "bar"
    equal $c.eq( 1 ).control().data( "_property" ), "bar"
  
  test "Properties: Define getter/setter with Control.property", ->
    MyControl = Control.sub()
    MyControl::myProperty = Control.property()
    $elements = Control( "<div/>" ).add( "<div/>" )
    $c = $elements.control MyControl
    equal $c.myProperty() is undefined, true
    $c.myProperty "foo"
    equal $c.eq( 0 ).myProperty(), "foo"
    equal $c.eq( 1 ).myProperty(), "foo"
  
  test "Properties: property", ->
    $c = Control.create()
    $c.foo = Control.property()
    equal $c.foo() is undefined, true
    result = $c.foo "Hello"
    equal result, $c
    equal $c.foo(), "Hello"
  
  test "Properties: property: bool", ->
    $c = Control.create()
    $c.foo = Control.property.bool()
    $c.foo "true" # Set as string
    equal $c.foo(), true
    $c.foo false # Set as bool
    equal $c.foo(), false
  
  test "Properties: property: integer", ->
    $c = Control.create()
    $c.foo = Control.property.integer()
    $c.foo "123" # Set as string
    equal $c.foo(), 123
    $c.foo 0 # Set as integer
    equal $c.foo(), 0

  test "Properties: side-effect function", ->
    $c = Control.create()
    $c.foo = Control.property ( newFoo ) ->
      equal arguments.length, 1
      equal newFoo, "Hello"
    equal $c.foo(), undefined
    $c.foo "Hello"
    equal $c.foo(), "Hello"

  test "Properties: side effect function with old value", ->
    $c = Control.create()
    $c.foo = Control.property ( newFoo, oldFoo ) ->
      equal arguments.length, 2
      equal oldFoo, expectedOldValue
    expectedOldValue = undefined
    $c.foo "Hello"
    expectedOldValue = "Hello"
    $c.foo "world"
