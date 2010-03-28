//
// DownloadPage
//
DownloadPage = SitePage.extend({
	className: "DownloadPage",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			"area": "Download",
			"title": "Download QuickUI",
			"content": [
				" ",
				"<h2>Windows</h2>",
				" ",
				$("<ol />").items(
					" ",
					$("<li />").items(
						QuickUI.Control.create(Link, {
							"content": "Download the installer",
							"href": "/downloads/QuickUI%20Setup.msi"
						}),
						"."
					)[0],
					" ",
					"<li>Add the QuickUI tools folder (e.g., C:\\Program Files\\QuickUI\\bin) to your path.</li>",
					" "
				)[0],
				" ",
				"<h2>Mac OS/X</h2>",
				" ",
				$("<ol />").items(
					" ",
					$("<li />").items(
						"Download ",
						QuickUI.Control.create(Link, {
							"content": "Mono",
							"href": "http://www.mono-project.com"
						}),
						". The QuickUI tools are written in .NET, and the Mono binaries allow QuickUI to run fine on OS/X."
					)[0],
					" ",
					$("<li />").items(
						"Download ",
						QuickUI.Control.create(Link, {
							"content": "QuickUI.zip",
							"href": "/downloads/QuickUI.zip"
						}),
						" and expand it."
					)[0],
					" ",
					"<li>Copy the expanded contents to a location, e.g., /Developer/Applications/QuickUI.</li>",
					" ",
					"<li>Add the resulting location of the QuickUI bin folder (e.g., /Developer/Applications/QuickUI/bin) to your path.</li>",
					" ",
					"<li>If you installed in a location other than /Developer/Applications/QuickUI,\r\n    then update the qb and qc scripts in the bin folder to point to the location you used.</li>",
					" "
				)[0],
				" ",
				$("<p />").items(
					"After downloading, you can run through the quick ",
					QuickUI.Control.create(Link, {
						"content": "tutorial",
						"href": "/tutorial/section01/default.html"
					}),
					"."
				)[0],
				" ",
				"<h1>Integrate QuickUI into a development environment</h1>",
				" ",
				"<p>\r\nQuick markup files use the .qui extension. You can associate this extension with your\r\nprefered XML or HTML editor. (An HTML editor will likely complain about some unknown elements,\r\nbut you’ll pick up syntax highlighting, auto-completion, etc., for CSS rules and JavaScript\r\nembedded in the Quick markup.)\r\n</p>",
				" ",
				"<h2>Aptana Studio</h2>",
				" You can configure ",
				QuickUI.Control.create(Link, {
					"content": "Aptana Studio",
					"href": "http://www.aptana.com/studio"
				}),
				" to automatically build a QuickUI project by invoking the qb tool. ",
				"<ol>\r\n\t<li>Create or open a project in Aptana Studio.</li>\r\n\t<li>From the Project menu, choose Properties.</li>\r\n\t<li>Select the Builders tab.</li>\r\n\t<li>First you’ll create a Builder to build your Aptana project using qb. Click the New… button.</li>\r\n\t<li>Select “Program”.</li>\r\n\t<li>Give the builder a name like “qb”.</li>\r\n\t<li>\r\n        On the Main tab, enter a Location of “${system_path:qb.exe}”.\r\n        (On OS/X, use \"qb\" instead of \"qb.exe\".\r\n        Mac Aptana doesn't seem to actually respect the system_path variable;\r\n        you may need to hard-code the path to qb instead.)\r\n    </li>\r\n    <li>For the Working Directory, use the Browse Workspace… button to select your project.</li>\r\n\t<li>On the Refresh tab, check “Refresh resources upon completion”, and “The project containing the selected resource”.</li>\r\n\t<li>Click OK to save the Builder.</li>\r\n\t<li>Next you’ll create a Builder to clean your Aptana project using qb with the “-clean” option. Click the New… button again.</li>\r\n\t<li>Select “Program”.</li>\r\n\t<li>Give the builder a name like “qb -clean”.</li>\r\n\t<li>On the Main tab, in the Arguments text box, enter “-clean”. Enter the same Location (${system_path:qb.exe}) and Working Directory. </li>\r\n\t<li>On the Refresh tab, check “Refresh resources upon completion”, and “The project containing the selected resource”.</li>\r\n\t<li>On the Build Options tab, check “During a ‘Clean’”, and uncheck the other “Run the builder” check boxes.</li>\r\n\t<li>Click OK to save the Builder.</li>\r\n\t<li>Click OK to close the Properties dialog.</li>\r\n\t<li>From the Project menu, select “Build Project”. You should see qb output in the Console view.</li>\r\n</ol>",
				" ",
				$("<p />").items(
					" To get most of the benefits of Aptana's HTML editor, in Aptana'a Preferences dialog, under General / Editors / File Associates, set the editor for *.qui files to be “Aptana HTML Editor”. The editor will complain about the custom tags in Quick markup, but that won't prevent you from getting work done, and you'll pick up smart editing for the contents of ",
					QuickUI.Control.create(Tag, {
						"content": "style"
					}),
					" and ",
					QuickUI.Control.create(Tag, {
						"content": "script"
					}),
					" tags. "
				)[0],
				" "
			]
		});
	}
});

