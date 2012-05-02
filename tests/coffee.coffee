###
CoffeeScript tests
###

window.coffeeTests = ->

  class Simple extends Control
    constructor: -> return @coffee arguments
  
  class Greet extends Simple
    constructor: -> return @coffee arguments
    settings:
      content: [
        "Hello ",
        { html: "<span>", id: "Greet_content" }
      ]
    content: Control.chain "$Greet_content", "content"
  
  test "CoffeeScript: create simple class", ->
    simple = Simple.create "Hello"
    ok simple instanceof jQuery
    ok simple instanceof Control
    ok simple instanceof Simple
    ok simple instanceof Simple::init
    equal simple.className, "Simple"
    equal simple.classHierarchy, "Simple Control"
    equal simple.content(), "Hello"

  test "CoffeeScript: create subclass", ->
    greet = Greet.create "Ann"
    ok greet instanceof Simple
    ok greet instanceof Greet
    equal greet.className, "Greet"
    equal greet.classHierarchy, "Greet Simple Control"
    equal greet.content(), "Ann"
    equal greet.text(), "Hello Ann"
