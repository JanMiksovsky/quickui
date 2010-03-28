//
// AddThis
//
AddThis = QuickUI.Control.extend({
	className: "AddThis",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": " <div class=\"addthis_toolbox addthis_default_style\">\r\n\t<a href=\"http://www.addthis.com/bookmark.php?v=250&amp;pub=janmiksovsky\" class=\"addthis_button_compact\">Share</a>\r\n\t<span class=\"addthis_separator\">|</span>\r\n\t<a class=\"addthis_button_twitter\"></a>\r\n\t<a class=\"addthis_button_facebook\"></a>\r\n\t<a class=\"addthis_button_email\"></a>\r\n\t<a class=\"addthis_button_favorites\"></a>\r\n\t<a class=\"addthis_button_print\"></a>\r\n\t</div> "
		});
	}
});
var addthis_share = {
	content: "Hello, world!",
	templates: {
		twitter: "QuickUI creates modular jQuery controls that can be used like new HTML tags {{url}}",
	},
	title: "QuickUI",
	url: "http://quickui.org"
};

//
// CodeOutput
//
CodeOutput = QuickUI.Control.extend({
	className: "CodeOutput",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.CodeOutput_content = $("<div id=\"CodeOutput_content\" />")[0],
				" "
			]
		});
	}
});
$.extend(CodeOutput.prototype, {
	content: QuickUI.Element("CodeOutput_content").content()
})

//
// Link
//
Link = QuickUI.Control.extend({
	className: "Link",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": this.Link_content = $("<a id=\"Link_content\" />")[0]
		});
	}
});
$.extend(Link.prototype, {
	
	content: QuickUI.Element("Link_content").content(),
	href: QuickUI.Element("Link_content").attr("href", function(href) {
        // HACK for testing under Aptana preview server.
        if ((window.location.hostname == "127.0.0.1" || window.location.hostname == "localhost")
            && href.substr(0,7) != "http://")
        {
            $(this.Link_content).attr("href", "/QuickUI/site" + href);
        }
    })
   
});

//
// LinkList
//
LinkList = QuickControl.extend({
	className: "LinkList",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			"content": [
				" ",
				this.list = QuickUI.Control.create(List, {
					"content": [
						" ",
						$("<p />").items(
							" ",
							this.link = QuickUI.Control.create(Link, {
								"id": "link"
							}),
							" "
						)[0],
						" "
					],
					"id": "list"
				}),
				" "
			]
		});
	}
});
$.extend(LinkList.prototype, {
	data: QuickUI.Element("list").controlProperty("data"),
	ready: function() {
		QuickUI(this.list).bind = function(value) {
			$(this).find("#link").control().content(value);
		};
	}
});

//
// List
//
List = QuickUI.Control.extend({
	className: "List",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.List_expansion = $("<div id=\"List_expansion\" />")[0],
				" "
			]
		});
	}
});
$.extend(List.prototype, {

	expansion: QuickUI.Element("List_expansion").content(),

	ready: function() {
		this.expand();
	},
	
	bind: null,
	
	content: QuickUI.Property(function() {
		this.expand();
	}),
	
	data: QuickUI.Property(function() {
		this.expand();
	}),
	
	expand: function() {
		var template = this.content();
		if (template != null)
		{
			$(this.List_expansion).empty();
			var data = this.data();
			if (data != null)
			{
				for (var i = 0; i < data.length; i++)
				{
					/*
					var newElement = this.cloneElementWithControls(template);
					if (this.bind != null) {
						this.bind.call(newElement, data[i]);
					}
					$(newElement).appendTo(this.List_expansion);
					*/
					var $newElement = $(template).clone();
					$newElement.appendTo(this.List_expansion);
				}
			}
		}
	},
	
	cloneElementWithControls: function(element) {
		
	},
	
	cloneElementWithControl: function(element) {
		var $newElement = $(element).clone();
		var control = QuickUI(element);
		if (control !== undefined)
		{
			var newControl = new control.constructor();
			$.extend(true, newControl, control);
		}
		newControl.element = $newElement;
		$.data(newControl.element, "control", newControl);
		return $newElement[0];
	}
	
});

//
// NavigationBar
//
NavigationBar = QuickUI.Control.extend({
	className: "NavigationBar",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Home",
					"href": "/home/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Download",
					"href": "/downloads/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Tutorial",
					"href": "/tutorial/section01/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Gallery",
					"href": "/gallery/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Discuss",
					"href": "http://groups.google.com/group/quickui"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Contribute",
					"href": "http://code.google.com/p/quickui/"
				}),
				" "
			]
		});
	}
});
$.extend(NavigationBar.prototype, {

	highlightCurrentArea: function() {
		// Highlight the link for the area we're in.
		var area = this.page() && this.page().area();
		if (area != null) {
			this.$(".Link").each(function() {
				var control = QuickUI(this);
				$(this).toggleClass("highlight", control.content() == area);
			});
		}
	}
	
});

//
// NavigationLink
//
NavigationLink = Link.extend({
	className: "NavigationLink",
	render: function() {
		Link.prototype.render.call(this);
		this.setClassProperties(Link, {

		});
	}
});

//
// Navigator
//
Navigator = QuickUI.Control.extend({
	className: "Navigator"
});
$.extend(Navigator.prototype, {

	// Highlight the link for the page we're on.
	highlightCurrentPage: function() {
		var pageHref = window.location.href;
		this.$(".Link").each(function() {
			var linkHref = QuickUI(this).href();
			var pageHrefRight = pageHref.substring(pageHref.length - linkHref.length)
			$(this).toggleClass("highlight", pageHrefRight == linkHref);
		});
	}
	
});

