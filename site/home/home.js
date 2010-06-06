//
// Counter
//
Counter = QuickUI.Control.extend({
	className: "Counter",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" You’ve clicked this ",
				this.count = $("<span id=\"count\">0</span>")[0],
				" times. "
			]
		});
	}
});
$.extend(Counter.prototype, {
    ready: function() {
        // Points to above span.
        var $count = $(this.count);
        $(this.element).click(function() {
            $count.text(1 +
             parseInt($count.text()));
        });
    }
});

//
// Ellipsis
//
Ellipsis = QuickUI.Control.extend({
	className: "Ellipsis",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": "…"
		});
	}
});

//
// Feature
//
Feature = QuickUI.Control.extend({
	className: "Feature",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				$("<div class=\"table\" />").items(
					" ",
					$("<div class=\"row\" />").items(
						" ",
						$("<div class=\"cell\" />").items(
							" ",
							this.Feature_name = $("<h2 id=\"Feature_name\" />")[0],
							" ",
							this.Feature_control = $("<div id=\"Feature_control\" />")[0],
							" "
						)[0],
						" ",
						$("<div class=\"cell\" />").items(
							" ",
							this.Feature_description = $("<div id=\"Feature_description\" />")[0],
							" ",
							"<div class=\"label\">Sample usage</div>",
							" ",
							this.Feature_example = $("<div id=\"Feature_example\" />")[0],
							" ",
							"<div class=\"label separator\">Live demo</div>",
							" ",
							this.Feature_result = $("<div id=\"Feature_result\" />")[0],
							" "
						)[0],
						" "
					)[0],
					" "
				)[0],
				" "
			]
		});
	}
});
$.extend(Feature.prototype, {
    control: QuickUI.Element("Feature_control").content(),
    description: QuickUI.Element("Feature_description").content(),
    example: QuickUI.Element("Feature_example").content(),
    name: QuickUI.Element("Feature_name").content(),
    result: QuickUI.Element("Feature_result").content()
});

//
// FeatureBrowserIsolation
//
FeatureBrowserIsolation = Feature.extend({
	className: "FeatureBrowserIsolation",
	render: function() {
		Feature.prototype.render.call(this);
		this.setClassProperties(Feature, {
			"name": "Isolate browser inconsistencies",
			"description": [
				" Getting something working across the mainstream browsers often involves variations in the CSS or JavaScript you need. Bundle up that knowledge in a control so you can reapply it when needed. See the complete ",
				QuickUI.Control.create(GalleryLink, {
					"content": "Gradient"
				}),
				" source. "
			],
			"control": " <pre>\r\n&lt;Control name=\"Gradient\"&gt;\r\n&lt;script&gt;\r\n…\r\nif ($.browser.mozilla)\r\n{\r\n  value = \"-moz-linear-gradient(\"\r\n    + position + \", \"\r\n    + startColorString + \", \"\r\n    + endColorString + \")\";\r\n}\r\n$(this.element).css(property, value);\r\n…\r\n&lt;/script&gt;\r\n&lt;/Control&gt;\r\n</pre> ",
			"example": " <pre>\r\n&lt;Gradient start=\"#808080\" end=\"#f0f0f0\"/&gt;\r\n</pre> ",
			"result": [
				" ",
				QuickUI.Control.create(FeatureBrowserIsolationDemo),
				" "
			]
		});
	}
});

//
// FeatureBrowserIsolationDemo
//
FeatureBrowserIsolationDemo = QuickUI.Control.extend({
	className: "FeatureBrowserIsolationDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				QuickUI.Control.create(Gradient, {
					"start": "#808080",
					"end": "#f0f0f0"
				}),
				" "
			]
		});
	}
});

//
// FeatureComposition
//
FeatureComposition = Feature.extend({
	className: "FeatureComposition",
	render: function() {
		Feature.prototype.render.call(this);
		this.setClassProperties(Feature, {
			"name": "Define new controls by composing existing ones",
			"description": [
				" QuickUI controls can be used as building blocks for larger and more complex controls. Snap together some markup, CSS, and JavaScript behavior—and now you have a new class that can be used anywhere you want. See the full ",
				QuickUI.Control.create(GalleryLink, {
					"content": "SearchBox"
				}),
				" example. "
			],
			"control": " <pre>\r\n&lt;Control name=\"SearchBox\"&gt;\r\n\r\n&lt;content&gt;\r\n  &lt;input id=\"terms\" type=\"text\"/&gt;\r\n  &lt;OrangeButton&gt;Search&lt;/OrangeButton&gt;\r\n&lt;/content&gt;\r\n…\r\n&lt;/Control&gt;\r\n</pre> ",
			"example": " <pre>\r\n&lt;SearchBox/&gt;\r\n</pre> ",
			"result": [
				" ",
				QuickUI.Control.create(SearchBox),
				" "
			]
		});
	}
});

