###
inDocument unit tests
###

$ ->

  # InDocumentSample control that creates an inDocument callback request.
  InDocumentSample = Control.subclass
    className: "InDocumentSample"
    prototype:
      inDocumentCalled: Control.property.bool()
      initialize: ->
        @inDocument -> @inDocumentCalled true
  
  # Add a control to force the raising of an inDocument event.
  addControl = ( control ) ->
    $( "#qunit-fixture" ).append control
    if jQuery.browser.msie and parseInt( jQuery.browser.version ) < 9
      # IE 8 uses polling. Force a check for element insertion.
      Control._elementInserted()

  ###
  Create a control *before* the document body is ready. Any inDocument()
  callbacks queued up here should still work.
  
  Note: This control creation effects the pending count, and so the execution
  order of the tests can be affected by when QUnit runs this test. If
  necessary, we could set QUnit.config.reorder = false.
  ### 
  createdBeforeReady = InDocumentSample.create()  
  
  test "inDocument: control created before document ready", ->
    addControl createdBeforeReady
    ok createdBeforeReady.inDocumentCalled()

  test "inDocument: typical invocation in control created outside document and then added", ->
    $c = InDocumentSample.create()
    ok not $c.inDocumentCalled()
    addControl $c
    ok $c.inDocumentCalled()
  
  test "inDocument: nested invocations outside document", ->
    $c = InDocumentSample.create().content InDocumentSample.create()
    ok not $c.inDocumentCalled()
    addControl $c
    ok $c.inDocumentCalled()

  ###  
  inDocument callbacks should get invoked in reverse document order, so
  if we have a control containing two children A and B, in that order,
  then B's callbacks should get invoked before A's.
  ###
  test "inDocument: invocations happen in reverse document order", ->
    $a = InDocumentSample.create("A").inDocument ->
      ok $b.inDocumentCalled()
    $b = InDocumentSample.create("B").inDocument ->
      ok not $a.inDocumentCalled()
    $c = Control.create().content [ $a, $b ]
    addControl $c
  
  test "inDocument: create controls on element in document", ->
    $c = $("<div/>")
    addControl $c
    $c = $c.control InDocumentSample
    ok $c.inDocumentCalled()
    