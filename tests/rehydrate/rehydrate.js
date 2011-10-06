//
// BoxWithHeading
//
BoxWithHeading = Control.subclass( "BoxWithHeading", function renderBoxWithHeading() {
	this.properties({
		"content": [
			" ",
			this._define( "$BoxWithHeading_heading", Control( "<div id=\"BoxWithHeading_heading\" />" ) ),
			" ",
			this._define( "$BoxWithHeading_content", Control( "<div id=\"BoxWithHeading_content\" />" ) ),
			" "
		]
	}, Control );
});
BoxWithHeading.prototype.extend({
    heading: Control.chain( "$BoxWithHeading_heading", "content" ),
    headingBackground: Control.chain( "$BoxWithHeading_heading", "css/background" ),
    content: Control.chain( "$BoxWithHeading_content", "content" ),
    initialize: function() {
        this.genericIfClassIs( BoxWithHeading );
    }
});

//
// MyButton
//
MyButton = ButtonBase.subclass( "MyButton", function renderMyButton() {
	this.properties({

	}, ButtonBase );
});
MyButton.prototype.extend({
    color: Control.chain( "css/color" ),
    "default": Control.chain( "applyClass/default" ), 
    initialize: function() {
        MyButton.superclass.prototype.initialize.call( this );
        this.genericIfClassIs( MyButton );
    }
})

//
// Sample
//
Sample = Control.subclass( "Sample", function renderSample() {
	this.properties({
		"content": [
			" ",
			"<div>\n        This is a plain div.\n    </div>",
			" ",
			BoxWithHeading.create({
				"content": [
					" ",
					" ",
					"<p>\n            Here's a plain paragraph.\n        </p>",
					" ",
					MyButton.create({
						"content": " OK ",
						"class": "default",
						"color": "red"
					}),
					" ",
					MyButton.create({
						"content": "  Cancel ",
						"generic": "false",
						"color": "blue"
					}),
					" "
				],
				"headingBackground": "lightblue",
				"heading": "This is a box with some <i>buttons</i>:"
			}),
			" "
		]
	}, Control );
});

