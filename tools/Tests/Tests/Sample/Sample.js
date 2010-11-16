//
// Foo
//
Foo = QuickUI.Control.extend({
	className: "Foo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.Simple_content = $("<span id=\"Simple_content\" />")[0],
				" "
			]
		});
	}
});

//
// Bar
//
Bar = Foo.extend({
	className: "Bar",
	render: function() {
		Foo.prototype.render.call(this);
		this.setClassProperties(Foo, {
			"content": "Hello, world."
		});
	}
});

