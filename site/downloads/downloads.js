//
// DownloadPage
//
DownloadPage = SitePage.extend({
	className: "DownloadPage",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			area: "Download",
			title: "Download QuickUI",
			content: [
				"<h2>Windows</h2>",
				$("<ol />").items(
					$("<li />").items(
						QuickUI.Control.create(Link, {
							content: "Download the installer",
							href: "/downloads/QuickUI%20Setup.msi",
						}),
						"."
					)[0],
					"<li>Add the QuickUI tools folder (e.g., C:\\Program Files\\QuickUI\\bin) to your path.</li>"
				)[0],
				"<div style=\"color: lightgray\"><h2>Mac OS/X</h2><ol><li>Download Mono</li><li>Download package</li><li>Add the QuickUI shell folder to your path.</li></ol></div>",
				$("<p />").items(
					"After downloading, you can run through the quick ",
					QuickUI.Control.create(Link, {
						content: "tutorial",
						href: "/tutorial/section01/default.html",
					}),
					"."
				)[0],
				"<h1>Integrate QuickUI into a development environment</h1>",
				"<p>\r\nQuick markup files use the .qui extension. You can associate this extension with your\nprefered XML or HTML editor. (An HTML editor will likely complain about some unknown elements,\nbut you’ll pick up syntax highlighting, auto-completion, etc., for CSS rules and JavaScript\nembedded in the Quick markup.)\n</p>",
				"<h2>Aptana Studio</h2>",
				" You can configure ",
				QuickUI.Control.create(Link, {
					content: "Aptana Studio",
					href: "http://www.aptana.com/studio",
				}),
				" to automatically build a QuickUI project by invoking the qb tool. ",
				"<ol><li>Create or open a project in Aptana Studio.</li><li>From the Project menu, choose Properties.</li><li>Select the Builders tab.</li><li>First you’ll create a Builder to build your Aptana project using qb. Click the New… button.</li><li>Select “Program”.</li><li>Give the builder a name like “qb”.</li><li>On the Main tab, enter a Location of “${system_path:qb.exe}”. For the Working Directory, use the Browse Workspace… button to select your project.</li><li>On the Refresh tab, check “Refresh resources upon completion”, and “The project containing the selected resource”.</li><li>Click OK to save the Builder.</li><li>Next you’ll create a Builder to clean your Aptana project using qb with the “-clean” option. Click the New… button again.</li><li>Select “Program”.</li><li>Give the builder a name like “qb -clean”.</li><li>On the Main tab, in the Arguments text box, enter “-clean”. Enter the same Location (${system_path:qb.exe}) and Working Directory. </li><li>On the Refresh tab, check “Refresh resources upon completion”, and “The project containing the selected resource”.</li><li>On the Build Options tab, check “During a ‘Clean’”, and uncheck the other “Run the builder” check boxes.</li><li>Click OK to save the Builder.</li><li>Click OK to close the Properties dialog.</li><li>From the Project menu, select “Build Project”. You should see qb output in the Console view.</li></ol>"
			],
		});
	}
});

