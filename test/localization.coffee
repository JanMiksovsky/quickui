###
Localization unit tests
###

$ ->
  
  test "Localization: culture", ->
    c = Control.create()
    equal c.culture().language, "en"
    c.culture "fr"
    equal c.culture().language, "fr"
    c.culture "__"  # Random string; non-existing culture
    equal c.culture().language, "en" # Reversts to default culture, English
