//
// GalleryMainPage
//
GalleryMainPage = SitePage.extend({
	className: "GalleryMainPage",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			"title": "Gallery",
			"area": "Gallery",
			"navigationLinks": [
				" ",
				QuickUI.Control.create(GalleryNavigationLinks),
				" "
			],
			"content": [
				" ",
				" ",
				"<p>\r\n\t\tThis gallery shows live examples and the full source for a handful of\r\n\t\tsimple QuickUI controls, representing a small range of what’s possible\r\n\t\tin QuickUI. Since a key goal of QuickUI is to produce easily readable\r\n\t\tcode, as you look at each control, ask yourself: Is it easy to\r\n\t\tunderstand the usage of the control by looking at the source code\r\n\t\tfor the control’s demo?\r\n\t\t</p>",
				" ",
				$("<p />").items(
					" Some of these controls are subclasses of controls defined elsewhere. The source code for all referenced classes is available in the ",
					QuickUI.Control.create(Link, {
						"content": "QuickUI source code",
						"href": "http://code.google.com/p/quickui/source/browse/#svn/trunk"
					}),
					". "
				)[0],
				" ",
				"<p>\r\n\t\tSelect a control from the pane on the left.\r\n\t\t</p>",
				" "
			]
		});
	}
});

//
// GalleryNavigationLinks
//
GalleryNavigationLinks = QuickUI.Control.extend({
	className: "GalleryNavigationLinks",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.linkIndex = QuickUI.Control.create(NavigationLink, {
					"content": "Index",
					"id": "linkIndex",
					"href": "/gallery/default.html"
				}),
				" ",
				QuickUI.Control.create(GalleryLink, {
					"content": "IfBrowser"
				}),
				" ",
				QuickUI.Control.create(GalleryLink, {
					"content": "GalleryPage"
				}),
				" ",
				QuickUI.Control.create(GalleryLink, {
					"content": "HintTextBox"
				}),
				" ",
				QuickUI.Control.create(GalleryLink, {
					"content": "SampleSpriteButton"
				}),
				" ",
				QuickUI.Control.create(GalleryLink, {
					"content": "SearchBox"
				}),
				" ",
				QuickUI.Control.create(GalleryLink, {
					"content": "Sprite"
				}),
				" ",
				QuickUI.Control.create(GalleryLink, {
					"content": "SpriteButton"
				}),
				" ",
				QuickUI.Control.create(GalleryLink, {
					"content": "Tag"
				}),
				" ",
				QuickUI.Control.create(GalleryLink, {
					"content": "TextBoxWithButton"
				}),
				" "
			]
		});
	}
});

//
// GalleryPage
//
GalleryPage = SitePage.extend({
	className: "GalleryPage",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			"area": "Gallery",
			"navigationLinks": [
				" ",
				QuickUI.Control.create(GalleryNavigationLinks),
				" "
			],
			"content": [
				" ",
				this.GalleryPage_summary = $("<div id=\"GalleryPage_summary\" />")[0],
				" ",
				"<h2>Live demo</h2>",
				" ",
				QuickUI.Control.create(CodeOutput, {
					"content": [
						" ",
						this.GalleryPage_demo = $("<div id=\"GalleryPage_demo\" />")[0],
						" "
					]
				}),
				" ",
				"<h2>Demo source code</h2>",
				" ",
				this.sourceCodeExample = QuickUI.Control.create(SourceCode, {
					"id": "sourceCodeExample"
				}),
				" ",
				"<h2>Full control source code</h2>",
				" ",
				this.sourceCodeControl = QuickUI.Control.create(SourceCode, {
					"id": "sourceCodeControl"
				}),
				" ",
				"<h2>Notes</h2>",
				" ",
				this.GalleryPage_notes = $("<div id=\"GalleryPage_notes\" />")[0],
				" "
			]
		});
	}
});
$.extend(GalleryPage.prototype, {
	demo: QuickUI.Element("GalleryPage_demo").content(),
	notes: QuickUI.Element("GalleryPage_notes").content(),
	sourceFileControl: QuickUI.Element("sourceCodeControl").controlProperty("sourceFile"),
	sourceFileExample: QuickUI.Element("sourceCodeExample").controlProperty("sourceFile"),
	summary: QuickUI.Element("GalleryPage_summary").content(),
});

