/* A control whose prototype hosts other controls. */
var SimpleHost = Control.sub({
    className: "SimpleHost",
    inherited: {
        content: [
            " Text ",
            {
                control: "Simple",
                content: "Hello, world!"
            },
            " "
        ]
    }
});

