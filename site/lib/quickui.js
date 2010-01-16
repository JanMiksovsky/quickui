/*
 * QuickUI
 * Version 0.7.2
 * Modular web control framework
 * http://quickui.org/
 *
 * Copyright (c) 2009-2010 Jan Miksovsky
 * Licensed under the MIT license.
 *
 */

/*
 * QuickUI namespace.
 * 
 * The QuickUI object itself is a helper function that returns the control associated with a DOM element,
 * or null if the given element does not represent a control.
 */
function QuickUI(element) {
    return $(element).control();
}

/*
 * A subclassable class.
 * Modeled after John Resig's "Simple Javascript Inheritance".
 */
QuickUI.Class = function() {};

/*
 * Create a subclass of this class.
 */
QuickUI.Class.extend = function(properties) {
	var subclass = function() {}
	subclass.prototype = new this();
	subclass.prototype.constructor = subclass;
	
	jQuery.extend(subclass.prototype, properties);
	
	// Give class reference to base class and its prototype.
	subclass.superClass = this.prototype.constructor;
	subclass.superProto = this.prototype;
	
	// Give new subclass this method so the new subclass
	// can itself be subclassed.
	subclass.extend = arguments.callee;
	
	return subclass;
};

/*
 * Base QuickUI control class.
 * All compiled Quick controls ultimately derive from this class.
 */
QuickUI.Control = QuickUI.Class.extend({
	
	/* Use jQuery to search within the control's DOM. */
	$: function(selector)
	{
		return jQuery(this.element).find(selector);
	},
	
	className: "Control",
	
	/*
	 * Return this class's hierarchy as a string.
	 * If this has of class Foo and superclasses Bar and Control,
	 * this returns "Foo Bar Control".
	 */
	classList: function() {
		var classes = QuickUI.Control.classHierarchy(this);
		var classNames = jQuery.map(classes, function(c) {
			return c.prototype.className;
		});
		return classNames.join(" ");
	},
	
	/*
	 * Set the content of a control.
	 */
	content: function(value) {
		return jQuery(this.element).items(value);
	},
	
	id: function(s) {
		return jQuery(this.element).attr("id", s);
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
	 * This lets one specify a style attribute in Quick markup for a control instance;
	 * the style will apply to the control's root element.
	 */
	style: function(value)
	{
		return jQuery(this.element).attr("style", value);
	}

});

/*
 * Static Control methods.
 */
jQuery.extend(QuickUI.Control, {

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
		return [ f ].concat(QuickUI.Control.classHierarchy(f.superClass));
	},

	/*
	 * Create an instance of the given control class.
	 */
	create: function(controlClass, properties) {
		return QuickUI.Control.createAt(null, controlClass, properties);
	},

	/*
	 * Create an instance of the control class on the given target element(s).
	 * Return the element.
	 */
	createAt: function(target, controlClass, properties) {

		// Grab the existing contents of the target.
		var oldContents = target && jQuery.trim($(target).html());
		
		// Instantiate the control class.
		var control = new controlClass();
		
		// Create a target if none was supplied.
		var element = jQuery(target || "<div/>");
		
		// Bind the control to the element.
		control.element = element[0];

		// Bind the element to the control.
		// Don't set a property on the element directly to avoid creating a circular
		// reference, which is hard to garbage collect.
		jQuery.data(control.element, "control", control);

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
	}
	
});

/*
 * Alias for QuickUI.Control that allows specification of QuickUI.Control
 * in Quick markup as <QuickControl>. The class QuickUI.Control can't
 * be referenced in a tag directly because the "." is invalid within a tag,
 * and <QuickUI\.Control> would be legal but awkward.
 */
QuickControl = QuickUI.Control;

/*
 * QuickUI "control" jQuery extension.
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
	else if (jQuery.isFunction(arg1))
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
		var contents = jQuery(this).contents(value);
		var result = jQuery.map(contents, function(item) {
			return (item.nodeType == 3)
				? item.nodeValue	// Return text node as simple string
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
		if (arguments.length == 1 && !jQuery.isArray(value))
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
			jQuery.each(array, function(i, item) {
				element.append(item);
			});
		}
		return this;
	}
}

/*
 * Property factories for common types of properties in QuickUI classes.
 * These are functions that return setter/getter functions.
 */

/*
 * Factory for generic property getter/setter.
 */