//
// SitePage
//
SitePage = Page.extend({
	className: "SitePage",
	render: function() {
		Page.prototype.render.call(this);
		this.setClassProperties(Page, {
			"fill": "true",
			"content": [
				" ",
				this.tableMain = $("<table id=\"tableMain\" />").items(
					" ",
					this.topRow = $("<tr id=\"topRow\" />").items(
						" ",
						this.logoCell = $("<td id=\"logoCell\" />").items(
							" ",
							this.logotype = QuickUI.Control.create(Link, {
								"content": " <span class=\"bracket\">&lt;</span>QuickUI<span class=\"bracket\">&gt;</span> ",
								"href": "/home/default.html",
								"id": "logotype"
							}),
							" ",
							this.tagline = $("<div id=\"tagline\">Modular web control framework</div>")[0],
							" "
						)[0],
						" ",
						this.topNavigation = $("<td id=\"topNavigation\" />").items(
							this.navigationBar = QuickUI.Control.create(NavigationBar, {
								"id": "navigationBar"
							})
						)[0],
						" "
					)[0],
					" ",
					$("<tr />").items(
						" ",
						this.leftNavigation = $("<td id=\"leftNavigation\" />").items(
							" ",
							"<h1> </h1>",
							" ",
							this.SitePage_navigationLinks = QuickUI.Control.create(Navigator, {
								"id": "SitePage_navigationLinks"
							}),
							" ",
							this.SitePage_sidebar = $("<div id=\"SitePage_sidebar\" />")[0],
							" "
						)[0],
						" ",
						this.pageCanvas = $("<td id=\"pageCanvas\" />").items(
							" ",
							this.SitePage_title = $("<h1 id=\"SitePage_title\" />")[0],
							" ",
							this.SitePage_content = $("<div id=\"SitePage_content\" />")[0],
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
$.extend(SitePage.prototype, {
	
	area: QuickUI.Property(),
	content: QuickUI.Element("SitePage_content").content(),
	navigationLinks: QuickUI.Element("SitePage_navigationLinks").content(),
	sidebar: QuickUI.Element("SitePage_sidebar").content(),
	
	ready: function() {
		QuickUI(this.navigationBar).highlightCurrentArea();
		QuickUI(this.SitePage_navigationLinks).highlightCurrentPage();
	},
	
	title: function(value) {
		if (value !== undefined)
		{
			$(this.SitePage_title).html(value);
			return SitePage.superProto.title.call(this, value + " - QuickUI");
		}
		else
		{
			return SitePage.superProto.title.call(this);
		}
	}
	
});

//
// SourceCode
//
SourceCode = QuickUI.Control.extend({
	className: "SourceCode",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.SourceCode_content = $("<pre id=\"SourceCode_content\" />")[0],
				" ",
				$("<div id=\"_divLink\" />").items(
					" ",
					this.link = $("<a id=\"link\" />").items(
						"→ ",
						this.linkText = $("<span id=\"linkText\" />")[0]
					)[0],
					" "
				)[0],
				" "
			]
		});
	}
});
$.extend(SourceCode.prototype, {
	
	content: QuickUI.Element("SourceCode_content").content(),
	
	fileName: function(path) {
		var pathNames = path.split("/");
		return (pathNames.length == 0)
			? null
			: pathNames[pathNames.length - 1];
	},
	
	sourceFile: QuickUI.Property(function(value) {
		var self = this;
		// Load the file.
		$.get(value, function(data) {
			// Using $.text() escapes the HTML/XML.
			$(self.SourceCode_content).text(self.tabsToSpaces(data));
		});
		$(this.link).attr("href", value);
		$(this.linkText).html(this.fileName(value));
	}),
	
	tabsToSpaces: function(s) {
		return s.replace(/\t/g, "    ");
	}
	
});

//
// Tag
//
Tag = QuickUI.Control.extend({
	className: "Tag",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				"&lt;",
				this.Tag_content = $("<span id=\"Tag_content\" />")[0],
				">"
			]
		});
	}
});
$.extend(Tag.prototype, {
	content: QuickUI.Element("Tag_content").content()
});

//
// TutorialPage
//
TutorialPage = SitePage.extend({
	className: "TutorialPage",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			"area": "Tutorial",
			"navigationLinks": [
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Hello, world",
					"href": "/tutorial/section01/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "How QuickUI works",
					"href": "/tutorial/section02/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Composing controls",
					"href": "/tutorial/section03/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Referencing control elements",
					"href": "/tutorial/section04/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Defining control properties",
					"href": "/tutorial/section05/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Setting control properties",
					"href": "/tutorial/section06/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Property factories",
					"href": "/tutorial/section07/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Markup within properties",
					"href": "/tutorial/section08/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Control content",
					"href": "/tutorial/section09/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Styling controls",
					"href": "/tutorial/section10/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "More on styling",
					"href": "/tutorial/section11/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Defining interactivity",
					"href": "/tutorial/section12/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Controlling behavior",
					"href": "/tutorial/section13/default.html"
				}),
				" ",
				QuickUI.Control.create(NavigationLink, {
					"content": "Subclassing controls",
					"href": "/tutorial/section14/default.html"
				}),
				" "
			]
		});
	}
});

