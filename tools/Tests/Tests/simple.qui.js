//
// Simple
//
Simple = Control.extend({
	className: "Simple",
	render: function() {
		Control.prototype.render.call(this);
		this.setClassProperties(Control, {
			"content": [
				" ",
				this.Simple_content = $("<span id=\"Simple_content\" />")[0],
				" "
			]
		});
	}
});