QuickUI.Property = function(setterFunction, defaultValue, converterFunction) {
	var backingPropertyName = "_property" + QuickUI.Property.symbolCounter++;
	return function(value) {
		var result;
		if (value === undefined)
		{
			// Getting property value.
			result = jQuery.data(this, backingPropertyName);
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
			jQuery.data(this, backingPropertyName, result);
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
jQuery.extend(QuickUI.Property, {
	
	/*
	 * A boolean property.
	 */
	bool: function(setterFunction, defaultValue) {
		return QuickUI.Property(
			setterFunction,
			defaultValue,
			function(value) {
				// Convert either string or bool to bool.
				return String(value) == "true";
			}
		);
	},
	
	/*
	 * An integer property.
	 */
	integer: function(setterFunction, defaultValue) {
		return QuickUI.Property(
			setterFunction,
			defaultValue,
			parseInt
		);
	},

	symbolCounter: 0

});

/*
 * Return a factory for properties associated with a DOM element, (including those
 * representing QuickUI controls).
 */
QuickUI.Element = function(elementId) {
	return new QuickUI.ElementPropertyFactory(elementId);		
};

/*
 * Factory for properties associated with a DOM element (including those
 * representing QuickUI controls).
 */
QuickUI.ElementPropertyFactory = function(elementId) {
	this.elementId = elementId;
};

jQuery.extend(QuickUI.ElementPropertyFactory, {
	/*
	 * Obtain the indicated element of the control.
	 * If no element is indicated, the control's top-level element is returned.
	 */
	$getElement: function(control, elementId) {
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
});

/*
 * Factories for various types of properties on elements.
 */
jQuery.extend(QuickUI.ElementPropertyFactory.prototype, {
	
	/*
	 * Toggle a CSS class on and off the element.
	 * Like $.toggleClass(), but if no value is supplied, the current CSS class state
	 * (has / has not) is returned rather than toggling that state.
	 */
	applyClass: function(className) {
		var elementId = this.elementId;
		return function(value) {
			var $element = QuickUI.ElementPropertyFactory.$getElement(this, elementId);
			return (value === undefined)
				? $element.hasClass(className)
				: $element.toggleClass(className, value);
		}
	},
    
    /*
     * An attribute of the element. Works like $.attr().
     */
    attr: function(attributeName, setterFunction) {
        var elementId = this.elementId;
        return function(value) {
            var $element = QuickUI.ElementPropertyFactory.$getElement(this, elementId);
            var result = $element.attr(attributeName, value);
            if (value !== undefined && setterFunction != null)
            {
                setterFunction.call(this, value);
            }
            return result;
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
			var $element = QuickUI.ElementPropertyFactory.$getElement(this, elementId);	// "this" = control
			var result = ($element.control() !== undefined)
				? $element.control().content(value)
                : ($element[0] instanceof HTMLInputElement || $element[0] instanceof HTMLTextAreaElement)
					? $element.val(value)
					: $element.items(value);
			
			if (value !== undefined && setterFunction != null)
			{
				setterFunction.call(this, value);
			}
			
			return result;
		}
	},
	
	/*
	 * A property of the control represented by the element.
	 * The property needs to be defined as a getter/setter.
	 */
	controlProperty: function(propertyName, setterFunction) {
		var elementId = this.elementId;
		return function(value) {
			var $element = QuickUI.ElementPropertyFactory.$getElement(this, elementId);
			var control = $element.control();
			var result = control[propertyName].call(control, value);
			if (value !== undefined && setterFunction != null)
			{
				setterFunction.call(this, value);
			}
			return result;
		};
	},
	
	/*
	 * A specific CSS property of the element. Works like $.css().
	 */
	css: function(attributeName, setterFunction) {
		var elementId = this.elementId;
		return function(value) {
			var $element = QuickUI.ElementPropertyFactory.$getElement(this, elementId);
			var result = $element.css(attributeName, value);
			if (value !== undefined && setterFunction != null)
			{
				setterFunction.call(this, value);
			}
			return result;
		}
	},
	
	/*
	 * The text (only) of the element. Like $.text().
	 */
	text: function(setterFunction, defaultValue) {
		var elementId = this.elementId;
		return function(value) {
			var $element = QuickUI.ElementPropertyFactory.$getElement(this, elementId);
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
			var $element = QuickUI.ElementPropertyFactory.$getElement(this, elementId);
			return (value === undefined)
				? $element.is(":visible")
				: $element.toggle(value);
		}
	}
});
