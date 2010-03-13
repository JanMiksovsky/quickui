//
// SampleProperties
//
SampleProperties = QuickUI.Control.extend({
	className: "SampleProperties",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": this.SampleProperties_content = $("<div id=\"SampleProperties_content\" />")[0]
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
// Test
//
Test = QuickUI.Control.extend({
	className: "Test",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				"\n    ",
				this.header = $("<div id=\"header\" />").items(
					"\n        ",
					this.Test_name = $("<span id=\"Test_name\" />")[0],
					": ",
					this.Test_result = $("<span id=\"Test_result\" />")[0],
					"\n    "
				)[0],
				"\n    ",
				this.details = $("<div id=\"details\" />").items(
					"\n        Actual: ",
					this.htmlActual = $("<span id=\"htmlActual\" />")[0],
					"\n        ",
					this.Test_test = $("<div id=\"Test_test\" />")[0],
					"\n        Expected: ",
					this.htmlExpected = $("<span id=\"htmlExpected\" />")[0],
					"\n        ",
					this.Test_expect = $("<div id=\"Test_expect\" />")[0],
					"\n    "
				)[0],
				"\n"
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
				"\n\n",
				"<h1>QuickUI Test Suite</h1>",
				"\n\n",
				QuickUI.Control.create(Test, {
					"name": "Plain text macro",
					"test": QuickUI.Control.create(Simple),
					"expect": "<div class=\"Simple Control\">Hello, world!</div>"
				}),
				"\n\n",
				QuickUI.Control.create(Test, {
					"name": "Content property as attribute",
					"test": QuickUI.Control.create(Simple, {
						"content": "Hi"
					}),
					"expect": "<div class=\"Simple Control\">Hi</div>"
				}),
				"\n\n",
				QuickUI.Control.create(Test, {
					"name": "Whitespace",
					"test": [
						"\n        A\n        ",
						QuickUI.Control.create(Simple, {
							"content": "\n            B\n        "
						}),
						"\n        C\n    "
					],
					"expect": "\n        A\n        <div class=\"Simple Control\">\r\n            B\r\n        </div>\n        C\n    "
				}),
				"\n\n",
				QuickUI.Control.create(Test, {
					"name": "Compound property",
					"test": QuickUI.Control.create(Simple, {
						"content": "Hi"
					}),
					"expect": "<div class=\"Simple Control\">Hi</div>"
				}),
				"\n\n",
				QuickUI.Control.create(Test, {
					"name": "Content property override",
					"test": [
						"\n        ",
						QuickUI.Control.create(SampleProperties, {
							"content": "Foo"
						}),
						"\n    "
					],
					"expect": [
						"\n        ",
						$("<div class=\"SampleProperties Control\" />").items(
							this.SampleProperties_content = $("<div id=\"SampleProperties_content\">Foo</div>")[0]
						)[0],
						"\n    "
					]
				}),
				"\n\n\n\n"
			]
		});
	}
});

