//
// BrowserDependent
//
BrowserDependent = Control.subclass("BrowserDependent", function() {
	this.properties({
		"content": [
			" ",
			this.$BrowserDependent_content = Control("<span id=\"BrowserDependent_content\" />"),
			" ",
			this.$BrowserDependent_elseContent = Control("<span id=\"BrowserDependent_elseContent\" />"),
			" "
		]
	}, Control);
});
BrowserDependent.prototype.define({
    
	ifBrowser: Control.property(),
	content: Control.element("BrowserDependent_content").content(),
	elseContent: Control.element("BrowserDependent_elseContent").content(),
	ifSupport: Control.property(),
	
	initialize: function() {
		var usingSpecifiedBrowser = (this.ifBrowser() === undefined) || !!$.browser[this.ifBrowser()];
		var browserSupportsProperty = (this.ifSupport() === undefined) || !!$.support[this.ifSupport()];
		var allConditionsSatisfied = usingSpecifiedBrowser && browserSupportsProperty;
		this.$BrowserDependent_content.toggle(allConditionsSatisfied);
		this.$BrowserDependent_elseContent.toggle(!allConditionsSatisfied);
	}
});

//
// ButtonBase
//
ButtonBase = Control.subclass("ButtonBase");
ButtonBase.prototype.define({
	
	isFocused: Control.property.bool(null, false),
	isKeyPressed: Control.property.bool(null, false),
	isMouseButtonDown: Control.property.bool(null, false),
	isMouseOverControl: Control.property.bool(null, false),
	
	initialize: function() {
		var self = this;
		this
			.blur(function(event) { self.trackBlur(event); })
			.click(function(event) {
				if (self.disabled())
				{
					event.stopImmediatePropagation();
				}
			})
			.focus(function(event) { self.trackFocus(event); })
			.hover(
				function(event) { self.trackMousein(event); },
				function(event) { self.trackMouseout(event); }
			)
			.keydown (function(event) { self.trackKeydown(event); })
			.keyup (function(event) { self.trackKeyup(event); })
			.mousedown(function(event) { self.trackMousedown(event); })
			.mouseup(function(event) { self.trackMouseup(event); });
		this._renderButton();
	},
	
	trackBlur: function(event) {
		
		this.removeClass("focused");

		// Losing focus causes the button to override any key that had been pressed.
		this.isKeyPressed(false);

		this.isFocused(false);
		this._renderButton();
	},
	
	// The current state of the button.
	buttonState: function() {
		if (this.disabled())
		{
			return ButtonBase.state.disabled;
		}
		else if ((this.isMouseButtonDown() && this.isMouseOverControl())
			|| this.isKeyPressed())
		{
			return ButtonBase.state.pressed;
		}
		else if (this.isFocused())
		{
			return ButtonBase.state.focused;
		}
		else if (this.isMouseOverControl() /* || this.isMouseButtonDown() */)
		{
			return ButtonBase.state.hovered;
		}

		return ButtonBase.state.normal;
	},

    disabled: Control.element().applyClass("disabled", function(disabled) {
		this._renderButton();
	}),
	
	trackFocus: function(event) {
        if (!this.disabled()) 
        {
            this.addClass("focused");
            this.isFocused(true);
            this._renderButton();
        }
	},
	
	trackKeydown: function(event) {
		if (!this.disabled() && (event.keyCode == 32 /* space */ || event.keyCode == 13 /* return */))
		{
			this.isKeyPressed(true);		
			this._renderButton();
		}
	},
	
	trackKeyup: function(event) {
		this.isKeyPressed(false);
		this._renderButton();
	},
	
	trackMousedown: function(event) {
        if (!this.disabled())
        {
            this.addClass("pressed");
            this.isMouseButtonDown(true);
            this._renderButton();
        }
	},
	
	trackMousein: function(event) {
        if (!this.disabled()) 
        {
            this.addClass("hovered");
            this.isMouseOverControl(true);
            this._renderButton();
        }
	},
	
	trackMouseout: function(event) {
		this
			.removeClass("focused")
			.removeClass("hovered")
			.removeClass("pressed");
		this.isMouseOverControl(false);
		this._renderButton();
	},
	
	trackMouseup: function(event) {
		this.removeClass("pressed");
		this.isMouseButtonDown(false);
		this._renderButton();
	},
	
	_renderButtonState: function(buttonState) {},
	
	_renderButton: function() {
		this._renderButtonState(this.buttonState());
	}
});
$.extend(ButtonBase, {
	state: {
		normal: 0,
		hovered: 1,
		focused: 2,
		pressed: 3,
		disabled: 4
	}
});

