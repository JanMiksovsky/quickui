###
Layout helpers.
###

###
See if the control's size has changed since the last time we checked and,
if so, trigger the sizeChanged event.

A control can use this method to let layout-performing ancestors know
that the control has changed its size, in case the ancestor will now
need to update the layout.
###
Control::checkForSizeChange = ->
  @trigger "sizeChanged" if updateSavedSize @
  @


###
Layout event.

Elements can use the layout event if they want to perform custom layout when
their size changes. The layout contract is weak: it's generally triggered
when the window size changes AND the element's size has actually changed in
response.
 
The layout event will *notautomatically fire if the element's size has
changed in response to other activity, such as a child element growing in
size. Supporting that generally would require setting up an expensive poll
interval. However, a contained element that want to let their containers
know about changes in the contained element's size can do so by triggering
a layout event that will bubble up to the container.      
###
jQuery.event.special.layout =

  ###
  Add a layout event handler.
  ###
  add: ( handleObj ) ->
    # Add the element to the set of element being tracked.
    layout = jQuery.event.special.layout
    layout._trackedElements = layout._trackedElements.add @
    # Send an initial layout event when the element is in the document.
    Control( this ).inDocument ->
      ###
      Directly invoke the handler instead of triggering the event.
      If add() is invoked on an element that's already in the document,
      inDocument() will fire immediately, which means the handler won't
      be wired up yet.
      ###
      handler = handleObj.handler
      event = new jQuery.Event "layout"
      handler.call this, event


  ###
  Handle the layout event.
  ###
  handle: ( event ) ->
    control = new Control @
    return unless control.inDocument()            # Not currently in document; no need for layout.
    # TODO: Shouldn't the line below invoke updateSavedSize()?
    return unless control.checkForSizeChange()    # Size hasn't actually changed; no need for layout.
    event.handleObj.handler.apply @, arguments


  ###
  Called the first time the layout event is added to an element.
  ###
  setup: ->
    # Are we already handling the window resize event?
    layout = jQuery.event.special.layout
    unless layout._trackingResizeEvent
      # Start handling window resize.
      $( window ).resize ->
        layout._windowResized()
      layout._trackingResizeEvent = true


  ###
  The last layout event handler for an element has been removed.
  ###    
  teardown: ->
    # Remove the control from the set of controls being tracked.
    jQuery.event.special.layout._trackedElements = jQuery.event.special.layout._trackedElements.not @


  ###
  The set of elements receiving layout events.
  ###
  _trackedElements: $()


  ###
  The window has been resized.
  ###
  _windowResized: ->
        # Trigger layout event for all elements being asked.
    jQuery.event.special.layout._trackedElements.trigger "layout"


###
Compare the control's current size with its previously recorded size.
If the size has not changed, return false. If the size has changed,
update the recorded size and return true.
###
updateSavedSize = ( control ) ->
  previousSize = control.data( "_size" ) ? {}
  size =
    height: control.height()
    width: control.width()
  if size.height is previousSize.height and size.width is previousSize.width
    # Size hasn't changed.
    false
  else
    # Size changed; record the new size.
    control.data "_size", size
    true
