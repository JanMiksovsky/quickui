//
// DownloadPage
//
DownloadPage = QuickUI.Control.extend({
	className: "DownloadPage",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				"\n\n",
				QuickUI.Control.create(SitePage, {
					"content": [
						"\n\t\n",
						"<h2>Windows</h2>",
						"\n\n",
						$("<ol />").items(
							"\n\t",
							$("<li />").items(
								QuickUI.Control.create(Link, {
									"content": "Download the installer",
									"href": "/downloads/QuickUI%20Setup.msi"
								}),
								"."
							)[0],
							"\n\t",
							"<li>Add the QuickUI tools folder (e.g., C:\\Program Files\\QuickUI\\bin) to your path.</li>",
							"\n"
						)[0],
						"\n\n",
						"<div style=\"color: lightgray\">\r\n<h2>Mac OS/X</h2>\r\n<ol>\r\n\t<li>Download Mono</li>\r\n\t<li>Download package</li>\r\n\t<li>Add the QuickUI shell folder to your path.</li>\r\n</ol>\r\n</div>",
						"\n\n",
						$("<p />").items(
							"After downloading, you can run through the quick ",
							QuickUI.Control.create(Link, {
								"content": "tutorial",
								"href": "/tutorial/section01/default.html"
							}),
							"."
						)[0],
						"\n\n",
						"<h1>Integrate QuickUI into a development environment</h1>",
						"\n\n",
						"<p>\r\nQuick markup files use the .qui extension. You can associate this extension with your\r\nprefered XML or HTML editor. (An HTML editor will likely complain about some unknown elements,\r\nbut you’ll pick up syntax highlighting, auto-completion, etc., for CSS rules and JavaScript\r\nembedded in the Quick markup.)\r\n</p>",
						"\n\n",
						"<h2>Aptana Studio</h2>",
						"\n\nYou can configure ",
						QuickUI.Control.create(Link, {
							"content": "Aptana Studio",
							"href": "http://www.aptana.com/studio"
						}),
						" to \nautomatically build a QuickUI project by invoking the qb tool.\n\n",
						"<ol>\r\n\t<li>Create or open a project in Aptana Studio.</li>\r\n\t<li>From the Project menu, choose Properties.</li>\r\n\t<li>Select the Builders tab.</li>\r\n\t<li>First you’ll create a Builder to build your Aptana project using qb. Click the New… button.</li>\r\n\t<li>Select “Program”.</li>\r\n\t<li>Give the builder a name like “qb”.</li>\r\n\t<li>On the Main tab, enter a Location of “${system_path:qb.exe}”. For the Working Directory, use the Browse Workspace… button to select your project.</li>\r\n\t<li>On the Refresh tab, check “Refresh resources upon completion”, and “The project containing the selected resource”.</li>\r\n\t<li>Click OK to save the Builder.</li>\r\n\t<li>Next you’ll create a Builder to clean your Aptana project using qb with the “-clean” option. Click the New… button again.</li>\r\n\t<li>Select “Program”.</li>\r\n\t<li>Give the builder a name like “qb -clean”.</li>\r\n\t<li>On the Main tab, in the Arguments text box, enter “-clean”. Enter the same Location (${system_path:qb.exe}) and Working Directory. </li>\r\n\t<li>On the Refresh tab, check “Refresh resources upon completion”, and “The project containing the selected resource”.</li>\r\n\t<li>On the Build Options tab, check “During a ‘Clean’”, and uncheck the other “Run the builder” check boxes.</li>\r\n\t<li>Click OK to save the Builder.</li>\r\n\t<li>Click OK to close the Properties dialog.</li>\r\n\t<li>From the Project menu, select “Build Project”. You should see qb output in the Console view.</li>\r\n</ol>",
						"\n\n"
					],
					"area": "Download",
					"title": "Download QuickUI"
				}),
				"\n\n"
			]
		});
	}
});

