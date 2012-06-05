/*
 * Build QuickUI runtime, tests, etc. using Grunt.js
 */
module.exports = function(grunt) {

    grunt.loadTasks( "grunt" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            quickui: {
                src: [
                    "src/sub.coffee",       // Subclassing support; must come first.
                    "src/control.coffee",   // Defines Control class; must come second.
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
                dest: "src/quickui.js"
            },
            test: {
                src: [
                    // Basic facilities; helpful to put these first.
                    "test/sub.coffee",
                    "test/sample.coffee", // Sample classes used by following tests
                    "test/control.coffee",
                    
                    // Other services
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
