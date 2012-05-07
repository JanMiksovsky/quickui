###
CSS helpers unit tests
###

$ ->
  
  test "Utilities: applyClass", ->
    $c = Control.create().toggleClass("foo")
    equal $c.applyClass("foo"), true
    equal $c.applyClass("enabled"), false
    $c.applyClass "enabled", true
    equal $c.applyClass("foo"), true
    equal $c.applyClass("enabled"), true
      
  test "Utilities: visibility", ->
    $c = Control.create()
    equal $c.visibility(), false # Control isn't in DOM, so is not visible.
