//
// CodeOutput
//
CodeOutput = QuickControl.extend({
	className: "CodeOutput",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: this.CodeOutput_content = $("<div id=\"CodeOutput_content\" />")[0],
		});
	}
});
$.extend(CodeOutput.prototype, {
	content: Property.element("CodeOutput_content")
})

//
// Link
//
Link = QuickControl.extend({
	className: "Link",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: this.Link_content = $("<a id=\"Link_content\" href=\"javascript:\" />")[0],
		});
	}
});
$.extend(Link.prototype, {
	
	content: Property.element("Link_content"),
	href: Property(),
	
	ready: function() {
		var self = this;
		$(this.Link_content).click(function() {
			self.navigate();
		});
	},
	
	navigate: function() {
		
		var href = this.href();
		if (href == null) {
			return;
		}
		
		// HACK for testing under Aptana preview server.
		if (window.location.hostname == "127.0.0.1" &&
			href.substr(0,7) != "http://")
		{
			href = "/QuickUI/site" + href;
		}
		window.location.href = href;
	},
});

//
// NavigationBar
//
NavigationBar = QuickControl.extend({
	className: "NavigationBar",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: QuickControl.nodes(
				QuickControl.create(NavigationLink, {
					content: "Home",
					href: "/home/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Download",
					href: "/downloads/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Tutorial",
					href: "/tutorial/section01/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Contribute",
					href: "http://code.google.com/p/quickui/",
				})[0]
			),
		});
	}
});
$.extend(NavigationBar.prototype, {

	highlightCurrentArea: function() {
		// Highlight the link for the area we're in.
		var area = this.page() && this.page().area();
		if (area != null) {
			this.$(".Link").each(function() {
				var control = $(this).control();
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
});

//
// SitePage
//
SitePage = Page.extend({
	className: "SitePage",
	render: function() {
		Page.prototype.render.call(this);
		this.setClassProperties(Page, {
			fill: "true",
			content: this.tableMain = $("<table id=\"tableMain\" />")
			.append(
				QuickControl.nodes(
					this.topRow = $("<tr id=\"topRow\" />")
					.append(
						QuickControl.nodes(
							this.logoCell = $("<td id=\"logoCell\" />")
							.append(
								QuickControl.nodes(
									this.logotype = QuickControl.create(Link, {
										content: "<span class=\"bracket\">&lt;</span>QuickUI<span class=\"bracket\">&gt;</span>",
										href: "/home/default.html",
										id: "logotype",
									})[0],
									this.tagline = $("<div id=\"tagline\">Modular web control framework</div>")[0]
								)
							)[0],
							this.topNavigation = $("<td id=\"topNavigation\" />")
							.append(
								QuickControl.nodes(
									this.navigationBar = QuickControl.create(NavigationBar, {
										id: "navigationBar",
									})[0]
								)
							)[0]
						)
					)[0],
					$("<tr />")
					.append(
						QuickControl.nodes(
							this.leftNavigation = $("<td id=\"leftNavigation\" />")
							.append(
								QuickControl.nodes(
									this.SitePage_navigator = $("<div id=\"SitePage_navigator\" />")[0]
								)
							)[0],
							this.pageCanvas = $("<td id=\"pageCanvas\" />")
							.append(
								QuickControl.nodes(
									this.SitePage_title = $("<h1 id=\"SitePage_title\" />")[0],
									this.SitePage_content = $("<div id=\"SitePage_content\" />")[0]
								)
							)[0]
						)
					)[0]
				)
			)[0],
		});
	}
});
$.extend(SitePage.prototype, {
	
	area: Property(),
	content: Property.element("SitePage_content"),
	navigator: Property.element("SitePage_navigator"),
	
	ready: function() {
		$(this.navigationBar).control().highlightCurrentArea();
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
SourceCode = QuickControl.extend({
	className: "SourceCode",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: QuickControl.nodes(
				this.SourceCode_content = $("<pre id=\"SourceCode_content\" />")[0],
				$("<div id=\"_divLink\" />")
				.append(
					QuickControl.nodes(
						this.link = $("<a id=\"link\" />")
						.append(
							QuickControl.nodes(
								"→ ",
								this.linkText = $("<span id=\"linkText\" />")[0]
							)
						)[0]
					)
				)[0]
			),
		});
	}
});
$.extend(SourceCode.prototype, {
	
	content: Property.element("SourceCode_content"),
	
	fileName: function(path) {
		var pathNames = path.split("/");
		return (pathNames.length == 0)
			? null
			: pathNames[pathNames.length - 1];
	},
	
	sourceFile: Property(function(value) {
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
Tag = QuickControl.extend({
	className: "Tag",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: QuickControl.nodes(
				"<",
				this.Tag_content = $("<div id=\"Tag_content\" />")[0],
				">"
			),
		});
	}
});
$.extend(Tag.prototype, {
	content: Property.element("Tag_content")
});

//
// TutorialNavigator
//
TutorialNavigator = QuickControl.extend({
	className: "TutorialNavigator",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: QuickControl.nodes(
				"<h1>Tutorial</h1>",
				QuickControl.create(NavigationLink, {
					content: "Hello, world",
					href: "/tutorial/section01/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "How QuickUI works",
					href: "/tutorial/section02/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Composing controls",
					href: "/tutorial/section03/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Referencing control elements",
					href: "/tutorial/section04/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Defining control properties",
					href: "/tutorial/section05/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Setting control properties",
					href: "/tutorial/section06/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Compact property definition",
					href: "/tutorial/section07/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Markup within properties",
					href: "/tutorial/section08/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Control prototypes",
					href: "/tutorial/section09/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Styling controls",
					href: "/tutorial/section10/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "More on styling",
					href: "/tutorial/section11/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Defining interactivity",
					href: "/tutorial/section12/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Controlling behavior",
					href: "/tutorial/section13/default.html",
				})[0],
				QuickControl.create(NavigationLink, {
					content: "Subclassing controls",
					href: "/tutorial/section14/default.html",
				})[0]
			),
		});
	}
});
$.extend(TutorialNavigator.prototype, {

	highlightCurrentPage: function() {
		// Highlight the link for the page we're on.
		var pageHref = window.location.href;
		this.$(".Link").each(function() {
			var linkHref = $(this).control().href();
			var pageHrefRight = pageHref.substring(pageHref.length - linkHref.length)
			$(this).toggleClass("highlight", pageHrefRight == linkHref);
		});
	}
	
});

//
// TutorialPage
//
TutorialPage = SitePage.extend({
	className: "TutorialPage",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			area: "Tutorial",
			navigator: this.tutorialNavigator = QuickControl.create(TutorialNavigator, {
				id: "tutorialNavigator",
			})[0],
		});
	}
});
$.extend(TutorialPage.prototype, {
	ready: function() {
		TutorialPage.superProto.ready.call(this);
		$(this.tutorialNavigator).control().highlightCurrentPage();
	}
});

