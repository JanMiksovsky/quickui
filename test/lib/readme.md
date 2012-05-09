This contains files from the Globalize project at http://github.com/jquery/globalize.
QuickUI uses Globalize as an *optional* component. If Globalize is loaded,
QuickUI controls can override their culture() property to perform culture-
specific work. Such controls should generally fall back to default behavior if
Globalize is not loaded.

These files only appear in the QuickUI repo so the unit test suite can test the
base implementation of the culture() property. (IE 9, for example, won't load
these files directly from GitHub.) If these files ever become available in
hosted versions, the test suite should be updated to use those, and these files
can be dropped.