//
// FeatureElementIDs
//
FeatureElementIDs = Feature.extend({
	className: "FeatureElementIDs",
	render: function() {
		Feature.prototype.render.call(this);
		this.setClassProperties(Feature, {
			"name": "Refer to DOM elements as class members",
			"description": " The JavaScript generated by the Quick compiler builds your DOM elements at run-time through jQuery calls. As it does so, it saves references to any element with an ID, storing these as members on your control instance. Your JavaScript can refer to these members directly without the need for run-time searches through the DOM to reacquire exactly the element you want. This works even if another element on the page has the same ID! ",
			"control": " <pre>\r\n&lt;Control name=\"Counter\"&gt;\r\n\r\n&lt;content&gt;\r\nYou’ve clicked this\r\n&lt;span id=\"count\"&gt;0&lt;/span&gt;\r\ntimes.\r\n&lt;/content&gt;\r\n\r\n&lt;script&gt;\r\n$.extend(Counter.prototype, {\r\nready: function() {\r\n  // Points to above span.\r\n  var $count = $(this.count);\r\n  $(this.element).click(function() {\r\n    $count.text(1 +\r\n     parseInt($count.text()));\r\n  });\r\n}\r\n});\r\n&lt;/script&gt;\r\n\r\n&lt;/Control&gt;\r\n</pre> ",
			"example": " <pre>\r\n&lt;Counter/&gt;\r\n&lt;Counter/&gt;\r\n&lt;Counter/&gt;\r\n</pre> ",
			"result": [
				" ",
				QuickUI.Control.create(Counter),
				" ",
				QuickUI.Control.create(Counter),
				" ",
				QuickUI.Control.create(Counter),
				" "
			]
		});
	}
});

//
// FeatureHtmlMacros
//
FeatureHtmlMacros = Feature.extend({
	className: "FeatureHtmlMacros",
	render: function() {
		Feature.prototype.render.call(this);
		this.setClassProperties(Feature, {
			"name": "HTML macros",
			"description": " Define your own tag to stand for a block of HTML content. This content will get inserted wherever you use that tag. ",
			"control": " <pre>\r\n&lt;Control name=\"Greet\"&gt;\r\nHello &lt;i&gt;world!&lt;/i&gt;\r\n&lt;/Control&gt;\r\n</pre> ",
			"example": " <pre>\r\n&lt;Greet/&gt;\r\nYes!\r\n&lt;Greet/&gt;\r\n</pre> ",
			"result": [
				" ",
				QuickUI.Control.create(FeatureHtmlMacrosDemo),
				" "
			]
		});
	}
});

//
// FeatureHtmlMacrosDemo
//
FeatureHtmlMacrosDemo = QuickUI.Control.extend({
	className: "FeatureHtmlMacrosDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				QuickUI.Control.create(Greet2),
				" Yes! ",
				QuickUI.Control.create(Greet2),
				" "
			]
		});
	}
});

//
// FeatureMarkupAndCSS
//
FeatureMarkupAndCSS = Feature.extend({
	className: "FeatureMarkupAndCSS",
	render: function() {
		Feature.prototype.render.call(this);
		this.setClassProperties(Feature, {
			"name": "Keep related markup and CSS right next to each other",
			"description": " Old school HTML pages kept the markup and CSS right next to each other, which was great for simple pages but can’t scale up to today’s complex apps. QuickUI restores this simplicity in a scalable way by letting you define a control in a single file that keeps the control’s markup and CSS rules together. No more hunting around for all the styles defined for a particular component! ",
			"control": " <pre>\r\n&lt;Control name=\"Tag\"&gt;\r\n\r\n&lt;content&gt;\r\n  &amp;lt;&lt;span id=\"Tag_content\"/&gt;&amp;gt;\r\n&lt;/content&gt;\r\n\r\n&lt;style&gt;\r\n{\r\n  display: inline;\r\n  font-family: monospace;\r\n}\r\n&lt;/style&gt;\r\n…\r\n&lt;/Control&gt;\r\n</pre> ",
			"example": " <pre>\r\nQuick markup has &lt;Tag&gt;style&lt;/Tag&gt; and &lt;Tag&gt;script&lt;/Tag&gt; elements, just like HTML.\r\n</pre> ",
			"result": [
				" ",
				QuickUI.Control.create(FeatureMarkupAndCSSDemo),
				" "
			]
		});
	}
});

//
// FeatureMarkupAndCSSDemo
//
FeatureMarkupAndCSSDemo = QuickUI.Control.extend({
	className: "FeatureMarkupAndCSSDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" Quick markup has ",
				QuickUI.Control.create(Tag, {
					"content": "style"
				}),
				" and ",
				QuickUI.Control.create(Tag, {
					"content": "script"
				}),
				" elements, just like HTML. "
			]
		});
	}
});

