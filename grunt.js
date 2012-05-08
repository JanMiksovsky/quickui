/*
 * Build QuickUI runtime, tests, etc. using Grunt.js
 */
module.exports = function(grunt) {

    grunt.loadTasks( "src/grunt" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            quickui: {
                src: [
                    "src/control.coffee",   // Defines Control class, must come first.
                    "src/coffee.coffee",
                    "src/content.coffee",
                    "src/inDocument.coffee",
                    "src/json.coffee",
                    "src/layout.coffee",
                    "src/localization.coffee",
                    "src/properties.coffee",
                    "src/rehydrate.coffee",
                    "src/styles.coffee",
                    "src/super.coffee",
                    "src/utilities.coffee"
                ],
                dest: "src/quickui-pre.js"
            },
            test: {
                src: [
                    "test/sample.coffee",    // Creates sample classes used by other tests
                    "test/control.coffee",   // Most basic, so helpful to have run first
                    "test/coffee.coffee",
                    "test/content.coffee",
                    "test/inDocument.coffee",
                    "test/json.coffee",
                    "test/layout.coffee",
                    "test/localization.coffee",
                    "test/properties.coffee",
                    "test/rehydrate.coffee",
                    "test/styles.coffee",
                    "test/super.coffee",
                    "test/utilities.coffee"
                ],
                dest: "test/unittests.js"
            }
        },
        watch: {
            quickui: {
                files: "<config:coffee.quickui.src>",
                tasks: "coffee:quickui"
            },
            test: {
                files: "<config:coffee.test.src>",
                tasks: "coffee:test"
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee" );
    
};
