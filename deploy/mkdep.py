#! /usr/bin/env python3.2

# Builds the deployment files for QuickUI.
# This includes versioned copies of:
#     the quickui.js runtime
#     the QuickUI Setup.msi installer
#     the QuickUI.zip package
# It also includes a version.js file that lets the versions be read at runtime.
#
# This script needs to run AFTER building the Visual Studio Setup project.
# After this script builds the deployment files, run the upload script to
# deploy those files to quickui.org.

import json
import re
import os
import shutil
import sys

# Paths that reflect the folder/file structure of the quickui project.
script_path = sys.path[0]
project_path = os.path.normpath(os.path.join(script_path, ".."))
lib_path = os.path.join(project_path, "lib")
exe_path = os.path.join(project_path,
                        os.path.normpath("tools/Setup/Setup/Release"))
uploads_path = os.path.join(project_path, "release")

runtime_name = "quickui.js"
runtime_path = os.path.join(lib_path, runtime_name)
versioned_runtime_template = os.path.join(uploads_path, "quickui-{0}.js")

assembly_info_path = os.path.join(project_path,
                                  os.path.normpath("tools/qb/Properties/AssemblyInfo.cs"))
setup_path = os.path.join(exe_path, "QuickUI Setup.msi")
versioned_setup_template = os.path.join(uploads_path, "QuickUI Setup-{0}.msi")

zip_path = os.path.join(script_path, "QuickUI.zip")
versioned_zip_template = os.path.join(uploads_path, "QuickUI-{0}.zip")

version_js_path = os.path.join(uploads_path, "version.js")

# Regular expression that finds the version number in quickui.js runtime
re_runtime_version = 'quickui: "([\d\.]+)"'

# Regular expression that finds the version number in AssemblyInfo.cs
re_setup_version = 'AssemblyVersion\("([\d\.]+)"\)'

def build_deployment_files():
    #copyfile(runtime_path, os.path.join(uploads_path, runtime_name))    
    runtime_info = copy_versioned_file(runtime_path,
                                       runtime_path,
                                       re_runtime_version,
                                       versioned_runtime_template)
    setup_info = copy_versioned_file(setup_path,
                                     assembly_info_path,
                                     re_setup_version,
                                     versioned_setup_template)
    zip_info = copy_versioned_file(zip_path,
                                     assembly_info_path,
                                     re_setup_version,
                                     versioned_zip_template)
    write_version_js_file(runtime_info, setup_info, zip_info)

def copy_versioned_file(source_path, version_path, re_version, destination_template):
    version = get_version(version_path, re_version)
    destination_path = destination_template.format(version)
    copyfile(source_path, destination_path)
    destination_name = os.path.basename(destination_path)
    return {
        "version": version,
        "filename": destination_name
    }

def copyfile(source_path, destination_path):
    source_name = os.path.basename(source_path)
    destination_name = os.path.basename(destination_path)
    print("Copying {0} to {1}".format(source_name, destination_name))
    shutil.copyfile(source_path, destination_path)
    
def write_version_js_file(runtime_info, setup_info, zip_info):
    """ Copy the version information to a file that can be read by quickui.org """
    versionInfo = {
                    "runtime": runtime_info,
                    "setup": setup_info,
                    "zip": zip_info
                  }
    with open(version_js_path, "w") as f:
        f.write("// QuickUI version information\n")
        f.write("var quickUIVersion = ")
        json.dump(versionInfo, f, sort_keys=True, indent=4)
        f.write(";\n")

def get_version(path, re_version):
    """ Extract the version number in the given file with the given re."""
    with open(path) as f:
        s = f.read()
        match = re.search(re_version, s)
        if (match is None):
            sys.exit("Error: No version number found in {0}.".format(path))
        return match.group(1)

if ( __name__ == "__main__" ):
    build_deployment_files()
