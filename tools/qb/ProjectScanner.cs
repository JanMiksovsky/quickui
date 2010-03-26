using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace qb
{
    public class ProjectScanner
    {
        public string BuildFolder { get; set; }
        public string ProjectFolder { get; set; }

        public ProjectScanner(string projectFolder, string buildFolder)
        {
            ProjectFolder = projectFolder;
            BuildFolder = buildFolder;
        }

        public IEnumerable<string> Scan(Build build)
        {
            if (!Directory.Exists(BuildFolder))
            {
                // Need to build everything.
                return QuiFiles;
            }

            Build previousBuild = new Build(BuildFolder);
            previousBuild.AddExistingFiles();

            List<string> quiFilesToCompile = new List<string>();
            foreach (string quiFile in QuiFiles)
            {
                BuildUnit previousBuildUnit;
                bool found = previousBuild.GetCorrespondingBuildUnit(quiFile, out previousBuildUnit);
                if (found && !RequiresCompilation(quiFile, previousBuildUnit))
                {
                    // Up to date -- add to current build as is.
                    build.Add(previousBuildUnit);
                }
                else
                {
                    // Need to compile.
                    quiFilesToCompile.Add(quiFile);
                }
            }

            return quiFilesToCompile;
        }

        /// <summary>
        /// All Quick markup files in the project.
        /// </summary>
        /// <returns>
        /// A list of all Quick markup files in the project folder or its subfolders.
        /// </returns>
        public IEnumerable<string> QuiFiles
        {
            get
            {
                //return from quiFile in QuiFilesInPath(ProjectFolder)
                //       orderby Path.GetFileName(quiFile)
                //       select quiFile;
                string searchPattern = "*" + Project.fileExtensionQui;
                return Directory.GetFiles(ProjectFolder, searchPattern, SearchOption.AllDirectories);
            }
        }

        /// <summary>
        /// Return true if the first is newer than the second.
        /// </summary>
        private bool FileNewerThan(string file, string targetFile)
        {
            DateTime fileLastWriteTime = new FileInfo(file).LastWriteTimeUtc;
            DateTime targetLastWriteTime = new FileInfo(targetFile).LastWriteTimeUtc;
            return (fileLastWriteTime > targetLastWriteTime);
        }

        /// <summary>
        /// Return true if the JS or CSS of the given build unit is missing 
        /// or older than the source Quick markup file.
        /// </summary>
        private bool RequiresCompilation(string quiFile, BuildUnit previousBuildUnit)
        {
            return RequiresCompilation(quiFile, previousBuildUnit.JsFileName) ||
                   RequiresCompilation(quiFile, previousBuildUnit.CssFileName);
        }

        private bool RequiresCompilation(string quiFile, string targetFile)
        {
            bool outOfDate = !File.Exists(targetFile) || FileNewerThan(quiFile, targetFile);
            return outOfDate;
        }
    }
}
