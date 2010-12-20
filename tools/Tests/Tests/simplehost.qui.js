//
// SimpleHost
//
SimpleHost = Control.extend({
	className: "SimpleHost",
	render: function() {
		Control.prototype.render.call(this);
		this.setClassProperties(Control, {
			"content": [
				" Text ",
				Control.create(Simple, {
					"content": "Hello, world!"
				}),
				" "
			]
		});
	}
});

