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
			title: "QuickUI: Modular Web Control Framework",
			content: [
				"<p>\r\nQuickUI (Quick User Interface) is a framework that simplifies the design, construction,\r\nand maintenance of web-based user interfaces. The easiest way to describe QuickUI is\r\nthat it lets you write HTML as if you could create your own tags.\r\n</p>",
				"<p>\t\r\nIn QuickUI, the tags you create are called controls. Each control can include HTML markup\r\n(including other Quick controls), CSS styling, and JavaScript scripting. You can easily\r\nbundle together a group of controls to create a new control.\r\n</p>",
				$("<p />").items(
					" QuickUI includes tools that compile your markup into regular JavaScript and CSS files. These tools run on Windows and OS/X (via the Mono project). The generated JavaScript makes use of the ",
					QuickControl.create(Link, {
						content: "jQuery",
						href: "http://jquery.com",
					}),
					" library to build the web user interface on demand. QuickUI also includes a run-time library. Overall QuickUI is targetted at and tested against the mainstream browsers: Apple Safari 4.x, Google Chrome 3.x, Internet Explorer 8.x, and Mozilla Firefox 3.x. "
				)[0],
				"<h2>A quick example</h2>",
				"<p>\r\n\tThe following Quick markup defines a simple control called “Greet”.\r\n</p>",
				QuickControl.create(SourceCode, {
					sourceFile: "Greet.qui",
				}),
				$("<p />").items(
					" This control definition gives you a new tag ",
					QuickControl.create(Tag, {
						content: "Greet",
					}),
					" that can be used in other Quick markup like this: "
				)[0],
				QuickControl.create(SourceCode, {
					sourceFile: "Sample.qui",
				}),
				"<p>\r\nKicking everything off is accomplished in JavaScript via a jQuery extension:\r\n</p>",
				"<pre>\r\n$(\"div\").control(Sample);\r\n</pre>",
				"<p>\r\nThe div below shows the sample control above instantiated on this page:\r\n</p>",
				QuickControl.create(CodeOutput, {
					content: QuickControl.create(Sample),
				}),
				"<p>\r\nThis is a trivial example. Most controls will include more complex\r\ncontents, styling, and interactive behavior. When combined with the ability to\r\ncompose and subclass controls, things can quickly become very interesting.\r\n</p>",
				"<h2>Get started</h2>",
				$("<ul />").items(
					$("<li />").items(
						QuickControl.create(Link, {
							content: "Download QuickUI",
							href: "/downloads/default.html",
						})
					)[0],
					$("<li />").items(
						QuickControl.create(Link, {
							content: "Read the Tutorial",
							href: "/tutorial/section01/default.html",
						})
					)[0]
				)[0],
				QuickControl.create(AddThis)
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

