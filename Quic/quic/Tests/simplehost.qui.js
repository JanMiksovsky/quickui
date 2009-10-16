//
// SimpleHost
//
SimpleHost = QuickControl.extend({
	className: "SimpleHost",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: QuickControl.nodes(
				" Text ",
				QuickControl.create(Simple, {
					content: "Hello, world!",
				})[0]
			),
		});
	}
});

