#!/usr/bin/make

XBUILD:=/usr/bin/xbuild
Configuration:=Release
OutputPath:="$(CURDIR)/output"
SOLUTION:="$(CURDIR)/tools/Tools.sln"
$(OutputPath):
	mkdir -p "$(OutputPath)"

.PHONY: build
build: $(OutputPath)
	xbuild "$(SOLUTION)" /property:OutputPath="$(OutputPath)" /property:Configuration="$(Configuration)"
	
.PHONY: clean
clean:
	xbuild /target:Clean "$(SOLUTION)"
	rm -rf "$(OutputPath)"