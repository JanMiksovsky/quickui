//
// PropertiesPage
//
PropertiesPage = SitePage.extend({
	className: "PropertiesPage",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			"area": "Features",
			"title": "Defining a control’s content",
			"content": [
				"<h2>Each control can define its content property</h2>",
				"<p>\r\nIn addition to stock content and styling it’s extremely common to want to define some custom content that varies per control. The simplest way to do this is to define a <i>content property</i> for the control. Each control can define a single content property. This is used to hold the control’s “main” content. What that means specifically will vary from control to control.\n</p>",
				$("<p />").items(
					" A simple example is the ",
					QuickUI.Control.create(GalleryLink, {
						"content": "Tag"
					}),
					" control, used throughout the QuickUI site to format Quick markup tags. So the text on these pages can easily format references to a ",
					QuickUI.Control.create(Tag, {
						"content": "style"
					}),
					" tag or ",
					QuickUI.Control.create(Tag, {
						"content": "script"
					}),
					" tag. "
				)[0],
				"<p>\r\nHere the control’s content is the name of the tag—in the above examples, the string “style” or “script”. The Tag control surrounds this content with the “&lt;” and “&gt;”, and styles all the text in a non-proportional font suitable for code. Everywhere we use this Tag control, we’ll always get the brackets and the formatting, so we if we want to change either of those aspects later, we can.\n</p>",
				"<h2>Starting point</h2>",
				" Let’s start with a rudimentary Tag control that always shows fixed text: ",
				QuickUI.Control.create(SourceCode, {
					"sourceFile": "properties/TagBefore.qui"
				}),
				" This always produces: ",
				QuickUI.Control.create(CodeOutput, {
					"content": QuickUI.Control.create(TagBefore)
				}),
				"<h2>Defining a content property</h2>",
				" Now let’s add the ability to pass in the content we really want the Tag control to display. First, we replace the fixed content with a placeholder in the form of a ",
				QuickUI.Control.create(Tag, {
					"content": "span"
				}),
				": ",
				"<pre>\r\n&lt;content&gt;&amp;lt;<b>&lt;span id=\"Tag_content\" /&gt;</b>&amp;gt;&lt;/content&gt;\n</pre>",
				" The ",
				QuickUI.Control.create(Tag, {
					"content": "span"
				}),
				" will hold the content people pass into the control by calling a setter/getter function. The actual definition of the setter/getter is as follows: ",
				"<pre>\r\n&lt;script&gt;\n$.extend(Tag.prototype, {\n\t<b>content: QuickUI.Element(\"Tag_content\").content()</b>\r\n});\n&lt;/script&gt;\n</pre>",
				"<p>\r\nThis defines a function called Tag.prototype.content(), so it will be available to all instances of the Tag control. The key line of script defines a function that looks for the DOM element with ID “Tag_content” and sets or gets the content of that element. In other words, this line says: The “content” of a Tag control is the content of the element called “Tag_content”.\n</p>",
				"<p>\r\nThe different mentions of “content” in the line above might be confusing, but this is a pretty powerful feature of QuickUI. It makes it trivially easy to expose a setter/getter property function on a class that maps directly onto a DOM element. So when someone sets that property, the value gets stored in the DOM element. Conversely, when some reads that property, the value is retrieved from the DOM element.\n</p>",
				"<h2>Final source code</h2>",
				" Our Tag control now looks like this: ",
				QuickUI.Control.create(SourceCode, {
					"sourceFile": "../controls/Tag.qui"
				}),
				" We can now write markup like this: ",
				"<pre>\r\nYou can place a &lt;Tag&gt;script&lt;/Tag&gt; inside a &lt;Tag&gt;Control&lt;/Tag&gt;.\n</pre>",
				"<p>\r\nwhich will create the following output:\n</p>",
				QuickUI.Control.create(CodeOutput, {
					"content": [
						" You can place a ",
						QuickUI.Control.create(Tag, {
							"content": "script"
						}),
						" inside a ",
						QuickUI.Control.create(Tag, {
							"content": "Control"
						}),
						". "
					]
				})
			]
		});
	}
});

//
// TagBefore
//
TagBefore = QuickUI.Control.extend({
	className: "TagBefore",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": "&lt;tag-name-goes-here>"
		});
	}
});

