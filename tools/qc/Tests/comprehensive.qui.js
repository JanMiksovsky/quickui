//
// Comprehensive
//
Comprehensive = SampleBaseClass.extend({
	className: "Comprehensive",
	render: function() {
		SampleBaseClass.prototype.render.call(this);
		this.setClassProperties(SampleBaseClass, {
			"content": [
				"\n    ",
				this.message = QuickUI.Control.create(Simple, {
					"content": "\n      Hello, <i>world</i>!\n    ",
					"id": "message"
				}),
				"\n    ",
				$("<div />").items(
					"\n      ",
					this.Comprehensive_content = $("<p id=\"Comprehensive_content\" />")[0],
					"\n    "
				)[0],
				"\n  "
			]
		});
	}
});
$.extend(Comprehensive.prototype, {
  content: QuickUI.Element("Comprehensive_content").content(),
  foo: function()
  {
      alert("Hello, world!");
  }
});

