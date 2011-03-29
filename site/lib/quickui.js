/*
 * QuickUI
 * Version 0.7.9
 * Modular web control framework
 * http://quickui.org/
 *
 * Copyright (c) 2009-2011 Jan Miksovsky
 * Licensed under the MIT license.
 *
 */

/*
 * Base QuickUI control class.
 * All compiled Quick controls ultimately derive from this class.
 * 
 * Calling new Control() will create a new control
 * Directly calling Control(element) is a helper function to
 * retrieve the control associated with a DOM element.
 */
Control = function(element) {
    if (element)
    {
        return $(element).control();
    }
};

/*
 * Static Control methods.
 */
jQuery.extend(Control, {

    /*
     * Return a control's complete class hierarchy as a string.
     * If a control has a class Foo and superclasses Bar and Control,
     * this returns "Foo Bar Control".
     */
    classHierarchy: function(controlClass)
    {
        if (!(controlClass && controlClass.prototype && controlClass.prototype.className))
        {
            return "";
        }
        if (!controlClass._classHierarchy)
        {
            var result = controlClass.prototype.className;
            var superClassNames = Control.classHierarchy(controlClass.superClass);
            if (superClassNames.length > 0)
            {
                result += " " + superClassNames;
            }
            controlClass._classHierarchy = result;  // Memoize result
        }
        return controlClass._classHierarchy;
    },

    /*
     * Create an instance of the given control class.
     */
    create: function(controlClass, properties) {
        return Control.createAt(null, controlClass, properties);
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
        var $element = jQuery(target || "<" + controlClass.prototype.tag + "/>");
        
        // Bind the control to the element.
        control.element = $element[0];

        // Bind the element to the control.
        // Don't set a property on the element directly to avoid creating a circular
        // reference, which is hard to garbage collect.
        jQuery.data(control.element, "control", control);

        // Apply all class names in the class hierarchy as style names.
        // This lets the element pick up styles defined by those classes.
        $element.addClass(control.classHierarchy());
        
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
        Control._readyQueue.push(control);
        if ($element.parent().length > 0)
        {
            // Control is part of the document's DOM.
            // Invoke the ready() handler of all queued controls.
            // This will also pick up any children of this element that were
            // added before this element was added to the document.
            var c = Control._readyQueue.shift();
            while (c)
            {
                c.ready();
                c = Control._readyQueue.shift();
            }
        }

        return control.element;
    },
    
    /*
     * Create a subclassable control.
     * Modeled after John Resig's "Simple Javascript Inheritance".
     */
    extend: function(properties) {
        var subclass = function() {};
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
    },
    
    // Queue of controls waiting for their ready() handler to be called.
    _readyQueue: []
    
});

/*
 * Control instance methods.
 */
jQuery.extend(Control.prototype, {
    
    /* Use jQuery to search within the control's DOM. */
    $: function(selector)
    {
        return jQuery(this.element).find(selector);
    },
    
    /*
     * The set of classes on the control's element.
     * If no value is supplied, this gets the current list of classes.
     * If a value is supplied, the specified class name(s) are *added*
     * to the element. This is useful for allowing a class to be added
     * at design-time to an instance, e.g., <Foo class="bar"/>. The
     * resulting element will end up with "bar" as a class, as well as
     * the control's class hierarchy: <div class="Foo Control bar">.
     * 
     * Note that, since "class" is a reserved word in JavaScript, we have
     * to quote it. 
     */
    "class": function(value) {
        if (value !== undefined)
        {
            jQuery(this.element).toggleClass(value, true);
        }
        return jQuery(this.element).attr("class");
    },
    
    className: "Control",
    
    classHierarchy: function() {
        return Control.classHierarchy(this.constructor);
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
            this._checkPropertyExists(propertyName);
            var value = properties[propertyName];
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
            this._checkPropertyExists(propertyName);
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
    },
    
    /*
     * By default, the root tag of the control will be a div.
     * Control classes can override this: <Control name="Foo" tag="span">
     */
    tag: "div",
    
    /*
     * Throw an exception if a function called propertyName hasn't been defined,
     * to assist debugging.
     */
    _checkPropertyExists: function(propertyName) {
        if (this[propertyName] === undefined) {
            var message = "Tried to access undefined getter/setter function for property \"" + propertyName + "\" on control class \"" + this.className + "\".";
            throw message;
        }
    }

});

/*
 * QuickUI "control" jQuery extension.
 * 
 * Usage:
 * 
 * $(myElement).control()
 *         Returns the control that was created on that element.
 *
 * $(myElement).control({ content: "Hello" });
 *      Sets the content property of the control at this element.
 * 
 * $(myElement).control(MyControlClass);
 *         Creates a new instance of MyControl around the element(s).
 * 
 * $(myElement).control(MyControlClass, { content: "Hello" });
 *         Creates a new control instance and sets its content property.
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
            Control.createAt(this, controlClass, properties);
        });
    }
    else
    {
        // Set properties on the control(s).
        var properties = arg1;
        this.each(function() {
            var control = jQuery.data(this, "control");
            control.setProperties(properties);
        });
        return this;
    }
};

/*
 * The element's "content", which is either:
 * 		- its val (if the element is an <input> element)
 * 	    - its inner HTML (if the element is any other HTML element)
 * 		- its content (if the element is a control).
 * This function allows one to code against, e.g., a control element without
 * needing to track whether that element is a QuickUI control or a standard element.
 */
