This folder contains tools to deploy the QuickUI runtime and tools
to http://quickui.org.

The deployment process is moving from a couple of bash scripts to Python.
During this transition, the process is a bit clunky.

1. Use Visual Studio to build tools/Setup/Setup.sln and create the .msi
installer.
2. Run mkzip to create the QuickUI.zip file for OS/X and Linux.
3. Run mkdep.py to create the versioned .msi and .zip files that will be uploaded.
This also creates a version.js file that can be used by quickui.org to
see what the latest files are. These are all placed in /releases,
which is ignored by git.
4. Run the upload script to upload everything to quickui.org.
This uses the psftp FTP client included with PuTTY
(http://www.chiark.greenend.org.uk/~sgtatham/putty/).

The plan moving forward to collapse all these steps into the mkdep Python script.