//
// FeatureProperties
//
FeatureProperties = Feature.extend({
	className: "FeatureProperties",
	render: function() {
		Feature.prototype.render.call(this);
		this.setClassProperties(Feature, {
			"name": "Easy property definition",
			"description": " The QuickUI runtime includes a range of helper functions that make it trivial to define properties on a control class and map the property values to (and from) control DOM element content, CSS styles, and more. Properties can be specified in markup as tag attributes or tag content. Compound property syntax lets the markup for control consumers define rich property values. All proprties are directly accessible as JavaScript class members. ",
			"control": " <pre>\r\n&lt;Control name=\"Recipe\"&gt;\r\n\r\n&lt;content&gt;\r\n  &lt;div&gt;\r\n    Name: &lt;span id=\"Recipe_name\"/&gt;\r\n    &lt;span id=\"Recipe_rating\"/&gt;\r\n  &lt;/div&gt;\r\n  &lt;div id=\"Recipe_content\"/&gt;\r\n&lt;/content&gt;\r\n\r\n&lt;script&gt;\r\n$.extend(Recipe.prototype, {\r\n\r\ncontent: QuickUI.Element(\r\n  \"Recipe_content\").content(),\r\nname: QuickUI.Element(\r\n  \"Recipe_name\").content(),\r\nrating: QuickUI.Property.integer(\r\n  function(rating) {\r\n    $(this.Recipe_rating).text(\r\n      \"*****\".substr(0, rating));\r\n  })\r\n\r\n})\r\n&lt;/script&gt;\r\n\r\n&lt;/Control&gt;\r\n</pre> ",
			"example": " <pre>\r\n&lt;Recipe name=\"Lasagna\" rating=\"3\"&gt;\r\n  Quick and easy lasagna\r\n&lt;/Recipe&gt;\r\n&lt;Recipe&gt;\r\n  &lt;name&gt;\r\n    Pasta &lt;i&gt;con i fagioli&lt;/i&gt;\r\n  &lt;/name&gt;\r\n  &lt;rating&gt;5&lt;/rating&gt;\r\n  &lt;content&gt;\r\n    A &lt;b&gt;great&lt;/b&gt;\r\n    Tuscan peasant dish\r\n  &lt;/content&gt;\r\n&lt;/Recipe&gt;\r\n</pre> ",
			"result": [
				" ",
				QuickUI.Control.create(FeaturePropertiesDemo),
				" "
			]
		});
	}
});

//
// FeaturePropertiesDemo
//
FeaturePropertiesDemo = QuickUI.Control.extend({
	className: "FeaturePropertiesDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				QuickUI.Control.create(Recipe, {
					"content": " Quick and easy lasagna ",
					"name": "Lasagna",
					"rating": "3"
				}),
				" ",
				QuickUI.Control.create(Recipe, {
					"content": " A <b>great</b> Tuscan peasant dish ",
					"name": " Pasta <i>con i fagioli</i> ",
					"rating": "5"
				}),
				" "
			]
		});
	}
});

//
// FeatureScoping
//
FeatureScoping = Feature.extend({
	className: "FeatureScoping",
	render: function() {
		Feature.prototype.render.call(this);
		this.setClassProperties(Feature, {
			"name": "Prevent style rule collisions with style scoping",
			"description": " Controls on a page are as independent of each other as possible, so you can mix controls freely without concern for collisions in the namespaces for DOM element IDs or CSS rule names. For example, the QuickUI compiler ensures that a control’s CSS only applies to instances of that control: each control defines a corresponding CSS class, and the DOM roots of all that control’s instances are stamped with that CSS class. So if two controls define CSS for a class called, say, “message”, the generated CSS will apply the correct rules to each control. ",
			"control": " <pre>\r\n&lt;Control name=\"Red\"&gt;\r\n&lt;div class=\"message\"&gt;I’m red&lt;/div&gt;\r\n&lt;style&gt;\r\n.message {\r\n  color: red;\r\n}\r\n&lt;/style&gt;\r\n&lt;/Control&gt;\r\n\r\n&lt;Control name=\"Green\"&gt;\r\n&lt;div class=\"message\"&gt;I’m green&lt;/div&gt;\r\n&lt;style&gt;\r\n.message {\r\n  color: green;\r\n}\r\n&lt;/style&gt;\r\n&lt;/Control&gt;\r\n</pre> ",
			"example": " <pre>\r\n&lt;Red/&gt;\r\n&lt;Green/&gt;\r\n</pre> ",
			"result": [
				" ",
				QuickUI.Control.create(FeatureScopingDemo),
				" "
			]
		});
	}
});

//
// FeatureScopingDemo
//
FeatureScopingDemo = QuickUI.Control.extend({
	className: "FeatureScopingDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				QuickUI.Control.create(Red),
				" ",
				QuickUI.Control.create(Green),
				" "
			]
		});
	}
});

