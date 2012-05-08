// Generated by CoffeeScript 1.3.1

/*
Shared sample classes used by unit tests.
*/


(function() {
  var createGreetClass,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  createGreetClass = function() {
    return window.Greet = Control.subclass({
      className: "Greet",
      content: [
        "Hello ", {
          html: "<span>Ann</span>",
          id: "name"
        }
      ]
    });
  };

  /*
  General control unit tests
  */


  $(function() {
    test("Create: from scratch", function() {
      var $c;
      $c = Control.create();
      equal($c.attr("class"), "Control");
      return equal($c.control()[0] === $c[0], true);
    });
    test("Create: set properties on constructor", function() {
      var $c;
      $c = Control.create({
        text: "Hello"
      });
      return equal($c.text(), "Hello");
    });
    test("control() on existing div", function() {
      var $c, $element;
      $element = $("<div/>");
      $c = $element.control(Control);
      equal($c.attr("class"), "Control");
      return equal($element.control()[0] === $c[0], true);
    });
    test("control() on multiple divs", function() {
      var $c, $elements, MyControl;
      MyControl = Control.subclass({
        className: "MyControl"
      });
      $elements = $().add("<div/>").add("<div/>");
      $c = $elements.control(MyControl);
      return equal($c.control().length, 2);
    });
    test("control() set properties", function() {
      var $c, $element;
      $element = $("<div/>");
      $c = Control.createAt($element);
      $element.control({
        text: "Hello"
      });
      return equal($c.text(), "Hello");
    });
    test("control() incorporate existing DOM content", function() {
      var $c, $children, $original, MyControl;
      MyControl = Control.subclass({
        className: "MyControl",
        content: [
          "*", {
            html: "<span/>",
            id: "MyControl_content"
          }, "*"
        ]
      });
      MyControl.prototype.content = Control.chain("$MyControl_content", "content");
      $original = $("<div><div>Hello</div><div>world</div></div>");
      $children = $original.children();
      $c = MyControl.createAt($children);
      return equal($c.text(), "*Hello**world*");
    });
    test("control() on existing content preserves existing control", function() {
      var $c, $original, $sub, $subcontrol, MyControl;
      MyControl = Control.subclass({
        className: "MyControl"
      });
      $original = $("<div><div id='subcontrol'/></div>");
      $subcontrol = $original.find("#subcontrol").control(MyControl);
      $c = $original.control(Control);
      $sub = $c.find("#subcontrol").control();
      return equal($sub.attr("class"), "MyControl Control");
    });
    test(":control filter", function() {
      var $c, $combined, $d;
      $c = Control.create();
      $d = $("<div/>");
      $combined = $c.add($d);
      ok($c.is(":control"));
      ok($d.not(":control"));
      ok($combined.is(":control"));
      return ok($combined.filter(":control").length === 1 && $combined.filter(":control")[0] === $c[0]);
    });
    return test("transmute: existing tag doesn't match desired tag", function() {
      var MyButton, c;
      MyButton = Control.subclass({
        className: "MyButton",
        tag: "button"
      });
      c = Control.create("Hello");
      equal(c[0].nodeName.toLowerCase(), "div");
      c = c.transmute(MyButton, true);
      equal(c[0].nodeName.toLowerCase(), "button");
      return equal(c.text(), "Hello");
    });
  });

  /*
  CoffeeScript support unit tests
  */


  $(function() {
    var GreetCoffee, SimpleCoffee;
    SimpleCoffee = (function(_super) {

      __extends(SimpleCoffee, _super);

      SimpleCoffee.name = 'SimpleCoffee';

      function SimpleCoffee() {
        return Control.coffee();
      }

      return SimpleCoffee;

    })(Control);
    GreetCoffee = (function(_super) {

      __extends(GreetCoffee, _super);

      GreetCoffee.name = 'GreetCoffee';

      function GreetCoffee() {
        return Control.coffee();
      }

      GreetCoffee.prototype.inherited = {
        content: [
          "Hello ", {
            html: "<span>Ann</span>",
            id: "GreetCoffee_content"
          }
        ]
      };

      GreetCoffee.prototype.content = Control.chain("$GreetCoffee_content", "content");

      return GreetCoffee;

    })(SimpleCoffee);
    test("CoffeeScript: create SimpleCoffee class", function() {
      var c;
      c = SimpleCoffee.create("Hello");
      ok(c instanceof jQuery);
      ok(c instanceof Control);
      ok(c instanceof SimpleCoffee);
      ok(c instanceof SimpleCoffee.prototype.init);
      equal(SimpleCoffee.className, "SimpleCoffee");
      equal(SimpleCoffee.classHierarchy, "SimpleCoffee Control");
      return equal(c.content(), "Hello");
    });
    return test("CoffeeScript: create subclass", function() {
      var c;
      c = GreetCoffee.create("Ann");
      ok(c instanceof SimpleCoffee);
      ok(c instanceof GreetCoffee);
      equal(GreetCoffee.className, "GreetCoffee");
      equal(GreetCoffee.classHierarchy, "GreetCoffee SimpleCoffee Control");
      equal(c.content(), "Ann");
      return equal(c.text(), "Hello Ann");
    });
  });

  /*
  Content unit tests
  */


  $(function() {
    test("Content: HTML text", function() {
      var $c;
      $c = Control.create();
      $c.content("Hello");
      equal($c.content(), "Hello");
      return equal($c.html(), "Hello");
    });
    test("Content: HTML text, return canonical form", function() {
      var $c;
      $c = Control.create();
      $c.content(["Hello"]);
      equal($c.content(), "Hello");
      return equal($c.html(), "Hello");
    });
    test("Content: HTML array", function() {
      var $c, b, content;
      $c = Control.create();
      b = $("<b>there</b>")[0];
      $c.content(["Hello", b, "world"]);
      equal($c.html().toLowerCase(), "hello<b>there</b>world");
      content = $c.content();
      equal(content[0], "Hello");
      equal(content[1], b);
      return equal(content[2], "world");
    });
    test("Content: input element", function() {
      var $c;
      $c = Control("<input type='text'/>");
      $c.content("Hello");
      equal($c.content(), "Hello");
      return equal($c.val(), "Hello");
    });
    return test("Content: jQuery object", function() {
      var $c, content;
      $c = Control.create();
      $c.content("<h1>Hello</h1>");
      content = $c.content();
      ok(content instanceof jQuery);
      equal(content[0].nodeName.toLowerCase(), "h1");
      return equal(content.html(), "Hello");
    });
  });

  /*
  inDocument unit tests
  */


  $(function() {
    var InDocumentSample, addControl, createdBeforeReady, pendingCount;
    InDocumentSample = Control.subclass({
      className: "InDocumentSample",
      prototype: {
        inDocumentCalled: Control.property.bool(),
        initialize: function() {
          return this.inDocument(function() {
            return this.inDocumentCalled(true);
          });
        }
      }
    });
    addControl = function(control) {
      $("#qunit-fixture").append(control);
      if (Control._elementInsertionInterval) {
        return Control._checkForElementInsertion();
      }
    };
    pendingCount = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = Control._elementInsertionCallbacks) != null ? _ref1.length : void 0) != null ? _ref : 0;
    };
    /*
      Create a control *before* the document body is ready. Any inDocument()
      callbacks queued up here should still work.
      
      Note: This control creation effects the pending count, and so the execution
      order of the tests can be affected by when QUnit runs this test. If
      necessary, we could set QUnit.config.reorder = false.
    */

    createdBeforeReady = InDocumentSample.create();
    test("inDocument: control created before document ready", function() {
      addControl(createdBeforeReady);
      equal(pendingCount(), 0);
      return ok(createdBeforeReady.inDocumentCalled());
    });
    test("inDocument: typical invocation in control created outside document and then added", function() {
      var $c;
      equal(pendingCount(), 0);
      $c = InDocumentSample.create();
      equal(pendingCount(), 1);
      ok(!$c.inDocumentCalled());
      addControl($c);
      equal(pendingCount(), 0);
      return ok($c.inDocumentCalled());
    });
    test("inDocument: nested invocations outside document", function() {
      var $c;
      equal(pendingCount(), 0);
      $c = InDocumentSample.create().content(InDocumentSample.create());
      equal(pendingCount(), 2);
      ok(!$c.inDocumentCalled());
      addControl($c);
      equal(pendingCount(), 0);
      return ok($c.inDocumentCalled());
    });
    /*  
    inDocument callbacks should get invoked in reverse document order, so
    if we have a control containing two children A and B, in that order,
    then B's callbacks should get invoked before A's.
    */

    test("inDocument: invocations happen in reverse document order", function() {
      var $a, $b, $c;
      equal(pendingCount(), 0);
      $a = void 0;
      $b = void 0;
      $c = void 0;
      $a = InDocumentSample.create("A").inDocument(function() {
        return ok($b.inDocumentCalled());
      });
      $b = InDocumentSample.create("B").inDocument(function() {
        return ok(!$a.inDocumentCalled());
      });
      $c = Control.create().content([$a, $b]);
      equal(pendingCount(), 4);
      addControl($c);
      return equal(pendingCount(), 0);
    });
    return test("inDocument: create controls on element in document", function() {
      var $c;
      equal(pendingCount(), 0);
      $c = $("<div/>");
      addControl($c);
      equal(pendingCount(), 0);
      $c = $c.control(InDocumentSample);
      equal(pendingCount(), 0);
      return ok($c.inDocumentCalled());
    });
  });

  /*
  Control JSON unit tests
  */


  $(function() {
    test("json: plain text", function() {
      var c;
      c = Control.create();
      c.json({
        content: "Hello"
      });
      return equal(c.content(), "Hello");
    });
    test("json: html", function() {
      var c;
      c = Control.create();
      c.json({
        content: {
          html: "<h1>Hello</h1>"
        }
      });
      return equal(c.html().toLowerCase(), "<h1>hello</h1>");
    });
    test("json: html tag singleton without brackets", function() {
      var c;
      c = Control.create();
      c.json({
        content: {
          html: "span"
        }
      });
      return equal(c.html().toLowerCase(), "<span></span>");
    });
    test("json: control", function() {
      var c, greet;
      createGreetClass();
      Greet.prototype.extend({
        name: Control.chain("$name", "content")
      });
      c = Control.create();
      c.json({
        content: {
          control: "Greet",
          name: "Bob"
        }
      });
      greet = c.content().control();
      ok(greet instanceof Greet);
      return equal(greet.text(), "Hello Bob");
    });
    test("json: explicit content array", function() {
      var c;
      c = Control.create();
      c.json({
        content: ["Hello", "world"]
      });
      equal(c.contents().length, 2);
      equal(c.contents().eq(0).text(), "Hello");
      return equal(c.contents().eq(1).text(), "world");
    });
    return test("json: implicit content array", function() {
      var c;
      c = Control.create();
      c.json(["Hello", "world"]);
      equal(c.contents().length, 2);
      equal(c.contents().eq(0).text(), "Hello");
      return equal(c.contents().eq(1).text(), "world");
    });
  });

  /*
  Layout unit tests
  */


  $(function() {});

  /*
  Localization unit tests
  */


  /*
  Control property declaration unit tests
  */


  $(function() {
    test("Properties: chain: root content", function() {
      var $c, result;
      createGreetClass();
      Greet.prototype.foo = Control.chain("content");
      $c = Greet.create();
      result = $c.foo();
      equal(result[0], "Hello ");
      equal($(result[1]).html(), "Ann");
      $c.foo("world");
      return equal($c.html(), "world");
    });
    test("Properties: chain: element", function() {
      var $c, $element;
      createGreetClass();
      Greet.prototype.name = Control.chain("$name");
      $c = Greet.create();
      $element = $c.$name();
      equal($element[0], $c.find("#name")[0]);
      return equal($element.html(), "Ann");
    });
    test("Properties: chain: element content", function() {
      var $c;
      createGreetClass();
      Greet.prototype.name = Control.chain("$name", "content");
      $c = Greet.create();
      equal($c.name(), "Ann");
      $c.name("Bob");
      return equal($c.text(), "Hello Bob");
    });
    test("Properties: chain: subcontrol property", function() {
      var $c, MyControl;
      createGreetClass();
      Greet.prototype.name = Control.chain("$name", "content");
      MyControl = Control.subclass({
        className: "MyControl",
        content: {
          control: "Greet",
          id: "greet"
        }
      });
      MyControl.prototype.name = Control.chain("$greet", "name");
      $c = MyControl.create();
      equal($c.name(), "Ann");
      $c.name("Bob");
      return equal($c.$greet().text(), "Hello Bob");
    });
    test("Properties: chain: element content with iteration", function() {
      var $c, $g, $inner1, $inner2;
      createGreetClass();
      Greet.prototype.name = Control.chain("$name", "content");
      $inner1 = Greet.create({
        name: "Ann"
      });
      $inner2 = Greet.create({
        name: "Bob"
      });
      $c = Control.create({
        content: [$inner1, "/", $inner2]
      });
      equal($c.text(), "Hello Ann/Hello Bob");
      $g = Greet($c.find(".Greet"));
      equal($g.name(), "Ann");
      $g.name("Carol");
      return equal($c.text(), "Hello Carol/Hello Carol");
    });
    test("Properties: chain: element content with side effect function", function() {
      var $c;
      createGreetClass();
      Greet.prototype.name = Control.chain("$name", "content", function(name) {
        return this.data("_name", name);
      });
      $c = Greet.create();
      $c.name("Ann");
      equal($c.name(), "Ann");
      return equal($c.data("_name"), "Ann");
    });
    test("Properties: chain: chaining", function() {
      var $c, result;
      createGreetClass();
      Greet.prototype.extend({
        foo: Control.chain("content"),
        bar: Control.chain("prop/display")
      });
      $c = Greet.create();
      result = $c.foo("Hello").bar("inline");
      equal($c.content(), "Hello");
      equal($c.prop("display"), "inline");
      return equal(result, $c);
    });
    test("Properties: chain: functions with parameters", function() {
      var $c, MyControl;
      MyControl = Control.subclass({
        className: "MyControl"
      });
      MyControl.prototype.display = Control.chain("css/display");
      $c = MyControl.create();
      $c.css("display", "block");
      equal($c.display(), "block");
      $c.display("none");
      equal($c.css("display"), "none");
      return equal($c.display(), "none");
    });
    test("Properties: chain: function undefined", function() {
      var $c, MyControl;
      MyControl = Control.subclass({
        className: "MyControl"
      });
      MyControl.prototype.foo = Control.chain("bar");
      $c = MyControl.create();
      return raises(function() {
        return $c.foo();
      });
    });
    test("Properties: Define method", function() {
      var $c, $elements, MyControl, result;
      MyControl = Control.subclass({
        className: "MyControl"
      });
      MyControl.prototype.foo = function() {
        return this.data("_calledFoo", true);
      };
      $elements = Control("<div/>").add("<div/>");
      $c = $elements.control(MyControl);
      result = $c.foo();
      equal(result, $c);
      equal($c.eq(0).data("_calledFoo"), true);
      return equal($c.eq(1).data("_calledFoo"), true);
    });
    test("Properties: Define method with iterator()", function() {
      var $c, $elements, MyControl, methodResult;
      MyControl = Control.subclass({
        className: "MyControl"
      });
      MyControl.prototype.foo = Control.iterator(function() {
        return this.data("_calledFoo", true);
      });
      $elements = Control("<div/>").add("<div/>");
      $c = $elements.control(MyControl);
      methodResult = $c.foo();
      equal(methodResult, $c);
      equal($c.eq(0).data("_calledFoo"), true);
      return equal($c.eq(1).data("_calledFoo"), true);
    });
    test("Properties: Define getter/setter with iterator()", function() {
      var $c, $elements, MyControl;
      MyControl = Control.subclass({
        className: "MyControl"
      });
      MyControl.prototype.foo = Control.iterator(function(value) {
        return this.data("_property", value);
      });
      $elements = Control("<div/>").add("<div/>");
      $c = $elements.control(MyControl);
      $c.foo("bar");
      equal($c.eq(0).control().data("_property"), "bar");
      return equal($c.eq(1).control().data("_property"), "bar");
    });
    test("Properties: Define getter/setter with Control.property", function() {
      var $c, $elements, MyControl;
      MyControl = Control.subclass();
      MyControl.prototype.myProperty = Control.property();
      $elements = Control("<div/>").add("<div/>");
      $c = $elements.control(MyControl);
      equal($c.myProperty() === void 0, true);
      $c.myProperty("foo");
      equal($c.eq(0).myProperty(), "foo");
      return equal($c.eq(1).myProperty(), "foo");
    });
    test("Properties: property", function() {
      var $c, result;
      $c = Control.create();
      $c.foo = Control.property();
      equal($c.foo() === void 0, true);
      result = $c.foo("Hello");
      equal(result, $c);
      return equal($c.foo(), "Hello");
    });
    test("Properties: property: bool", function() {
      var $c;
      $c = Control.create();
      $c.foo = Control.property.bool();
      $c.foo("true");
      equal($c.foo(), true);
      $c.foo(false);
      return equal($c.foo(), false);
    });
    return test("Properties: property: integer", function() {
      var $c;
      $c = Control.create();
      $c.foo = Control.property.integer();
      $c.foo("123");
      equal($c.foo(), 123);
      $c.foo(0);
      return equal($c.foo(), 0);
    });
  });

  /*
  Rehydration unit tests
  */


  $(function() {
    test("Rehydrate: simple element with content", function() {
      var $c, $e;
      $e = $("<div data-control='Control'>Hello</div>");
      $c = Control($e).rehydrate();
      ok($c instanceof Control);
      equal($e.attr("data-control"), void 0);
      ok($e.hasClass("Control"));
      return equal($c.content(), "Hello");
    });
    test("Rehydrate: custom content property", function() {
      var $c, $e;
      createGreetClass();
      Greet.prototype.content = Control.chain("$name", "content");
      $e = Control("<div data-control='Greet'>Bob</div>");
      $c = $e.rehydrate();
      equal($c.text(), "Hello Bob");
      return equal($c.content(), "Bob");
    });
    test("Rehydrate: data- property", function() {
      var $c, $e;
      createGreetClass();
      Greet.prototype.name = Control.chain("$name", "content");
      $e = Control("<div data-control='Greet' data-name='Bob'></div>");
      $c = $e.rehydrate();
      ok($c instanceof Greet);
      equal($c.text(), "Hello Bob");
      return equal($c.name(), "Bob");
    });
    test("Rehydrate: compound property", function() {
      var $c, $e;
      createGreetClass();
      Greet.prototype.name = Control.chain("$name", "content");
      $e = Control("<div data-control='Greet'><div data-property='name'>Bob</div></div>");
      equal($e.find("[data-property]").length, 1);
      $c = $e.rehydrate();
      equal($e.find("[data-property]").length, 0);
      equal($c.text(), "Hello Bob");
      return equal($c.name(), "Bob");
    });
    test("Rehydrate: subcontrol", function() {
      var $c, $e, $sub;
      createGreetClass();
      Greet.prototype.content = Control.chain("$name", "content");
      $e = Control("<div data-control='Control'><div data-control='Greet'>Bob</div></div>");
      $c = $e.rehydrate();
      $sub = $c.content().control();
      ok($sub instanceof Greet);
      equal($sub.text(), "Hello Bob");
      return equal($sub.content(), "Bob");
    });
    test("Rehydrate: automatically rehydrate with data-create-controls", function() {
      var $c;
      $c = $("#rehydration-test").control();
      ok($c instanceof Control);
      return equal($c.content(), "Hello");
    });
    return test("Rehydrate: class not found", function() {
      var $e;
      $e = Control("<div data-control='Foo'></div>");
      return raises(function() {
        var $c;
        return $c = $e.rehydrate();
      });
    });
  });

  /*
  CSS helpers unit tests
  */


  $(function() {
    test("Utilities: applyClass", function() {
      var $c;
      $c = Control.create().toggleClass("foo");
      equal($c.applyClass("foo"), true);
      equal($c.applyClass("enabled"), false);
      $c.applyClass("enabled", true);
      equal($c.applyClass("foo"), true);
      return equal($c.applyClass("enabled"), true);
    });
    return test("Utilities: visibility", function() {
      var $c;
      $c = Control.create();
      return equal($c.visibility(), false);
    });
  });

  /*
  _super() method invocation unit tests
  */


  $(function() {
    test("_super(): invoke superclass functions", function() {
      var A, B, C, a, b, c;
      A = Control.subclass({
        className: "A"
      });
      B = A.subclass({
        className: "B"
      });
      C = B.subclass({
        className: "C"
      });
      A.prototype.extend({
        decorate: function(s) {
          return "( a: " + s + " )";
        },
        calc: function(x) {
          return x * 2;
        }
      });
      B.prototype.extend({
        decorate: function(s) {
          return "( b: " + (this._super(s)) + " )";
        },
        calc: function(x) {
          return this._super(x) + 1;
        }
      });
      C.prototype.extend({
        decorate: function(s) {
          return "( c: " + (this._super(s)) + " )";
        }
      });
      c = C.create();
      equal(c.decorate("Hello"), "( c: ( b: ( a: Hello ) ) )");
      equal(c.calc(3), 7);
      b = B.create();
      equal(b.decorate("Hello"), "( b: ( a: Hello ) )");
      equal(b.calc(3), 7);
      a = A.create();
      equal(a.decorate("Hello"), "( a: Hello )");
      return equal(a.calc(3), 6);
    });
    return test("_super(): superclass function undefined", function() {
      var A, B, b;
      A = Control.subclass({
        className: "A"
      });
      B = A.subclass({
        className: "B"
      });
      B.prototype.foo = function() {
        return this._super();
      };
      b = B.create();
      return raises(function() {
        return b.foo();
      });
    });
  });

  /*
  Utilities unit tests
  */


  $(function() {
    test("Utilities: cast: control() on plain jQuery reference returns undefined", function() {
      var $element;
      $element = $("<div/>");
      return equal($element.control(), void 0);
    });
    test("Utilities: cast: two control classes derive from same superclass", function() {
      var $a, $b, $c, $cast, $set, A, B, C;
      A = Control.subclass({
        className: "A"
      });
      B = A.subclass({
        className: "B"
      });
      C = A.subclass({
        className: "C"
      });
      $a = A.create();
      $b = B.create();
      $c = C.create();
      $set = Control("<div/>").append($b).append($a).append($c);
      $cast = $set.children().cast();
      return equal($cast instanceof A, true);
    });
    test("Utilities: cast: control and jQuery mix", function() {
      var $a, $cast, $set, A;
      A = Control.subclass({
        className: "A"
      });
      $a = A.create();
      $set = Control("<div/>").append($a).append($("<div/>"));
      $cast = $set.children().cast();
      return equal($cast instanceof Control, true);
    });
    test("Utilities: each", function() {
      var c, segments;
      c = $("<div>Ann</div><div>Bob</div>").control(Control);
      segments = c.each();
      ok(segments instanceof Array);
      equal(segments.length, 2);
      equal(segments[0].content(), "Ann");
      return equal(segments[1].content(), "Bob");
    });
    test("Utilities: eachControl", function() {
      var $bar, $c, $foo, Bar, Foo, results;
      Foo = Control.subclass({
        className: "Foo"
      });
      Foo.prototype.content = function() {
        return "foo";
      };
      $foo = Foo.create();
      Bar = Control.subclass({
        className: "Bar"
      });
      Bar.prototype.content = function() {
        return "bar";
      };
      $bar = Bar.create();
      $c = Control().add($foo).add($bar);
      results = [];
      $c.eachControl(function(index, $control) {
        return results.push($control.content());
      });
      return deepEqual(results, ["foo", "bar"]);
    });
    test("Utilities: referencedElement: Element function definition", function() {
      var $c;
      createGreetClass();
      $c = Greet.create();
      equal($c.$name().html(), "Ann");
      $c.$name().html("Bob");
      return equal($c.text(), "Hello Bob");
    });
    test("Utilities: referencedElement: Element functions $.end()-able", function() {
      var $c, $result;
      createGreetClass();
      $c = Greet.create();
      $result = $c.$name().end();
      equal($result, $c);
      ok($result instanceof Greet);
      return ok($c.$name() instanceof Control);
    });
    return test("Utilities: propertyVector", function() {
      var $a, $b, $c, vector;
      $a = Control.create("one");
      $b = Control.create("two");
      $c = $a.add($b);
      vector = $c.propertyVector("content");
      deepEqual(vector, ["one", "two"]);
      $c.propertyVector("content", ["un", "deux"]);
      equal($a.content(), "un");
      return equal($b.content(), "deux");
    });
  });

}).call(this);
