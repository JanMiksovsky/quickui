###
Rehydration unit tests
###

$ ->
  
  test "Rehydrate: simple element with content", ->
    $e = $ "<div data-control='Control'>Hello</div>"
    $c = ( new Control( $e )).rehydrate()
    ok $c instanceof Control
    equal $e.attr( "data-control" ), undefined
    ok $e.hasClass "Control"
    equal $c.content(), "Hello"

  test "Rehydrate: custom content property", ->
    createGreetClass()
    Greet::content = Control.chain "$name", "content"
    $e = new Control "<div data-control='Greet'>Bob</div>"
    $c = $e.rehydrate()
    equal $c.text(), "Hello Bob"
    equal $c.content(), "Bob"

  test "Rehydrate: data- property", ->
    createGreetClass()
    Greet::name = Control.chain "$name", "content"
    $e = new Control "<div data-control='Greet' data-name='Bob'></div>"
    $c = $e.rehydrate()
    ok $c instanceof Greet
    equal $c.text(), "Hello Bob"
    equal $c.name(), "Bob"

  test "Rehydrate: compound property", ->
    createGreetClass()
    Greet::name = Control.chain "$name", "content"
    $e = new Control "<div data-control='Greet'><div data-property='name'>Bob</div></div>"
    equal $e.find( "[data-property]" ).length, 1
    $c = $e.rehydrate()
    equal $e.find( "[data-property]" ).length, 0
    equal $c.text(), "Hello Bob"
    equal $c.name(), "Bob"
    
  test "Rehydrate: subcontrol", ->
    createGreetClass()
    Greet::content = Control.chain "$name", "content"
    $e = new Control "<div data-control='Control'><div data-control='Greet'>Bob</div></div>"
    $c = $e.rehydrate()
    $sub = $c.content().control()
    ok $sub instanceof Greet
    equal $sub.text(), "Hello Bob"
    equal $sub.content(), "Bob"

  # This test only works when run in the browser.
  test "Rehydrate: automatically rehydrate with data-create-controls", ->
    $c = $( "#rehydration-test" ).control()
    ok $c instanceof Control
    equal $c.content(), "Hello"

  test "Rehydrate: class not found", ->
    $e = new Control "<div data-control='Foo'></div>"
    raises ->
      $c = $e.rehydrate()