//
// FeatureSubclassing
//
FeatureSubclassing = Feature.extend({
	className: "FeatureSubclassing",
	render: function() {
		Feature.prototype.render.call(this);
		this.setClassProperties(Feature, {
			"name": "Subclassing",
			"description": [
				" Quick controls can be easily subclassed to create true prototype-based JavaScript subclasses. These inherit DOM elements, CSS rules, and behavior from their parent classes in a well-defined way. One use for subclassing is to create templates for dialogs, page sections, or complete pages (such as the ",
				QuickUI.Control.create(GalleryLink, {
					"content": "GalleryPage"
				}),
				" example). Subclasses generally allow for clean factoring of a user interface into easily maintainable and reusable components. "
			],
			"control": " <pre>\r\n&lt;!-- Sample dialog template --&gt;\r\n&lt;Control name=\"OrangeDialog\"&gt;\r\n\r\n&lt;prototype&gt;\r\n  &lt;Dialog&gt;\r\n    &lt;h1 id=\"OrangeDialog_title\"/&gt;\r\n    &lt;div id=\"OrangeDialog_content\"/&gt;\r\n    &lt;div id=\"OrangeDialog_buttons\"/&gt;\r\n  &lt;/Dialog&gt;\r\n&lt;/prototype&gt;\r\n\r\n&lt;style&gt;\r\n{\r\n  border: 2px solid orange;\r\n  …\r\n}\r\n&lt;/style&gt;\r\n\r\n&lt;script&gt;\r\n$.extend(OrangeDialog.prototype, {\r\nbuttons: QuickUI.Element(\r\n  \"OrangeDialog_buttons\").content(),\r\n…\r\n});\r\n&lt;/script&gt;\r\n\r\n&lt;/Control&gt;\r\n</pre> ",
			"example": " <pre>\r\n&lt;!-- Sample use of template --&gt;\r\n&lt;Control name=\"SampleDialog\"&gt;\r\n\r\n&lt;prototype&gt;\r\n  &lt;OrangeDialog\r\n    title=\"What do you think?\"&gt;\r\n    It's easy to use subclassing\r\n    to create a new dialog --\r\n    or an entirely new template.\r\n    &lt;buttons&gt;\r\n      &lt;OrangeButton&gt;\r\n        Huh\r\n      &lt;/OrangeButton&gt;\r\n      &lt;OrangeButton&gt;\r\n        Neat!\r\n      &lt;/OrangeButton&gt;\r\n    &lt;/buttons&gt;\r\n  &lt;/OrangeDialog&gt;\r\n&lt;/prototype&gt;\r\n\r\n&lt;/Control&gt;\r\n</pre> ",
			"result": [
				" ",
				QuickUI.Control.create(FeatureSubclassingDemo),
				" "
			]
		});
	}
});

//
// FeatureSubclassingDemo
//
FeatureSubclassingDemo = QuickUI.Control.extend({
	className: "FeatureSubclassingDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.buttonShow = QuickUI.Control.create(OrangeButton, {
					"content": "Show dialog",
					"id": "buttonShow"
				}),
				" "
			]
		});
	}
});
$.extend(FeatureSubclassingDemo.prototype, {
    ready: function() {
        $(this.buttonShow).click(function() {
            Dialog.show(SampleDialog);
        });
    }
});

//
// GetStartedModule
//
GetStartedModule = QuickUI.Control.extend({
	className: "GetStartedModule",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				"<h2>Get started</h2>",
				" ",
				$("<ul />").items(
					" ",
					$("<li />").items(
						QuickUI.Control.create(Link, {
							"content": "Download QuickUI",
							"href": "/downloads/default.html"
						})
					)[0],
					" ",
					$("<li />").items(
						QuickUI.Control.create(Link, {
							"content": "Read the Tutorial",
							"href": "/tutorial/section01/default.html"
						})
					)[0],
					" "
				)[0],
				" "
			]
		});
	}
});

