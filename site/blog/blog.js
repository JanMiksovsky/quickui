//
// Blog
//
Blog = QuickUI.Control.extend({
	className: "Blog"
});
$.extend(Blog.prototype, {
    
    loaded: false,
    
    ready: function() {
        if (!window.google)
        {
            debugger;
        }
        if (!google.feeds)
        {
            google.load("feeds", "1");
        }
        // this._reload();
    },

    url: QuickUI.Property(function() {
        this.loaded = false;
        // this._reload();
    }),
    
    _reload: function() {
        
        if (this.loaded)
        {
            return;            
        }

        var url = this.url();
        if (url == null)
        {
            return;
        }

        var $element = $(this.element);
        $element.empty();
        
        debugger;
        var feed = new google.feeds.Feed(url);
        feed.load(function(result) {
            if (!result.error) {
                debugger;
            }
        });
        
        this.loaded = true;
    }
});

//
// BlogPage
//
BlogPage = QuickUI.Control.extend({
	className: "BlogPage",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				QuickUI.Control.create(Blog, {
					"url": "http://feeds.feedburner.com/flowstate?format=xml"
				}),
				" "
			]
		});
	}
});

