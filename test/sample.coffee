###
Shared sample classes used by unit tests.
###

createGreetClass = ->
  window.Greet = Control.sub
    className: "Greet"
    inherited: 
      content: [
        "Hello "
        { html: "<span>Ann</span>", ref: "name" }
       ]