//
// Gradient
//
Gradient = QuickUI.Control.extend({
	className: "Gradient"
});
$.extend(Gradient.prototype, {
    
    ready: function() {
        this._redraw();
    },
    
    end: QuickUI.Property(function() { this._redraw(); }),
    direction: QuickUI.Property(function() { this._redraw(); }, "vertical"),
    start: QuickUI.Property(function() { this._redraw(); }),
    
    _redraw: function() {
        var direction = this.direction();
        var start = this.start();
        var end = this.end();
        if (direction && start && end)
        {
            var horizontal = (direction == "horizontal");
            var startColorString = this._hexColorToRgbString(start);
            var endColorString = this._hexColorToRgbString(end);
            var property;
            var value;
            if ($.browser.mozilla)
            {
                property = "background-image";
                var position = horizontal ? "left" : "top";
                value = "-moz-linear-gradient(" + position + ", " + startColorString + ", " + endColorString + ")";
            }
            else if ($.browser.webkit)
            {
                property = "background-image"; 
                var position2 = horizontal ? "right top" : "left bottom";
                value = "-webkit-gradient(linear, left top, " + position2 + ", from(" + startColorString + "), to(" + endColorString + "))";
            }
            else if ($.browser.msie)
            {
                property = "filter";
                var gradientType = horizontal ? 1 : 0;
                value = "progid:DXImageTransform.Microsoft.gradient(gradientType=" + gradientType + ", startColorStr=" + start + ", endColorStr=" + end + ")"; 
            }

            $(this.element).css(property, value);
        }
    },
    
    /* Convert a hex color like #00ff00 to "rgb(0, 255, 0)" */
    _hexColorToRgbString: function(hex) {
        if (hex.substr(0, 1) == "#")
        {
            // Remove "#"
            hex = hex.substring(1);
        }
        var hasAlpha = (hex.length == 8);
        var color = parseInt(hex, 16);
        var colorStringType = hasAlpha ? "rgba" : "rgb";
        
        var alphaString = "";
        if (hasAlpha)
        {
            // Alpha
            a = color & 0xFF;
            alphaString = "," + a;
            color = color >> 8;
        }
        
        var r = (color >> 16) & 0xFF;
        var g = (color >> 8)  & 0xFF;
        var b = color         & 0xFF;
        
        var rgbString = colorStringType + "(" + r + "," + g + "," + b + alphaString + ")";
        return rgbString;
    }
    
});

//
// Green
//
Green = QuickUI.Control.extend({
	className: "Green",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": " <div class=\"message\">I’m green</div> "
		});
	}
});

//
// Greet
//
Greet = QuickUI.Control.extend({
	className: "Greet",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": " Hello, world! "
		});
	}
});

//
// Greet2
//
Greet2 = QuickUI.Control.extend({
	className: "Greet2",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": " Hello <i>world!</i> "
		});
	}
});

//
// HomePage
//
HomePage = SitePage.extend({
	className: "HomePage",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			"area": "Home",
			"title": "QuickUI web control framework",
			"sidebar": [
				" ",
				QuickUI.Control.create(GetStartedModule),
				" "
			],
			"content": [
				" ",
				" ",
				"<p>\r\nQuickUI (Quick User Interface) is a framework that simplifies the design, construction,\r\nand maintenance of web-based user interfaces. The easiest way to describe QuickUI is\r\nthat <i>it lets you write HTML as if you could create your own tags</i>.\r\n</p>",
				" ",
				"<p> \r\nIn QuickUI, the tags you create are called controls. You define controls with declarative\r\nmarkup that can include HTML (including other QuickUI controls), CSS styling,\r\nand JavaScript scripting. You can easily create new controls by bundling together a group\r\nof existing controls, or by subclassing an existing control to make it more special-purpose.\r\nThe page you are reading here, and remainder of this site, is built entirely using QuickUI.\r\n</p>",
				" ",
				$("<p />").items(
					" QuickUI includes tools that compile your markup into regular JavaScript and CSS files. These tools run on Windows and OS/X (via the Mono project). The generated JavaScript makes use of the ",
					QuickUI.Control.create(Link, {
						"content": "jQuery",
						"href": "http://jquery.com"
					}),
					" library to build the web user interface on demand. QuickUI also includes a run-time library. Overall QuickUI is targetted at and tested against the mainstream browsers: Apple Safari 4.x, Google Chrome 3.x, Internet Explorer 8.x, and Mozilla Firefox 3.x. "
				)[0],
				" ",
				"<p>\r\nThe following are brief examples of some aspects of QuickUI. Each demo shows\r\nthe live output of a Quick control running on this page.\r\n</p>",
				" ",
				QuickUI.Control.create(FeatureHtmlMacros),
				" ",
				QuickUI.Control.create(FeatureMarkupAndCSS),
				" ",
				QuickUI.Control.create(FeatureComposition),
				" ",
				QuickUI.Control.create(FeatureElementIDs),
				" ",
				QuickUI.Control.create(FeatureProperties),
				" ",
				QuickUI.Control.create(FeatureSubclassing),
				" ",
				QuickUI.Control.create(FeatureScoping),
				" ",
				QuickUI.Control.create(FeatureBrowserIsolation),
				" ",
				"<h2 class=\"section\">Why use QuickUI?</h2>",
				" ",
				"<p>\r\nQuickUI:\r\n</p>",
				" ",
				"<ul>\r\n    <li>\r\n        Allows you to create UI in a markup language that is easy to read,\r\n        is easy to work with, and can concisely express your design intention.\r\n        This speeds up UI development, and makes UI code more maintainable.\r\n    </li>\r\n    <li>\r\n        Works with the web’s native technologies, it doesn’t replace them.\r\n        QuickUI is true to HTML, CSS, and JavaScript. Familiar conventions are used\r\n        whenever possible. QuickUI is only meant to address the web’s painful lack\r\n        of an extensible control framework.\r\n    </li>\r\n    <li>\r\n        Allows designers and developers to share design artifacts. QuickUI can bridge\r\n        the gap between pure visual design tools and native web coding frameworks.\r\n        The markup language can be easily learned by HTML-savvy designers, and is\r\n        still powerful and flexible enough to appeal to developers.\r\n    </li>\r\n    <li>\r\n        Encourages well-factored UI code. Controls are as modular as possible,\r\n        easily composable, and easily subclassable. All the goodness of object-oriented\r\n        design can be applied to your UI code.\r\n    </li>\r\n    <li>\r\n        Produces predictable compiled code. The QuickUI tools do a minimum of\r\n        compilation magic. The compiler’s output is legible, understandable,\r\n        readily debuggable JavaScript classes. The generated code takes care of \r\n        populating the control’s run-time DOM — code that is often tedious to write\r\n        and hard to read. The behavior of these controls can\r\n        be programmed in JavaScript and jQuery.\r\n    </li>\r\n    <li>\r\n        Creates controls that can be used as top-level pages on their own,\r\n        or easily included in web pages built with other technologies\r\n        (jQuery UI, etc.).\r\n    </li>\r\n    <li>\r\n        Is fun to work in!\r\n    </li>\r\n</ul>",
				" ",
				"<h2 class=\"section\">Next steps</h2>",
				" ",
				$("<p />").items(
					" The ",
					QuickUI.Control.create(Link, {
						"content": "tutorial",
						"href": "/tutorial/section01/default.html"
					}),
					" walks through the development of a simple control step-by-step. You can see some sample QuickUI controls in the ",
					QuickUI.Control.create(Link, {
						"content": "Gallery",
						"href": "/gallery/default.html"
					}),
					". "
				)[0],
				" ",
				$("<p />").items(
					" QuickUI is completely free, and the ",
					QuickUI.Control.create(Link, {
						"content": "source code",
						"href": "http://code.google.com/p/quickui/"
					}),
					" is open under the ",
					QuickUI.Control.create(Link, {
						"content": "MIT License",
						"href": "http://www.opensource.org/licenses/mit-license.php"
					}),
					". "
				)[0],
				" ",
				$("<p />").items(
					" ",
					QuickUI.Control.create(Link, {
						"content": "Download QuickUI",
						"href": "/downloads/default.html"
					}),
					" "
				)[0],
				" ",
				"<br />",
				" ",
				QuickUI.Control.create(AddThis),
				" "
			]
		});
	}
});

