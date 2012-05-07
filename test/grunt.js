// Build tests.

module.exports = function(grunt) {

    grunt.loadTasks( "../src/grunt" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            controls: {
                src: [
                    "sample.coffee",    // Creates sample classes used by other tests
                    "control.coffee",   // Most basic, so helpful to have run first
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
                dest: "unittests.js"
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
