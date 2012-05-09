###
Control JSON: a JSON scheme for defining a control class.
###


###
Apply the indicated JSON to the control. Each key in the JSON will
invoke the corresponding setter function in a function chain. E.g.,
the JSON dictionary

     {
         foo: "Hello",
         bar: "World"
     }

will invoke this.foo( "Hello" ).bar( "World" ).

If a dictionary value is itself a JSON object, it will be reconstituted
into HTML, or controls, or an array.

This is similar to properties(), but that function doesn't attempt any
processing of the values.

The logicalParent parameter is intended for internal use only.
###
Control::json = ( json, logicalParent ) ->
  logicalParent ?= @
  for control, i in @each()
    properties = evaluateControlJsonProperties json, logicalParent.nth( i )
    control.properties properties
  @


###
Create the control from the given JSON. This will be of three forms.
The first form creates a control:

 {
   control: "MyButton",
   id: "foo",     
   content: "Hello, world."
 }

The special "control" property determines the class of the control. 
The second form creates a plain HTML element:

 {
   html: "<div/>",
   id: "foo"
 }

The html can be any HTML string supported by jQuery. It can also be an HTML
tag singleton without braces: e.g., "div" instead of needing "<div>" or
"<div/>". In normal jQuery, a tag like "div" would be a selector, and would
not create an element. But in the context of creating controls, it seems
more useful to interpret this to create an element of the indicated type.

The "id" property determines the ID *andhas the side effect of creating
an element reference so the logical parent can find that control later.
The remainder of the JSON properties are invoked as setters on the new
control.

The third form is any other JSON dictionary object, returned as is.
###
evaluateControlJson = ( json, logicalParent ) ->
  # Get the first key in the JSON.
  for firstKey of json
    break
  return json  if firstKey isnt "html" and firstKey isnt "control"  # Regular object, return as is.
  reservedKeys = {}
  reservedKeys[firstKey] = true
  stripped = copyExcludingKeys json, reservedKeys
  properties = evaluateControlJsonProperties stripped, logicalParent
  control = undefined
  if firstKey is "html"
    html = json.html
    if /^\w+$/.test html
      # HTML tag singleton. Map tag like "div" to "<div>".
      html = "<" + html + ">"
    control = Control( html ).properties properties
  else
    control = Control.getClass( json.control ).create properties
  if json.id
    # Create an element reference function on the parent's class.
    logicalParentClass = logicalParent.constructor
    elementReference = "$" + json.id
    unless logicalParentClass::[ elementReference ]
      logicalParentClass::[ elementReference ] = ( elements ) ->
        @referencedElement elementReference, elements
    logicalParent.referencedElement elementReference, control
  control


###
For each key in the given JSON object, evaluate its value.

If the JSON is a scalar value (e.g., a string) or array, this will implicitly
be taken as a content property. E.g., a json argument of "Hello" would have
the same as { content: "Hello" }.
###
evaluateControlJsonProperties = ( json, logicalParent ) ->
  # Scalar value or array; take this as the content property.
  json = content: json unless jQuery.isPlainObject json
  properties = {}
  for key of json
    properties[ key ] = evaluateControlJsonValue json[key], logicalParent
  properties
  
  
###
Determine the value of the given JSON object found during the processing
of control JSON.

If the supplied json is a JavaScript object, it will be treated as a control
and created from that object's properties.
If it's an array, its items will be mapped to their values using this same
function.
Otherwise, the object is returned as is.

The "logical parent" is the control whose JSON defined the elements being
created. The logical parent for a given element may not be the element's
immediate parent in the DOM; it might be higher up.
###
evaluateControlJsonValue = ( value, logicalParent ) ->
  if jQuery.isArray value
    # Recursively process each member of the array.
    ((
      itemValue = evaluateControlJsonValue item, logicalParent
      if itemValue instanceof jQuery
        itemValue[0] # Just add element
      else
        itemValue
    ) for item in value )
  else if jQuery.isPlainObject value
    # Process JSON sub-dictionary.
    evaluateControlJson value, logicalParent
  else
    # Return other types of values as is.
    value
