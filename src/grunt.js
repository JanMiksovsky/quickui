// Build CoffeeScript plugin.

module.exports = function(grunt) {

    grunt.loadTasks( "../src/grunt" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            controls: {
                src: [
                    "control.coffee",
                    "json.coffee",
                    "properties.coffee",
                    "layout.coffee",
                    "styles.coffee",
                    "super.coffee"
                ],
                dest: "quickui-pre.js"
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
