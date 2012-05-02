
/*
CoffeeScript tests
*/

(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.coffeeTests = function() {
    var Greet, Simple;
    Simple = (function(_super) {

      __extends(Simple, _super);

      function Simple() {
        return this.coffee(arguments);
      }

      return Simple;

    })(Control);
    Greet = (function(_super) {

      __extends(Greet, _super);

      function Greet() {
        return this.coffee(arguments);
      }

      Greet.prototype.inherited = {
        content: [
          "Hello ", {
            html: "<span>",
            id: "Greet_content"
          }
        ]
      };

      Greet.prototype.content = Control.chain("$Greet_content", "content");

      return Greet;

    })(Simple);
    test("CoffeeScript: create simple class", function() {
      var simple;
      simple = Simple.create("Hello");
      ok(simple instanceof jQuery);
      ok(simple instanceof Control);
      ok(simple instanceof Simple);
      ok(simple instanceof Simple.prototype.init);
      equal(simple.className, "Simple");
      equal(simple.classHierarchy, "Simple Control");
      return equal(simple.content(), "Hello");
    });
    return test("CoffeeScript: create subclass", function() {
      var greet;
      greet = Greet.create("Ann");
      ok(greet instanceof Simple);
      ok(greet instanceof Greet);
      equal(greet.className, "Greet");
      equal(greet.classHierarchy, "Greet Simple Control");
      equal(greet.content(), "Ann");
      return equal(greet.text(), "Hello Ann");
    });
  };

}).call(this);
