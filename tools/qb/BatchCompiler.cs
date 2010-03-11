using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using qc;

namespace qb
{
    /// <summary>
    /// Compiles batches of Quick markup files.
    /// </summary>
    public class BatchCompiler
    {
        public string BuildPath { get; protected set; }
        public List<string> JsFiles { get; protected set; }
        public List<string> CssFiles { get; protected set; }

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
        public bool Compile(List<string> quiFiles)
        {
            bool batchSuccess = true;

            if (!Directory.Exists(BuildPath))
            {
                Directory.CreateDirectory(BuildPath);
            }

            JsFiles = new List<string>();
            CssFiles = new List<string>();

            foreach (string quiFile in quiFiles)
            {
                string jsFile = GetOutputFilePath(quiFile, Project.fileExtensionJs);
                string cssFile = GetOutputFilePath(quiFile, Project.fileExtensionCss);

                bool fileSuccess = true;
                if (!File.Exists(jsFile) ||
                    Utilities.FileNewerThan(quiFile, jsFile) ||
                    !File.Exists(cssFile) ||
                    Utilities.FileNewerThan(quiFile, cssFile))
                {
                    fileSuccess = CompileQuiFile(quiFile, jsFile, cssFile);
                }

                if (fileSuccess)
                {
                    JsFiles.Add(jsFile);
                    CssFiles.Add(cssFile);
                }
                else
                {
                    batchSuccess = false;
                }
            }

            RemoveOrphanedFiles();

            return batchSuccess;
        }

        /// <summary>
        /// Compile the supplied Quick markup file into the indicate JavaScript and Css files.
        /// Return true if successful, false if there were errors.
        /// </summary>
        private bool CompileQuiFile(string quiFile, string jsFile, string cssFile)
        {
            try
            {
                string quiFileName = Path.GetFileName(quiFile);
                Console.WriteLine(quiFileName);
                MarkupFileCompiler.Compile(quiFile, jsFile, cssFile);
                return true;
            }
            catch (Exception e)
            {
                Console.Error.WriteLine("qc: " + e.Message);
                return false;
            }
        }

        /// <summary>
        /// Return the path that should be used for the given type of output file.
        /// </summary>
        private string GetOutputFilePath(string quiFile, string fileExtension)
        {
            string quiFileName = Path.GetFileName(quiFile);
            string outputFileName = Path.ChangeExtension(quiFileName, fileExtension);
            return Path.Combine(BuildPath, outputFileName);
        }

        /// <summary>
        /// Remove any files in the build folder that were not part of the last compile.
        /// </summary>
        private void RemoveOrphanedFiles()
        {
            RemoveOrphanedFiles(JsFiles, Project.fileExtensionJs);
            RemoveOrphanedFiles(CssFiles, Project.fileExtensionCss);
        }

        /// <summary>
        /// Remove any files of the given extension in the build folder that
        /// aren't in the list of current files.
        /// </summary>
        private void RemoveOrphanedFiles(List<string> currentFiles, string fileExtension)
        {
            foreach (string orphanedFile in
                Directory.GetFiles(BuildPath, "*" + fileExtension).Except(currentFiles))
            {
                File.Delete(orphanedFile);
            }
        }
    }
}
