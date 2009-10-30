/*
 * QuickUI
 * Version 0.6
 * Modular web control framework
 * http://quickui.org/
 *
 * Copyright (c) 2009 Jan Miksovsky
 * Licened under the MIT license.
 *
 */

/*
 * A subclassable class.
 * Modeled after John Resig's "Simple Javascript Inheritance".
 */

Class = function() {}
	
/*
 * Create a subclass of the given base class.
 */
Class.extend = function(properties)
{
	var subclass = function() {}
	subclass.prototype = new this();
	subclass.prototype.constructor = subclass;
	
	$.extend(subclass.prototype, properties);
	
	// Give class reference to base class and its prototype.
	subclass.superClass = this.prototype.constructor;
	subclass.superProto = this.prototype;
	
	// Give new subclass this method so the new subclass
	// can itself be subclassed.
	subclass.extend = arguments.callee;
	
	return subclass;
}

/*
 * Base Quick Control class.
 * All compiled Quick controls ultimately derive from this class.
 */
QuickControl = Class.extend({
	
	/* Use jQuery to search within the control's DOM. */
	$: function(selector)
	{
		return $(this.element).find(selector);
	},
	
	className: "QuickControl",
	
	/*
	 * Return this class's hierarchy as a string.
	 * If this has of class Foo and superclasses Bar and QuickControl,
	 * this returns "Foo Bar QuickControl".
	 */
	classList: function() {
		var classes = QuickControl.classHierarchy(this);
		var classNames = $.map(classes, function(c) {
			return c.prototype.className;
		});
		return classNames.join(" ");
	},
	
	/*
	 * Set the content of a control.
	 */
	content: function(value) {
		return $(this.element).items(value);
	},
	
	id: function(s) {
		return $(this.element).attr("id", s);
	},

	/*
	 * Invoked when the control has finished rendering.
	 * Subclasses can override this to perform their own post-rendering work
	 * (e.g., wiring up events).
	 */	
	ready: function() {},

	/*
	 * Base Control class has no visualization of its own.
	 */	
	render: function() {},
	
	/*
	 * Set the indicated properties on the control.
	 * 
	 * This is similar to $.extend(), but invokes property setter functions
	 * instead of directly setting properties.
	 */
	setProperties: function(properties) {
		for (var propertyName in properties)
		{
			var value = properties[propertyName];
			if (this[propertyName] === undefined) {
				throw "No getter/setter functions is defined for property '" + propertyName +"'.";
			}
			this[propertyName](value);
		}
	},
	
	/*
	 * Set the indicated properties on the control by invoking property
	 * setters defined by the given class.
	 * 
	 * This is like setProperties(), but is used to set properties defined
	 * by a parent class.
	 */
	setClassProperties: function(setAsClass, properties) {
		for (var propertyName in properties)
		{
			var value = properties[propertyName];
			setAsClass.prototype[propertyName].call(this, value);
		}
	},
	
	/*
	 * Sets/gets the style of matching elements.
	 * This lets one specify a style attribute in Qui markup for a control instance;
	 * the style will apply to the control's root element.
	 */
	style: function(value)
	{
		return $(this.element).attr("style", value);
	}

});
// Static methods.
$.extend(QuickControl, {

	/*
	 * Return an array of x's classes, starting from x's class and working up.
	 */
	classHierarchy: function(x)
	{
		if (x == null)
		{
			return [];
		}
		
		var f = (typeof x == "function") ? x : x.constructor;
		return [ f ].concat(QuickControl.classHierarchy(f.superClass));
	},

	/*
	 * Create an instance of the given control class.
	 */
	create: function(controlClass, properties) {
		return QuickControl.createAt(null, controlClass, properties);
	},

	/*
	 * Create an instance of the control class on the given target element(s).
	 * Return the element.
	 */
	createAt: function(target, controlClass, properties) {

		// Grab the existing contents of the target.
		var oldContents = target && $.trim($(target).html());
		
		// Instantiate the control class.
		var control = new controlClass();
		
		// Create a target if none was supplied.
		var element = $(target || "<div/>");
		
		// Bind the control to the element.
		control.element = element[0];

		// Bind the element to the control.
		// Don't set a property on the element directly to avoid creating a circular
		// reference, which is hard to garbage collect.
		$.data(control.element, "control", control);

		// Apply all class names in the class hierarchy as style names.
		// This lets the element pick up styles defined by those classes.
		element.addClass(control.classList());
		
		// Let the control render itself into its DOM element.
		control.render();

		// Set any properties requested in the call to createAs.
		control.setProperties(properties);
		
		// Pass in the target's old contents (if any).
		if (oldContents != null && oldContents.length > 0)
		{
			control.content(oldContents);
		}
		
		// Tell the control it's ready.
		control.ready();

		return control.element;
	},

	/*
	 * Utility: If the supplied value is a string, evaluate it and return the result.
	 * Otherwise return the value as is.
	 */
	evalIfString: function(value)
	{
		if (typeof value == "string" || value instanceof String) 
		{
			eval("var obj = " + value);
			return obj;
		}
		else 
		{
			return value;
		}
	}
	
})

