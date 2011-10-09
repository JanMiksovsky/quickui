/*
 * QuickUI
 * Version 0.8.5
 * Modular web control framework
 * http://quickui.org/
 *
 * Copyright (c) 2009-2011 Jan Miksovsky
 * Licensed under the MIT license.
 *
 */

 
/*
 * QuickUI "control" jQuery extension to create and manipulate
 * controls via a regular jQuery instance.
 * 
 * Usage:
 * 
 * $( element ).control()
 *         Returns the control that was created on that element.
 *
 * $( element ).control( { content: "Hello" } );
 *      Sets the content property of the control at this element.
 * 
 * $( element ).control( MyControlClass );
 *         Creates a new instance of MyControlClass around the element(s).
 * 
 * $( element ).control( MyControlClass, { content: "Hello" } );
 *         Creates new control instance(s) and sets its (their) content property.
 * 
 */
jQuery.fn.control = function( arg1, arg2 ) {
    if ( arg1 === undefined ) {
        // Return the controls bound to these element(s), cast to the correct class.
        var $cast = Control( this ).cast( jQuery );
        return ( $cast instanceof Control ) ? $cast : null;
    } else if ( jQuery.isFunction( arg1 ) ) {
        // Create a new control around the element(s).
        var controlClass = arg1;
        var properties = arg2;
		for ( var i = 0, length = this.length; i < length; i++ ) {
            controlClass.createAt( this.eq(i), properties );
        }
        
        // Return the control array as an instance of the desired class.
        // TODO: Handle differing classes if controls transmuted themselves
        // differently during initialize. A cast() each time seems excessive.
        var classFn = Control( this )._controlClass();
        return classFn( this );
    } else {
        // Set properties on the control(s).
        return Control( this ).cast().properties( arg1 );
    }
};

/*
 * Selector for ":control": reduces the set of matched elements to the ones
 * which are controls.
 * 
 * With this, $foo.is(":control") returns true if at least one element in $foo
 * is a control, and $foo.filter(":control") returns just the controls in $foo.
 */
jQuery.expr[":"].control = function( elem ) {
    var controlClass = Control( elem )._controlClass(); 
    return controlClass
        ? controlClass === Control || controlClass.prototype instanceof Control
        : false;
};

/*
 * Control subclass of jQuery.
 * 
 * This is used as the base class for all QuickUI controls.
 */
