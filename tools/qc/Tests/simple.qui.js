//
// Simple
//
Simple = QuickControl.extend({
	className: "Simple",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: this.Simple_content = $("<span id=\"Simple_content\" />")[0],
		});
	}
});

