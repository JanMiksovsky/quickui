//
// SimpleHost
//
SimpleHost = QuickUI.Control.extend({
	className: "SimpleHost",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" Text ",
				QuickUI.Control.create(Simple, {
					"content": "Hello, world!"
				}),
				" "
			]
		});
	}
});