var Control = jQuery.sub();
jQuery.extend( Control, {
    
    /*
     * Given an array of functions, repeatedly invoke them as a chain.
     * 
     * This function allows the compact definition of getter/setter functions
     * for Control classes that are delegated to aspects of the control or
     * elements within its DOM.
     * 
     * For example:
     * 
     *     MyControl.prototype.foo = Control.chain( "$foo", "content" );
     * 
     * will create a function foo() on all MyControl instances that sets or gets
     * the content of the elements returned by the element function $foo(),
     * which in turn likely means any element with id "#foo" inside the control.
     * 
     * The parameters to chain are the names of functions that are invoked in
     * turn to produce the result. The last parameter may be an optional side
     * effect function that will be invoked whenever the chain function is
     * invoked as a setter.
     * 
     * The function names passed as parameters may also define an optional
     * string-valued parameter that will be passed in. So chain( "css/display" )
     * creates a curried setter/getter function equivalent to css("display", value ).
     */
    chain: function() {
        
        // Check for a side effect function as last parameter.
        var args = arguments;
        var sideEffectFn;
        if ( jQuery.isFunction( args[args.length - 1] ) ) {
            // Convert arguments to a real array in order to grab last param.
            args = [].slice.call( arguments );
            sideEffectFn = args.pop();
        }
        
        // Identify function names and optional parameters.
        var functionNames = [];
        var functionParams = [];
        for ( var i = 0, length = args.length; i < length; i++ ) {
            // Check for optional parameter.
            var parts = arguments[i].split( "/" );
            functionNames[i] = parts.shift();
            functionParams[i] = parts;
        }
        
        // Generate a function that executes the chain.
        return function chain( value ) {
            
            var result = this;
            for ( var i = 0, length = functionNames.length; i < length; i++ ) {
                var fn = result[ functionNames[i] ];
                var params = functionParams[i];
                if ( value !== undefined && i === length - 1 ) {
                    // Invoke last function as setter.
                    params = params.concat( [ value ] );
                }
                if ( fn === undefined ) {
                    var message = "Control class \"" + this.className + "\" tried to call an undefined getter/setter function \"" + functionNames[i] + "\".";
                    throw message;
                }
                result = fn.apply( result, params );
            }
            
            if ( value === undefined ) {
                // Chain invoked as getter.
                return result;
            } else {
                if ( sideEffectFn ) {
                    // Carry out side effect.
                    sideEffectFn.call( this, value );
                }
                return this;
            }
        };
    },
        

    /*
     * Return the names of all control classes in this class' hierarchy,
     * in order from most specific to most general class.
     * 
     * Example: If a control class Foo has superclasses Bar and Control,
     * this returns "Foo Bar Control".
     */
    classHierarchy: function( startingClass ) {
        var controlClass = startingClass || this;
        if ( !( controlClass && controlClass.prototype && controlClass.prototype.className ) ) {
            return "";
        }
        if ( !controlClass._classHierarchy )          // Already have memoized result?
        {
            var result = controlClass.prototype.className;
            var superClassNames = this.classHierarchy( controlClass.superclass );
            if ( superClassNames.length > 0 ) {
                result += " " + superClassNames;
            }
            controlClass._classHierarchy = result;  // Memoize result
        }
        return controlClass._classHierarchy;
    },
    
    /*
     * Create an instance of this control class around a default element.
     * The class prototype's tag member can define a specific element tag. 
     */
    create: function( properties ) {
        return this.createAt( "<" + this.prototype.tag + "/>", properties );
    },
    
    /*
     * Create instance(s) of this control class around the given target(s).
     */
    createAt: function( target, properties ) {

        // Instantiate the control class.
        var $controls = this( target );
        
        // Grab the existing contents of the target elements.
        var oldContents = $controls.map( function( index, element ) {
            var content = jQuery.trim( $( element ).html() );
            return content.length > 0 && content;
        }).get();
        
        $controls
            // Save a reference to the controls' class.
            .data( Control._controlClassData, this )
            
            // Apply all class names in the class hierarchy as style names.
            // This lets the element pick up styles defined by those classes.
            .addClass( this.classHierarchy() )
            
            // Render controls as DOM elements.
            .render()

            // Pass in the target's old contents (if any).
            .propertyVector( "content", oldContents )
            
            // Set any requested properties.
            .properties( properties )
        
            // Tell the controls they're ready.
            .initialize();
        
        // It's possible (but unlikely) that a control transmuted itself
        // during its initialize() call, so get the class back and return
        // controls as an instance of that class.
        var classFn = $controls._controlClass();
        return $controls instanceof classFn
                    ? $controls
                    : classFn( $controls );
    },

    // Return true if the given element is a control.    
    isControl: function( element ) {
        return ( Control( element ).control() !== undefined );
    },

    /*
     * Return a function that applies another function to each control in a
     * jQuery array.
     *
     * If the inner function returns a defined value, then the function is
     * assumed to be a property getter, and that result is return immediately.
     * Otherwise, "this" is returned to permit chaining.
     */
    iterator: function( fn ) {
        return function() {
            var args = arguments;
            var iteratorResult;
            this.eachControl( function( index, $control ) {
                var result = fn.apply( $control, args );
                if ( result !== undefined ) {
                    iteratorResult = result;
                    return false;
                }
            });
            return ( iteratorResult !== undefined )
                ? iteratorResult // Getter
                : this; // Method or setter
        };
    },
    
    /*
     * Generic factory for a property getter/setter.
     */
    property: function( sideEffectFn, defaultValue, converterFunction ) {
        var backingPropertyName = "_property" + Control.property._symbolCounter++;
        return function( value ) {
            var result;
            if ( value === undefined ) {
                // Getter
                result = this.data( backingPropertyName );
                return ( result === undefined )
                    ? defaultValue
                    : result;
            } else {
                // Setter. Allow chaining.
                return this.eachControl( function( index, $control ) {
                    result = ( converterFunction )
                        ? converterFunction.call( $control, value )
                        : value;
                    $control.data( backingPropertyName, result );
                    if ( sideEffectFn ) {
                        sideEffectFn.call( $control, result );            
                    }
                });
            }
        };
    },
    
    // Create a subclass of this class.
    subclass: function( className, renderFunction, tag ) {
        var superClass = this;
        var newClass = superClass.sub();
        
        // jQuery.sub uses $.extend to copy properties from super to subclass;
        // need to blow away class properties that shouldn't have been copied.
        delete newClass._classHierarchy;
        delete newClass._initializeQueue;
        
        newClass.prototype.className = className;
        if ( renderFunction ) {
            newClass.prototype.render = function() {
                superClass.prototype.render.call( this );
                // Call the render function on each element separately to
                // ensure each control ends up with its own element references.
                for ( var i = 0, length = this.length; i < length; i++ ) {
                    renderFunction.call( this.eq(i) );
                }
                return this;
            };
        }
        if ( tag ) {
            newClass.prototype.tag = tag;
        }
        
        newClass.subclass = superClass.subclass;
        return newClass;
    },
    
    /*
     * An element may have been added to the document; see if it's a control that's
     * waiting to be notified of that via Control.prototype.inDocument().
     */ 
    _checkForElementInsertion: function( event ) {

        var i = 0;
        while ( i < Control._elementInsertionCallbacks.length ) {
            var element = Control._elementInsertionCallbacks[i].element;
            if ( jQuery.contains( document.body, element ) || document.body === element ) {
                
                // The element has been inserted into the document.
                // We can now invoke its inDocument callback.
                var $control = Control( element ).control();
                Control._elementInsertionCallbacks[i].callback.call( $control, $control );
                
                // Remove the element from the list we're waiting to see inserted.
                Control._elementInsertionCallbacks.splice( i, 1 );
            } else {
                i++;
            }
        }
        
        if ( Control._elementInsertionCallbacks.length === 0 ) {
            // No more elements to wait for.
            Control._stopListeningForElementInsertion();
        }
    },
    
    /*
     * The name of the data element used to store a reference to an element's control class.
     */
    _controlClassData: "_controlClass",
    
    /*
     * Converts a string class name into the indicated class. Alternatively,
     * if this is given a class function, it returnst that function as is.
     */
    _convertToClass: function( value ) {
        return jQuery.isFunction( value )
            ? value
            // Convert a string to a function. For security reasons,
            // only do the conversion if the string is a single, legal
            // JavaScript function name.
            : /^[$A-Za-z_][$0-9A-Za-z_]*$/.test( value )
                ? eval( value )
                : null;
    },
    
    // Controls waiting (via an inDocument call) to be added to the body.
    _elementInsertionCallbacks: [],
    
    // True if Control is currently listening for DOM insertions.
    _listeningForElementInsertion: false,
    
    // True if we can rely on DOM mutation events to detect DOM changes. 
    _mutationEvents: function() {
        // Since the only QuickUI-supported browser that doesn't support
        // mutation events is IE8, we just look for that. If need be, we
        // could programmatically detect support using something like
        // Diego Perini's NWMatcher approach.
        return ( !jQuery.browser.msie || parseInt( jQuery.browser.version ) >= 9 ); 
    },

    /*
     * Start listening for insertions of elements into the document body.
     * 
     * On modern browsers, we use the DOMNodeInserted mutation event (which, as of
     * 7/2011, had better browser converage than DOMNodeinDocument).
     * Mutation events are slow, but the only way to reliably detect insertions
     * that are created outside the document and then later added in. The events
     * aren't used when we can avoid it, and the event is unbound once all known
     * pending controls have been added.
     * 
     * IE8 doesn't support mutation events, so we have to set up our own polling
     * interval to check to see whether a control has been added. Again, we avoid
     * doing this at all costs, but this apparently is the only way we can
     * determine when elements have been added in IE8.
     */    
    _startListeningForElementInsertion: function() {
        if ( Control._mutationEvents() ) {
            jQuery( "body" ).bind( "DOMNodeInserted", Control._checkForElementInsertion );
            Control._listeningForElementInsertion = true;
        } else {
            var self = this;
            Control._elementInsertionInterval = window.setInterval( function() {
                self._checkForElementInsertion();
            }, 10 );
        }
    },
    
    _stopListeningForElementInsertion: function() {
        if ( Control._mutationEvents() ) {
            jQuery( "body" ).unbind( "DOMNodeInserted", Control._checkForElementInsertion );
            Control._listeningForElementInsertion = false;
        } else {
            window.clearInterval( Control._elementInsertionInterval );
            Control._elementInsertionInterval = null;
        }
    }
});

