//
// SimpleHost
//
SimpleHost = Control.subclass("SimpleHost", function() {
	this.properties({
		"content": [
			" Text ",
			Simple.create({
				"content": "Hello, world!"
			}),
			" "
		]
	}, Control);
});

