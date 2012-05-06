###
Utilities unit tests
###

window.utilitiesTests = ->

  test "Utilities: each", ->
    c = $( "<div>Ann</div><div>Bob</div>" ).control( Control );
    segments = c.each();
    ok segments instanceof Array
    equal segments.length, 2
    equal segments[0].content(), "Ann"
    equal segments[1].content(), "Bob"