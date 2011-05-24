//
// Comprehensive
//
Comprehensive = SampleBaseClass.subclass("Comprehensive", function() {
	this.properties({
		"content": [
			" ",
			this.$message = Simple.create({
				"content": " Hello, <i>world</i>! ",
				"id": "message"
			}),
			" ",
			Control("<div />").content(
				" ",
				this.$Comprehensive_content = Control("<p id=\"Comprehensive_content\" />"),
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