//
// HorizontalPanels
//
HorizontalPanels = Control.subclass("HorizontalPanels", function() {
	this.properties({
		"content": [
			" ",
			this.$HorizontalPanels_left = Control("<div id=\"HorizontalPanels_left\" class=\"minimumWidth\" />"),
			" ",
			this.$HorizontalPanels_content = Control("<div id=\"HorizontalPanels_content\" />"),
			" ",
			this.$HorizontalPanels_right = Control("<div id=\"HorizontalPanels_right\" class=\"minimumWidth\" />"),
			" "
		]
	}, Control);
});
HorizontalPanels.prototype.define({
    content: Control.element("HorizontalPanels_content").content(),
    fill: Control.element().applyClass("fill"),
    left: Control.element("HorizontalPanels_left").content(),
    right: Control.element("HorizontalPanels_right").content()
});

//
// List
//
List = Control.subclass("List");
List.prototype.define({
    
    itemClass: Control.property(
        function() { this._refresh(); },
        null,
        function(className) {
            return eval(className);
        }
    ),
        
    items: Control.property(function() { this._refresh(); }),
    
    //
    // This mapFn should be a function that accepts one object
    // (typically a data object) and returns a new object whose
    // properties map directly to property settors defined by the
    // target itemClass.
    //
    mapFn: Control.property(null, null),
    
    _refresh: function() {
        var itemClass = this.itemClass();
        var items = this.items();
        var mapFn = this.mapFn();
        if (itemClass && items)
        {
            var self = this;
            var controls = $.map(items, function(item, index) {
                var properties;
                if (mapFn)
                {
                    // Map item to control properties with custom map function.
                    properties = mapFn.call(self, item, index);
                }
                else if (typeof item == "string" || item instanceof String)
                {
                    // Simple string; use as content property.
                    properties = { content: item };
                }
                else
                {
                    // Use the item as is for the control's properties.
                    properties = item;
                }
                var control = itemClass.create(properties);
                return control;
            });
            this.content(controls);
        }
    }
    
});

