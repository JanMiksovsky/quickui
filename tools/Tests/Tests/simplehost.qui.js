//
// SimpleHost
//
SimpleHost = Control.subclass( "SimpleHost", function renderSimpleHost() {
	this.properties({
		"content": [
			" Text ",
			Simple.create({
				"content": "Hello, world!"
			}),
			" "
		]
	}, Control );
});

