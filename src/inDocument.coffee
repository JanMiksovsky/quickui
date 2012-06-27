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

inDocumentCallbacks will be invoked in reserve document order to ensure that
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
    newCallbacks = []
    for element, i in @
      if isElementInDocument element
        callback.call @constructor element  # Now in document; invoke callback.
      else
        # Add element to the list we're waiting to see inserted.
        newCallbacks.push
          element: element
          callback: callback
    if newCallbacks.length > 0
      # New inDocumentCallbacks go at beginning of list we're tracking.
      inDocumentCallbacks.unshift.apply inDocumentCallbacks, newCallbacks
      startInDocumentListening() unless inDocumentListening
    @


###
An element has been added to the document; see if it's a control that's been
waiting to be notified of that event via an inDocument() callback.
###
elementInserted = ( event ) ->
  callbacksReady = []
  i = 0
  while i < inDocumentCallbacks.length
    element = inDocumentCallbacks[i].element
    if isElementInDocument element
      # The element has been inserted into the document. Move it
      # into the list of callbacks which we can now invoke.
      callbacksReady.push inDocumentCallbacks[i]
      # Now remove the element from the pending list. We remove it from the list
      # *before* we invoke the callback -- because the callback itself might do
      # DOM manipulations that could trigger more DOM mutation events.
      inDocumentCallbacks.splice i, 1
    else
      i++
  if inDocumentCallbacks.length == 0
    stopInDocumentListening()   # No more elements to wait for.
  for callback in callbacksReady
    control = Control( callback.element ).control()
    callback.callback.call control
    
    
# Expose the elementInserted function so it can be reached from unit tests.
# Otherwise, this is an internal function, and should not be called directly.
Control._elementInserted = elementInserted


# Used to poll for element insertion in IE 8.
elementInsertionInterval = null


# Controls waiting (via an inDocument call) to be added to the body.
inDocumentCallbacks = []

# True if Control is currently listening for DOM insertions.
inDocumentListening = false

# True if we got a request for inDocument() before the document was ready.
inDocumentListeningDeferred = false


###
Return true if the document body contains the indicated element, or if
if the element *is* the document body.
###
isElementInDocument = ( element ) ->
  document?.body is element or jQuery.contains( document.body, element )


###
Return true if we can rely on DOM mutation events to detect DOM changes.
### 
mutationEvents = ->
  # Since the only QuickUI-supported browser that doesn't support
  # mutation events is IE 8, we just look for that. If need be, we
  # could programmatically detect support using something like
  # Diego Perini's NWMatcher approach.
  not jQuery.browser.msie or parseInt( jQuery.browser.version ) >= 9


###
Remove the given element from the list of callbacks, effectively canceling its
inDocument behavior. If the element is not in the list, this has no effect.
###
removeElementFromInDocumentCallbacks = ( element ) ->
  i = 0
  while i < inDocumentCallbacks.length
    if inDocumentCallbacks[i].element is element
      inDocumentCallbacks.splice i, 1
    else
      i++


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
startInDocumentListening = ->
  if mutationEvents()
    # Use mutation events.
    if document.body
      # The document's ready for us to wire up mutation event handlers.
      jQuery( "body" ).on "DOMNodeInserted", elementInserted
      inDocumentListening = true
    else unless inDocumentListeningDeferred

      # We can't sink events yet, so things get messy. We have to
      # queue up a ready() callback that can wire up the events.
      jQuery( "body" ).ready ->
        elementInserted() # Check pending inDocumentCallbacks.
        # If any callbacks are left, start listening.
        startInDocumentListening() if inDocumentCallbacks.length > 0
        inDocumentListeningDeferred = false

      # Make note that we've already deferred, so we don't do it again.
      inDocumentListeningDeferred = true
  else
    # Use timer (IE 8).
    elementInsertionInterval = window.setInterval( ->
      elementInserted()
    , 10 )


###
Stop listening for element insertion events.
###
stopInDocumentListening = ->
  if mutationEvents()
    jQuery( "body" ).off "DOMNodeInserted", Control.elementInserted
    inDocumentListening = false
  else
    window.clearInterval elementInsertionInterval
    elementInsertionInterval = null