//
// GalleryPageAbout
//
GalleryPageAbout = GalleryPage.extend({
	className: "GalleryPageAbout",
	render: function() {
		GalleryPage.prototype.render.call(this);
		this.setClassProperties(GalleryPage, {
			"title": "GalleryPage",
			"sourceFileExample": "GalleryPage/GalleryPageAbout.qui",
			"sourceFileControl": "GalleryPage.qui",
			"summary": " The GalleryPage control is the basic template for all controls in the QuickUI gallery. It defines the main content area of the type of page you are looking at right now. ",
			"demo": " This page is its own demo of the control’s behavior! The demo source code section shows the entire source of the elements unique to the specific page you’re looking at now. All pages on this site are constructed similarly. ",
			"notes": " This control is a good example of a page template with numerous slots which can be filled in by setting properties on the control. For the control properties that point to source code, the GalleryPage control delegates responsibility for showing the source code to the separate SourceCode control. GalleryPage is a subclass of another control called SitePage, which adds the site’s standard top and left navigation. The title property referenced in the Example is inherited from SitePage. "
		});
	}
});

//
// GoogleSearchBox
//
GoogleSearchBox = QuickUI.Control.extend({
	className: "GoogleSearchBox",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				QuickUI.Control.create(SearchBox, {
					"query": "http://www.google.com/search?q=%s",
					"hint": "Search Google"
				}),
				" "
			]
		});
	}
});

//
// HintTextBox
//
HintTextBox = QuickUI.Control.extend({
	className: "HintTextBox",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.HintTextBox_textBox = $("<input id=\"HintTextBox_textBox\" type=\"text\" />")[0],
				" ",
				this.HintTextBox_hint = $("<div id=\"HintTextBox_hint\" />")[0],
				" "
			]
		});
	}
});
$.extend(HintTextBox.prototype, {
	
	hint: QuickUI.Element("HintTextBox_hint").content(),
	content: QuickUI.Element("HintTextBox_textBox").content(),
	
	ready: function() {
		var me = this;
        $(this.element).bind({
            "click": function() { me._hideHint(); },
            "focus": function() {
                if (!me._isTextBoxFocused)
                {
                    $(me.HintTextBox_textBox).focus();
                }
            }
        });
		$(this.HintTextBox_textBox).bind({
            "blur": function() {
                me._isTextBoxFocused = false;
                me._showHintIfEmpty();
            },
            "keydown keyup": function() { me._showHintIfEmpty(); },
            "focus": function() { me._isTextBoxFocused = true; }
        });
        $(this.HintTextBox_hint).click(function() {
            me._hideHint();
        });
	},
    
    _isTextBoxFocused: false,
    
    _hideHint: function() {
        $(this.HintTextBox_hint).hide(); 
        $(this.HintTextBox_textBox).focus();
    },
    
    _showHintIfEmpty: function() {
        $(this.HintTextBox_hint).toggle(this.content().length == 0);
    }
    
});

//
// HintTextBoxAbout
//
HintTextBoxAbout = GalleryPage.extend({
	className: "HintTextBoxAbout",
	render: function() {
		GalleryPage.prototype.render.call(this);
		this.setClassProperties(GalleryPage, {
			"title": "HintTextBox",
			"sourceFileExample": "HintTextBox/HintTextBoxDemo.qui",
			"sourceFileControl": "HintTextBox/HintTextBox.qui",
			"summary": " A text box that displays a hint (instructions) when the text box is empty. ",
			"demo": [
				" ",
				QuickUI.Control.create(HintTextBoxDemo),
				" "
			],
			"notes": " The standard approach to hint text is to display the hint as text in the text box itself, then remove it when the text box receives the focus. The problem is that there are occasions when the hint should still be visible after the control receives the focus. First, a user tabbing into a field may still want to have the hint visible until they begin typing. Second, there are times when it’s desirable to place the default focus for a page into a text box with a hint. Third, if the user erases what they have typed, it’s helpful to show the hint again. "
		});
	}
});
$.extend(HintTextBoxAbout.prototype, {
	ready: function() {
		HintTextBoxAbout.superProto.ready.call(this);
		this.$("input").focus();
	}
});

//
// HintTextBoxDemo
//
HintTextBoxDemo = QuickUI.Control.extend({
	className: "HintTextBoxDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				$("<div />").items(
					" ",
					QuickUI.Control.create(HintTextBox, {
						"hint": "Type here"
					}),
					" "
				)[0],
				" "
			]
		});
	}
});

