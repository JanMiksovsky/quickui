﻿/* A control whose prototype hosts other controls. */
var SimpleHost = Control.subclass({
    className: "SimpleHost",
    content: [
        " Text ",
        {
            control: "Simple",
            content: "Hello, world!"
        },
        " "
    ]
});

