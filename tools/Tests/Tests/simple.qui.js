//
// Simple
//
Simple = Control.subclass("Simple", function() {
	this.properties({
		"content": [
			" ",
			this.$Simple_content = $("<span id=\"Simple_content\" />"),
			" "
		]
	}, Control);
});