/*
 * Qui "control" jQuery extension.
 * 
 * Usage:
 * 
 * $(myElement).control()
 * 		Returns the control that was created on that element.
 *
 * $(myElement).control({ content: "Hello" });
 *      Sets the content property of the control at this element.
 * 
 * $(myElement).control(MyControlClass);
 * 		Creates a new instance of MyControl around the element(s).
 * 
 * $(myElement).control(MyControlClass, { content: "Hello" });
 * 		Creates a new control instance and sets its content property.
 * 
 */
jQuery.fn.control = function(arg1, arg2) {
	if (arg1 === undefined)
	{
		// Return the control bound to the first element.
		return jQuery.data(this[0], "control");
	}
	else if ($.isFunction(arg1))
	{
		// Create a new control around the element(s).
		var controlClass = arg1;
		var properties = arg2;
		return this.each(function() {
			QuickControl.createAt(this, controlClass, properties);
		});
	}
	else
	{
		// Set properties on the control.
		var properties = arg1;
		jQuery.data(this[0], "control").setProperties(properties);
		return this;
	}
}

/*
 * jQuery extension: Like $.contents(), but you can also set the content of an
 * element to the given item, array of items, or items listed as parameters.
 * Adding multiple items at a time is an important case in compiled QuickUI markup.
 * 
 * This function attempts to return contents in a canonical form, so that setting
 * contents with common parameter types is likely to return those values back in 
 * the same form. If there is only one content element, that is returned directly,
 * instead of returning an array of one element. If the element being returned is
 * a text node, it is returned as a string.
 */
jQuery.fn.items = function(value) {
	if (value === undefined)
	{
		// Getting contents.
		var contents = $(this).contents(value);
		var result = $.map(contents, function(item) {
			return (item.nodeType == 3)
				? item.textContent	// Return text node as simple string
				: item;
		});
		return (result != null && result.length == 1)
			? result[0]				// Return the single content element.
			: result;
	}
	else
	{
		// Setting contents.
		this.empty();
		if (arguments.length == 1 && !$.isArray(value))
		{
			// Single element.
			this.append(value);
		}
		else
		{
			// Array or parameter list.
			var array = (arguments.length > 1) ? arguments : value;
			
			// Add elements one at a time to avoid a limitation in $.append().
			// As of jQuery 1.3.2, jQuery.append() can drop the text nodes when given
			// an array containing a mixture of text and jQuery nodes.
			// See filed bug http://dev.jquery.com/ticket/5404. If/when that gets
			// fixed, this extension can get simplified.
			var element = this;
			$.each(array, function(i, item) {
				element.append(item);
			});
		}
		return this;
	}
}

/*
 * Helper functions for properties that commonly occur in defining QuickUI classes.
 * These are *factories* for setter/getter functions.
 */

/*
 * Factory for generic property getter/setter.
 */
function Property(setterFunction, defaultValue, converterFunction) {
	var backingPropertyName = "_property" + Property.symbolCounter++;
	return function(value) {
		var result;
		if (value === undefined)
		{
			// Getting property value.
			result = $.data(this, backingPropertyName);
			if (result === undefined)
			{
				result = defaultValue;
			}
		}
		else
		{
			// Setting property value.
			result = (converterFunction !== undefined)
				? converterFunction.call(this, value)
				: value;
			$.data(this, backingPropertyName, result);
			if (setterFunction != null) {
				setterFunction.call(this, result);			
			}
		}
		
		return result;
	};
}

