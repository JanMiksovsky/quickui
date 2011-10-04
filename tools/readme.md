### Visual Studio

The Tools.sln can be opened and built with Microsoft Visual Studio Express
(which is free). The Setup/Setup.sln project, which builds the installer,
requires the full Visual Studio product.

### Mono
Tested with Mono 2.8.

If you have monotools installed, you can build the tools by issuing the
following command from this directory:

    xbuild /p:Configuration=Release
