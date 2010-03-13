//
// Simple
//
Simple = QuickUI.Control.extend({
	className: "Simple",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				"\n  ",
				this.Simple_content = $("<span id=\"Simple_content\" />")[0],
				"\n"
			]
		});
	}
});

