//
// Comprehensive
//
Comprehensive = SampleBaseClass.subclass("Comprehensive", function renderComprehensive() {
	this.properties({
		"content": [
			" ",
			this._define("$message", Simple.create({
				"content": " Hello, <i>world</i>! ",
				"id": "message"
			})),
			" ",
			Control("<div />").content(
				" ",
				this._define("$Comprehensive_content", Control("<p id=\"Comprehensive_content\" />")),
				" "
			),
			" "
		]
	}, SampleBaseClass);
}, "div");
Comprehensive.prototype.extend({
  content: Control.element("Comprehensive_content").content(),
  foo: function()
  {
      alert("Hello, world!");
  }
});

