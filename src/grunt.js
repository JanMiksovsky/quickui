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
                    "content.coffee",
                    "properties.coffee",
                    "inDocument.coffee",
                    "layout.coffee",
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