/*
 * More factories for getter/setters of various types.
 */
$.extend(Property, {
	
	/*
	 * A boolean property.
	 */
	bool: function(setterFunction, defaultValue) {
		return Property(
			setterFunction,
			defaultValue,
			function(value) {
				// Convert either string or bool to bool.
				return String(value) == "true";
			}
		);
	},

	/*
	 * A property of an element of the control.
	 */
	element: function(elementId) {
		return new ElementPropertyFactory(elementId);		
	},
	
	/*
	 * An integer property.
	 */
	integer: function(setterFunction, defaultValue) {
		return Property(
			setterFunction,
			defaultValue,
			parseInt
		);
	},

	symbolCounter: 0

});

/*
 * Factory for properties associated with a DOM element, (including those
 * representing QuickUI controls).
 */

function ElementPropertyFactory(elementId) {
	this.elementId = elementId;
}

/*
 * Obtain the indicated element of the control.
 * If no element is indicated, the control's top-level element is returned.
 */
ElementPropertyFactory.$getElement = function(control, elementId) {
	if (elementId === undefined) {
		// Return control's top-level element.
		return $(control.element);
	}
	if (control[elementId] === undefined)
	{
		throw "Can't find element with ID \"" + elementId + "\"";
	}
	return $(control[elementId]);
}

/*
 * Factories for various types of properties on elements.
 */
$.extend(ElementPropertyFactory.prototype, {
	
	/*
	 * Toggle a CSS class on and off the element.
	 * Like $.toggleClass(), but if no value is supplied, the current CSS class state
	 * (has / has not) is returned rather than toggling that state.
	 */
	applyClass: function(className) {
		var elementId = this.elementId;
		return function(value) {
			var $element = ElementPropertyFactory.$getElement(this, elementId);
			return (value === undefined)
				? $element.hasClass(className)
				: $element.toggleClass(className, value);
		}
	},

	/* 
	 * The element's "content",
	 * which is either its val (if the element is an <input> element)
	 * or its inner HTML (if the element is any other HTML element)
	 * or its content (if the element is a control)
	 */
	content: function(setterFunction) {
		var elementId = this.elementId;	// "this" = property generator
		return function(value) {
			var $element = ElementPropertyFactory.$getElement(this, elementId);	// "this" = control
			var result = ($element.control() !== undefined)
				? $element.control().content(value)
				: ($element[0] instanceof HTMLInputElement)
					? $element.val(value)
					: $element.items(value);
			
			if (value !== undefined && setterFunction != null) {
				setterFunction.call(this, value);
			}
			
			return result;
		}
	},
	
	/*
	 * A property of the control represented by the element.
	 * The property needs to be defined as a getter/setter.
	 */
	controlProperty: function(propertyName) {
		var elementId = this.elementId;
		return function(value) {
			var $element = ElementPropertyFactory.$getElement(this, elementId);
			var control = $element.control();
			return control[propertyName].call(control, value);
		};
	},
	
	/*
	 * A specific CSS property of the element. Works like $.css().
	 */
	css: function(attributeName) {
		var elementId = this.elementId;
		return function(value) {
			var $element = ElementPropertyFactory.$getElement(this, elementId);
			return $element.css(attributeName, value);
		}
	},
	
	/*
	 * The text (only) of the element. Like $.text().
	 */
	text: function(setterFunction, defaultValue) {
		var elementId = this.elementId;
		return function(value) {
			var $element = ElementPropertyFactory.$getElement(this, elementId);
			return $element.text(value);
		}
	},
	
	/*
	 * Toggle the element's visibility.
	 * Like $.toggle(), but if no value is supplied, the current visibility is returned
	 * (rather than toggling the element's visibility).
	 */
	visibility: function() {
		var elementId = this.elementId;
		return function(value) {
			var $element = ElementPropertyFactory.$getElement(this, elementId);
			return (value === undefined)
				? $element.is(":visible")
				: $element.toggle(value);
		}
	}
});
