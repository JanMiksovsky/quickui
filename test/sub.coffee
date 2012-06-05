###
Test subclassing facilities
###

$ ->

  test "sub: CoffeeScript-style class", ->
    class Sub extends Control
      property: "value"
    # Before instantiation, class isn't compatible with jQuery.
    equal Sub.superclass, jQuery # When fixed, will be equal to Control
    sub = Sub.create()
    equal Sub.superclass, Control
    ok sub instanceof jQuery
    ok sub instanceof Control
    ok sub instanceof Sub
    equal sub.className, "Sub"
    equal sub.classes, "Sub Control"
    equal sub.property, "value"

  test "sub: JavaScript-style class", ->
    Sub = `Control.sub({
      className: "Sub",
      property: "value"
    })`
    equal Sub.superclass, Control
    sub = Sub.create()
    ok sub instanceof jQuery
    ok sub instanceof Control
    ok sub instanceof Sub
    equal sub.className, "Sub"
    equal sub.classes, "Sub Control"
    equal sub.property, "value"

  ###
  test "sub: CoffeeScript-style subclasses CoffeeScript-style"

  test "sub: CoffeeScript-style subclasses JavaScript-style"

  test "sub: JavaScript-style subclasses JavaScript-style"

  test "sub: JavaScript-style subclasses CoffeeScript-style"


  test "sub: create subclass", ->
    c = GreetCoffee.create "Ann"
    ok c instanceof SimpleCoffee
    ok c instanceof GreetCoffee
    equal c.className, "GreetCoffee"
    equal c.classes, "GreetCoffee SimpleCoffee Control"
    equal c.content(), "Ann"
    equal c.text(), "Hello Ann"

  test "sub: subclass a class created with $.sub()", ->
    c = GreetSub.create "Ann"
    ok c instanceof GreetSub
    ok c instanceof Greet
    equal c.className, "GreetSub"
    equal c.classes, "GreetSub Greet Control"
    equal c.content(), "Ann"
    equal c.text(), "Hello Ann"
  ###