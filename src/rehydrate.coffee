###
Rehydration

This takes static HTML created in normal means for SEO purposes, and looks for
elements decorated with data- properties indicating which elements should be
reconstituted as live QuickUI controls.
###

Control::rehydrate = ->
  subcontrols = @find("[data-control]").get()
  if subcontrols.length > 0
    subcontrols = subcontrols.reverse()
    $.each subcontrols, (index, element) ->
      rehydrateControl element
  $controls = Control()
  @each (index, element) ->
    $element = Control(element)
    $control = (if $element.data("control") then rehydrateControl(element) else $element)
    $controls = $controls.add($control)

  $controls.cast()

rehydrateControl = (element) ->
  $element = $(element)
  className = $element.data("control")
  return  unless className
  $element.removeAttr "data-control"
  controlClass = Control.getClass(className)
  lowerCaseProperties = $.extend({}, getPropertiesFromAttributes(element), getCompoundPropertiesFromChildren(element))
  properties = restorePropertyCase(controlClass, lowerCaseProperties)
  $(element).control controlClass, properties
getPropertiesFromAttributes = (element) ->
  properties = {}
  attributes = element.attributes
  regexDataProperty = /^data-(.+)/
  i = 0
  length = attributes.length

  while i < length
    attributeName = attributes[i].name
    match = regexDataProperty.exec(attributeName)
    if match
      propertyName = match[1]
      properties[propertyName] = attributes[i].value  if propertyName isnt "control"
    i++
  $element = $(element)
  for key of properties
    $element.removeAttr "data-" + key
  properties
getCompoundPropertiesFromChildren = (element) ->
  properties = {}
  $(element).children().filter("[data-property]").each((index, element) ->
    $element = Control(element)
    propertyName = $element.attr("data-property")
    if propertyName isnt "control"
      propertyValue = $element.content()
      properties[propertyName] = propertyValue
      propertyValue.detach()  if propertyValue instanceof jQuery
  ).remove()
  properties
restorePropertyCase = (controlClass, properties) ->
  return properties  if $.isEmptyObject(properties)
  map = classPropertyNameMap(controlClass)
  result = {}
  for propertyName of properties
    mixedCaseName = map[propertyName.toLowerCase()]
    result[mixedCaseName] = properties[propertyName]  if mixedCaseName
  result
classPropertyNameMap = (controlClass) ->
  className = controlClass.className
  unless propertyNameMaps[className]
    map = {}
    for mixedCaseName of controlClass::
      lowerCaseName = mixedCaseName.toLowerCase()
      map[lowerCaseName] = mixedCaseName
    propertyNameMaps[className] = map
  propertyNameMaps[className]
Control.fn.rehydrate = ->
  subcontrols = @find("[data-control]").get()
  if subcontrols.length > 0
    subcontrols = subcontrols.reverse()
    $.each subcontrols, (index, element) ->
      rehydrateControl element
  $controls = Control()
  @each (index, element) ->
    $element = Control(element)
    $control = (if $element.data("control") then rehydrateControl(element) else $element)
    $controls = $controls.add($control)

  $controls.cast()

propertyNameMaps = {}

jQuery ->
  $body = Control("body")
  $body.rehydrate()  if $body.data("create-controls")