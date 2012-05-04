###
Localization
###


Control::extend

  ###
  The control's culture.
  If jQuery Globalize is present, this defaults to the current culture.
  This can be overridden on a per-control basis, e.g., for testing purposes.
  
  Control classes can override this method to respond immediately to an
  explicit change in culture. They should invoke their base class' culture
  method, do whatever work they want (if the culture parameter is defined),
  then return the result of the base class call.
  ###
  culture: (culture) ->
    cultureDataMember = "_culture"
    controlCulture = undefined
    if culture is `undefined`
      controlCulture = @data(cultureDataMember)
      controlCulture or (if window.Globalize then Globalize.culture() else null)
    else
      controlCulture = (if (typeof culture is "string") then Globalize.findClosestCulture(culture) else culture)
      @data cultureDataMember, controlCulture
      this
