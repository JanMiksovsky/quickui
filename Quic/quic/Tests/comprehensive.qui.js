//
// Comprehensive
//
Comprehensive = SampleBaseClass.extend({
	className: "Comprehensive",
	render: function() {
		SampleBaseClass.prototype.render.call(this);
		this.setClassProperties(SampleBaseClass, {
			content: QuickControl.nodes(
				this.message = QuickControl.create(Simple, {
					content: " Hello, <i>world</i>! ",
					id: "message",
				})[0],
				$("<div />")
				.append(
					QuickControl.nodes(
						this.Comprehensive_content = $("<p id=\"Comprehensive_content\" />")[0]
					)
				)[0]
			),
		});
	}
});
$.extend(Comprehensive.prototype, {
  content: Property.element("Comprehensive_content"),
  foo: function()
  {
      alert("Hello, world!");
  }
});

