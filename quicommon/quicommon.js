//
// ButtonBase
//
ButtonBase = QuickUI.Control.extend({
	className: "ButtonBase"
});
$.extend(ButtonBase.prototype, {
	
	isFocused: QuickUI.Property.bool(null, false),
	isKeyPressed: QuickUI.Property.bool(null, false),
	isMouseButtonDown: QuickUI.Property.bool(null, false),
	isMouseOverControl: QuickUI.Property.bool(null, false),
	
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

	disabled: QuickUI.Property.bool(function(value) {
		$(this.element).toggleClass("disabled", value);
		this.renderButton();
	}, false),
	
	focus: function(event) {
		$(this.element).addClass("focused");
		this.isFocused(true);
		this.renderButton();
	},
	
	keydown: function(event) {
		if (event.keyCode == 32 /* space */ || event.keyCode == 13 /* return */)
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
		$(this.element).addClass("pressed");
		this.isMouseButtonDown(true);
		this.renderButton();
	},
	
	mousein: function(event) {
		$(this.element).addClass("hovered");
		this.isMouseOverControl(true);
		this.renderButton();
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
// DockPanel
//
DockPanel = QuickUI.Control.extend({
	className: "DockPanel",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.DockPanel_top = $("<div id=\"DockPanel_top\" />")[0],
				" ",
				this.rowCenter = $("<div id=\"rowCenter\" />").items(
					" ",
					this.centerTable = $("<div id=\"centerTable\" />").items(
						" ",
						this.DockPanel_left = $("<div id=\"DockPanel_left\" class=\"panel\" />")[0],
						" ",
						this.DockPanel_content = $("<div id=\"DockPanel_content\" />")[0],
						" ",
						this.DockPanel_right = $("<div id=\"DockPanel_right\" class=\"panel\" />")[0],
						" "
					)[0],
					" "
				)[0],
				" ",
				this.DockPanel_bottom = $("<div id=\"DockPanel_bottom\" />")[0],
				" "
			]
		});
	}
});
$.extend(DockPanel.prototype, {
	
	content: QuickUI.Element("DockPanel_content").content(),	
	left: QuickUI.Element("DockPanel_left").content(),
	right: QuickUI.Element("DockPanel_right").content(),
	
	ready: function() {
		/*
		var self = this;
		$(this.element).click(function() {
			self.recalc();
		})
		*/
		// this.recalc();
	},
	
	bottom: QuickUI.Element("DockPanel_bottom").content(function(value) {
		this.recalc(this.DockPanel_bottom);
	}),
	
	top: QuickUI.Element("DockPanel_top").content(function(value) {
		this.recalc(this.DockPanel_top);
	}),
	
	recalc: function(element) {
		
		if (element === undefined)
		{
			this.recalc(this.DockPanel_top);
			this.recalc(this.DockPanel_bottom);
			return;
		}
		
		var height = 0;
		$(element).children().each(function() {
			height += $(this).outerHeight();
		});
		$(element).css("height", height + "px");
		
	}
	
});

//
// IfBrowser
//
IfBrowser = QuickUI.Control.extend({
	className: "IfBrowser",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
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
	browser: QuickUI.Property(),
	content: QuickUI.Element("IfBrowser_content").content(),
	elseContent: QuickUI.Element("IfBrowser_elseContent").content(),
	support: QuickUI.Property(),
	
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
List = QuickUI.Control.extend({
	className: "List"
});
$.extend(List.prototype, {
    
    itemClass: QuickUI.Property(
        function() { this._refresh(); },
        null,
        function(className) {
            return eval(className);
        }
    ),
        
    items: QuickUI.Property(function() { this._refresh(); }),
    
    mapFn: QuickUI.Property(),
    
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
                var control = QuickUI.Control.create(itemClass, properties);
                return control;
            });
            $(this.element).items(controls);
        }
    }
    
});

//
// Overlay
//
Overlay = QuickUI.Control.extend({
	className: "Overlay"
});
$.extend(Overlay.prototype, {

	blanket: QuickUI.Property(),
	dismissOnInsideClick: QuickUI.Property.bool(),
	dismissOnOutsideClick: QuickUI.Property.bool(null, true),
	
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
Page = QuickUI.Control.extend({
	className: "Page"
});
/*
 * General page utility functions.
 */
$.extend(Page.prototype, {
	
	// If true, have the page fill its container.
	fill: QuickUI.Element().applyClass("fill"),

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
    
    //
    // Return the URL parameters as a JavaScript object.
    // E.g., if the URL looks like http://www.example.com/index.html?foo=hello&bar=world
    // then this returns the object
    //
    //    { foo: "hello", bar: "world" }
    //
    urlParameters: function() {
        var regex = /[?&](\w+)=([^&#]*)/g;
        var results = {};
        var match = regex.exec( window.location.search );
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
$.extend(QuickUI.Control.prototype, {
	
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
// Repeater
//
Repeater = QuickUI.Control.extend({
	className: "Repeater",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
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
	
	content: QuickUI.Property(function() {
		this.expand();
	}),
	
	count: QuickUI.Property.integer(function(value) {
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
Sprite = QuickUI.Control.extend({
	className: "Sprite"
});
$.extend(Sprite.prototype, {
	
	image: QuickUI.Element().css("background-image"),

	// The height of a single cell in the strip, in pixels.
	cellHeight: QuickUI.Property(function(value) {
		$(this.element).css("height", value + "px");
		this.shiftBackground();
	}),
	
	// The cell currently being shown.
	currentCell: QuickUI.Property(function(value) {
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
// VerticalAlign
//
VerticalAlign = QuickUI.Control.extend({
	className: "VerticalAlign"
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

