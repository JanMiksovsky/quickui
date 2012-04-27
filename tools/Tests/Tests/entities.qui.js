/*
Control whose script contains characters ("&" and "<") that get interpreted as HTML entities.
*/
var Entities = Control.subclass({
    className: "Entities"
});
Entities.prototype.extend({
  ready: function() {
    if (1 < 2 && 4 > 3)
    {
      alert("Success");
    }
  }
});

