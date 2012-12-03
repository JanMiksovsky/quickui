###
This preserves jQuery's $.browser facility, which is deprecated in jQuery 1.9.
It's all too common for a control to need to work around subtle bugs in
browsers -- most often IE 8, but they all have quirks -- and these bugs are
nearly never detectable by general feature-detection systems like Modernizr.
So Control.browser supports the same properties as jQuery.browser used to.
###

userAgent = navigator.userAgent.toLowerCase()
userAgentMatch = /(chrome)[ \/]([\w.]+)/.exec( userAgent ) \
  or /(webkit)[ \/]([\w.]+)/.exec( userAgent ) \
  or /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( userAgent ) \
  or /(msie) ([\w.]+)/.exec( userAgent ) \
  or userAgent.indexOf( "compatible" ) < 0 and /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( userAgent ) \
  or []
Control.browser = {}
Control.browser[ userAgentMatch[1] ] = true if userAgentMatch[1]?
Control.browser.version = userAgentMatch[2] if userAgentMatch[2]?

# Chrome is Webkit, but Webkit is also Safari.
if Control.browser.chrome
  Control.browser.webkit = true
else if Control.browser.webkit
  Control.browser.safari = true  