//
// IfBrowserAbout
//
IfBrowserAbout = GalleryPage.extend({
	className: "IfBrowserAbout",
	render: function() {
		GalleryPage.prototype.render.call(this);
		this.setClassProperties(GalleryPage, {
			"title": "IfBrowser",
			"sourceFileExample": "IfBrowser/IfBrowserDemo.qui",
			"sourceFileControl": "../common/IfBrowser.qui",
			"summary": [
				" Conditionally shows contents if the given browser is in use (defined by ",
				QuickUI.Control.create(Link, {
					"content": "jQuery.browser",
					"href": "http://docs.jquery.com/Utilities/jQuery.browser"
				}),
				"), and/or if the browser in use supports a given compatibility property (defined by ",
				QuickUI.Control.create(Link, {
					"content": "jQuery.support",
					"href": "http://docs.jquery.com/Utilities/jQuery.support"
				}),
				"). "
			],
			"demo": [
				" ",
				QuickUI.Control.create(IfBrowserDemo),
				" "
			]
		});
	}
});

//
// IfBrowserDemo
//
IfBrowserDemo = QuickUI.Control.extend({
	className: "IfBrowserDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" You are using: ",
				QuickUI.Control.create(IfBrowser, {
					"content": "Internet Explorer",
					"browser": "msie",
					"style": "display: inline",
					"elseContent": "a browser other than Internet Explorer"
				}),
				" "
			]
		});
	}
});

//
// SampleSpriteButtonAbout
//
SampleSpriteButtonAbout = GalleryPage.extend({
	className: "SampleSpriteButtonAbout",
	render: function() {
		GalleryPage.prototype.render.call(this);
		this.setClassProperties(GalleryPage, {
			"title": "SampleSpriteButton",
			"sourceFileExample": "SampleSpriteButton/SampleSpriteButtonDemo.qui",
			"sourceFileControl": "SampleSpriteButton/SampleSpriteButton.qui",
			"summary": [
				" A sample of how to create a new ",
				QuickUI.Control.create(GalleryLink, {
					"content": "SpriteButton"
				}),
				" class through subclassing. The subclass simply defines a ",
				QuickUI.Control.create(GalleryLink, {
					"content": "Sprite"
				}),
				" (image strip) for the button’s various states. "
			],
			"demo": [
				" ",
				QuickUI.Control.create(SampleSpriteButtonDemo),
				" "
			]
		});
	}
});

//
// SampleSpriteButtonDemo
//
SampleSpriteButtonDemo = QuickUI.Control.extend({
	className: "SampleSpriteButtonDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				QuickUI.Control.create(SampleSpriteButton, {
					"content": "Save"
				}),
				" ",
				QuickUI.Control.create(SampleSpriteButton, {
					"content": "Don't Save"
				}),
				" ",
				QuickUI.Control.create(SampleSpriteButton, {
					"content": "Cancel",
					"disabled": "true"
				}),
				" "
			]
		});
	}
});
$.extend(SampleSpriteButtonDemo.prototype, {
	ready: function() {
		this.$(".SampleSpriteButton").click(function() {
			alert("You clicked " + QuickUI(this).content());
		});
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
				QuickUI.Control.create(TextBoxWithButton, {
					"textBox": [
						" ",
						this.searchTerms = QuickUI.Control.create(HintTextBox, {
							"id": "searchTerms",
							"hint": "Enter search"
						}),
						" "
					],
					"goButton": [
						" ",
						this.searchButton = QuickUI.Control.create(SampleSpriteButton, {
							"content": "Search",
							"id": "searchButton"
						}),
						" "
					]
				}),
				" "
			]
		});
	}
});
$.extend(SearchBox.prototype, {
    
    hint: QuickUI.Element("searchTerms").controlProperty("hint"),
    query: QuickUI.Property(null, "%s"),
    
    ready: function() {
        var me = this;
        $(this.element).bind("goButtonClick", function() {
            var searchTerms = QuickUI(me.searchTerms).content();
            var url = me.query().replace("%s", searchTerms);
            window.location.href = url;
        });
        $(this.searchTerms).focus();
    }
    
});

