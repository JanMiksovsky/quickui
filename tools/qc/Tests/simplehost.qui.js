//
// SimpleHost
//
SimpleHost = QuickUI.Control.extend({
	className: "SimpleHost",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				"\n  Text\n  ",
				QuickUI.Control.create(Simple, {
					"content": "Hello, world!"
				}),
				"\n"
			]
		});
	}
});

