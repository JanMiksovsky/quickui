###
Standardized handling of element content.
###


Control::extend

  ###
  Get/set the content of an HTML element.
  
  Like $.contents(), but you can also set content, not just get it.
  You can set content to a single item, an array of items, or a set
  of items listed as parameters. Setting multiple items at a time
  is an important case in rehydrating HTML controls. Input elements
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
    if value is undefined
      # Getting contents. Just process first element.
      $element = @nth 0
      if isInputElement $element[0]
        $element.val()  # Return input element value.
      else
        # Return HTML contents in a canonical form.
        result = ((
          # Return child text nodes as strings
          if item.nodeType is 3 then item.nodeValue else item
        ) for item in $element.contents() )
        if result.length == 1 and typeof result[0] == "string"
          result[0] # Return the single string instead of an array.
        else
          @constructor result
    else
      # Setting contents.

      # Cast arguments to an array.
      array = if arguments.length > 1
        arguments 
      else if value instanceof jQuery
        value.get()                       # convert jQuery object to array 
      else if jQuery.isArray value
        value                             # single array parameter
      else
        [ value ]                         # singleton parameter

      for $element in @segments()
        if isInputElement $element[0]
          # Set input element value.
          $element.val value
        else
          # The new content value might actually already be deeper in the
          # element's existing content. To ensure that data, etc., get
          # preserved, first detach the existing contents.
          $element.children().detach()
          # Set HTML contents.
          $element.empty().append array...
      @

###
Return true if the given element is an input element with a val().
Exception: buttons are not considered input elements, because typically
when one is setting their contents, one wants to set their label, not
their "value".
###
isInputElement = ( element ) ->
  inputTags = [ "input", "select", "textarea" ]
  ( jQuery.inArray element.nodeName.toLowerCase(), inputTags ) >= 0