//
// SearchBoxAbout
//
SearchBoxAbout = GalleryPage.extend({
	className: "SearchBoxAbout",
	render: function() {
		GalleryPage.prototype.render.call(this);
		this.setClassProperties(GalleryPage, {
			"title": "SearchBox",
			"sourceFileExample": "SearchBox/GoogleSearchBox.qui",
			"sourceFileControl": "SearchBox/SearchBox.qui",
			"summary": [
				" A typical web search box, constructed from a ",
				QuickUI.Control.create(GalleryLink, {
					"content": "TextBoxWithButton"
				}),
				" hosting a ",
				QuickUI.Control.create(GalleryLink, {
					"content": "HintTextBox"
				}),
				" and ",
				QuickUI.Control.create(GalleryLink, {
					"content": "SampleSpriteButton"
				}),
				". "
			],
			"demo": [
				" ",
				QuickUI.Control.create(GoogleSearchBox),
				" "
			]
		});
	}
});

//
// SpriteAbout
//
SpriteAbout = GalleryPage.extend({
	className: "SpriteAbout",
	render: function() {
		GalleryPage.prototype.render.call(this);
		this.setClassProperties(GalleryPage, {
			"title": "Sprite",
			"sourceFileExample": "Sprite/SpriteDemo.qui",
			"sourceFileControl": "../common/Sprite.qui",
			"summary": " A very basic CSS sprite: shows a single image at a time from a strip of images. ",
			"demo": [
				" ",
				QuickUI.Control.create(SpriteDemo),
				" "
			]
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
// SpriteButtonAbout
//
SpriteButtonAbout = GalleryPage.extend({
	className: "SpriteButtonAbout",
	render: function() {
		GalleryPage.prototype.render.call(this);
		this.setClassProperties(GalleryPage, {
			"title": "SpriteButton",
			"sourceFileExample": "SampleSpriteButton/SampleSpriteButton.qui",
			"sourceFileControl": "SpriteButton/SpriteButton.qui",
			"summary": [
				" A button that uses a ",
				QuickUI.Control.create(Link, {
					"content": "Sprite",
					"href": "/gallery/default.html?page=SpriteAbout"
				}),
				" for its background. "
			],
			"demo": [
				" See ",
				QuickUI.Control.create(Link, {
					"content": "SampleSpriteButton",
					"href": "/gallery/default.html?page=SampleSpriteButtonAbout"
				}),
				" for a demo. "
			]
		});
	}
});

//
// SpriteDemo
//
SpriteDemo = QuickUI.Control.extend({
	className: "SpriteDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.sprite = QuickUI.Control.create(Sprite, {
					"id": "sprite",
					"image": "url(SampleSpriteButton/buttonStates.png)",
					"currentCell": "4",
					"cellHeight": "32"
				}),
				" ",
				"<p>\r\n\t\tSelect a frame from the sprite image:\r\n\t</p>",
				" ",
				this.image = $("<img id=\"image\" src=\"SampleSpriteButton/buttonStates.png\" />")[0],
				" "
			]
		});
	}
});
$.extend(SpriteDemo.prototype, {
	ready: function() {
		var self = this;
		$(this.image).click(function(event) {
			var mouseY = event.pageY - $(this).offset().top;
			var cellIndex = Math.floor(mouseY / QuickUI(self.sprite).cellHeight());
			QuickUI(self.sprite).currentCell(cellIndex);
		});
	}
});

//
// TagAbout
//
TagAbout = GalleryPage.extend({
	className: "TagAbout",
	render: function() {
		GalleryPage.prototype.render.call(this);
		this.setClassProperties(GalleryPage, {
			"title": "Tag",
			"sourceFileExample": "Tag/TagDemo.qui",
			"sourceFileControl": "../controls/Tag.qui",
			"summary": " The Tag control formats its content as an XML tag. The control is a simple example of what’s effectively a parameterized HTML macro that includes both content (opening and closing brackets) and styling (a fixed-width font). ",
			"demo": [
				" ",
				QuickUI.Control.create(TagDemo),
				" "
			],
			"notes": [
				" ",
				$("<p />").items(
					" The ",
					QuickUI.Control.create(Tag, {
						"content": "script"
					}),
					" defines the Tag control’s own contents to be as the contents of the ",
					QuickUI.Control.create(Tag, {
						"content": "span"
					}),
					" tag. "
				)[0],
				" ",
				"<p>\r\n\t\t\tThe behavior of the Tag control is simple enough that it could be replicated purely\r\n\t\t\tin CSS 3 by making use of the “content” attribute. The content attribute allows one\r\n\t\t\tto specify text that should appear before and after a matching HTML element.\r\n\t\t\tThe QuickUI approach is more flexible in that it allows arbitrary elements to be\r\n\t\t\tplaced before and after the control’s content.\r\n\t\t\t</p>",
				" "
			]
		});
	}
});

