//
// Content
//
Content = QuickControl.extend({
	className: "Content",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: [
				QuickControl.create(Simple, {
					content: "Hello",
				}),
				QuickControl.create(Simple, {
					content: "There",
				}),
				QuickControl.create(Simple, {
					content: " World ",
				})
			],
		});
	}
});

