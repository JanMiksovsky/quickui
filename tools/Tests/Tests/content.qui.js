//
// Content
//
Content = Control.subclass("Content", function() {
	this.properties({
		"content": [
			" ",
			Simple.create({
				"content": "Hello"
			}),
			" ",
			Simple.create({
				"content": "There"
			}),
			" ",
			Simple.create({
				"content": " World "
			}),
			" "
		]
	}, Control);
});

