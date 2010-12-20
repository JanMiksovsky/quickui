//
// Content
//
Content = Control.extend({
	className: "Content",
	render: function() {
		Control.prototype.render.call(this);
		this.setClassProperties(Control, {
			"content": [
				" ",
				Control.create(Simple, {
					"content": "Hello"
				}),
				" ",
				Control.create(Simple, {
					"content": "There"
				}),
				" ",
				Control.create(Simple, {
					"content": " World "
				}),
				" "
			]
		});
	}
});

