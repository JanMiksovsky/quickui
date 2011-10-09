#!/usr/bin/make

XBUILD:=/usr/bin/xbuild
Configuration:=Release
OutputPath:="$(CURDIR)/output"
QuickUiOutput="$(CURDIR)/quicommon/build"
SOLUTION:="$(CURDIR)/tools/Tools.sln"
MONO:=/usr/bin/mono

prefix=/usr
exec_prefix=${prefix}
BINDIR=${exec_prefix}/bin
LIBDIR=${exec_prefix}/lib
DATADIR=${exec_prefix}/lib
INSTALL=/usr/bin/install -c
INSTALL_PROGRAM=${INSTALL}
INSTALL_DATA=${INSTALL} -m 644

$(OutputPath):
	mkdir -p "$(OutputPath)"

all: build

build: build-sln build-common

build-sln: $(OutputPath)
	-@echo '..... Building the Solution .....'
	xbuild "$(SOLUTION)" /property:OutputPath="$(OutputPath)" /property:Configuration="$(Configuration)"
	-@echo '..... Done building the Solution .....'

build-common:
	-@echo '..... Building QuickUI Common .....'
	$(OutputPath)/qb.exe $(CURDIR)/build.qb
	-@echo '..... Done Building QuickUI Common .....'
	
clean:
	xbuild /target:Clean "$(SOLUTION)"
	rm -rf "$(OutputPath)"
	rm -rf "$(QuickUiOutput)"

install: build
	-@test -z "$(DESTDIR)" || mkdir -p "$(DESTDIR)" 2>/dev/null
	-mkdir -p "$(DESTDIR)$(prefix)" "$(DESTDIR)$(BINDIR)" "$(DESTDIR)$(LIBDIR)" 2>/dev/null
	-@echo '..... Installing the programs .....'
	$(INSTALL_PROGRAM) $(OutputPath)/qb.exe "$(DESTDIR)$(BINDIR)/qb.exe"
	$(INSTALL_PROGRAM) $(OutputPath)/qc.exe "$(DESTDIR)$(BINDIR)/qc.exe"
	# I *think* this is a legal way to symlink things...  we 
	# don't want to symlink into the $(DESTDIR) or the symlink will be
	# broken once installed
	ln -sf "$(BINDIR)/qc.exe" "$(DESTDIR)$(BINDIR)/qc"
	ln -sf "$(BINDIR)/qb.exe" "$(DESTDIR)$(BINDIR)/qb"
	-@echo '..... Installing data .....'
	$(INSTALL_DATA) "$(CURDIR)/lib/quickui.js" "$(DESTDIR)$(DATADIR)/quickui.js"
	$(INSTALL_DATA) "$(CURDIR)/quicommon/quicommon.css" "$(DESTDIR)$(DATADIR)/quicommon.css"
	$(INSTALL_DATA) "$(CURDIR)/quicommon/quicommon.js" "$(DESTDIR)$(DATADIR)/quicommon.js"
	-@echo '..... Finishing up .....'
	-@( cd "$(DESTDIR)$(BINDIR)" ; echo ""; echo "$(DESTDIR)$(BINDIR):" ; /bin/ls -l "qb" "qc" 2>/dev/null | sed 's/^/  /;' ; echo "" )
	-@echo 'Done installing QuickQUI.'
