var BoxWithHeading = Control.subclass({
    className: "BoxWithHeading",
    content: [
        " ",
        {
            html: "<div />",
            id: "BoxWithHeading_heading"
        },
        " ",
        {
            html: "<div />",
            id: "BoxWithHeading_content"
        },
        " "
    ]
});
BoxWithHeading.prototype.extend({
    heading: Control.chain( "$BoxWithHeading_heading", "content" ),
    headingBackground: Control.chain( "$BoxWithHeading_heading", "css/background" ),
    content: Control.chain( "$BoxWithHeading_content", "content" ),
    initialize: function() {
        this.genericIfClassIs( BoxWithHeading );
    }
});

var MyButton = BasicButton.subclass({
    className: "MyButton"
});
MyButton.prototype.extend({
    color: Control.chain( "css/color" ),
    "default": Control.chain( "applyClass/default" ), 
    initialize: function() {
        this._super();
        this.genericIfClassIs( MyButton );
    }
})

var Sample = Control.subclass({
    className: "Sample",
    content: [
        " ",
        "<div>This is a plain div.</div>",
        " ",
        {
            control: "BoxWithHeading",
            headingBackground: "lightblue",
            heading: "This is a box with some <i>buttons</i>:",
            content: [
                " ",
                " ",
                "<p>Here's a plain paragraph.</p>",
                " ",
                {
                    control: "MyButton",
                    "class": "default",
                    color: "red",
                    content: "OK"
                },
                " ",
                {
                    control: "MyButton",
                    generic: "false",
                    color: "blue",
                    content: "Cancel"
                },
                " "
            ]
        },
        " "
    ]
});

