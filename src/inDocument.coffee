###
Let controls get notified when they are added to the document.
###


###
A (new) control is asking to have a callback invoked when the control
has been inserted into the document body. This is useful because
the initialize event is often invoked before the control has actually
been added to the document, and therefore doesn't have height or width,
doesn't have any externally-imposed styles applied to it, etc.

If the control is already in the document, the callback is executed
immediately.

If no callback function is supplied, this returns true if all controls
are in the document, and false if not.

Callbacks will be invoked in reserve document order to ensure that
the callback of a child will be invoked before the callback of a parent.
This lets the parent proceed knowing that its children have already had
the chance to set themselves up.
###
Control::inDocument = ( callback ) ->
  if callback is undefined

    # The empty condition is defined as being *not* in the document.
    return false if @length is 0

    # See if controls are in document.
    for element in @
      unless isElementInDocument element
        return false  # At least one control is not in the document.
    
    true  # All controls are in the document.
    
  else
    # Invoke callback immediately for controls already in document,
    # queue a callback for those which are not.
    callbacks = []
    for element, i in @
      if isElementInDocument element
        callback.call @constructor element  # Now in document; invoke callback.
      else
        # Add element to the list we're waiting to see inserted.
        callbacks.push
          element: element
          callback: callback
    if callbacks.length > 0
      Control._elementInsertionCallbacks = callbacks.concat Control._elementInsertionCallbacks
      Control._startListeningForElementInsertion() unless Control._listeningForElementInsertion
    @


# TODO: Move these to regular functions
$.extend Control,

  ###
  An element may have been added to the document; see if it's a control that's
  waiting to be notified of that via Control.prototype.inDocument().
  ### 
  _checkForElementInsertion: ( event ) ->
    callbacksReady = []
    i = 0
    while i < Control._elementInsertionCallbacks.length
      element = Control._elementInsertionCallbacks[i].element
      if isElementInDocument element
        # The element has been inserted into the document. Move it
        # into the list of callbacks which we can now invoke.
        callbacksReady = callbacksReady.concat Control._elementInsertionCallbacks[i]
        # Now remove it from the pending list. We remove it from the list
        # *before* we invoke the callback -- because the callback
        # itself might do DOM manipulations that trigger more DOM
        # mutation events.
        Control._elementInsertionCallbacks.splice i, 1
      else
        i++
    
    if Control._elementInsertionCallbacks.length == 0
      # No more elements to wait for.
      Control._stopListeningForElementInsertion()
    
    for callback in callbacksReady
      control = Control( callback.element ).control()
      callback.callback.call control

    # Controls waiting (via an inDocument call) to be added to the body.
  _elementInsertionCallbacks: []

    # True if Control is currently listening for DOM insertions.
  _listeningForElementInsertion: false

    # True if we can rely on DOM mutation events to detect DOM changes. 
  _mutationEvents: ->
    # Since the only QuickUI-supported browser that doesn't support
    # mutation events is IE8, we just look for that. If need be, we
    # could programmatically detect support using something like
    # Diego Perini's NWMatcher approach.
    not $.browser.msie or parseInt( $.browser.version ) >= 9

  ###
  Start listening for insertions of elements into the document body.
  
  On modern browsers, we use the DOMNodeInserted mutation event (which, as of
  7/2011, had better browser coverage than DOMNodeinDocument).
  Mutation events are slow, but the only way to reliably detect insertions
  that are created outside the document and then later added in. The events
  aren't used when we can avoid it, and the event is unbound once all known
  pending controls have been added.
   
  IE8 doesn't support mutation events, so we have to set up our own polling
  interval to check to see whether a control has been added. Again, we avoid
  doing this at all costs, but this apparently is the only way we can
  determine when elements have been added in IE8.
  ###    
  _startListeningForElementInsertion: ->
    if Control._mutationEvents()
      # Use mutation events.
      if document.body
        # The document's ready for us to wire up mutation event handlers.
        jQuery( "body" ).on "DOMNodeInserted", Control._checkForElementInsertion
        Control._listeningForElementInsertion = true
      else unless Control._deferredElementInsertionListening
        # We can't sink events yet, so things get messy. We have to
        # queue up a ready() callback that can wire up the events.
        jQuery( "body" ).ready ->
          # Check pending callbacks.
          Control._checkForElementInsertion()
          # If any callbacks are left, start listening.
          Control._startListeningForElementInsertion()  if Control._elementInsertionCallbacks.length > 0
          Control._deferredElementInsertionListening = false
          # Make note that we've already deferred, so we don't do it again.
        Control._deferredElementInsertionListening = true
    else
      # Use timer
      self = this
      Control._elementInsertionInterval = window.setInterval( ->
        self._checkForElementInsertion()
      , 10 )

  _stopListeningForElementInsertion: ->
    if Control._mutationEvents()
      jQuery( "body" ).off "DOMNodeInserted", Control._checkForElementInsertion
      Control._listeningForElementInsertion = false
    else
      window.clearInterval Control._elementInsertionInterval
      Control._elementInsertionInterval = null


###
Return true if the document body contains the indicated element, or if
if the element *is* the document body.
###
isElementInDocument = ( element ) ->
  !!document.body and ( document.body is element or $.contains( document.body, element ) )