//
// TagDemo
//
TagDemo = QuickUI.Control.extend({
	className: "TagDemo",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" Here's a reference to the ",
				QuickUI.Control.create(Tag, {
					"content": "script"
				}),
				" tag. "
			]
		});
	}
});

//
// TextBoxWithButton
//
TextBoxWithButton = QuickUI.Control.extend({
	className: "TextBoxWithButton",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.TextBoxWithButton_textBox = $("<div id=\"TextBoxWithButton_textBox\" />")[0],
				" ",
				this.TextBoxWithButton_goButton = $("<div id=\"TextBoxWithButton_goButton\" />")[0],
				" "
			]
		});
	}
});
$.extend(TextBoxWithButton.prototype, {
    
    goButton: QuickUI.Element("TextBoxWithButton_goButton").content(),    
    textBox: QuickUI.Element("TextBoxWithButton_textBox").content(),
    
    ready: function() {
        var me = this;
        $(this.TextBoxWithButton_textBox).bind("change keydown keyup", function(event) {
            me._disableButtonIfContentEmpty();
            var keyCode = event.keyCode || event.which;
            if (!me._isContentEmpty() && keyCode == 13 /* Enter */)
            {
                $(me.element).trigger("goButtonClick");
            }
        });
        $(this.TextBoxWithButton_goButton).click(function() {
            $(me.element).trigger("goButtonClick");
        });
        this._disableButtonIfContentEmpty();
    },
    
    content: function(value) {
        result = this.elementContent(this.TextBoxWithButton_textBox, value); 
        if (value !== undefined) 
        {
            this.disableButtonIfContentEmpty();
        }
        return result;
    },
    
    _disableButtonIfContentEmpty: function() {
        var content = this.content();
        var $goButton = $(this.TextBoxWithButton_goButton);
        if ($goButton.children().length > 0)
        {
            var buttonControl = QuickUI($goButton.children()[0]);
            if (buttonControl != null && buttonControl instanceof ButtonBase)
            {
                buttonControl.disabled(this._isContentEmpty());
            }
        }
    },

    // General purpose -- Should move this into quickui.js. Also used by EditableField.
    elementContent: function(element, value) {
        var $element = $(element);
        var $firstChild = $element.children().length == 0
                              ? $element
                              : $($element.children()[0]);
        var result = ($firstChild.control() != undefined)
            ? $firstChild.control().content(value)
            : ($firstChild[0] instanceof HTMLInputElement || $firstChild[0] instanceof HTMLTextAreaElement)
                ? $firstChild.val(value)
                : $firstChild.items(value);
        return result;
    },
    
    _isContentEmpty: function() {
        var content = this.content();
        return !(content && content.length > 0);
    }
    
});

//
// TextBoxWithButtonAbout
//
TextBoxWithButtonAbout = GalleryPage.extend({
	className: "TextBoxWithButtonAbout",
	render: function() {
		GalleryPage.prototype.render.call(this);
		this.setClassProperties(GalleryPage, {
			"title": "TextBoxWithButton",
			"sourceFileControl": "TextBoxWithButton/TextBoxWithButton.qui",
			"summary": " A control with a content area (usually some form of text box) and an associated \"Go\" button (labeled something like \"Search\"), where clicking the button does something with the content. ",
			"demo": [
				" See ",
				QuickUI.Control.create(GalleryLink, {
					"content": "SearchBox"
				}),
				" for a demo. "
			]
		});
	}
});

//
// SampleSpriteButton
//
SampleSpriteButton = SpriteButton.extend({
	className: "SampleSpriteButton",
	render: function() {
		SpriteButton.prototype.render.call(this);
		this.setClassProperties(SpriteButton, {
			"image": "url(SampleSpriteButton/buttonStates.png)",
			"cellHeight": "32"
		});
	}
});

