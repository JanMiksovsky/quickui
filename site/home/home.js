//
// Greet
//
Greet = QuickControl.extend({
	className: "Greet",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: " Hello, world! ",
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
			area: "Home",
			title: "Introduction to QuickUI",
			content: [
				"<p>\r\nQuickUI (Quick User Interface) is a framework that simplifies the design, construction,\r\nand maintenance of web-based user interfaces. The easiest way to describe QuickUI is\r\nthat it lets you write HTML as if you could create your own tags.\r\n</p>",
				$("<p />").setContents(
					" In QuickUI, the tags you create are called controls. Each control can include HTML markup (including other Quick controls), CSS styling, and JavaScript scripting. You can easily bundle together a group of controls to create a new control. At its core, QuickUI includes a design-time tool that compiles your markup into regular JavaScript and CSS files. This tool runs on Windows and OS/X. The generated JavaScript makes use of the ",
					QuickControl.create(Link, {
						content: "jQuery",
						href: "http://jquery.com",
					}),
					" library to build the web user interface on demand. "
				)[0],
				"<h2>A quick example</h2>",
				"<p>\r\n\tThe following Quick markup defines a simple control called “Greet”.\r\n</p>",
				QuickControl.create(SourceCode, {
					sourceFile: "Greet.qui",
				}),
				$("<p />").setContents(
					" This control definition gives you a new tag ",
					QuickControl.create(Tag, {
						content: "Greet",
					}),
					" that can be used in other Quick markup like this: "
				)[0],
				QuickControl.create(SourceCode, {
					sourceFile: "Sample.qui",
				}),
				"<p>\r\nOf course you need a way to kick things off, which you can do in JavaScript\r\nvia a jQuery extension:\r\n</p>",
				"<pre>\r\n$(\"div\").control(Sample);\r\n</pre>",
				"<p>\r\nRunning this will embed output like the following into the web page:\r\n</p>",
				QuickControl.create(CodeOutput, {
					content: QuickControl.create(Sample),
				}),
				"<p>\r\nThis is a trivial example. Most controls will include more complex\r\ncontents, styling, and interactive behavior. When combined with the ability to\r\ncompose and subclass controls, things can quickly become very interesting.\r\n</p>",
				"<h2>Get started</h2>",
				$("<ul />").setContents(
					$("<li />").setContents(
						QuickControl.create(Link, {
							content: "Download QuickUI",
							href: "/downloads/default.html",
						})
					)[0],
					$("<li />").setContents(
						QuickControl.create(Link, {
							content: "Read the Tutorial",
							href: "/tutorial/section01/default.html",
						})
					)[0]
				)[0]
			],
		});
	}
});

//
// Sample
//
Sample = QuickControl.extend({
	className: "Sample",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: [
				"<h1>QuickUI sample</h1>",
				QuickControl.create(Greet)
			],
		});
	}
});

