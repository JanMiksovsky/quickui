###
Rehydration

This takes static HTML created in normal means for SEO purposes, and looks for
elements decorated with data- properties indicating which elements should be
reconstituted as live QuickUI controls.
###

###
Rehydrate controls from static HTML.
###
Control::rehydrate = ->
  # Process any contained controls first.
  subcontrols = @find( "[data-control]" ).get()
  if subcontrols.length > 0
    # Process elements in reverse, so we work from leaves towards root.
    for i in [ subcontrols.length - 1 .. 0 ]
      rehydrateElement subcontrols[i]
  # Process top elements if they're controls.
  # Collect the processed controls, which may differ from the original
  # elements if the existing elements didn't have they right tags.
  controls = ( ( if $e.data "control" then rehydrateElement $e[0] else $e ) for $e in @segments() )
  Control( controls ).cast()


###
Rehydrate the given element as a control.
###
rehydrateElement = ( element ) ->
  # Extract the control class from the element's "control" property
  # and remove it from the element.       
  $element = $ element
  className = $element.data "control"
  $element.removeAttr "data-control"
  controlClass = Control.getClass className
  # Extract properties. Compound properties ( those defined in children )
  # will get removed from the control content at this point.
  lowerCaseProperties = jQuery.extend(
    {},
    getPropertiesFromAttributes( element ),
    getCompoundPropertiesFromChildren( element )
  )
  properties = restorePropertyCase controlClass, lowerCaseProperties
  # Create the control.
  jQuery( element ).control controlClass, properties


###
Return the properties indicated on the given element's attributes.
###
getPropertiesFromAttributes = ( element ) ->
  properties = {}
  regexDataProperty = /^data-(.+)/
  for attribute in element.attributes
    match = regexDataProperty.exec attribute.name
    if match
      propertyName = match[1]
      properties[propertyName] = attribute.value if propertyName isnt "control"
  # Remove any data properties we've processed.
  # Removing during the loop above would complicate things, since
  # we also want to process the properties in the order they're defined.
  $element = jQuery element
  for key of properties
    $element.removeAttr "data-" + key
  properties


###  
Return any compound properties found in the given element's children.
###
getCompoundPropertiesFromChildren = ( element ) ->
  properties = {}
  $compoundElements = Control( element ).children().filter "[data-property]" 
  for $compound in $compoundElements.segments()
    propertyName = $compound.attr "data-property"
    if propertyName isnt "control" # data-control means a control, not a property.
      $value = $compound.content()
      properties[ propertyName ] = $value
      # Detach before removing so we preserve subcontrols.      
      $value.detach() if $value instanceof jQuery
  $compoundElements.remove()
  properties
  
  
###
Map the given property dictionary, in which all property names may be in
lowercase, to the equivalent mixed case names. Properties which are not
found in the control class are dropped.
###
restorePropertyCase = ( controlClass, properties ) ->
  return properties if jQuery.isEmptyObject properties
  map = classPropertyNameMap controlClass
  result = {}
  for propertyName of properties
    mixedCaseName = map[ propertyName.toLowerCase() ]
    result[ mixedCaseName ] = properties[ propertyName ] if mixedCaseName
  result


###
Cached maps for property names in rehydrated control classes. See below.
###
propertyNameMaps = {}


###
Return a dictionary for the given class which maps the lowercase forms of
its properties' names to their full mixed-case property names.
###
classPropertyNameMap = ( controlClass ) ->
  className = controlClass::className
  unless propertyNameMaps[ className ]
    map = {}
    # Use the names on the control class' prototype for reference.
    for mixedCaseName of controlClass::
      lowerCaseName = mixedCaseName.toLowerCase()
      map[ lowerCaseName ] = mixedCaseName
    propertyNameMaps[ className ] = map
  propertyNameMaps[ className ]


###
Auto-loader for rehydration.
Set data-create-controls="true" on the body tag to have the current
page automatically rehydrated on load.
###
jQuery ->
  $body = Control "body"
  $body.rehydrate() if $body.data "create-controls"
