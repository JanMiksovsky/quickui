//
// DemoPage
//
DemoPage = Page.extend({
	className: "DemoPage",
	render: function() {
		Page.prototype.render.call(this);
		this.setClassProperties(Page, {
			"fill": "true",
			"content": [
				" ",
				this.photoCanvas = Control.create(PhotoCanvas, {
					"id": "photoCanvas"
				}),
				" "
			]
		});
	}
});
$.extend(DemoPage.prototype, {
    
    ready: function() {
        var apiKey = "c3685bc8d8cefcc1d25949e4c528cbb0";
        var method = "flickr.interestingness.getList";
        var self = this;
        this.getFlickrPhotos(apiKey, method, function(flickrPhotos) {
            var photos = $.map(flickrPhotos, function(flickrPhoto) {
                return {
                    src: self.getFlickrImageSrc(flickrPhoto),
                    href: self.getFlickrImageHref(flickrPhoto)
                };
            })
            Control(self.photoCanvas).photos(photos);
        });
    },
    
    getFlickrPhotos: function(apiKey, method, callback) {
        var baseUrl = "http://api.flickr.com/services/rest/";
        var count = Page.urlParameters().count || 12;
        var url = baseUrl + 
                    "?api_key=" + apiKey +
                    "&method=" + method +
                    "&per_page=" + count +
                    "&format=json" +
                    "&nojsoncallback=1";
        $.getJSON(url, function (data) {
            callback(data.photos.photo);
        });
    },
    
    getFlickrImageSrc: function(flickrPhoto) {
        return "http://farm" + flickrPhoto.farm +
               ".static.flickr.com/" + flickrPhoto.server +
               "/" + flickrPhoto.id +
               "_" + flickrPhoto.secret +
               ".jpg";
    },
    
    getFlickrImageHref: function(flickrPhoto) {
        return "http://flickr.com/photo.gne?id=" + flickrPhoto.id;
    }
});

//
// Photo
//
Photo = Control.extend({
	className: "Photo",
	render: function() {
		Control.prototype.render.call(this);
		this.setClassProperties(Control, {
			"content": [
				" ",
				this.Photo_src = $("<img id=\"Photo_src\" />")[0],
				" "
			]
		});
	}
});
$.extend(Photo.prototype, {
    href: Control.Property(),
    src: Control.Element("Photo_src").attr("src"),
    ready: function() {
        var self = this;
        $(this.Photo_src).click(function() {
            window.location.href = self.href();
        });
        /*
        var $img = $(this.Photo_src);
        $img.load(function() {
            var image = $img[0];
            var aspect = image.naturalWidth / image.naturalHeight;
            var narrow = (aspect < 1);
            var width = narrow ? "auto" : "100%";
            var height = narrow ? "100%" : "auto";
            $img.css({
                width: width,
                height: height
            });
        });
        */
    }
});

//
// PhotoCanvas
//
PhotoCanvas = Control.extend({
	className: "PhotoCanvas"
});
$.extend(PhotoCanvas.prototype, {

    ready: function() {
        var self = this;
        $(window).resize(function() { self._resize(); });
        this._resize();
    },
    
    // An array of URLs pointing to images.
    photos: Control.Property(function(photos) {
        var photoElements = $.map(photos, function(photo) {
            return Control.create(Photo, {
                src: photo.src,
                href: photo.href
            });
        });
        $(this.element).items(photoElements);
        
        // HACK to trigger invocation of new control's ready() event.
        var c = Control._readyQueue.shift();
        while (c)
        {
            c.ready();
            c = Control._readyQueue.shift();
        }
        
        this._resize();
    }),

    _resize: function() {
        var $element = $(this.element);
        var $children = $element.children();
        var width = $element.width();
        var height = $element.height();
        var cellCount = $children.length;
        var cellSize = maxSquare.optimalCellSize(width, height, cellCount);
        $children.css(cellSize);
    }    
});

