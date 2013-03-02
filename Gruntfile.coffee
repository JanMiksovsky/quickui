#
# Build QuickUI runtime with Grunt.
#
module.exports = ->

  @loadNpmTasks "grunt-contrib-coffee"
  @loadNpmTasks "grunt-contrib-concat"
  @loadNpmTasks "grunt-contrib-less"
  
  @initConfig
    pkg: @file.readJSON "package.json"

    coffee:
      quickui:
        files: [
          # "build/*.js": "src/*.coffee"
          expand: true
          cwd: "src/"
          src: "*.coffee"
          dest: "build/"
          ext: ".js"
        ]
        options:
          bare: true
      test:
        files:
          "test/unittests.js": [
            # Basic facilities; helpful to put these first.
            "test/control.coffee"
            "test/sub.coffee"
            
            # Sample classes used by following tests
            "test/sample.coffee"

            # Other services
            "test/content.coffee"
            "test/inDocument.coffee"
            "test/json.coffee"
            "test/layout.coffee"
            "test/localization.coffee"
            "test/properties.coffee"
            "test/rehydrate.coffee"
            "test/styles.coffee"
            "test/super.coffee"
            "test/utilities.coffee"
          ]

    concat:
      quickui:
        src: [
          "src/intro.js"      # Start of function wrapper
          "build/control.js"  # Defines Control class; must come second.
          "build/browser.js"
          "build/content.js"
          "build/inDocument.js"
          "build/json.js"
          "build/layout.js"
          "build/localization.js"
          "build/properties.js"
          "build/rehydrate.js"
          "build/styles.js"
          "build/super.js"
          "build/utilities.js"
          "src/outro.js"      # End of function wrapper.
        ]
        dest: "quickui.js"

    min:
      dist:
        src: [ "quickui.js" ]
        dest: "quickui.min.js"
  
  # Default task.
  @registerTask "default", [ "coffee", "concat" ]
