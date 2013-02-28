###
Content unit tests
###

$ ->
  
  test "Content: HTML text", ->
    $c = Control.create()
    $c.content "Hello"
    equal $c.content(), "Hello"
    equal $c.html(), "Hello"
  
  test "Content: HTML text, return canonical form", ->
    $c = Control.create()
    $c.content [ "Hello" ]
    equal $c.content(), "Hello"
    equal $c.html(), "Hello"
  
  test "Content: HTML array", ->
    $c = Control.create()
    b = $("<b>there</b>")[0]
    $c.content [ "Hello", b, "world" ]
    equal $c.html().toLowerCase(), "hello<b>there</b>world"
    content = $c.content()
    equal content[0], "Hello"
    equal content[1], b
    equal content[2], "world"
  
  test "Content: input element", ->
    $c = new Control "<input type='text'/>"
    $c.content "Hello"
    equal $c.content(), "Hello"
    equal $c.val(), "Hello"
  
  test "Content: jQuery object", ->
    $c = Control.create()
    $c.content "<h1>Hello</h1>"
    content = $c.content()
    ok content instanceof jQuery
    equal content[0].nodeName.toLowerCase(), "h1"
    equal content.html(), "Hello"