jQuery.fn.content = function(value) {
	
	var getterResult;
    this.each(function() {
		var $element = jQuery(this);
	    if ($element.control() !== undefined)
	    {
	        // QuickUI control
	        result = $element.control().content(value);
	    }
	    else if (jQuery.nodeName($element[0], "input" ) || jQuery.nodeName($element[0], "select" ) || jQuery.nodeName($element[0], "textarea" ))
	    {
	        // Input control.
	        // $.val() checks its argument count, so we can't just pass in undefined to call it as a getter.
	        result = (value !== undefined) ? $element.val(value) : $element.val();
	    }
	    else
	    {
	        // Other DOM element
	        result = $element.items(value);
	    }
	    if (value === undefined)
	    {
	    	getterResult = result;
	    	return false;
	    }
	});
	
	return (value === undefined)
		? getterResult
		: this;
};

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
                ? item.nodeValue    // Return text node as simple string
                : item;
        });
        return (result != null && result.length == 1)
            ? result[0]                // Return the single content element.
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
};

/*
 * Property factories for common types of properties in QuickUI classes.
 * These are functions that return setter/getter functions.
 */

/*
 * Factory for generic property getter/setter.
 */
Control.Property = function(setterFunction, defaultValue, converterFunction) {
    var backingPropertyName = "_property" + Control.Property.symbolCounter++;
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
};

/*
 * More factories for getter/setters of various types.
 */
jQuery.extend(Control.Property, {
    
    // A boolean property.
    bool: function(setterFunction, defaultValue) {
        return Control.Property(
            setterFunction,
            defaultValue,
            function(value) {
                // Convert either string or bool to bool.
                return String(value) == "true";
            }
        );
    },
    
    // A date-valued property. Accepts a JavaScript date or parseable date string.
    date: function(setterFunction, defaultValue) {
        return Control.Property(
            setterFunction,
            defaultValue,
            function(value) {
                return value instanceof Date
                    ? value
                    : new Date(Date.parse(value));
            }
        );
    },
        
    // An integer property.
    integer: function(setterFunction, defaultValue) {
        return Control.Property(
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
Control.Element = function(elementId) {
    return new Control.ElementPropertyFactory(elementId);        
};

/*
 * Factory for properties associated with a DOM element (including those
 * representing QuickUI controls).
 */
Control.ElementPropertyFactory = function(elementId) {
    this.elementId = elementId;
};

jQuery.extend(Control.ElementPropertyFactory, {
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
jQuery.extend(Control.ElementPropertyFactory.prototype, {
    
    /*
     * Toggle a CSS class on and off the element.
     * Like $.toggleClass(), but if no value is supplied, the current CSS class state
     * (has / has not) is returned rather than toggling that state.
     */
    applyClass: function(className, setterFunction) {
        var elementId = this.elementId;
        return function(value) {
            var $element = Control.ElementPropertyFactory.$getElement(this, elementId);
            var result = (value === undefined)
                ? $element.hasClass(className)
                : $element.toggleClass(className, value);
            if (value !== undefined && setterFunction != null)
            {
                setterFunction.call(this, value);
            }
            return result;
        };
    },
    
    /*
     * An attribute of the element. Works like $.attr().
     */
    attr: function(attributeName, setterFunction) {
        var elementId = this.elementId;
        return function(value) {
            var $element = Control.ElementPropertyFactory.$getElement(this, elementId);
            var result = $element.attr(attributeName, value);
            if (value !== undefined && setterFunction != null)
            {
                setterFunction.call(this, value);
            }
            return result;
        };
    },

    /* 
     * Get/set the element's "content"; see jQuery.fn.control.content().
     */
    content: function(setterFunction) {
        var elementId = this.elementId;    // "this" = property generator
        return function(value) {
            var $element = Control.ElementPropertyFactory.$getElement(this, elementId);    // "this" = control
            var result = $element.content(value);
            if (value !== undefined && setterFunction != null)
            {
                setterFunction.call(this, value);
            }
            return result;
        };
    },
    
    /*
     * A property of the control represented by the element.
     * The property needs to be defined as a getter/setter.
     */
    controlProperty: function(propertyName, setterFunction) {
        var elementId = this.elementId;
        return function(value) {
            var $element = Control.ElementPropertyFactory.$getElement(this, elementId);
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
            var $element = Control.ElementPropertyFactory.$getElement(this, elementId);
            var result = $element.css(attributeName, value);
            if (value !== undefined && setterFunction != null)
            {
                setterFunction.call(this, value);
            }
            return result;
        };
    },
    
    /*
     * The text (only) of the element. Like $.text().
     */
    text: function(setterFunction) {
        var elementId = this.elementId;
        return function(value) {
            var $element = Control.ElementPropertyFactory.$getElement(this, elementId);
            var result = $element.text(value);
            if (value !== undefined && setterFunction != null)
            {
                setterFunction.call(this, value);
            }
            return result;
        };
    },
    
    /*
     * Toggle the element's visibility.
     * Like $.toggle(), but if no value is supplied, the current visibility is returned
     * (rather than toggling the element's visibility).
     */
    visibility: function() {
        var elementId = this.elementId;
        return function(value) {
            var $element = Control.ElementPropertyFactory.$getElement(this, elementId);
            return (value === undefined)
                ? $element.is(":visible")
                : $element.toggle(value);
        };
    }
});
