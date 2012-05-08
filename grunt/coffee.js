/*
 * CoffeeScript support for Grunt.
 * Based on https://github.com/Takazudo/gruntExamples/tree/gruntcoffee/coffee-all-in-one/tasks
 */
module.exports = function( grunt ) {
    
    grunt.registerHelper( "coffee_multi_to_one", function( srcs, dest, done ) {
        srcs = srcs.join(" ");
        var args = {
          cmd: "coffee",
          args: [ "--join", dest, "--compile", srcs ]
        };
        grunt.helper( "exec", args, function( err, stdout, code ){
            if ( err ) {
                grunt.log.writeln( "coffee failed" );
            } else {
                grunt.log.writeln( "Updated " + dest + "." ); 
            }
            done( !err );
        });
    });

    grunt.registerMultiTask( "coffee", "Compile CoffeeScript", function() {
        var done = this.async();
        var files = grunt.file.expandFiles( this.data.src );
        var dest = this.data.dest;
        grunt.helper( "coffee_multi_to_one", files, dest, done);
    });
    
}
