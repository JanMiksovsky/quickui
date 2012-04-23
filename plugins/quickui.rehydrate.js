/*
 * Rehydrate plugin for QuickUI controls.
 * 
 * This takes static HTML created in normal means for SEO purposes, and looks for
 * elements decorated with data- properties indicating which elements should be
 * reconstituted as live QuickUI controls.
 */

( function( jQuery ) {
    
    /*
     * Rehydrate controls from static HTML.
     */
    Control.fn.rehydrate = function() {
        
        // Process any contained controls first.
        var subcontrols = this.find("[data-control]").get();
        if ( subcontrols.length > 0 ) {
            // Reverse order so we work from leaves towards roots.
            subcontrols = subcontrols.reverse();
            $.each( subcontrols, function( index, element ) {
                rehydrateControl( element );
            });
        }
        
        // Process top elements if they're controls.
        // Collect the processed controls, which may differ from the original
        // elements if the existing elements didn't have they right tags.
        var $controls = Control();
        this.each( function( index, element ) {
            var $element = Control( element );
            var $control = $element.data( "control" )
                ? rehydrateControl( element )
                : $element;
            $controls = $controls.add( $control );
        });

        // Return the top elements, potentially as controls.        
        return $controls.cast();
    };
    
    /*
     * Rehydrate the given element as a control.
     */
    function rehydrateControl ( element ) {

        // Extract the control class from the element's "control" property
        // and remove it from the element.       
        var $element = $( element );
        var className = $element.data( "control" );
        if ( !className ) {
            return;
        }
        $element.removeAttr( "data-control" );
        var controlClass = Control.getClass( className );

        // Extract properties. Compound properties (those defined in children)
        // will get removed from the control content at this point.
        var lowerCaseProperties = $.extend( {},
            getPropertiesFromAttributes( element ),
            getCompoundPropertiesFromChildren( element )
        );
        var properties = restorePropertyCase( controlClass, lowerCaseProperties );
        
        // Create the control.
        return $( element ).control( controlClass, properties );
    }
    
    /*
     * Return the properties indicated on the given element's attributes.
     */
    function getPropertiesFromAttributes( element ) {
        
        var properties = {};
        var attributes = element.attributes;
        var regexDataProperty = /^data-(.+)/;
        
        for ( var i = 0, length = attributes.length; i < length; i++ ) {
            var attributeName = attributes[i].name;
            var match = regexDataProperty.exec( attributeName );
            if ( match ) {
                var propertyName = match[1];
                if ( propertyName !== "control" ) {
                    properties[ propertyName ] = attributes[i].value;
                }
            }
        }
        
        // Remove any data properties we've processed.
        // Removing during the loop above would complicate things, since
        // we also want to process the properties in the order they're defined.
        var $element = $( element );
        for ( var key in properties ) {
            $element.removeAttr( "data-" + key );
        }
        
        return properties;
    }
    
    /*
     * Return any compound properties found in the given element's children.
     */
    function getCompoundPropertiesFromChildren( element ) {
        var properties = {};
        $( element )
            .children()
            .filter( "[data-property]" )
            .each( function( index, element ) {
                var $element = Control( element );
                var propertyName = $element.attr( "data-property" );
                if ( propertyName !== "control" ) {
                    var propertyValue = $element.content();
                    properties[ propertyName ] = propertyValue;
                    
                    if ( propertyValue instanceof jQuery ) {
                        // Detach before removing so we preserve subcontrols.
                        propertyValue.detach();
                    }
                }
            })
            .remove();
        return properties;
    }
    
    /*
     * Map the given property dictionary, in which all property names may
     * be in lowercase, to the equivalent camelCase names, using the given
     * control class's prototype for reference.
     * 
     * Properties which are not found in the control class are dropped.
     */
    function restorePropertyCase( controlClass, properties ) {
        
        if ( $.isEmptyObject( properties ) ) {
            return properties;
        }
        
        // Build a map of properties available on the control.
        // This can be lossy, but it'd be bad practice to have two properties
        // on the same class that differ only in case.
        var mapLowerCaseToCamelCase = {};
        for ( var camelCaseName in controlClass.prototype ) {
            var lowerCaseName = camelCaseName.toLowerCase();
            mapLowerCaseToCamelCase[ lowerCaseName ] = camelCaseName;
        }
        
        var result = {};
        for ( var propertyName in properties ) {
            var camelCaseName = mapLowerCaseToCamelCase[ propertyName.toLowerCase() ];
            if ( camelCaseName ) {
                result[ camelCaseName ] = properties[ propertyName ];
            }
        }
        
        return result;
    }
    
})( jQuery );

/*
 * Auto-loader for rehydration.
 * Set data-create-controls="true" on the body tag to have the current
 * page automatically rehydrated on load.
 */
jQuery( function() {
    var $body = Control( "body" );
    if ( $body.data( "create-controls" ) ) {
        $body.rehydrate();
    }
});
