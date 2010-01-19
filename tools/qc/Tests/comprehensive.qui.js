//
// Comprehensive
//
Comprehensive = SampleBaseClass.extend({
	className: "Comprehensive",
	render: function() {
		SampleBaseClass.prototype.render.call(this);
		this.setClassProperties(SampleBaseClass, {
			"content": [
				this.message = QuickUI.Control.create(Simple, {
					"content": " Hello, <i>world</i>! ",
					"id": "message",
				}),
				$("<div />").items(
					this.Comprehensive_content = $("<p id=\"Comprehensive_content\" />")[0]
				)[0]
			],
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

