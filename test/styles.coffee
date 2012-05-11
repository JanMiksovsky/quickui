###
CSS helpers unit tests
###

$ ->
  
  test "Utilities: applyClass", ->
    $c = Control.create().toggleClass "foo"
    equal $c.applyClass( "foo" ), true
    equal $c.applyClass( "enabled" ), false
    $c.applyClass "enabled", true
    equal $c.applyClass( "foo" ), true
    equal $c.applyClass( "enabled" ), true
    
  test "Utilities: generic", ->
    createGreetClass()
    $c1 = Greet.create()
    ok !$c1.generic()
    equal $c1.prop( "class" ), "Greet Control"
    Greet::genericSupport = true
    $c2 = Greet.create()
    ok $c2.generic()
    equal $c2.prop( "class" ), "Greet Control generic"
      
  test "Utilities: visibility", ->
    $c = Control.create()
    equal $c.visibility(), false # Control isn't in DOM, so is not visible.
