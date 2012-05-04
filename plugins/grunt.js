// Build CoffeeScript plugin.

module.exports = function(grunt) {

    grunt.loadTasks( "../src/grunt" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            controls: {
                src: "*.coffee",
                dest: "quickui.coffee.js"
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