//
// HomePageOld
//
HomePageOld = SitePage.extend({
	className: "HomePageOld",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			"area": "Home",
			"title": "QuickUI modular web control framework",
			"sidebar": [
				" ",
				QuickUI.Control.create(GetStartedModule),
				" "
			],
			"content": [
				" ",
				" ",
				"<p>\r\nQuickUI (Quick User Interface) is a framework that simplifies the design, construction,\r\nand maintenance of web-based user interfaces. The easiest way to describe QuickUI is\r\nthat <i>it lets you write HTML as if you could create your own tags</i>.\r\n</p>",
				" ",
				"<p>\t\r\nIn QuickUI, the tags you create are called controls. You define controls with declarative\r\nmarkup that can include HTML (including other QuickUI controls), CSS styling,\r\nand JavaScript scripting. You can easily create new controls by bundling together a group\r\nof existing controls, or by subclassing an existing control to make it more special-purpose.\r\nThe page you are reading here, and remainder of this site, is built entirely using QuickUI.\r\n</p>",
				" ",
				$("<p />").items(
					" QuickUI includes tools that compile your markup into regular JavaScript and CSS files. These tools run on Windows and OS/X (via the Mono project). The generated JavaScript makes use of the ",
					QuickUI.Control.create(Link, {
						"content": "jQuery",
						"href": "http://jquery.com"
					}),
					" library to build the web user interface on demand. QuickUI also includes a run-time library. Overall QuickUI is targetted at and tested against the mainstream browsers: Apple Safari 4.x, Google Chrome 3.x, Internet Explorer 8.x, and Mozilla Firefox 3.x. "
				)[0],
				" ",
				"<h2>A quick example</h2>",
				" ",
				"<p>\r\n\tThe following Quick markup defines a simple control called “Greet”.\r\n</p>",
				" ",
				QuickUI.Control.create(SourceCode, {
					"sourceFile": "Greet.qui"
				}),
				" ",
				$("<p />").items(
					" This control definition gives you a new tag ",
					QuickUI.Control.create(Tag, {
						"content": "Greet"
					}),
					" that can be used in other Quick markup like this: "
				)[0],
				" ",
				QuickUI.Control.create(SourceCode, {
					"sourceFile": "Sample.qui"
				}),
				" ",
				"<p>\r\nKicking everything off is accomplished in JavaScript via a jQuery extension:\r\n</p>",
				" ",
				"<pre>\r\n$(\"div\").control(Sample);\r\n</pre>",
				" ",
				"<p>\r\nThe div below shows the actual sample control above instantiated here on this page:\r\n</p>",
				" ",
				QuickUI.Control.create(CodeOutput, {
					"content": [
						" ",
						QuickUI.Control.create(Sample),
						" "
					]
				}),
				" ",
				$("<p />").items(
					" This is a trivial example. The ",
					QuickUI.Control.create(Link, {
						"content": "tutorial",
						"href": "/tutorial/section01/default.html"
					}),
					" examines controls with complex contents, control styling, and interactive behavior. When combined with the ability to compose and subclass controls, things can quickly become very interesting. You can see some sample QuickUI controls in the ",
					QuickUI.Control.create(Link, {
						"content": "Gallery",
						"href": "/gallery/default.html"
					}),
					". "
				)[0],
				" ",
				"<h2>Why use QuickUI?</h2>",
				" ",
				"<p>\r\nConsider using QuickUI because it:\r\n</p>",
				" ",
				"<ul>\r\n\t<li>\r\n\t\tAllows you to create UI in a markup language that is easy to read,\r\n\t\tis easy to work with, and can concisely express your design intention.\r\n\t\tThis speeds up UI development, and makes UI code more maintainable.\r\n\t</li>\r\n\t<li>\r\n\t\tWorks with the web’s native technologies, it doesn’t replace them.\r\n\t\tQuickUI is true to HTML, CSS, and JavaScript. Familiar conventions are used\r\n\t\twhenever possible. QuickUI is only meant to address the web’s painful lack\r\n\t\tof an extensible control framework.\r\n\t</li>\r\n\t<li>\r\n\t\tAllows designers and developers to share design artifacts. QuickUI can bridge\r\n\t\tthe gap between pure visual design tools and native web coding frameworks.\r\n\t\tThe markup language can be easily learned by HTML-savvy designers, and is\r\n\t\tstill powerful and flexible enough to appeal to developers.\r\n\t</li>\r\n\t<li>\r\n\t\tEncourages well-factored UI code. Controls are as modular as possible,\r\n\t\teasily composable, and easily subclassable. All the goodness of object-oriented\r\n\t\tdesign can be applied to your UI code. Package up your hard-earned knowledge\r\n\t\tof HTML and CSS idiosyncrasies into reusable controls that can be readily\r\n\t\tapplied to new problems.\r\n\t</li>\r\n\t<li>\r\n\t\tProduces predictable compiled code. The QuickUI tools do a minimum of\r\n\t\tcompilation magic. The compiler’s output are legible, understandable,\r\n\t\treadily debuggable JavaScript classes. The generated code takes care of \r\n\t\tpopulating the control’s run-time DOM — code that is often tedious to write\r\n\t\tby hand, and normally hard to read. The behavior of these controls can\r\n\t\tbe programmed in JavaScript and jQuery.\r\n\t</li>\r\n\t<li>\r\n\t\tCreates controls that can be used as top-level pages on their own,\r\n\t\tor easily included in web pages built with other technologies.\r\n\t</li>\r\n\t<li>\r\n\t\tIs fun to work in!\r\n\t</li>\r\n</ul>",
				" QuickUI is completely free, and the ",
				QuickUI.Control.create(Link, {
					"content": "source code",
					"href": "http://code.google.com/p/quickui/"
				}),
				" is open under the ",
				QuickUI.Control.create(Link, {
					"content": "MIT License",
					"href": "http://www.opensource.org/licenses/mit-license.php"
				}),
				". ",
				$("<p />").items(
					" ",
					QuickUI.Control.create(Link, {
						"content": "Download QuickUI",
						"href": "/downloads/default.html"
					}),
					" "
				)[0],
				" ",
				"<br />",
				" ",
				QuickUI.Control.create(AddThis),
				" "
			]
		});
	}
});

