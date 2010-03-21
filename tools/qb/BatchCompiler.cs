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
        public bool Compile(IEnumerable<string> quiFiles, out BuildManifest manifestJs, out BuildManifest manifestCss)
        {
            BuildManifest manifestOldJs;
            BuildManifest manifestOldCss;
            CheckBuildFolder(out manifestOldJs, out manifestOldCss);

            manifestJs = new BuildManifest();
            manifestCss = new BuildManifest();
            bool batchSuccess = true;
            foreach (string quiFile in quiFiles)
            {
                string jsFile;
                string cssFile;
                bool fileSuccess = QuiFileCompiler.Compile(quiFile, BuildPath, out jsFile, out cssFile);
                if (fileSuccess)
                {
                    manifestJs.Add(jsFile);
                    manifestCss.Add(cssFile);
                }
                else
                {
                    batchSuccess = false;
                }
            }

            RemoveUnbuiltFiles(manifestJs, manifestOldJs);
            RemoveUnbuiltFiles(manifestCss, manifestOldCss);

            return batchSuccess;
        }

        private void CheckBuildFolder(out BuildManifest manifestOldJs, out BuildManifest manifestOldCss)
        {
            if (Directory.Exists(BuildPath))
            {
                // Incremental build; find existing files.
                manifestOldJs = new BuildManifest(BuildPath, Project.fileExtensionJs);
                manifestOldCss = new BuildManifest(BuildPath, Project.fileExtensionCss);
            }
            else
            {
                // Clean build.
                Directory.CreateDirectory(BuildPath);
                manifestOldJs = null;
                manifestOldCss = null;
            }
        }

        /// <summary>
        /// Remove any files in the old manifest but not in the new,
        /// i.e., files that are left over from a previous compilation.
        /// </summary>
        private void RemoveUnbuiltFiles(BuildManifest manifestNew, BuildManifest manifestOld)
        {
            if (manifestOld == null)
            {
                return;
            }

            IEnumerable<string> newFiles = manifestNew.Files;
            IEnumerable<string> unbuiltFiles = manifestOld.Files.Where(
                oldFile => !newFiles.Contains(oldFile));
            foreach (string unbuiltFile in unbuiltFiles)
            {
                File.Delete(unbuiltFile);
            }
        }
    }
}
