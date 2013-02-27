/*
 * Build QuickUI runtime, tests, etc. using Grunt.js
 */
module.exports = function( grunt ) {

    grunt.loadNpmTasks( "grunt-contrib-coffee" );

    // Project configuration.
    grunt.initConfig({
        coffee: {
            quickui: {
                files: {
                    "build/*.js": "src/*.coffee"
                },
                options: {
                    bare: true
                }
            },
            test: {
                files: {
                    "test/unittests.js": [
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
                    ]
                }
            }
        },
        concat: {
            quickui: {
                src: [
                    "src/intro.js",         // Start of function wrapper
                    // "build/sub.js",         // Subclassing support; must come first.
                    "build/control.js",     // Defines Control class; must come second.
                    "build/browser.js",
                    "build/content.js",
                    "build/inDocument.js",
                    "build/json.js",
                    "build/layout.js",
                    "build/localization.js",
                    "build/properties.js",
                    "build/rehydrate.js",
                    "build/styles.js",
                    "build/super.js",
                    "build/utilities.js",
                    "src/outro.js"          // End of function wrapper.
                ],
                dest: "quickui.js"
            }
        },
        min: {
            dist: {
                src: [ "quickui.js" ],
                dest: "quickui.min.js"
            }
        }
    });

    // Default task.
    grunt.registerTask( "default", "coffee concat" );
    
};
