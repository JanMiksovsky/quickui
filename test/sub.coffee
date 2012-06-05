###
Test subclassing facilities
###

$ ->

  test "sub: CoffeeScript-style class", ->
    class Sub extends Control
    # Before instantiation, class isn't compatible with jQuery.
    equal Sub.superclass, jQuery # When fixed, will be equal to Control
    c = Sub.create()
    equal Sub.superclass, Control
    ok c instanceof jQuery
    ok c instanceof Control
    ok c instanceof Sub
    ok ( c.init:: ) instanceof Control
    equal c.className, "Sub"
    equal c.classes, "Sub Control"

  test "sub: JavaScript-style class", ->
    Sub = `Control.sub({
      className: "Sub",
    })`
    equal Sub.superclass, Control
    c = Sub.create()
    ok c instanceof jQuery
    ok c instanceof Control
    ok c instanceof Sub
    ok ( c.init:: ) instanceof Control
    equal c.className, "Sub"
    equal c.classes, "Sub Control"

  test "sub: CoffeeScript-style subclasses CoffeeScript-style", ->
    class Sub extends Control
    class SubSub extends Sub
    c = SubSub.create()
    equal SubSub.superclass, Sub
    ok c instanceof jQuery
    ok c instanceof Control
    ok c instanceof SubSub
    ok c instanceof Sub
    equal c.className, "SubSub"
    equal c.classes, "SubSub Sub Control"


  ###
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