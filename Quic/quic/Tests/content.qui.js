//
// Content
//
Content = QuickControl.extend({
	className: "Content",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: QuickControl.nodes(
				QuickControl.create(Simple, {
					content: "Hello",
				})[0],
				QuickControl.create(Simple, {
					content: "There",
				})[0],
				QuickControl.create(Simple, {
					content: " World ",
				})[0]
			),
		});
	}
});

