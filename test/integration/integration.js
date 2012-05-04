var SampleProperties = Control.subclass({
    className: "SampleProperties",
    content: {
        html: "<span />",
        id: "SampleProperties_content"
    }
});
SampleProperties.prototype.extend({
    content: Control.chain("$SampleProperties_content", "content")
});

var Simple = Control.subclass({
    className: "Simple",
    content: "Hello, world!"
});

var SimpleSpan = Control.subclass({
    className: "SimpleSpan",
    tag: "span"});

var Test = Control.subclass({
    className: "Test",
    content: [
        " ",
        {
            html: "<div />",
            id: "header",
            content: [
                " ",
                {
                    html: "<span />",
                    id: "Test_name"
                },
                ": ",
                {
                    html: "<span />",
                    id: "Test_result"
                },
                " "
            ]
        },
        " ",
        {
            html: "<div />",
            id: "details",
            content: [
                " Actual: ",
                {
                    html: "<span />",
                    id: "htmlActual"
                },
                " ",
                {
                    html: "<div />",
                    id: "Test_test"
                },
                " Expected: ",
                {
                    html: "<span />",
                    id: "htmlExpected"
                },
                " ",
                {
                    html: "<div />",
                    id: "Test_expect"
                },
                " "
            ]
        },
        " "
    ]
});
Test.prototype.extend({
    
    expect: Control.chain("$Test_expect", "content"),
    name: Control.chain("$Test_name", "content"),
    result: Control.chain("$Test_result", "content"),
    test: Control.chain("$Test_test", "content"),
    
    initialize: function() {
        
        var htmlActual = this.$Test_test().html();
        var htmlExpected = this.$Test_expect().html();
        this.$htmlActual().text(htmlActual);
        this.$htmlExpected().text(htmlExpected);
        
        var equal = (htmlActual === htmlExpected);
        this.result(equal ? "Pass" : "Fail");
        this.toggleClass("fail", !equal);
        
        var self = this;
        this.click(function() {
            self.$details().toggle();
        });
    }
});

var TestSuite = Control.subclass({
    className: "TestSuite",
    content: [
        " ",
        "<h1>QuickUI Test Suite</h1>",
        " ",
        {
            control: "Test",
            name: "Plain text macro",
            test: {
                control: "Simple"
            },
            expect: "<div class=\"Simple Control\">Hello, world!</div>"
        },
        " ",
        {
            control: "Test",
            name: "Content property as attribute",
            test: {
                control: "Simple",
                content: "Hi"
            },
            expect: "<div class=\"Simple Control\">Hi</div>"
        },
        " ",
        {
            control: "Test",
            name: "Whitespace",
            test: [
                " ",
                {
                    control: "SimpleSpan",
                    content: "A"
                },
                " ",
                {
                    control: "SimpleSpan",
                    content: "B"
                },
                " "
            ],
            expect: " <span class=\"SimpleSpan Control\">A</span> <span class=\"SimpleSpan Control\">B</span> "
        },
        " ",
        {
            control: "Test",
            name: "No whitespace after tag",
            test: [
                " ",
                {
                    control: "SimpleSpan",
                    content: "A"
                },
                ". "
            ],
            expect: " <span class=\"SimpleSpan Control\">A</span>. "
        },
        " ",
        {
            control: "Test",
            name: "Compound property",
            test: {
                control: "Simple",
                content: "Hi"
            },
            expect: "<div class=\"Simple Control\">Hi</div>"
        },
        " ",
        {
            control: "Test",
            name: "Content property override",
            test: [
                " ",
                {
                    control: "SampleProperties",
                    content: "Foo"
                },
                " "
            ],
            expect: [
                " ",
                {
                    html: "<div class=\"SampleProperties Control\" />",
                    content: [
                        {
                            html: "<span>Foo</span>",
                            id: "SampleProperties_content"
                        }
                    ]
                },
                " "
            ]
        },
        " "
    ]
});

