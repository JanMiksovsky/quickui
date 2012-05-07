###
Control JSON unit tests
###

$ ->
  
  test "json: plain text", ->
    c = Control.create()
    c.json content: "Hello"
    equal c.content(), "Hello"
  
  test "json: html", ->
    c = Control.create()
    c.json content:
      html: "<h1>Hello</h1>"
  
    equal c.html().toLowerCase(), "<h1>hello</h1>"
  
  test "json: html tag singleton without brackets", ->
    c = Control.create()
    c.json content:
      html: "span"
  
    equal c.html().toLowerCase(), "<span></span>"
  
  test "json: control", ->
    createGreetClass()
    Greet::extend name: Control.chain("$name", "content")
    c = Control.create()
    c.json content:
      control: "Greet"
      name: "Bob"
  
    greet = c.content().control()
    ok greet instanceof Greet
    equal greet.text(), "Hello Bob"
  
  test "json: explicit content array", ->
    c = Control.create()
    c.json content: [ "Hello", "world" ]
    equal c.contents().length, 2
    equal c.contents().eq(0).text(), "Hello"
    equal c.contents().eq(1).text(), "world"
  
  test "json: implicit content array", ->
    c = Control.create()
    c.json [ "Hello", "world" ]
    equal c.contents().length, 2
    equal c.contents().eq(0).text(), "Hello"
    equal c.contents().eq(1).text(), "world"
