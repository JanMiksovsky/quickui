//
// ButtonBase
//
ButtonBase = Control.extend({
	className: "ButtonBase"
});
$.extend(ButtonBase.prototype, {
	
	isFocused: Control.Property.bool(null, false),
	isKeyPressed: Control.Property.bool(null, false),
	isMouseButtonDown: Control.Property.bool(null, false),
	isMouseOverControl: Control.Property.bool(null, false),
	
	ready: function() {
		var self = this;
		$(this.element)
			.blur(function(event) { self.blur(event); })
			.click(function(event) {
				if (self.disabled())
				{
					event.stopImmediatePropagation();
				}
			})
			.focus(function(event) { self.focus(event); })
			.hover(
				function(event) { self.mousein(event); },
				function(event) { self.mouseout(event); }
			)
			.keydown (function(event) { self.keydown(event); })
			.keyup (function(event) { self.keyup(event); })
			.mousedown(function(event) { self.mousedown(event); })
			.mouseup(function(event) { self.mouseup(event); });
		this.renderButton();
	},
	
	blur: function(event) {
		
		$(this.element).removeClass("focused");

		// Losing focus causes the button to override any key that had been pressed.
		this.isKeyPressed(false);

		this.isFocused(false);
		this.renderButton();
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

    disabled: Control.Element().applyClass("disabled", function(disabled) {
		this.renderButton();
	}),
	
	focus: function(event) {
        if (!this.disabled()) 
        {
            $(this.element).addClass("focused");
            this.isFocused(true);
            this.renderButton();
        }
	},
	
	keydown: function(event) {
		if (!this.disabled() && (event.keyCode == 32 /* space */ || event.keyCode == 13 /* return */))
		{
			this.isKeyPressed(true);		
			this.renderButton();
		}
	},
	
	keyup: function(event) {
		this.isKeyPressed(false);
		this.renderButton();
	},
	
	mousedown: function(event) {
        if (!this.disabled())
        {
            $(this.element).addClass("pressed");
            this.isMouseButtonDown(true);
            this.renderButton();
        }
	},
	
	mousein: function(event) {
        if (!this.disabled()) 
        {
            $(this.element).addClass("hovered");
            this.isMouseOverControl(true);
            this.renderButton();
        }
	},
	
	mouseout: function(event) {
		$(this.element).removeClass("focused")
			.removeClass("hovered")
			.removeClass("pressed");
		this.isMouseOverControl(false);
		this.renderButton();
	},
	
	mouseup: function(event) {
		$(this.element).removeClass("pressed");
		this.isMouseButtonDown(false);
		this.renderButton();
	},
	
	renderButtonState: function(buttonState) {},
	
	renderButton: function() {
		this.renderButtonState(this.buttonState());
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
HorizontalPanels = Control.extend({
	className: "HorizontalPanels",
	render: function() {
		Control.prototype.render.call(this);
		this.setClassProperties(Control, {
			"content": [
				" ",
				this.HorizontalPanels_left = $("<div id=\"HorizontalPanels_left\" class=\"minimumWidth\" />")[0],
				" ",
				this.HorizontalPanels_content = $("<div id=\"HorizontalPanels_content\" />")[0],
				" ",
				this.HorizontalPanels_right = $("<div id=\"HorizontalPanels_right\" class=\"minimumWidth\" />")[0],
				" "
			]
		});
	}
});
$.extend(HorizontalPanels.prototype, {
    content: Control.Element("HorizontalPanels_content").content(),
    fill: Control.Element().applyClass("fill"),
    left: Control.Element("HorizontalPanels_left").content(),
    right: Control.Element("HorizontalPanels_right").content(),
});

//
// IfBrowser
//
IfBrowser = Control.extend({
	className: "IfBrowser",
	render: function() {
		Control.prototype.render.call(this);
		this.setClassProperties(Control, {
			"content": [
				" ",
				this.IfBrowser_content = $("<span id=\"IfBrowser_content\" />")[0],
				" ",
				this.IfBrowser_elseContent = $("<span id=\"IfBrowser_elseContent\" />")[0],
				" "
			]
		});
	}
});
$.extend(IfBrowser.prototype, {
	browser: Control.Property(),
	content: Control.Element("IfBrowser_content").content(),
	elseContent: Control.Element("IfBrowser_elseContent").content(),
	support: Control.Property(),
	
	ready: function() {
		var usingSpecifiedBrowser = (this.browser() == undefined) || $.browser[this.browser()];
		var browserSupportsProperty = (this.support() == undefined) || $.support[this.support()];
		var allConditionsSatisfied = usingSpecifiedBrowser && browserSupportsProperty;
		$(this.IfBrowser_content).toggle(allConditionsSatisfied);
		$(this.IfBrowser_elseContent).toggle(!allConditionsSatisfied);
	}
});

//
// List
//
List = Control.extend({
	className: "List"
});
$.extend(List.prototype, {
    
    itemClass: Control.Property(
        function() { this._refresh(); },
        null,
        function(className) {
            return eval(className);
        }
    ),
        
    items: Control.Property(function() { this._refresh(); }),
    
    //
    // This mapFn should be a function that accepts one object
    // (typically a data object) and returns a new object whose
    // properties map directly to property settors defined by the
    // target itemClass.
    //
    mapFn: Control.Property(),
    
    // Allows items and mapFn to both be set in one step.
    setItems: function(items, mapFn) {
        this.mapFn(mapFn);
        this.items(items);
    },
    
    _refresh: function() {
        var itemClass = this.itemClass();
        var items = this.items();
        var mapFn = this.mapFn();
        if (itemClass && items)
        {
            var me = this;
            var controls = $.map(items, function(item, index) {
                var properties;
                if (mapFn)
                {
                    // Map item to control properties with custom map function.
                    properties = mapFn.call(me, item, index);
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
                var control = Control.create(itemClass, properties);
                return control;
            });
            $(this.element).items(controls);
        }
    }
    
});

//
// Overlay
//
Overlay = Control.extend({
	className: "Overlay"
});
$.extend(Overlay.prototype, {

	blanket: Control.Property(),
	dismissOnInsideClick: Control.Property.bool(),
	dismissOnOutsideClick: Control.Property.bool(null, true),
	
	ready: function()
	{
		var self = this;
		$(this.element).click(function() {
			if (self.dismissOnInsideClick())
			{
				self.hide();
			}
		});
	},
	
	createBlanket: function() {
		var newBlanket = $(this.element)
			.after("<div id='blanket'/>")
			.next()[0];
		var self = this;
		$(newBlanket)
			.click(function() {
				if (self.dismissOnOutsideClick())
				{
					self.hide();
				}
			})
			.css({
				cursor: "default",
				position: "fixed",
				opacity: 0.01,
				top: 0,
				left: 0,
				width: "100%",
				height: "100%"
			});
		return newBlanket;
	},
	
	hide: function()
	{
        /*
		$(this.element).remove();
        */
        $(this.element)
			.hide()
			.css("z-index", null); // No need to define Z-order any longer.
		if (this.blanket() != null)
		{
			// $(this.blanket()).remove();
			// this.blanket(null);
			$(this.blanket()).hide();
		}
	},
	
	/* Return the maximum Z-index in use by the page and its top-level controls. */
	maximumZIndex: function()
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
	},
	
	// Subclasses should override this to position themselves.
	position: function() {},
	
	show: function()
	{
		if (this.blanket() == null)
		{
			this.blanket(this.createBlanket());
		}
		
		if (!this.dismissOnOutsideClick())
		{
			$(this.blanket()).css({
				"background-color": "black",
				opacity: 0.25
			});
		}
		
		/* Show control and blanket at the top of the Z-order. */
		var maximumZIndex = this.maximumZIndex();
		$(this.blanket())
			.css("z-index", maximumZIndex + 1)
			.show();
		$(this.element)
			.css("z-index", maximumZIndex + 2)
			.show();
		this.position();
	}
});

//
// Page
//
Page = Control.extend({
	className: "Page"
});
/*
 * General page utility functions.
 */
$.extend(Page.prototype, {
	
	// If true, have the page fill its container.
	fill: Control.Element().applyClass("fill"),

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
 * Static members.
 */
$.extend(Page, {
    
    /*
     * Load the given class as the page's top-level class.
     * 
     * If element is supplied, that element is used to instantiate the control;
     * otherwise the entire body is given over to the control. 
     */
    loadClass: function(pageClass, element) {
    
        var pageClassFn;
        if ($.isFunction(pageClass))
        {
            pageClassFn = pageClass;
        }
        else
        {
            // Convert a string to a function.
            // Only accept strings completely composed of word characters,
            // in any effort to mitigate eval evil.
            var pageClassName = /^\w+$/.exec(pageClass);
            pageClassFn = eval(pageClass);
        }
        
        var $element = element ? $(element) : $("body");
        
        $element
            .empty()                // Remove elements
            .attr("class", "")      // Remove classes
            .control(pageClassFn);
    },

    /*
     * Start actively tracking changes in a page specified on the URL.
     * For a URL like www.example.com/index.html#page=Foo, load class Foo.
     * If the page then navigates to www.example.com/index.html#page=Bar, this
     * will load class Bar in situ, without forcing the browser to reload the page. 
     */
    trackClassFromUrl: function(defaultPageClass) {
        
        // Watch for changes in the URL after the hash.
        $(window).hashchange(function() {
            var pageClassName = Page.urlParameters().page;
            var pageClass = pageClassName || defaultPageClass;
            Page.loadClass(pageClass);
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
$.extend(Control.prototype, {
	
	/*
	 * Look up the page hosting a control.
	 */
	page: function() {
		// Get the containing DOM element subclassing Page that contains the element
		var pages = $(this.element).closest(".Page");
		
		// From the DOM element, get the associated QuickUI control.
		return (pages.length > 0) ? pages.control() : null;
	}
    
});

//
// Popup
//
Popup = Overlay.extend({
	className: "Popup",
	render: function() {
		Overlay.prototype.render.call(this);
		this.setClassProperties(Overlay, {
			"dismissOnInsideClick": "true"
		});
	}
});

//
// PopupButton
//
PopupButton = Control.extend({
	className: "PopupButton",
	render: function() {
		Control.prototype.render.call(this);
		this.setClassProperties(Control, {
			"content": [
				" ",
				this.PopupButton_content = $("<div id=\"PopupButton_content\" />")[0],
				" ",
				this.PopupButton_popup = Control.create(Popup, {
					"id": "PopupButton_popup"
				}),
				" "
			]
		});
	}
});
$.extend(PopupButton.prototype, {
	
	content: Control.Element("PopupButton_content").content(),
	popup: Control.Element("PopupButton_popup").content(),

	ready: function()
	{
		var self = this;
		$(this.PopupButton_content).click(function() {
			self.showPopup();
		});
		var popupControl = Control(this.PopupButton_popup); 
		if (popupControl)
		{
			popupControl.position = function() {
				self.positionPopup();
			};
		}
	},
	
	showPopup: function()
	{
		$(this.PopupButton_popup).control().show();
	},
	
	positionPopup: function()
	{
		var $contentElement = $(this.PopupButton_content);
		var contentTop = $contentElement.offset().top;
		var contentHeight = $contentElement.outerHeight(true);
		var $popupElement = $(this.PopupButton_popup);
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
        
        var contentLeft = $contentElement.offset().left;
        var popupWidth = $popupElement.outerWidth(true);
        var left = $(document).width() - popupWidth;
        if (contentLeft + popupWidth > $(document).width() &&
            left > 0)
        {
            // Move popup left
            $popupElement.css("left", left);
        }
	}
	
});

//
// Repeater
//
Repeater = Control.extend({
	className: "Repeater",
	render: function() {
		Control.prototype.render.call(this);
		this.setClassProperties(Control, {
			"content": [
				" ",
				this.Repeater_expansion = $("<div id=\"Repeater_expansion\" />")[0],
				" "
			]
		});
	}
});
$.extend(Repeater.prototype, {

	ready: function() {
		this.expand();
	},
	
	content: Control.Property(function() {
		this.expand();
	}),
	
	count: Control.Property.integer(function(value) {
		this.expand();
	}, 0),
	
	expand: function() {
		var template = $(this.content());
		if (template != null)
		{
			$(this.Repeater_expansion).empty();
			var count = this.count();
			for (var i = 0; i < count; i++)
			{
				template.clone(true).appendTo(this.Repeater_expansion); // Deep copy
			}
		}
	},
	
	expansion: function() {
		return $(this.Repeater_expansion).html();
	}
	
});

//
// Sprite
//
Sprite = Control.extend({
	className: "Sprite"
});
$.extend(Sprite.prototype, {
	
	image: Control.Element().css("background-image"),

	// The height of a single cell in the strip, in pixels.
	cellHeight: Control.Property(function(value) {
		$(this.element).css("height", value + "px");
		this.shiftBackground();
	}),
	
	// The cell currently being shown.
	currentCell: Control.Property(function(value) {
		this.shiftBackground();
	}, 0),
	
	shiftBackground: function() {
		if (this.currentCell() != null && this.cellHeight() != null) {
			var y = (this.currentCell() * -this.cellHeight()) + "px";
			if ($.browser.mozilla)
			{
				// Firefox 3.5.x doesn't support background-position-y,
				// use background-position instead.
				var backgroundPosition = $(this.element).css("background-position").split(" ");
				backgroundPosition[1] = y;
				$(this.element).css("background-position", backgroundPosition.join(" "));			
			}
			else
			{
				// Not Firefox
				$(this.element).css("background-position-y", y);
			}
		}
	}
});

//
// ToggleButtonBase
//
ToggleButtonBase = ButtonBase.extend({
	className: "ToggleButtonBase",
	render: function() {
		ButtonBase.prototype.render.call(this);
		this.setClassProperties(ButtonBase, {

		});
	}
});
$.extend(ToggleButtonBase.prototype, {
	
	selected: Control.Element().applyClass("selected"),
	
	ready: function() {
		ToggleButtonBase.superProto.ready.call(this);
		var me = this;
		$(this.element).click(function() {
            if (!me.disabled())
            {
                me.toggle();
            }
		});
	},
	
	toggle: function() {
		this.selected(!this.selected());
	}
});

//
// VerticalAlign
//
VerticalAlign = Control.extend({
	className: "VerticalAlign"
});

//
// VerticalPanels
//
VerticalPanels = Control.extend({
	className: "VerticalPanels",
	render: function() {
		Control.prototype.render.call(this);
		this.setClassProperties(Control, {
			"content": [
				" ",
				this.rowTop = $("<div id=\"rowTop\" class=\"minimumHeight\" />").items(
					" ",
					this.VerticalPanels_top = $("<div id=\"VerticalPanels_top\" />")[0],
					" "
				)[0],
				" ",
				this.VerticalPanels_content = $("<div id=\"VerticalPanels_content\" />")[0],
				" ",
				this.rowBottom = $("<div id=\"rowBottom\" class=\"minimumHeight\" />").items(
					" ",
					this.VerticalPanels_bottom = $("<div id=\"VerticalPanels_bottom\" />")[0],
					" "
				)[0],
				" "
			]
		});
	}
});
$.extend(VerticalPanels.prototype, {
    bottom: Control.Element("VerticalPanels_bottom").content(),
    content: Control.Element("VerticalPanels_content").content(),
    fill: Control.Element().applyClass("fill"),
    top: Control.Element("VerticalPanels_top").content()
});

//
// Dialog
//
Dialog = Overlay.extend({
	className: "Dialog",
	render: function() {
		Overlay.prototype.render.call(this);
		this.setClassProperties(Overlay, {
			"dismissOnOutsideClick": "false"
		});
	}
});
$.extend(Dialog, {
	show: function(dialogClass, properties, callbackOk, callbackCancel) {
		var dialog = $("body")
			.append("<div/>")
			.find(":last")
			.control(dialogClass)
			.control();
        $(dialog.element).bind({
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
        });
		dialog.setProperties(properties);
		dialog.show();
	}
});

$.extend(Dialog.prototype, {
	
	ready: function() {
		Dialog.superProto.ready.call(this);
		var self = this;
		$(this.element).keydown(function(event) {
			if (event.keyCode == 27)
			{
				self.cancel();
			}
		});
	},

	cancel: function() {
		this.hide();
		$(this.element).trigger("cancel");
	},
	
	close: function() {
		this.hide();
		$(this.element).trigger("ok");
	},
	
	position: function() {
		// Center dialog horizontally and vertically.
		var left = ($(window).width() - $(this.element).outerWidth()) / 2;
		var top = ($(window).height() - $(this.element).outerHeight()) / 2;
		$(this.element).css({
			left: left,
			top: top
		});
	}
});

