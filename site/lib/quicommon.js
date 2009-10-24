//
// Overlay
//
Overlay = QuickControl.extend({
	className: "Overlay",
});
$.extend(Overlay.prototype, {

	blanket: Property(),
	dismissOnInsideClick: Property.bool(),
	dismissOnOutsideClick: Property.bool(null, true),
	
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
		// $(this.element).remove();
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
// Popup
//
Popup = Overlay.extend({
	className: "Popup",
	render: function() {
		Overlay.prototype.render.call(this);
		this.setClassProperties(Overlay, {
			dismissOnInsideClick: "true",
		});
	}
});

//
// ButtonBase
//
ButtonBase = QuickControl.extend({
	className: "ButtonBase",
});
$.extend(ButtonBase.prototype, {
	
	ready: function()
	{
		var self = this;
		$(this.element).blur(function() {
				$(self.element).removeClass("focused");
			})
			.focus(function() { $(self.element).addClass("focused"); })
			.hover(
				function() {
					$(self.element).addClass("hovered");
				},
				function() {
					$(self.element).removeClass("focused")
						.removeClass("hovered")
						.removeClass("pressed");
			})
			.mousedown(function() {
				$(self.element).addClass("pressed");
			})
			.mouseup(function() {
				$(self.element).removeClass("pressed");
			});
	},

	disabled: Property.bool(function(value) {
		$(this.element).toggleClass("disabled", value);
	})

});

//
// Dialog
//
Dialog = Overlay.extend({
	className: "Dialog",
	render: function() {
		Overlay.prototype.render.call(this);
		this.setClassProperties(Overlay, {
			dismissOnOutsideClick: "false",
		});
	}
});
$.extend(Dialog, {
	show: function(dialogClass, arguments) {
		var dialog = $("body")
			.append("<div/>")
			.find(":last")
			.control(dialogClass)
			.control();
		dialog.setProperties(arguments);
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
		var left = ($(document).width() - $(this.element).outerWidth()) / 2;
		var top = ($(document).height() - $(this.element).outerHeight()) / 2;
		$(this.element).css({
			left: left,
			top: top
		});
	}
});

//
// DockPanel
//
DockPanel = QuickControl.extend({
	className: "DockPanel",
	render: function() {
		QuickControl.prototype.render.call(this);
		this.setClassProperties(QuickControl, {
			content: [
				this.DockPanel_top = $("<div id=\"DockPanel_top\" />")[0],
				this.rowCenter = $("<div id=\"rowCenter\" />").setContents(
					this.centerTable = $("<div id=\"centerTable\" />").setContents(
						this.DockPanel_left = $("<div id=\"DockPanel_left\" class=\"panel\" />")[0],
						this.DockPanel_content = $("<div id=\"DockPanel_content\" />")[0],
						this.DockPanel_right = $("<div id=\"DockPanel_right\" class=\"panel\" />")[0]
					)[0]
				)[0],
				this.DockPanel_bottom = $("<div id=\"DockPanel_bottom\" />")[0]
			],
		});
	}
});
$.extend(DockPanel.prototype, {
	
	content: Property.element("DockPanel_content"),	
	left: Property.element("DockPanel_left"),
	right: Property.element("DockPanel_right"),
	
	ready: function() {
		/*
		var self = this;
		$(this.element).click(function() {
			self.recalc();
		})
		*/
		// this.recalc();
	},
	
	bottom: Property.element("DockPanel_bottom", function(value) {
		this.recalc(this.DockPanel_bottom);
	}),
	
	top: Property.element("DockPanel_top", function(value) {
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
// Page
//
Page = QuickControl.extend({
	className: "Page",
});
/*
 * General page utility functions.
 */
$.extend(Page.prototype, {
	
	// If true, have the page fill its container.
	fill: Property.bool(function(value) {
		$(this.element).toggleClass("fill");
	}),
	
	// Return the parameter with the given name from the current URL, or null if not found.
	getUrlParameter: function(parameterName) {
		return Page.getUrlParameter(parameterName);
	},	
	
	// Gets or sets the title of the page.
	title: function(value) {
		if (value !== undefined)
		{
			document.title = value;
		}
		return document.title;
	},

});

$.extend(Page, {
	
	// Return the parameter with the given name from the current URL, or null if not found.
	getUrlParameter: function(parameterName) {
		parameterName = parameterName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+parameterName+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( window.location.href );
		return (results == null) ? null : results[1];
	},
	
});

/*
 * General utility functions made available to all controls.
 */
$.extend(QuickControl.prototype, {
	
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
// VerticalAlign
//
VerticalAlign = QuickControl.extend({
	className: "VerticalAlign",
});

