###
General control unit tests
###

$ ->

  test "Create: from scratch", ->
    $c = Control.create()
    equal $c.attr( "class" ), "Control"
    equal $c.control()[0] is $c[0], true
  
  test "Create: set properties on constructor", ->
    $c = Control.create text: "Hello"
    equal $c.text(), "Hello"
  
  test "control() on existing div", ->
    $element = $ "<div/>"
    $c = $element.control Control
    equal $c.attr( "class" ), "Control"
    equal $element.control()[0] is $c[0], true
  
  test "control() on multiple divs", ->
    MyControl = Control.subclass className: "MyControl"
    $elements = $().add( "<div/>" ).add( "<div/>" )
    $c = $elements.control MyControl
    equal $c.control().length, 2
  
  test "control() set properties", ->
    $element = $ "<div/>"
    $c = Control.createAt $element
    $element.control text: "Hello"
    equal $c.text(), "Hello"
  
  test "control() incorporate existing DOM content", ->
    MyControl = Control.subclass
      className: "MyControl"
      inherited:
        content: [
          "*"
          { html: "<span/>", ref: "MyControl_content" }
          "*"
        ]
    MyControl::content = Control.chain "$MyControl_content", "content"
    $original = $ "<div><div>Hello</div><div>world</div></div>"
    $children = $original.children()
    $c = MyControl.createAt $children
    equal $c.text(), "*Hello**world*"
  
  test "control() on existing content preserves existing control", ->
    MyControl = Control.subclass className: "MyControl"
    $original = $( "<div><div id='subcontrol'/></div>" )
    $subcontrol = $original.find( "#subcontrol" ).control MyControl
    $c = $original.control Control
    $sub = $c.find( "#subcontrol" ).control()
    equal $sub.attr( "class" ), "MyControl Control"
    
  test ":control filter", ->
    $c = Control.create()
    $d = $ "<div/>"
    $combined = $c.add $d
    ok $c.is ":control"
    ok $d.not ":control"
    ok $combined.is ":control"
    ok $combined.filter( ":control" ).length is 1 and $combined.filter( ":control" )[0] is $c[0]
  
  test "transmute: existing tag doesn't match desired tag", ->
    MyButton = Control.subclass
      className: "MyButton"
      tag: "button"
    c = Control.create "Hello"
    equal c[0].nodeName.toLowerCase(), "div"
    c = c.transmute MyButton, true
    equal c[0].nodeName.toLowerCase(), "button"
    equal c.text(), "Hello"
