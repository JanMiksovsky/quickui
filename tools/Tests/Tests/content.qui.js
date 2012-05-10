/* A control that shows several different ways of defining content. */
var Content = Control.subclass({
    className: "Content",
    inherited: {
        content: [
            " ",
            {
                control: "Simple",
                content: "Hello"
            },
            " ",
            {
                control: "Simple",
                content: "There"
            },
            " ",
            {
                control: "Simple",
                content: " World "
            },
            " "
        ]
    }
});

