/*
 * QuickUI
 * Version 0.8.8
 * Modular web control framework
 * http://quickui.org/
 *
 * Copyright (c) 2009-2012 Jan Miksovsky
 * Licensed under the MIT license.
 *
 */

( function( $ ) {
 
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
$.fn.control = function( arg1, arg2 ) {
    if ( arg1 === undefined ) {
        // Return the controls bound to these element(s), cast to the correct class.
        var $cast = Control( this ).cast( jQuery );
        return ( $cast instanceof Control ) ? $cast : null;
    } else if ( $.isFunction( arg1 ) ) {
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
$.expr[":"].control = function( elem ) {
    var controlClass = Control( elem )._controlClass(); 
    return controlClass
        ? controlClass === Control || controlClass.prototype instanceof Control
        : false;
};

/*
 * Control subclass of jQuery.
 * This is used as the base class for all QuickUI controls.
 */
var Control = $.sub();
$.extend( Control, {
    
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
        if ( $.isFunction( args[args.length - 1] ) ) {
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
                    var message = "Control class \"" + this.className + "\" tried to chain to an undefined getter/setter function \"" + functionNames[i] + "\".";
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
     * A class' "classHierarchy" member reflects the names of all classes
     * in its class hierarchy, from most specific to most general class.
     * This member is automatically built by Control.subclass().
     * 
     * Example: If a control class Foo has superclasses Bar and Control,
     * this member will be "Foo Bar Control".
     */
    classHierarchy: "Control",
    
    /*
     * Each control class knows its own name.
     * We'd prefer to use "name" for this, but something (the browser? jQuery?)
     * creates a "name" property on jQuery instances that's unchangeable.
     */
    className: "Control",
    
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
            return [ significantContents( element ) ];
        }).get();
        
        $controls
            // Save a reference to the controls' class.
            .data( Control._controlClassData, this )
            
            // Apply all class names in the class hierarchy as style names.
            // This lets the element pick up styles defined by those classes.
            .addClass( this.classHierarchy )
            
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
    
    /*
     * Create a subclass of this class.
     */
    subclass: function( json ) {
        
        var superclass = this;
        var newClass = superclass.sub();
        
        // $.sub uses $.extend to copy properties from super to subclass, so
        // we have to blow away class properties that shouldn't have been copied.
        delete newClass._initializeQueue;
        
        if ( json ) {
        
            newClass.extend({
                className: json.className,
                classHierarchy: json.className + " " + superclass.classHierarchy,
                subclass2: superclass.subclass2 
            });

            /* Create a copy of the JSON that doesn't include the reserved keys. */
            var reservedKeys = {
                className: true,
                prototype: true,
                tag: true
            };
            var cleanJson = {};
            for ( key in json ) {
                if ( !reservedKeys[ key ] ) {
                    cleanJson[ key ] = json[ key ];
                }
            }
            
            newClass.prototype.extend({
    
                // Create a render function for the control based on the control JSON.
                render: function render() {
                    var $super = superclass( this );
                    superclass.prototype.render.call( $super );
                    for ( var i = 0; i < this.length; i++ ) {
                        $super.nth(i).json( cleanJson );
                    }
                    return this;
                },
                
                tag: json.tag
            });
            
            newClass.prototype.extend( json.prototype );

        }
        
        // Let new class itself be subclassable.
        newClass.subclass = superclass.subclass;
        
        return newClass;
    },

    /*
     * An element may have been added to the document; see if it's a control that's
     * waiting to be notified of that via Control.prototype.inDocument().
     */ 
    _checkForElementInsertion: function( event ) {
        
        var callbacksReady = [];

        var i = 0;
        while ( i < Control._elementInsertionCallbacks.length ) {
            var element = Control._elementInsertionCallbacks[i].element;
            if ( $.contains( document.body, element ) || document.body === element ) {
                
                // The element has been inserted into the document. Move it
                // into the list of callbacks which we can now invoke.
                callbacksReady = callbacksReady.concat( Control._elementInsertionCallbacks[i] );
                
                // Now remove it from the pending list. We remove it from the list
                // *before* we invoke the callback -- because the callback
                // itself might do DOM manipulations that trigger more DOM
                // mutation events.
                Control._elementInsertionCallbacks.splice( i, 1 );
            } else {
                i++;
            }
        }
        
        if ( Control._elementInsertionCallbacks.length === 0 ) {
            // No more elements to wait for.
            Control._stopListeningForElementInsertion();
        }
        
        for ( i = 0; i < callbacksReady.length; i++ ) {
            var element = callbacksReady[i].element;
            var $control = Control( element ).control();
            var callback = callbacksReady[i].callback;
            callback.call( $control, $control );
        }
    },
    
    /*
     * The name of the data element used to store a reference to an element's control class.
     */
    _controlClassData: "_controlClass",
    
    /*
     * Converts a string class name into the indicated class. Alternatively,
     * if this is given a class function, it returns that function as is.
     */
    _convertToClass: function( value ) {
        var classFn;
        if ( $.isFunction( value ) )
        {
            classFn = value;
        } else {
            classFn = window[ value ];
            if ( !classFn ) {
                throw "Unable to find a class called \"" + value + "\".";
            }
        }
        return classFn; 
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
        return ( !$.browser.msie || parseInt( $.browser.version ) >= 9 ); 
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
 * Create the control from the given JSON. This will be of two forms.
 * The first form creates a control:
 * 
 *  {
 *      control: "MyButton",
 *      id: "foo",     
 *      content: "Hello, world."
 *  }
 * 
 * The special "control" property determines the class of the control. 
 * The second form creates a plain HTML element:
 * 
 *  {
 *      html: "<div/>",
 *      id: "foo"
 *  }
 * 
 * The "id" property determines the ID *and* has the side effect of creating
 * an element reference so the logical parent can find that control later.
 * The remainder of the JSON properties are invoked as setters on the new
 * control.
 * 
 */
function controlFromJson( json, logicalParent ) {
    
    var isControl = ( json.control !== undefined );
    var isHtml = ( json.html != undefined );
    
    if ( !isControl && !isHtml ) {
        // Regular object, return as is.
        return json;
    }
    
    var properties = {};
    for ( var key in json ) {
        // Skip properties we're handling specially.
        if ( !( (isControl && key === "control" ) || ( isHtml && key === "html" ))) {
            var value = valueFromJson( json[ key ], logicalParent );
            properties[ key ] = value;
        }
    }
    
    var control;
    if ( isHtml ) {
        var html = json.html;
        control = Control( html ).properties( properties );
    } else {
        var classFn = Control._convertToClass( json.control );
        control = classFn.create( properties );
    }
    
    var id = json.id;
    if ( id ) {
        // Store the element reference on the control(s).
        var elementReference = "$" + id;
        var logicalParentClass = logicalParent.constructor;
        var elementFunction = logicalParentClass.prototype[ elementReference ]; 
        if ( !elementFunction ) {
            elementFunction = function( elements ) {
                return this.referencedElement( elementReference, elements );
            };
            logicalParentClass.prototype[ elementReference ] = elementFunction;
        }
        logicalParent.referencedElement( elementReference, control );
    }
    
    return control;
}

/*
 * Given an element, return its contents if they're "significant".
 * Significant contents contain at least one node that's something other than
 * whitespace or comments. If there are no significant contents, return null.
 */
function significantContents( element ) {

    var content = Control( element ).content();
    
    if ( typeof content === "string" ) {
        if ( $.trim( content ).length > 0 ) {
            return content;                     // Found significant text
        }
    }
    
    // Content is an array
    for ( var i = 0, length = content.length; i < length; i++ ) {
        var c = content[i];
        if ( typeof c === "string" ) {
            if ( $.trim( c ).length > 0 ) {
                return content;                 // Found significant text
            }
        } else if ( c.nodeType !== 8 /* Comment node */ ) {
            return content;                     // Found some real element
        }
    }
    
    return null;    // Didn't find anything significant
}

/*
 * Determine the value of the given JSON object found during the processing
 * of control JSON to render a control.
 * 
 * If the supplied json is a JavaScript object, it will be treated as a control
 * and created from that object's properties.
 * If it's an array, its items will be mapped to their values using this same
 * function.
 * Otherwise, the object is returned as is.
 * 
 * The "logical parent" is the control whose JSON defined the elements being
 * created. The logical parent for a given element may not be the element's
 * immediate parent in the DOM; it might be higher up.
 */
function valueFromJson( json, logicalParent ) {
    var value;
    if ( $.isArray( json ) ) {
        value = [];
        for ( var i = 0; i < json.length; i++ ) {
            var item = json[i];
            var itemValue = valueFromJson( item, logicalParent );
            // When adding jQuery object to array, just add their element.
            if ( itemValue instanceof jQuery ) {
                itemValue = itemValue[0];
            }
            value.push( itemValue );
        }
    } else if ( typeof json === "object" ) {
        value = controlFromJson( json, logicalParent );
    } else {
        value = json;
    }
    return value;
}

/*
 * More factories for getter/setters of various types.
 */
$.extend( Control.property, {
    
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
$.extend( Control.prototype, {
            
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
    
    /*
     * The name of the control's class.
     * This shorthand is useful for quickly getting the name in the debugger
     * when one is holding a reference to a control.
     */
    className: function() {
        return this.constructor.className;
    },
    
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
            var result;
            if ( $element.isInputElement() ) {
                // Return input element value.
                result = $element.val();
            } else {
                // Return HTML contents in a canonical form.
                var resultContainsStrings = false;
                result = $element.contents().map( function( index, item ) {
                    if ( item.nodeType === 3 ) {
                        // Return text as simple string
                        resultContainsStrings = true;
                        return item.nodeValue;
                    } else {
                        return item;
                    }
                });
                if ( resultContainsStrings && result.length === 1 ) {
                    // Return the single string instead of an array.
                    result = result[0];
                }
            }
            return result;
        } else {
            
            // Setting contents.
            
            // Cast arguments to an array.
            var array = ( arguments.length > 1 )
                ? arguments                 // set of parameters
                : value instanceof jQuery
                    ? value.get()           // convert jQuery object to array 
                    : $.isArray( value )
                        ? value             // single array parameter
                        : [ value ];        // singleton parameter

            return this.each( function( index, element ) {
                var $element = Control( element );
                if ( $element.isInputElement() ) {
                    // Set input element value.
                    $element.val( value );
                } else {
                    // Set HTML contents.

                    // We're about to blow away the contents of the element
                    // via $empty(), but the new content value might actually
                    // already be deeper in the element's existing content.
                    // To ensure that data, etc., get preserved, first detach
                    // the existing contents.
                    $element.children().detach();

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
     * 
     * If no callback function is supplied, this returns true if all controls
     * are in the document, and false if not.
     */
    inDocument: function( callback ) {
        if ( callback === undefined ) {
            
            // See if controls are in document.
            for ( var i = 0; i < this.length; i++ ) {
                if ( !( $.contains( document.body, this[i] ) || document.body === this[i] )) {
                    // At least one control is not in the document.
                    return false;
                }
            }
            // All controls are in the document.
            return true;
            
        } else {

            // Invoke callback immediately for controls already in document,
            // queue a callback for those which are not.
            var callbacks = [];
            for ( var i = 0; i < this.length; i++ ) {
                var $element = this.eq(i);
                var element = $element[0];
                if ( $.contains( document.body, element ) || document.body === element ) {
                    // Element already in document
                    callback.call( $element, $element );
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

        }
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
            : ( $.inArray( this[0].nodeName.toLowerCase(), inputTags ) >= 0 );
    },
    
    /*
     * Apply the indicated JSON to the control. Each key "foo:" in the JSON
     * will invoke the foo() setter. The value of the "foo:" key will be passed
     * to that setter. If the value is itself a JSON object, it will be
     * reconstituted into HTML, or controls, or an array.
     * 
     * This is similar to properties(), but that function doesn't attempt any
     * processing of the values.
     */
    json: function( json ) {
        for ( var key in json ) {
            if ( this[ key ] === undefined ) {
                var message = "JSON specified undefined key \"" + propertyName + "\" on control class \"" + this.className() + "\".";
                throw message;
            }
            var value = valueFromJson( json[ key ], this );
            this[ key ].call( this, value );
        }
        return this;
    },
    
    /*
     * Experimental function like eq, but faster because it doesn't manipulate
     * the selector stack.
     */
    nth: function( index ) {
        return this.constructor( this[ index ] );
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
     */
    properties: function( properties ) {
        for ( var propertyName in properties ) {
            if ( this[ propertyName ] === undefined ) {
                var message = "Tried to access undefined setter function for property \"" + propertyName + "\" on control class \"" + this.className() + "\".";
                throw message;
            }
            var value = properties[ propertyName ];
            this[ propertyName ].call( this, value );
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
     * Save or retrieve an element associated with the control using the
     * given key. For a collection of controls, the getter maps the collection
     * to a collection of the corresponding elements.
     */
    referencedElement: function( key, elements ) {
        if ( elements === undefined ) {

            // Map a collection of control instances to the given element
            // defined for each instance.
            elements = [];
            for ( var i = 0, length = this.length; i < length; i++ ) {
                var element = $( this[i] ).data( key );
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
            
        } else {
            for ( var i = 0, length = this.length; i < length; i++ ) {
                $( this[i] ).data( key, elements[i] );
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
     * The current version of QuickUI.
     */
    quickui: "0.8.8", 
    
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
     * Call a function of the same name in a superclass.
     * 
     * E.g., if A is a superclass of B, then:
     * 
     *      A.prototype.calc = function ( x ) {
     *          return x * 2;
     *      }
     *      B.prototype.calc = function ( x ) {
     *          return this._super( x ) + 1;
     *      }
     * 
     *      var b = new B();
     *      b.calc( 3 );         // = 7
     *   
     * This assumes a standard prototype-based class system in which all classes have
     * a member called "superclass" pointing to their parent class, and all instances
     * have a member called "constructor" pointing to the class which created them.
     * 
     * This routine has to do some work to figure out which class defined the
     * calling function. It will have to walk up the class hierarchy and,
     * if we're running in IE, do a bunch of groveling through function
     * definitions. To speed things up, the first call to _super() within a
     * function creates a property called "_superFn" on the calling function;
     * subsequent calls to _super() will use the memoized answer.
     * 
     * Some prototype-based class systems provide a _super() function through the
     * use of closures. The closure approach generally creates overhead whether or
     * not _super() will ever be called. The approach below adds no overhead if
     * _super() is never invoked, and adds minimal overhead if it is invoked.
     * This code relies upon the JavaScript .caller method, which many claims
     * has slow performance because it cannot be optimized. However, "slow" is
     * a relative term, and this approach might easily have acceptable performance
     * for many applications.
     */
    _super: function _super() {
    
        // Figure out which function called us.
        var callerFn = ( _super && _super.caller )
            ? _super.caller             // Modern browser
            : arguments.callee.caller;  // IE9 and earlier
        if ( !callerFn ) {
            return undefined;
        }
        
        // Have we called super() within the calling function before?
        var superFn = callerFn._superFn; 
        if ( !superFn ) {
    
            // Find the class implementing this method.
            var classInfo = findMethodImplementation( callerFn, this.constructor );
            if ( classInfo ) {
                
                var classFn = classInfo.classFn;
                var callerFnName = classInfo.fnName;
                
                // Go up one level in the class hierarchy to get the superfunction.
                superFn = classFn.superclass.prototype[ callerFnName ];
                
                // Memoize our answer, storing the value on the calling function,
                // to speed things up next time.
                callerFn._superFn = superFn;
            }
        }
        
        return superFn
            ? superFn.apply( this, arguments )  // Invoke superfunction
            : undefined;
    }

});
    
/*
 * Find which class implements the given method, starting at the given
 * point in the class hierarchy and walking up.
 *
 * At each level, we enumerate all class prototype members to search for a
 * function identical to the method we're looking for.
 * 
 * Returns the class that implements the function, and the name of the class
 * member that references it. Returns null if the class was not found.
 */
function findMethodImplementation( methodFn, classFn ) {
    
    // See if this particular class defines the function.
    var prototype = classFn.prototype;
    for ( var key in prototype ) {
        if ( prototype[ key ] === methodFn ) {
            // Found the function implementation.
            // Check to see whether it's really defined by this class,
            // or is actually inherited.
            var methodInherited = classFn.superclass
                ? prototype[ key ] === classFn.superclass.prototype[ key ]
                : false;
            if ( !methodInherited ) {
                // This particular class defines the function.
                return {
                    classFn: classFn,
                    fnName: key
                };
            }
        }
    }

    // Didn't find the function in this class.
    // Look in parent classes (if any).
    return classFn.superclass
        ? findMethodImplementation( methodFn, classFn.superclass )
        : null;
}

// Expose Control class as a global.
window.Control = Control;

})( jQuery );
