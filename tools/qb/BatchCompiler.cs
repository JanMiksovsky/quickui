using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace qb
{
    /// <summary>
    /// Compiles batches of Quick markup files.
    /// </summary>
    public class BatchCompiler
    {
        public string BuildPath { get; set; }

        public BatchCompiler(string buildPath)
        {
            this.BuildPath = buildPath;
        }

        /// <summary>
        /// Remove the build folder and everything in it.
        /// </summary>
        public void Clean()
        {
            if (Directory.Exists(BuildPath))
            {
                Directory.Delete(BuildPath, true);
            }
        }

        /// <summary>
        /// Compile the given Quick markup files.
        /// Return true if successful, false if there were errors.
        /// </summary>
        /// <remarks>
        /// The compiled JS and CSS files are returned in the properties
        /// of the corresponding name.
        /// </remarks>
        public bool Compile(IEnumerable<string> quiFiles, out IEnumerable<string> jsFiles, out IEnumerable<string> cssFiles)
        {
            List<string> jsFilesBuilt = new List<string>();
            List<string> cssFilesBuilt = new List<string>();

            EnsureBuildDirectoryExists();
            bool batchSuccess = true;
            foreach (string quiFile in quiFiles)
            {
                string jsFile;
                string cssFile;
                bool fileSuccess = QuiFileCompiler.Compile(quiFile, BuildPath, out jsFile, out cssFile);
                if (fileSuccess)
                {
                    jsFilesBuilt.Add(jsFile);
                    cssFilesBuilt.Add(cssFile);
                }
                else
                {
                    batchSuccess = false;
                }
            }

            RemoveUnbuiltFiles(jsFilesBuilt, Project.fileExtensionJs);
            RemoveUnbuiltFiles(cssFilesBuilt, Project.fileExtensionCss);

            jsFiles = jsFilesBuilt;
            cssFiles = cssFilesBuilt;
            return batchSuccess;
        }

        private void EnsureBuildDirectoryExists()
        {
            if (!Directory.Exists(BuildPath))
            {
                Directory.CreateDirectory(BuildPath);
            }
        }

        /// <summary>
        /// Remove any files of the given extension in the build folder that
        /// aren't in the list of files to keep.
        /// </summary>
        private void RemoveUnbuiltFiles(IEnumerable<string> builtFile, string fileExtension)
        {
            foreach (string unbuiltFile in
                Directory.GetFiles(BuildPath, "*" + fileExtension).Except(builtFile))
            {
                File.Delete(unbuiltFile);
            }
        }
    }
}
