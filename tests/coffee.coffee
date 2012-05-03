###
CoffeeScript tests
###

window.coffeeTests = ->

  class Simple extends Control
    constructor: -> return Control.coffee()
  
  class Greet extends Simple
    constructor: -> return Control.coffee()
    inherited:
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
    equal Simple.className, "Simple"
    equal Simple.classHierarchy, "Simple Control"
    equal simple.content(), "Hello"

  test "CoffeeScript: create subclass", ->
    greet = Greet.create "Ann"
    ok greet instanceof Simple
    ok greet instanceof Greet
    equal Greet.className, "Greet"
    equal Greet.classHierarchy, "Greet Simple Control"
    equal greet.content(), "Ann"
    equal greet.text(), "Hello Ann"
