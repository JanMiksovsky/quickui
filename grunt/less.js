/*
 * LESS support for Grunt.
 */
module.exports = function( grunt ) {

    var fs = require( "fs" );
    var path = require( "path" );
    
    grunt.registerHelper( "lessc", function( src, dest, done ) {
        var args = {
            cmd: "lessc",
            args: [ src, dest ]
        };
        grunt.helper( "exec", args, function( err, stdout, code ) {
            if ( err ) {
                grunt.log.writeln( "lessc failed: " + src );
            } else {
                grunt.log.writeln( "Updated " + dest + "." );
            }
            done( !err );
        });
    });

    grunt.registerMultiTask( "less", "Process LESS files to CSS", function() {
        
        var done = this.async();
        
        var files = grunt.file.expandFiles( this.data.src );
        var dest = this.data.dest;
        
        /*
        if ( !path.existsSync( dest ) ) {
            grunt.log.writeln( "Creating directory " + dest );
            fs.mkdirSync( dest );
        }
        
        grunt.utils.async.forEach( files, function( file, next ) {
            var basename = path.basename( file, ".less" );
            var destinationName = basename + ".css";
            var destinationPath = path.join( dest, destinationName );
            grunt.helper( "lessc", file, destinationPath, function() {
                next();
            });
        }, function() {
            done();
        });
        */
       
        grunt.helper( "lessc", files[0], dest, done );
    });
    
}
