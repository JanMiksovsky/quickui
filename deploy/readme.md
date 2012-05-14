This folder contains tools to deploy the QuickUI runtime to http://quickui.org.

The deployment process is moving from a couple of bash scripts and Python to
Grunt.js. During this transition, the process is a bit clunky.

1. Run mkdep.py to create the versioned files that will be uploaded.
2. Run the upload script to upload everything to quickui.org.
This uses the psftp FTP client included with PuTTY
(http://www.chiark.greenend.org.uk/~sgtatham/putty/).
