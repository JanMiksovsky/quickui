###
Utilities
###


###
Return a copy of the given object, skipping the indicated keys.
Keys should be provided as a dictionary with true values. E.g., the dictionary
{ a: true, b: true } specifies that keys "a" and "b" should be excluded
from the result.
###
copyExcludingKeys = (obj, excludeKeys) ->
  copy = {}
  for key of obj
    copy[key] = obj[key]  unless excludeKeys[key]
  copy
