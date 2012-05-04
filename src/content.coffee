###
Standardized handling of element content.
###


Control::extend

  ###
  Get/set the content of an HTML element.
  
  Like $.contents(), but you can also set content, not just get it.
  You can set content to a single item, an array of items, or a set
  of items listed as parameters. Setting multiple items at a time
  is an important case in compiled QuickUI markup. Input elements
  are also handled specially: their value ( val ) is their content.
  
  This function attempts to return contents in a canonical form, so
  that setting contents with common parameter types is likely to
  return those values back in the same form. If there is only one
  content element, that is returned directly, instead of returning
  an array of one element. If the element being returned is a text node,
  it is returned as a string.
  
  Usage:
   $element.content( "Hello" )              # Simple string
   $element.content( ["Hello", "world"] )   # Array
   $element.content( "Hello", "world" )     # Parameters
   Control( "<input type='text'/>" ).content( "Hi" )   # Sets text value
  
  This is used as the default implementation of a control's content
  property. Controls can override this behavior.
  ###
  content: ( value ) ->
    if value is `undefined`
            # Getting contents. Just process first element.
      $element = @nth( 0 )
      result = undefined
      if $element.isInputElement()
                # Return input element value.
        result = $element.val()
      else
                # Return HTML contents in a canonical form.
        resultContainsStrings = false
        result = $element.contents().map( ( index, item ) ->
          if item.nodeType is 3
                        # Return text as simple string
            resultContainsStrings = true
            item.nodeValue
          else
            item
        )
                    # Return the single string instead of an array.
        result = result[0]  if resultContainsStrings and result.length is 1
      result
    else
            # Setting contents.
            
            # Cast arguments to an array.
            
                 # set of parameters
                 
                 # convert jQuery object to array 
                 
                 # single array parameter
                 # singleton parameter
      array = ( if ( arguments.length > 1 ) then arguments else ( if value instanceof jQuery then value.get() else ( if $.isArray( value ) then value else [ value ] ) ) )
      @each ( index, element ) ->
        $element = Control( element )
        if $element.isInputElement()
                    # Set input element value.
          $element.val value
        else
                    # Set HTML contents.

                    # We're about to blow away the contents of the element
                    # via $empty(), but the new content value might actually
                    # already be deeper in the element's existing content.
                    # To ensure that data, etc., get preserved, first detach
                    # the existing contents.
          $element.children().detach()
                    # Use apply() to feed array to $.append() as params.
          $element.empty().append.apply $element, array


  ###
  Return true if the (first) element is an input element (with a val).
  Note that buttons are not considered input elements, because typically
  when one is setting their contents, one wants to set their label, not
  their "value".
  ###
  # TODO: Make regular function
  isInputElement: ->
    inputTags = [ "input", "select", "textarea" ]
    ( if @length is 0 then false else ( $.inArray( this[0].nodeName.toLowerCase(), inputTags ) >= 0 ) )
