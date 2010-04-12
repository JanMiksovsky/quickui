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
				" ",
				"<p>\r\nOften we want to define some stock content and styling, <i>and</i> we also\r\nwant to define some custom content that varies per control.\r\n</p>",
				" ",
				$("<p />").items(
					" A simple example is the ",
					QuickUI.Control.create(GalleryLink, {
						"content": "Tag"
					}),
					" control, used throughout the QuickUI site to format Quick markup tags such as a ",
					QuickUI.Control.create(Tag, {
						"content": "Control"
					}),
					" tag. This control surrounds its contents with “&lt;” and “>” and styles itself in a non-proportional font suitable for code. "
				)[0],
				" ",
				"<h2>Defining a content property</h2>",
				" ",
				"<p>\r\n\r\n</p>",
				" ",
				QuickUI.Control.create(SourceCode, {
					"sourceFile": "../controls/Tag.qui"
				}),
				" ",
				"<h2>Using a content property</h2>",
				" ",
				"<p>\r\n*** explain content syntax here? ***\r\n</p>",
				" "
			]
		});
	}
});

