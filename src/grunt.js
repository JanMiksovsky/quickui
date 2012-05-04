// Build CoffeeScript plugin.

module.exports = function(grunt) {

    grunt.loadTasks( "../src/grunt" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            controls: {
                src: [
                    "control.coffee",   // Defines Control class, must come first.
                    "coffee.coffee",
                    "content.coffee",
                    "inDocument.coffee",
                    "json.coffee",
                    "layout.coffee",
                    "localization.coffee",
                    "properties.coffee",
                    "styles.coffee",
                    "super.coffee",
                    "utilities.coffee"
                ],
                dest: "quickui-pre.js"
            }
        },
        watch: {
            coffee: {
                files: "*.coffee",
                tasks: "coffee"
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee" );
    
};
