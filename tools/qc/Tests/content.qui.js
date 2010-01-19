//
// Content
//
Content = QuickUI.Control.extend({
	className: "Content",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				QuickUI.Control.create(Simple, {
					"content": "Hello",
				}),
				QuickUI.Control.create(Simple, {
					"content": "There",
				}),
				QuickUI.Control.create(Simple, {
					"content": " World ",
				})
			],
		});
	}
});

