/*
 * Execute a shell command.
 */
module.exports = function( grunt ) {

    var child_process = require( "child_process" );

    grunt.registerHelper( "exec", function( opts, done ) {
        var command = opts.cmd + " " + opts.args.join( " " );
        child_process.exec( command, opts.opts, function( code, stdout, stderr ) {
            if( !done ){
                return;
            }
            if( code === 0 ) {
                done( null, stdout, code );
            } else {
                done( code, stderr, code );
            }
        });
    });

}
