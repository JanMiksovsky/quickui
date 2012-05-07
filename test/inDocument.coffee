###
inDocument unit tests
###

$ ->

  ###
  test "inDocument: control created before document ready", ->
    equal pendingCount(), 1
    ok not $createdBeforeReady.inDocumentCalled()
    addControl $createdBeforeReady
    equal pendingCount(), 0
    ok $createdBeforeReady.inDocumentCalled()
    teardown()
  ###
  
  # InDocumentSample control that creates an inDocument callback request.
  InDocumentSample = Control.subclass
    className: "InDocumentSample"
    prototype:
      inDocumentCalled: Control.property.bool()
      initialize: ->
        @inDocument ->
          @inDocumentCalled true
  
  # Add a control to force the raising of an inDocument event.
  addControl = ( control ) ->
    $( "qunit-fixture" ).append control
    if Control._elementInsertionInterval
      # A timer has been set up, which means we're in IE 8.
      # Simulate the timer ticking over.
      Control._checkForElementInsertion()

  # Return the number of controls waiting for an inDocument event.  
  pendingCount = ->
    Control._elementInsertionCallbacks?.length ? 0
  
  test "inDocument: typical invocation in control created outside document and then added", ->
    equal pendingCount(), 0
    $c = InDocumentSample.create()
    equal pendingCount(), 1
    ok not $c.inDocumentCalled()
    addControl $c
    equal pendingCount(), 0
    ok $c.inDocumentCalled()
  
  test "inDocument: nested invocations outside document", ->
    equal pendingCount(), 0
    $c = InDocumentSample.create().content InDocumentSample.create()
    equal pendingCount(), 2
    ok not $c.inDocumentCalled()
    addControl $c
    equal pendingCount(), 0
    ok $c.inDocumentCalled()

  ###  
  inDocument callbacks should get invoked in reverse document order, so
  if we have a control containing two children A and B, in that order,
  then B's callbacks should get invoked before A's.
  ###
  test "inDocument: invocations happen in reverse document order", ->
    equal pendingCount(), 0
    $a = undefined
    $b = undefined
    $c = undefined
    $a = InDocumentSample.create("A").inDocument ->
      ok $b.inDocumentCalled()
    $b = InDocumentSample.create("B").inDocument ->
      ok not $a.inDocumentCalled()
    $c = Control.create().content [ $a, $b ]
    equal pendingCount(), 4
    addControl $c
    equal pendingCount(), 0
  
  test "inDocument: create controls on element in document", ->
    equal pendingCount(), 0
    $c = $("<div/>")
    addControl $c
    equal pendingCount(), 0
    $c = $c.control InDocumentSample
    equal pendingCount(), 0
    ok $c.inDocumentCalled()
    