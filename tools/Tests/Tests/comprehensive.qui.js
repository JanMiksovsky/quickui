//
// Comprehensive
//
Comprehensive = SampleBaseClass.subclass({
	name: "Comprehensive",
	tag: "div",
	content: [
		" ",
		{
			control: "Simple",
			id: "message",
			content: " Hello, <i>world</i>! "
		},
		" ",
		{
			html: "<div />",
			content: [
				" ",
				{
					html: "<p />",
					id: "Comprehensive_content"
			    },
				" "
			]
		},
		" "
	]
});
Comprehensive.prototype.extend({
  content: Control.chain( "$Comprehensive_content", "content", ),
  foo: function()
  {
      alert("Hello, world!");
  }
});