//
// OrangeDialog
//
OrangeDialog = Dialog.extend({
	className: "OrangeDialog",
	render: function() {
		Dialog.prototype.render.call(this);
		this.setClassProperties(Dialog, {
			"content": [
				" ",
				this.OrangeDialog_title = $("<h1 id=\"OrangeDialog_title\" />")[0],
				" ",
				this.OrangeDialog_content = $("<div id=\"OrangeDialog_content\" />")[0],
				" ",
				this.OrangeDialog_buttons = $("<div id=\"OrangeDialog_buttons\" />")[0],
				" "
			]
		});
	}
});
$.extend(OrangeDialog.prototype, {
    buttons: QuickUI.Element("OrangeDialog_buttons").content(),
    content: QuickUI.Element("OrangeDialog_content").content(),
    title: QuickUI.Element("OrangeDialog_title").content()
});

//
// Recipe
//
Recipe = QuickUI.Control.extend({
	className: "Recipe",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				$("<div />").items(
					" Name: ",
					this.Recipe_name = $("<span id=\"Recipe_name\" />")[0],
					" ",
					this.Recipe_rating = $("<span id=\"Recipe_rating\" />")[0],
					" "
				)[0],
				" ",
				this.Recipe_content = $("<div id=\"Recipe_content\" />")[0],
				" "
			]
		});
	}
});
$.extend(Recipe.prototype, {
    content: QuickUI.Element("Recipe_content").content(),
    name: QuickUI.Element("Recipe_name").content(),
    rating: QuickUI.Property.integer(function(rating) {
        $(this.Recipe_rating).text("*****".substr(0, rating));
    })
})

