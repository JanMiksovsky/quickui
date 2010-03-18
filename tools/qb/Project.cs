using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace qb
{
    public class Project
    {
        public const string fileExtensionQui = ".qui";
        public const string fileExtensionJs = ".js";
        public const string fileExtensionCss = ".css";
        private const string buildDirectoryName = "build";

        public string ProjectPath { get; protected set; }

        private BatchCompiler batchCompiler;
        private Combiner jsCombiner;
        private Combiner cssCombiner;

        public Project(string projectPath)
        {
            ProjectPath = Path.GetFullPath(projectPath);

            string buildPath = Path.Combine(ProjectPath, buildDirectoryName);
            batchCompiler = new BatchCompiler(buildPath);
            jsCombiner = new Combiner(ProjectPath, buildPath, fileExtensionJs);
            cssCombiner = new Combiner(ProjectPath, buildPath, fileExtensionCss);
        }

        /// <summary>
        /// Clean the project, including all compiled files and output files.
        /// </summary>
        public void Clean()
        {
            batchCompiler.Clean();
            jsCombiner.Clean();
            cssCombiner.Clean();
        }

        /// <summary>
        /// Perform an incremental build of the project.
        /// </summary>
        public void Build()
        {
            IEnumerable<string> jsFiles;
            IEnumerable<string> cssFiles;
            bool success = batchCompiler.Compile(QuiFiles, out jsFiles, out cssFiles);
            if (!success)
            {
                // Errors
                jsCombiner.Clean();
                cssCombiner.Clean();
            }

            // TODO: Both lists should contain the same files, but with different
            // extensions. The class dependencies will be the same in both cases,
            // so it'd be nice to just do the sorting once.
            IEnumerable<string> jsFilesSorted = FileDependencyMap.SortDependencies(jsFiles);
            IEnumerable<string> cssFilesSorted = FileDependencyMap.SortDependencies(cssFiles);

            jsCombiner.Combine(jsFilesSorted);
            cssCombiner.Combine(cssFilesSorted);
        }

        /// <summary>
        /// All Quick markup files in the project.
        /// </summary>
        /// <returns>
        /// A list of all Quick markup files in the project folder or its subfolders,
        /// sorted by file name.
        /// </returns>
        public IEnumerable<string> QuiFiles
        {
            get
            {
                return from quiFile in GetQuiFilesInPath(ProjectPath)
                    orderby Path.GetFileName(quiFile)
                    select quiFile;
            }
        }

        /// <summary>
        /// Return all Quick markup files in the given path or below.
        /// </summary>
        private static IEnumerable<string> GetQuiFilesInPath(string path)
        {
            string searchPattern = "*" + fileExtensionQui;
            return Directory.GetFiles(path, searchPattern)  // Quick markup files in this folder
                .Concat(Directory.GetDirectories(path).SelectMany(     // Quick markup files in subfolders
                            subfolder => GetQuiFilesInPath(subfolder)));
        }
    }
}
