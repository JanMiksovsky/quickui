###
Test subclassing facilities
###

$ ->

  test "sub: CoffeeScript class subclasses Control", ->
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

  test "sub: JavaScript class subclasses Control", ->
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

  test "sub: CoffeeScript class subclasses CoffeeScript subclass", ->
    class Sub extends Control
    class SubSub extends Sub
    c = SubSub.create()
    equal SubSub.superclass, Sub
    ok c instanceof jQuery
    ok c instanceof Control
    ok c instanceof Sub
    ok c instanceof SubSub
    equal c.className, "SubSub"
    equal c.classes, "SubSub Sub Control"


  test "sub: CoffeeScript subclass subclasses JavaScript class", ->
    Sub = `Control.sub({
      className: "Sub",
    })`
    class SubSub extends Sub
    c = SubSub.create()
    equal SubSub.superclass, Sub
    ok c instanceof jQuery
    ok c instanceof Control
    ok c instanceof Sub
    ok c instanceof SubSub
    equal c.className, "SubSub"
    equal c.classes, "SubSub Sub Control"

  test "sub: JavaScript class subclasses JavaScript class", ->
    Sub = `Control.sub({
      className: "Sub",
    })`
    SubSub = `Sub.sub({
      className: "SubSub",
    })`
    c = SubSub.create()
    equal SubSub.superclass, Sub
    ok c instanceof jQuery
    ok c instanceof Control
    ok c instanceof Sub
    ok c instanceof SubSub
    equal c.className, "SubSub"
    equal c.classes, "SubSub Sub Control"

  test "sub: JavaScript class subclasses CoffeeScript class", ->
    class Sub extends Control
    SubSub = `Sub.sub({
      className: "SubSub",
    })`
    c = SubSub.create()
    equal SubSub.superclass, Sub
    ok c instanceof jQuery
    ok c instanceof Control
    ok c instanceof Sub
    ok c instanceof SubSub
    equal c.className, "SubSub"
    equal c.classes, "SubSub Sub Control"
