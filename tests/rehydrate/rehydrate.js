//
// BoxWithLabel
//
BoxWithLabel = Control.subclass( "BoxWithLabel", function renderBoxWithLabel() {
	this.properties({
		"content": [
			" ",
			this._define( "$BoxWithLabel_label", Control( "<div id=\"BoxWithLabel_label\" />" ) ),
			" ",
			this._define( "$BoxWithLabel_content", Control( "<div id=\"BoxWithLabel_content\" />" ) ),
			" "
		]
	}, Control );
});
BoxWithLabel.prototype.extend({
    label: Control.chain( "$BoxWithLabel_label", "content" ),
    labelBackground: Control.chain( "$BoxWithLabel_label", "css/background" ),
    content: Control.chain( "$BoxWithLabel_content", "content" ),
    initialize: function() {
        this.genericIfClassIs( BoxWithLabel );
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

