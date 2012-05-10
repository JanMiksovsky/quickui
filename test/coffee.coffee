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
    equal SimpleCoffee::className, "SimpleCoffee"
    equal SimpleCoffee.classHierarchy, "SimpleCoffee Control"
    equal c.content(), "Hello"

  test "CoffeeScript: create subclass", ->
    c = GreetCoffee.create "Ann"
    ok c instanceof SimpleCoffee
    ok c instanceof GreetCoffee
    equal GreetCoffee::className, "GreetCoffee"
    equal GreetCoffee.classHierarchy, "GreetCoffee SimpleCoffee Control"
    equal c.content(), "Ann"
    equal c.text(), "Hello Ann"
