//
// Simple
//
Simple = Control.subclass("Simple", function() {
	this.properties({
		"content": [
			" ",
			this._define("$Simple_content", Control("<span id=\"Simple_content\" />")),
			" "
		]
	}, Control);
});

