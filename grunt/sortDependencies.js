/*
 * Sorts a list of class file names so that they function properly.
 */
 
var glob = require( "glob-whatev" );
var path = require( "path" );

/*
 * Sort an array of file names of the form Foo.Bar.extension, where Foo is the
 * name of a class that depends on base class Bar, such that the files for
 * base classes come before the files for their dependent subclasses.
 */
exports.sortClassFiles = function() {

    var patterns = flatten( arguments );

    var classFileNames = [];
    for ( var i in patterns ) {
        var fileNames = glob.glob( patterns[i] );
        classFileNames = classFileNames.concat( fileNames );
    }

    var dependencies = [];
    for ( var i = 0; i < classFileNames.length; i++ ) {
        var classFileName = classFileNames[i];
        var basename = path.basename( classFileName );
        var parts = basename.split( "." );
        var className = parts[0];
        var baseClassName = ( parts.length === 2 )
            ? baseClassName = null
            : parts[1];
        var dependency = [ className, baseClassName, classFileName ];
        dependencies.push( dependency );
    }

    var map = sortDependencies( dependencies );

    var sortedFileNames = [];
    for ( var i = 0; i < map.length; i++ ) {
        sortedFileNames.push( map[i][2] );
    }

    // console.log( sortedFileNames );

    return sortedFileNames;
};

/*
 * Sort an array representing a set of dependencies, such that each item
 * in the result comes after any items its dependent upon.
 * 
 * The dependency map is represented as an array with tuple values.
 * Each tuple takes the form (key, dependsOn, [data...]), where dependsOn can
 * refer to the key of an item that entry depends on. E.g., if the
 * map looks like:
 * 
 * [
 *     ("Bar", "Foo", "Goodbye"),  # Bar depends on Foo
 *     ("Foo", None, "Hello")      # Foo has no dependencies
 * ]
 * 
 * Sorting these dependencies will return the array with the "Foo"
 * tuple first, followed by the "Bar" tuple, because Bar depends on Foo.
 */
function sortDependencies( dependencies ) {

    // Build the list of keys.
    var keys = [];
    for ( var i = 0; i < dependencies.length; i++ ) {
        keys.push( dependencies[i][0] );
    }

    var unsorted = dependencies.slice();    // Entries not yet sorted.
    var sorted_keys = [];                   // Keys already sorted.
    var sorted = [];                        // Entries already sorted.

    // Each pass through the map should sort at least one item.
    // This gives us a maximum number of passes as n*(n+1) / 2.
    var max_pass = ( dependencies.length * ( dependencies.length + 1 ) ) / 2;
    for ( var i = 0; i < max_pass; i++ ) {
        // On each pass, we pull out anything that has no dependencies,
        // is depend on an item which has already been sorted, or is
        // dependent on something not in this map.
        var dependency = unsorted.shift();
        var key = dependency[0];
        var dependsOn = dependency[1];
        if ( dependsOn === null
            || sorted_keys.indexOf( dependsOn ) >= 0
            || keys.indexOf( dependsOn ) < 0 ) {
            
            sorted_keys.push( key );
            sorted.push( dependency );
            if ( unsorted.length === 0 ) {
                // Done
                break;
            }
        } else {
            unsorted.push( dependency ); // Defer sorting for a later pass.
        }
    }

    if ( unsorted.length > 0 ) {
        throw "Dependency map contains a circular reference.";
    }

    return sorted;
}

/* Flatten the given array. */
function flatten( a ) {
    var results;
    var isArray = ( a.length !== undefined && typeof a !== "string" );
    if ( isArray ) {
        results = []
        for ( var i = 0; i < a.length; i++ ) {
            var result = flatten( a[i] );
            results = results.concat( result );
        }
    } else {
        results = [ a ];
    }
    return results;
}