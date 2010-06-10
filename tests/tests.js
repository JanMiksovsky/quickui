//
// SampleProperties
//
SampleProperties = QuickUI.Control.extend({
	className: "SampleProperties",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": this.SampleProperties_content = $("<span id=\"SampleProperties_content\" />")[0]
		});
	}
});
$.extend(SampleProperties.prototype, {
    content: QuickUI.Element("SampleProperties_content").content()
});

//
// Simple
//
Simple = QuickUI.Control.extend({
	className: "Simple",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": "Hello, world!"
		});
	}
});

//
// SimpleSpan
//
SimpleSpan = QuickUI.Control.extend({
	className: "SimpleSpan",
	tag: "span"
});

//
// Test
//
Test = QuickUI.Control.extend({
	className: "Test",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.header = $("<div id=\"header\" />").items(
					" ",
					this.Test_name = $("<span id=\"Test_name\" />")[0],
					": ",
					this.Test_result = $("<span id=\"Test_result\" />")[0],
					" "
				)[0],
				" ",
				this.details = $("<div id=\"details\" />").items(
					" Actual: ",
					this.htmlActual = $("<span id=\"htmlActual\" />")[0],
					" ",
					this.Test_test = $("<div id=\"Test_test\" />")[0],
					" Expected: ",
					this.htmlExpected = $("<span id=\"htmlExpected\" />")[0],
					" ",
					this.Test_expect = $("<div id=\"Test_expect\" />")[0],
					" "
				)[0],
				" "
			]
		});
	}
});
$.extend(Test.prototype, {
    
    expect: QuickUI.Element("Test_expect").content(),
    name: QuickUI.Element("Test_name").content(),
    result: QuickUI.Element("Test_result").content(),
    test: QuickUI.Element("Test_test").content(),
    
    ready: function() {
        
        var htmlActual = $(this.Test_test).html();
        var htmlExpected = $(this.Test_expect).html();
        $(this.htmlActual).text(htmlActual);
        $(this.htmlExpected).text(htmlExpected);
        
        var equal = (htmlActual === htmlExpected);
        this.result(equal ? "Pass" : "Fail");
        $(this.element).toggleClass("fail", !equal);
        
        var me = this;
        $(this.element).click(function() {
            $(me.details).toggle();
        });
    }
});

//
// TestSuite
//
TestSuite = QuickUI.Control.extend({
	className: "TestSuite",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				"<h1>QuickUI Test Suite</h1>",
				" ",
				QuickUI.Control.create(Test, {
					"name": "Plain text macro",
					"test": QuickUI.Control.create(Simple),
					"expect": "<div class=\"Simple Control\">Hello, world!</div>"
				}),
				" ",
				QuickUI.Control.create(Test, {
					"name": "Content property as attribute",
					"test": QuickUI.Control.create(Simple, {
						"content": "Hi"
					}),
					"expect": "<div class=\"Simple Control\">Hi</div>"
				}),
				" ",
				QuickUI.Control.create(Test, {
					"name": "Whitespace",
					"test": [
						" ",
						QuickUI.Control.create(SimpleSpan, {
							"content": "A"
						}),
						" ",
						QuickUI.Control.create(SimpleSpan, {
							"content": "B"
						}),
						" "
					],
					"expect": " <span class=\"SimpleSpan Control\">A</span> <span class=\"SimpleSpan Control\">B</span> "
				}),
				" ",
				QuickUI.Control.create(Test, {
					"name": "No whitespace after tag",
					"test": [
						" ",
						QuickUI.Control.create(SimpleSpan, {
							"content": "A"
						}),
						". "
					],
					"expect": " <span class=\"SimpleSpan Control\">A</span>. "
				}),
				" ",
				QuickUI.Control.create(Test, {
					"name": "Compound property",
					"test": QuickUI.Control.create(Simple, {
						"content": "Hi"
					}),
					"expect": "<div class=\"Simple Control\">Hi</div>"
				}),
				" ",
				QuickUI.Control.create(Test, {
					"name": "Content property override",
					"test": [
						" ",
						QuickUI.Control.create(SampleProperties, {
							"content": "Foo"
						}),
						" "
					],
					"expect": [
						" ",
						$("<div class=\"SampleProperties Control\" />").items(
							this.SampleProperties_content = $("<span id=\"SampleProperties_content\">Foo</span>")[0]
						)[0],
						" "
					]
				}),
				" "
			]
		});
	}
});

