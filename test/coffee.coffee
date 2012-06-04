###
CoffeeScript support unit tests
###

$ ->

  class SimpleCoffee extends Control
    constructor: -> return Control.coffee()
  
  class GreetCoffee extends SimpleCoffee
    constructor: -> return Control.coffee()
    inherited:
      content: [
        "Hello ",
        { html: "<span>Ann</span>", ref: "GreetCoffee_content" }
      ]
    content: Control.chain "$GreetCoffee_content", "content"
  
  test "CoffeeScript: create SimpleCoffee class", ->
    c = SimpleCoffee.create "Hello"
    ok c instanceof jQuery
    ok c instanceof Control
    ok c instanceof SimpleCoffee
    ok c instanceof SimpleCoffee::init
    equal c.className, "SimpleCoffee"
    equal c.classes, "SimpleCoffee Control"
    equal c.content(), "Hello"

  test "CoffeeScript: create subclass", ->
    c = GreetCoffee.create "Ann"
    ok c instanceof SimpleCoffee
    ok c instanceof GreetCoffee
    equal c.className, "GreetCoffee"
    equal c.classes, "GreetCoffee SimpleCoffee Control"
    equal c.content(), "Ann"
    equal c.text(), "Hello Ann"


  class SimpleCoffee2 extends Control2
  
  class GreetCoffee2 extends SimpleCoffee
    inherited:
      content: [
        "Hello ",
        { html: "<span>Ann</span>", ref: "GreetCoffee_content" }
      ]
    content: Control.chain "$GreetCoffee_content", "content"
  
  test "CoffeeScript: create SimpleCoffee2 class", ->
    c = SimpleCoffee2.create "Hello"
    ok c instanceof jQuery
    ok c instanceof Control
    ok c instanceof SimpleCoffee2
    ok c instanceof SimpleCoffee2::init
    equal c.className, "SimpleCoffee2"
    equal c.classes, "SimpleCoffee2 Control"
    equal c.content(), "Hello"

  test "CoffeeScript: create subclass", ->
    c = GreetCoffee2.create "Ann"
    ok c instanceof SimpleCoffee2
    ok c instanceof GreetCoffee2
    equal c.className, "GreetCoffee2"
    equal c.classes, "GreetCoffee2 SimpleCoffee2 Control"
    equal c.content(), "Ann"
    equal c.text(), "Hello Ann"