//
// Overlay
//
Overlay = Control.subclass("Overlay");
Overlay.prototype.define({

	$blanket: Control.property(),
	blanketColor: Control.property(),
	blanketOpacity: Control.property(),
	dismissOnInsideClick: Control.property.bool(),
	dismissOnOutsideClick: Control.property.bool(null, true),
	
	initialize: function()
	{
		var self = this;
		this.click(function() {
			if (self.dismissOnInsideClick())
			{
				self.hideOverlay();
			}
		});
	},
	
	closeOverlay: function() {
	    this
	        .hideOverlay()
	        .remove();
	},
	
	hideOverlay: function()
	{
        this
			.hide()
			.css("z-index", null); // No need to define Z-order any longer.
		if (this.$blanket() != null)
		{
			this.$blanket().remove();
			this.$blanket(null);
		}
		
        this.trigger("overlayClosed");  // TODO: Rename to overlayHidden? Move trigger to closeOverlay?
	},
    
    // Subclasses should override this to position themselves.
    positionOverlay: function() {
        return this;
    },
    	
	showOverlay: function()
	{
		if (this.$blanket() == null)
		{
			this.$blanket(this._createBlanket());
		}
		
		/* Show control and blanket at the top of the Z-order. */
		var maximumZIndex = this._maximumZIndex();
		this.$blanket()
			.css("z-index", maximumZIndex + 1)
			.show();
		this
			.css("z-index", maximumZIndex + 2)
			.show()
			.positionOverlay()
			.trigger("overlayOpened");
	},

	_createBlanket: function() {
	    
		var $blanket = this
			.after("<div id='blanket'/>")
			.next();
			
        var dismissOnOutsideClick = this.dismissOnOutsideClick();
	    var color = this.blanketColor() ||
	                    (dismissOnOutsideClick ? false : "black");
	    var opacity = this.blanketOpacity() ||
                        (dismissOnOutsideClick ? 0.01 : 0.25);
			
		var self = this;
		$blanket
			.click(function() {
				if (self.dismissOnOutsideClick())
				{
					self.hideOverlay();
				}
			})
			.css({
				cursor: "default",
				position: "fixed",
				opacity: opacity,
				top: 0,
				left: 0,
				width: "100%",
				height: "100%"
			});
        if (color)
        {
            $blanket.css("background-color", color);
        }
        
		return $blanket;
	},
		
	/* Return the maximum Z-index in use by the page and its top-level controls. */
	_maximumZIndex: function()
	{
		var topLevelElements = $("body").children().andSelf();
		var zIndices = $.map(topLevelElements, function(element) {
			switch ($(element).css("position")) {
				case "absolute":
				case "fixed":
					var zIndex = parseInt($(element).css("z-index")) || 1;
					return zIndex;
			}
		});
		return Math.max.apply(null, zIndices);
	}
});

//
// Page
//
Page = Control.subclass("Page");
/*
 * General page utility functions.
 */
Page.prototype.define({
	
	// If true, have the page fill its container.
	fill: Control.element().applyClass("fill"),

    urlParameters: function() {
        return Page.urlParameters();
    },
    	
	// Gets or sets the title of the page.
	title: function(value) {
		if (value !== undefined)
		{
			document.title = value;
		}
		return document.title;
	}

});

/*
 * Class members.
 */
