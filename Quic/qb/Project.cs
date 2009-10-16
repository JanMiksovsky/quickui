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
            if (batchCompiler.Compile(QuiFiles))
            {
                // Success
                jsCombiner.Combine(batchCompiler.JsFiles);
                cssCombiner.Combine(batchCompiler.CssFiles);
            }
            else
            {
                // Errors
                jsCombiner.Clean();
                cssCombiner.Clean();
            }
        }

        /// <summary>
        /// All Quick markup files in the project.
        /// </summary>
        /// <returns>
        /// A list of all Quick markup files in the project folder or its subfolders,
        /// sorted by file name.
        /// </returns>
        public List<string> QuiFiles
        {
            get
            {
                return new List<string>(
                    from quiFile in GetQuiFilesInPath(ProjectPath)
                    orderby Path.GetFileName(quiFile)
                    select quiFile);
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
