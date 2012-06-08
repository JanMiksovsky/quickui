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
    class NoGeneric extends Control
    $c1 = NoGeneric.create()
    ok !$c1.generic()
    equal $c1.prop( "class" ), "NoGeneric Control"
    class Generic extends Control
      inherited:
        generic: true
    $c2 = Generic.create()
    ok $c2.generic()
    equal $c2.prop( "class" ), "Generic Control generic"

  test "Utilities: generic override", ->
    class MyControl extends Control
      inherited:
        generic: true
    class Sub extends MyControl
      inherited:
        generic: false
    $c = Sub.create()
    ok !$c.generic()
    equal $c.prop( "class" ), "Sub MyControl Control"

  test "Utilities: visibility", ->
    $c = Control.create()
    equal $c.visibility(), false # Control isn't in DOM, so is not visible.