Page.extend({
    
    /*
     * Load the given class as the page's top-level class.
     * 
     * If element is supplied, that element is used to instantiate the control;
     * otherwise the entire body is given over to the control. 
     */
    loadClass: function(pageClass, element, properties) {
    
        var pageClassFn;
        if ($.isFunction(pageClass))
        {
            pageClassFn = pageClass;
        }
        else
        {
            // Convert a string to a function.
            // Only do the conversion if the string is a single, legal
            // JavaScript function name.
            var regexFunctionName = /^[$A-Za-z_][$0-9A-Za-z_]*$/;
            if (!regexFunctionName.test(pageClass))
            {
            	return null;
            }
            pageClassFn = eval(pageClass);
        }
        
        var $element = element ? $(element) : $("body");
        
        var $page = $element
            .empty()                // Remove elements
            .attr("class", "")      // Remove classes
            .control(pageClassFn, properties);
        
        return $page;
    },

    /*
     * Start actively tracking changes in a page specified on the URL.
     * For a URL like www.example.com/index.html#page=Foo, load class Foo.
     * If the page then navigates to www.example.com/index.html#page=Bar, this
     * will load class Bar in situ, without forcing the browser to reload the page. 
     */
    trackClassFromUrl: function(defaultPageClass, element) {
        
        // Watch for changes in the URL after the hash.
        $(window).hashchange(function() {
            var pageClassName = Page.urlParameters().page;
            var pageClass = pageClassName || defaultPageClass;
            Page.loadClass(pageClass, element);
        })
            
        // Trigger a page class load now.
        $(window).hashchange();
    },
    
    /*
     * Return the URL parameters (after "&" and/or "#") as a JavaScript object.
     * E.g., if the URL looks like http://www.example.com/index.html?foo=hello&bar=world
     * then this returns the object
     *
     *    { foo: "hello", bar: "world" }
     *
     */
    urlParameters: function() {
        var regex = /[?#&](\w+)=([^?#&]*)/g;
        var results = {};
        var match = regex.exec( window.location.href );
        while (match != null)
        {
            var parameterName = match[1];
            var parameterValue = match[2];
            results[parameterName] = parameterValue;
            match = regex.exec( window.location.href );
        }
        return results;
    }    
    
});

/*
 * General utility functions made available to all controls.
 */
Control.prototype.define({
	
	/*
	 * Look up the page hosting a control.
	 */
	page: Control.iterator(function() {
        // Get the containing DOM element subclassing Page that contains the element
        var pages = this.closest(".Page");
        
        // From the DOM element, get the associated QuickUI control.
        return (pages.length > 0) ? pages.control() : null;
	})
    
});

//
// Popup
//
Popup = Overlay.subclass("Popup", function() {
	this.properties({
		"dismissOnInsideClick": "true"
	}, Overlay);
});

//
// PopupButton
//
PopupButton = Control.subclass("PopupButton", function() {
	this.properties({
		"content": [
			" ",
			this.$PopupButton_content = Control("<div id=\"PopupButton_content\" />"),
			" ",
			this.$PopupButton_popup = Popup.create({
				"id": "PopupButton_popup"
			}),
			" "
		]
	}, Control);
});
PopupButton.prototype.define({
	
	content: Control.element("PopupButton_content").content(),
	popup: Control.element("PopupButton_popup").content(),

	initialize: function()
	{
		var self = this;
		this.$PopupButton_content.click(function() {
			self.showPopup();
		});
		this.$PopupButton_popup.positionOverlay = function() {
			return self.positionPopup();
		};
	},
	
    positionPopup: function()
    {
        var $contentElement = this.$PopupButton_content;
        var contentTop = $contentElement.position().top;
        var contentHeight = $contentElement.outerHeight(true);
        var $popupElement = this.$PopupButton_popup;
        var popupHeight = $popupElement.outerHeight(true);

        // Try showing popup below.
        var top = contentTop + contentHeight;
        if (top + popupHeight > $(document).height() &&
            contentTop - popupHeight >= 0)         
        {
            // Show popup above.
            top = contentTop - popupHeight;
        }
        $popupElement.css("top", top);
        
        var contentLeft = $contentElement.position().left;
        var popupWidth = $popupElement.outerWidth(true);
        var left = $(document).width() - popupWidth;
        if (contentLeft + popupWidth > $(document).width() &&
            left > 0)
        {
            // Move popup left
            $popupElement.css("left", left);
        }
        
        return this;
    },
    	
	showPopup: function()
	{
		this.$PopupButton_popup.showOverlay();
	}
	
});

//
// Sprite
//
Sprite = Control.subclass("Sprite");
Sprite.prototype.define({
	
	image: Control.element().css("background-image"),

	// The height of a single cell in the strip, in pixels.
	cellHeight: Control.property(function(value) {
		this.css("height", value + "px");
		this.shiftBackground();
	}),
	
	// The cell currently being shown.
	currentCell: Control.property(function(value) {
		this.shiftBackground();
	}, 0),
	
	shiftBackground: function() {
		if (this.currentCell() != null && this.cellHeight() != null) {
			var y = (this.currentCell() * -this.cellHeight()) + "px";
			if ($.browser.mozilla)
			{
				// Firefox 3.5.x doesn't support background-position-y,
				// use background-position instead.
				var backgroundPosition = this.css("background-position").split(" ");
				backgroundPosition[1] = y;
				this.css("background-position", backgroundPosition.join(" "));			
			}
			else
			{
				// Not Firefox
				this.css("background-position-y", y);
			}
		}
	}
});

//
// Switch
//
Switch = Control.subclass("Switch");
Switch.prototype.define({
	
	initialize: function() {
	    if (this.children().not(".hidden").length > 1)
	    {
            // Show first child by default. 
            this.index(0);
	    }
	},
    
    // The currently visible child.
    activeChild: function(activeChild) {
        if (activeChild === undefined)
        {
            return this.children().not(".hidden")[0];
        }
        else
        {
            /*
             * Apply a "hidden" style instead of just forcing display to none.
             * If we did that, we would have no good way to undo the hiding.
             * A simple .toggle(true) would set display: block, which wouldn't
             * be what we'd want for inline elements.
             */
            this.children().not(activeChild).toggleClass("hidden", true);
            $(activeChild).toggleClass("hidden", false);
        }
    },
    
    // The index of the currently visible child.
    index: function(index) {
        if (index === undefined)
        {
            return this.children().index(this.activeChild());
        }
        else
        {
            this.activeChild(this.children()[index]);
        }
    }
        
});

//
// ToggleButton
//
ToggleButton = ButtonBase.subclass("ToggleButton", function() {
	this.properties({

	}, ButtonBase);
});
ToggleButton.prototype.define({
	
	selected: Control.element().applyClass("selected"),
	
	initialize: function() {
		ToggleButton.superclass.prototype.initialize.call(this);
		var me = this;
		this.click(function() {
            if (!me.disabled())
            {
                me.toggle();
            }
		});
	},
	
	toggle: function(value) {
		this.selected(value || !this.selected());
	}
});

//
// VerticalAlign
//
VerticalAlign = Control.subclass("VerticalAlign");

//
// VerticalPanels
//
VerticalPanels = Control.subclass("VerticalPanels", function() {
	this.properties({
		"content": [
			" ",
			this.$rowTop = Control("<div id=\"rowTop\" class=\"minimumHeight\" />").content(
				" ",
				this.$VerticalPanels_top = Control("<div id=\"VerticalPanels_top\" />"),
				" "
			),
			" ",
			this.$VerticalPanels_content = Control("<div id=\"VerticalPanels_content\" />"),
			" ",
			this.$rowBottom = Control("<div id=\"rowBottom\" class=\"minimumHeight\" />").content(
				" ",
				this.$VerticalPanels_bottom = Control("<div id=\"VerticalPanels_bottom\" />"),
				" "
			),
			" "
		]
	}, Control);
});
VerticalPanels.prototype.define({
    bottom: Control.element("VerticalPanels_bottom").content(),
    content: Control.element("VerticalPanels_content").content(),
    fill: Control.element().applyClass("fill"),
    top: Control.element("VerticalPanels_top").content()
});

//
// Dialog
//
Dialog = Overlay.subclass("Dialog", function() {
	this.properties({
		"dismissOnOutsideClick": "false"
	}, Overlay);
});
// Class method
Dialog.extend({
	showDialog: function(dialogClass, properties, callbackOk, callbackCancel) {
		$("body")
			.append("<div/>")
			.find(":last")
	        .bind({
	            ok: function() {
	                if (callbackOk)
	                {
	                    callbackOk.call(this);
	                }
	            },
	            cancel: function() {
	                if (callbackCancel)
	                {
	                    callbackCancel.call(this);
	                }
	            }
	        })
			.control(dialogClass, properties)
			.showOverlay();
	}
});

Dialog.prototype.define({
	
	initialize: function() {
		Dialog.superClass.prototype.initialize.call(this);
		var self = this;
		this.keydown(function(event) {
			if (event.keyCode == 27)
			{
				self.cancel();
			}
		});
	},

	cancel: function() {
		this
			.trigger("cancel")
			.closeOverlay();
	},
	
	close: function() {
		this
			.trigger("ok")
			.closeOverlay();
	},
	
	positionOverlay: function() {
		// Center dialog horizontally and vertically.
		var left = ($(window).width() - $(this.element).outerWidth()) / 2;
		var top = ($(window).height() - $(this.element).outerHeight()) / 2;
		this.css({
			left: left,
			top: top
		});
	}
});