/*
 * More factories for getter/setters of various types.
 */
jQuery.extend( Control.property, {
    
    // A boolean property.
    bool: function( sideEffectFn, defaultValue ) {
        return Control.property(
            sideEffectFn,
            defaultValue,
            function convertToBool( value ) {
                // Convert either string or bool to bool.
                return String( value ) === "true";
            }
        );
    },

    /*
     * A class-valued property.
     * This accepts either a function (the class) or a class name as a string.
     */
    "class": function( sideEffectFn, defaultValue ) {
        return Control.property(
            sideEffectFn,
            defaultValue,
            Control._convertToClass
        );
    },
    
    // A date-valued property. Accepts a JavaScript date or parseable date string.
    date: function( sideEffectFn, defaultValue ) {
        return Control.property(
            sideEffectFn,
            defaultValue,
            function convertToDate( value ) {
                return ( value instanceof Date || value == null )
                    ? value
                    : new Date( Date.parse( value ) );
            }
        );
    },
        
    // An integer property.
    integer: function( sideEffectFn, defaultValue ) {
        return Control.property(
            sideEffectFn,
            defaultValue,
            parseInt
        );
    },

    // Used to generate symbols to back new properties.
    _symbolCounter: 0

});

/*
 * Control instance methods.
 */
jQuery.extend( Control.prototype, {
            
    /*
     * Get/set whether the indicated class(es) are applied to the elements.
     * This effectively combines $.hasClass() and $.toggleClass() into a single
     * getter/setter.
     */
    applyClass: function( classes, value ) {
        return ( value === undefined )
            ? this.hasClass( classes )
            : this.toggleClass( classes, String( value ) === "true" );
    },
        
    /*
     * Return the array of elements cast to their closest JavaScript class ancestor.
     * E.g., a jQuery $(".foo") selector might pick up instances of control classes
     * A, B, and C. If B and C are subclasses of A, this will return an instance of
     * class A. So Control(".foo").cast() does the same thing as A(".foo"), but without
     * having to know the type of the elements in advance.
     * 
     * The highest ancestor class this will return is the current class, even for plain
     * jQuery objects, in order to allow Control methods (like content()) to be applied to
     * the result.
     */
    cast: function( defaultClass ) {
        defaultClass = defaultClass || this.constructor;
        var setClass;
        for ( var i = 0, length = this.length; i < length; i++ ) {
            var $element = this.eq(i);
            var elementClass = $element._controlClass() || defaultClass;
            if ( setClass === undefined || setClass.prototype instanceof elementClass) {
                setClass = elementClass;
            }
        };
        setClass = setClass || defaultClass;  // In case "this" had no elements.
        return setClass( this );
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
    "class": function( classList ) {
        return ( classList === undefined )
            ? this.attr( "class" )
            : this.toggleClass( classList, true );
    },

    className: "Control",
    
    /*
     * Get/set the content of an HTML element.
     * 
     * Like $.contents(), but you can also set content, not just get it.
     * You can set content to a single item, an array of items, or a set
     * of items listed as parameters. Setting multiple items at a time
     * is an important case in compiled QuickUI markup. Input elements
     * are also handled specially: their value (val) is their content.
     * 
     * This function attempts to return contents in a canonical form, so
     * that setting contents with common parameter types is likely to
     * return those values back in the same form. If there is only one
     * content element, that is returned directly, instead of returning
     * an array of one element. If the element being returned is a text node,
     * it is returned as a string.
     * 
     * Usage:
     *  $element.content("Hello")              // Simple string
     *  $element.content(["Hello", "world"])   // Array
     *  $element.content("Hello", "world")     // Parameters
     *  Control("<input type='text'/>").content("Hi")   // Sets text value
     * 
     * This is used as the default implementation of a control's content
     * property. Controls can override this behavior.
     */
    content: function( value ) {
        if ( value === undefined ) {
            // Getting contents. Just process first element.
            var $element = this.eq(0);
            if ( $element.isInputElement() ) {
                // Return input element value.
                return $element.val();
            } else {
                // Return HTML contents in a canonical form.
                var contents = $element.contents( value );
                var result = jQuery.map( contents, function( item ) {
                    return ( item.nodeType === 3 )
                        ? item.nodeValue // Return text as simple string
                        : item;
                });
                return ( result !== null && result.length === 1 )
                    ? result[0] // Return the single content element.
                    : result;
            }
        } else {
            // Setting contents.
            
            // Cast arguments to an array.
            var array = ( arguments.length > 1 )
                ? arguments                 // set of parameters
                : jQuery.isArray( value )
                    ? value                 // single array parameter
                    : [ value ];            // singleton parameter

            return this.each( function( index, element ) {
                var $element = Control( element );
                if ( $element.isInputElement() ) {
                    // Set input element value.
                    $element.val( value );
                } else {
                    // Set HTML contents.
                    // Use apply() to feed array to $.append() as params.
                    $element
                        .empty()
                        .append.apply( $element, array );
                }
            });
        }
    },
    
    /*
     * The control's culture.
     * If jQuery Globalize is present, this defaults to the current culture.
     * This can be overridden on a per-control basis, e.g., for testing purposes.
     *
     * Control classes can override this method to respond immediately to an
     * explicit change in culture. They should invoke their base class' culture
     * method, do whatever work they want (if the culture parameter is defined),
     * then return the result of the base class call.
     */
    culture: function( culture ) {
        var cultureDataMember = "_culture";
        var controlCulture;
        if ( culture === undefined ) {
            controlCulture = this.data( cultureDataMember );
            return controlCulture || ( window.Globalize ? Globalize.culture() : null );
        } else {
            controlCulture = ( typeof culture === "string" )
                ? Globalize.findClosestCulture( culture )
                : culture;
            this.data( cultureDataMember, controlCulture );
            return this;
        }
    },
    
    /*
     * Execute a function once for each control in the array.
     * Inside the function, "this" refers to the single control.
     */
    eachControl: function( fn ) {
        for ( var i = 0, length = this.length; i < length; i++ ) {
            var $control = this.eq(i).control();
            var result = fn.call( $control, i, $control );
            if ( result === false ) {
                break;
            }
        }
        return this;
    },

    /*
     * Sets/gets whether the control is showing a generic appearance.
     * We use a property with a side-effect, rather than a binding to
     * applyClass/generic, in order for the default value to be "undefined".
     */
    generic: Control.property.bool(function (generic) {
        this.applyClass( "generic", generic );
    }),
    
    /*
     * Sets the generic property to true if the control's most specific
     * class (i.e., its constructor) is the indicated class. Controls that
     * want to define a generic appearance should invoke this in their
     * initialize handler, passing in the control class.
     * 
     * The assumption is that subclasses want to define their own appearance,
     * and therefore do *not* want an inherited generic appearance. E.g.,
     * a class Foo could ask for generic appearance, but a subclass of Foo
     * called Bar will not get the generic appearance unless it calls this
     * function via this.genericIfClassIs(Bar).
     */
    genericIfClassIs: function( classFn ) {
        return this.eachControl( function( index, $control ) {
            if ( $control.constructor === classFn && $control.generic() === undefined ) {
                $control.generic( true );
            }
        });
    },

    // Allow controls have an element ID specified on them in markup.
    id: function( id ) {
        return this.attr( "id", id );
    },

    /*
     * Invoked when the control has finished rendering.
     * Subclasses can override this to perform their own post-rendering work
     * (e.g., wiring up events).
     */    
    initialize: function() {},
    
    /*
     * A (new) control is asking to have a callback invoked when the control
     * has been inserted into the document body. This is useful because
     * the initialize event is often invoked before the control has actually
     * been added to the document, and therefore doesn't have height or width,
     * doesn't have any externally-imposed styles applied to it, etc.
     * 
     * If the control is already in the document, the callback is executed
     * immediately.
     */
    inDocument: function( callback ) {

        var callbacks = [];
        for ( var i = 0; i < this.length; i++ ) {
            var $element = this.eq(i);
            var element = $element[0];
            if ( jQuery.contains( document.body, element ) || document.body === element ) {
                // Element already in document
                callback.call( $element );
            } else {
                // Add element to the list we're waiting to see inserted.
                callbacks.push({
                    element: element,
                    callback: callback
                });
            }
        }

        if ( callbacks.length > 0 ) {
            Control._elementInsertionCallbacks = callbacks.concat( Control._elementInsertionCallbacks );
            if ( !Control._listeningForElementInsertion ) {
                Control._startListeningForElementInsertion();
            }
        }
        
        return this;
    },
    
    /*
     * Return true if the (first) element is an input element (with a val).
     * Note that buttons are not considered input elements, because typically
     * when one is setting their contents, one wants to set their label, not
     * their "value".
     */
    isInputElement: function() {
        var inputTags = ["input", "select", "textarea"];
        return this.length === 0
            ? false
            : ( jQuery.inArray( this[0].nodeName.toLowerCase(), inputTags ) >= 0 );
    },

    /*
     * Base Control class has no visualization of its own.
     */    
    render: function() {
        return this;
    },
    
    /*
     * Invoke the indicated setter functions on the control to
     * set control properties. E.g.,
     * 
     *    $c.properties( { foo: "Hello", bar: 123 } );
     * 
     * is shorthand for $c.foo( "Hello" ).bar( 123 ).
     * 
     * The setAsClass parameter allows setting properties defined by
     * the given superclass.
     */
    properties: function( props, setAsClass ) {
        var classFn = setAsClass || this.constructor;
        var prototype = classFn.prototype;
        for ( var propertyName in props ) {
            var value = props[ propertyName ];
            if ( prototype[ propertyName ] === undefined ) {
                var message = "Tried to access undefined getter/setter function for property \"" + propertyName + "\" on control class \"" + this.className + "\".";
                throw message;
            }
            prototype[ propertyName ].call( this, value );
        }
        return this;
    },

    /*
     * Get/set the given property on multiple elements at once. If called
     * as a getter, an array of the property's current values is returned.
     * If called as a setter, that property of each element will be set to
     * the corresponding defined member of the values array. (Array values
     * which are undefined will not be set.)
     */
    propertyVector: function( propertyName, values ) {
        var propertyFn = this[ propertyName ];
        if ( values === undefined ) {
            // Getter
            var results = [];
            for ( var i = 0, length = this.length; i < length; i++ ) {
                results[i] = propertyFn.call( this.eq(i) );
            }
            return results;
        } else {
            // Setter
            for ( var i = 0, length1 = this.length, length2 = values.length; i < length1 && i < length2; i++ ) {
                if ( !!values[i] ) {
                    propertyFn.call( this.eq(i), values[i] );
                }
            }
            return this;
        }
    },
    
    /*
     * Sets/gets the style of matching elements.
     * This lets one specify a style attribute in QuickUI markup for a control instance;
     * the style will apply to the control's root element.
     */
    style: function( style ) {
        return this.attr( "style", style );
    },
    
    /*
     * The tabindex of the control.
     */
    tabindex: function( tabindex ) {
        return this.attr( "tabindex", tabindex );
    },

    /*
     * Replace this control with an instance of the given class and properties.
     * Unlike a normal Control.create() call, existing control contents are
     * *not* preserved. Event handlers, however, remain attached;
     * use a separate call to $.unbind() to remove them if desired.
     *
     * If preserveClasses is true, the existing class hierarchy will be left
     * on the "class" attribute, although the class "Control" will remain the
     * rightmost class. Suppose the class hierarchy looks like
     *      class="Foo Control"
     * If we're switching to class Bar, the hierarchy will end up like
     *      class="Bar Foo Control"
     */
    transmute: function( newClass, preserveContent, preserveClasses, preserveEvents ) {
        
        var classFn = Control._convertToClass( newClass );
        
        var oldContents = preserveContent ? this.propertyVector( "content" ) : null;
        var oldClasses = preserveClasses ? this.prop( "class" ) : null;
        
        // Reset everything.
        this
            .empty()
            .removeClass()
            .removeData();
        if ( !preserveEvents ) {
            this.unbind();
        }

        var $controls = this.control( classFn );
        
        if ( oldContents ) {
            $controls.propertyVector( "content", oldContents );
        }
        if ( oldClasses ) {
            $controls
                .removeClass( "Control" )
                .addClass( oldClasses )
                .addClass( "Control" );       // Ensures Control ends up rightmost
        }
        
        return $controls;
    },
    
    /*
     * By default, the root tag of the control will be a div.
     * Control classes can override this: <Control name="Foo" tag="span">
     */
    tag: "div",
    
    /*
     * Toggle the element's visibility.
     * Like $.toggle(), but if no value is supplied, the current visibility is returned
     * (rather than toggling the element's visibility).
     */
    visibility: function( value ) {
        return ( value === undefined )
            ? this.is( ":visible" )
            : this.toggle( String( value ) === "true" );
    },
    
    /*
     * Get/set the reference for the class for these control(s).
     */
    _controlClass: function( classFn ) {
        return this.data( Control._controlClassData, classFn );
    },

    /*
     * Return a jQuery element for the given content (either HTML or a DOM element)
     * that will be part of a control. At the same time, define a function on the
     * control class that can be used later to get that element back.
     * 
     * This is an internal routine invoked by a control class' generated
     * code whenever the control is rendered. The function defined herein is only
     * created the first time this routine is called.
     */
    _define: function( functionName, content ) {
        
        var $element = $( content );
        
        // Store the element reference as data on the control.
        this.data( functionName, $element[0] );
        
        if ( this[ functionName ] === undefined ) {
            // Define a control class function to get back to the element(s) later.
            this.constructor.prototype[ functionName ] = ( function( key ) {
                return function elementFunction() {

                    // Map a collection of control instances to the given element
                    // defined for each instance.
                    var elements = [];
                    for ( var i = 0, length = this.length; i < length; i++ ) {
                        var element = this.eq(i).data( key );
                        if ( element !== undefined ) {
                            elements.push( element );
                        }
                    }
                    
                    var $result = Control( elements ).cast();
                    
                    // To make the element function $.end()-able, we want to call
                    // jQuery's public pushStack() API. Unfortunately, that call
                    // won't allow us to both a) return a result of the proper class
                    // AND b) ensure that the result of calling end() will be of
                    // the proper class. So, we directly set the internal prevObject
                    // member used by end().
                    $result.prevObject = this;

                    return $result;
                };
            })( functionName );
        }
        
        return $element;
    }

});