//
// Red
//
Red = QuickUI.Control.extend({
	className: "Red",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": " <div class=\"message\">I’m red</div> "
		});
	}
});

//
// Sample
//
Sample = QuickUI.Control.extend({
	className: "Sample",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				"<h1>QuickUI sample</h1>",
				" ",
				QuickUI.Control.create(Greet),
				" "
			]
		});
	}
});

//
// SampleDialog
//
SampleDialog = OrangeDialog.extend({
	className: "SampleDialog",
	render: function() {
		OrangeDialog.prototype.render.call(this);
		this.setClassProperties(OrangeDialog, {
			"title": "What do you think?",
			"buttons": [
				" ",
				QuickUI.Control.create(OrangeButton, {
					"content": "Huh"
				}),
				" ",
				QuickUI.Control.create(OrangeButton, {
					"content": "Neat!"
				}),
				" "
			],
			"content": " It's easy to use subclassing to create a new dialog -- or an entirely new template.  "
		});
	}
});
$.extend(SampleDialog.prototype, {
    ready: function() {
        var me = this;
        $(this.OrangeDialog_buttons).click(function() {
            me.close();
        })
    }
});

//
// SearchBox
//
SearchBox = QuickUI.Control.extend({
	className: "SearchBox",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.terms = $("<input id=\"terms\" type=\"text\" />")[0],
				" ",
				this.buttonSearch = QuickUI.Control.create(OrangeButton, {
					"content": "Search",
					"id": "buttonSearch"
				}),
				" "
			]
		});
	}
});
$.extend(SearchBox.prototype, {
    ready: function() {
        var me = this;
        $(this.buttonSearch).click(function() {
            var terms = $(me.terms).val();
            var query = "http://www.google.com/search?q=%s";
            var url = query.replace("%s", terms);
            window.location.href = url;
        });
    }
});

//
// SpriteButton
//
SpriteButton = ButtonBase.extend({
	className: "SpriteButton",
	render: function() {
		ButtonBase.prototype.render.call(this);
		this.setClassProperties(ButtonBase, {
			"content": [
				" ",
				this.backgroundLeft = QuickUI.Control.create(Sprite, {
					"id": "backgroundLeft"
				}),
				" ",
				this.backgroundRight = QuickUI.Control.create(Sprite, {
					"id": "backgroundRight"
				}),
				" ",
				this.SpriteButton_content = $("<button id=\"SpriteButton_content\" />")[0],
				" "
			]
		});
	}
});
$.extend(SpriteButton.prototype, {
	
	content: QuickUI.Element("SpriteButton_content").content(),

	ready: function() {
		SpriteButton.superProto.ready.call(this);
		var self = this;
		$(this.SpriteButton_content)
			.blur(function() { self.blur(); })
			.focus(function() { self.focus(); });
	},
	
	cellHeight: QuickUI.Element().css("height", function(value) {
		$(this.SpriteButton_content).height(value + "px");
		QuickUI(this.backgroundLeft).cellHeight(value);
		QuickUI(this.backgroundRight).cellHeight(value);
	}),
	
	disabled: function(value) {
		if (value !== undefined)
		{
			$(this.SpriteButton_content).attr("disabled", String(value) == "true");
		}
		return SpriteButton.superProto.disabled.call(this, value);
	},
	
	image: QuickUI.Element("backgroundLeft").controlProperty("image", function(value) {
		QuickUI(this.backgroundRight).image(value);
	}),
	
	renderButtonState: function(buttonState) {
		QuickUI(this.backgroundLeft).currentCell(buttonState);
		QuickUI(this.backgroundRight).currentCell(buttonState);
	}
});

//
// OrangeButton
//
OrangeButton = SpriteButton.extend({
	className: "OrangeButton",
	render: function() {
		SpriteButton.prototype.render.call(this);
		this.setClassProperties(SpriteButton, {
			"image": "url(features/buttonStates.png)",
			"cellHeight": "32"
		});
	}
});

