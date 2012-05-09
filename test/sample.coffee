###
Shared sample classes used by unit tests.
###

createGreetClass = ->
  window.Greet = Control.subclass
    className: "Greet"
    content: [
      "Hello "
      { html: "<span>Ann</span>", ref: "name" }
     ]
