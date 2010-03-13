//
// Content
//
Content = QuickUI.Control.extend({
	className: "Content",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				"\n  ",
				QuickUI.Control.create(Simple, {
					"content": "Hello"
				}),
				"\n  ",
				QuickUI.Control.create(Simple, {
					"content": "There"
				}),
				"\n  ",
				QuickUI.Control.create(Simple, {
					"content": "\n      World\n    "
				}),
				"\n"
			]
		});
	}
});

