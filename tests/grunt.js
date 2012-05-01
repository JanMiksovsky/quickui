// Build tests.

module.exports = function(grunt) {

    grunt.loadTasks( "../plugins/grunt" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            controls: {
                src: "*.coffee",
                dest: "tests.js"
            }
        },
        watch: {
            coffee: {
                files: "<config:coffee.controls.src>",
                tasks: "coffee"
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee" );
    
};
