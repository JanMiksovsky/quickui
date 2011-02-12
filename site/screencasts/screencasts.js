//
// ScreencastsPage
//
ScreencastsPage = SitePage.extend({
	className: "ScreencastsPage",
	render: function() {
		SitePage.prototype.render.call(this);
		this.setClassProperties(SitePage, {
			"area": "Screencasts",
			"title": "QuickUI Screencasts",
			"content": [
				Control.create(YouTubeVideo, {
					"videoId": "LF8agaCt0v4"
				}),
				Control.create(YouTubeVideo, {
					"videoId": "uZSlmav9_w8"
				}),
				Control.create(YouTubeVideo, {
					"videoId": "skyxSnywAYo"
				})
			]
		});
	}
});

