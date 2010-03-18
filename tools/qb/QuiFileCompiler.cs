using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

using qc;

namespace qb
{
    static class QuiFileCompiler
    {
        /// <summary>
        /// Compile the supplied Quick markup file into the indicate JavaScript and Css files.
        /// Return true if successful, false if there were errors.
        /// </summary>
        public static bool Compile(string quiFile, string buildPath, out string jsFile, out string cssFile)
        {
            jsFile = GetOutputFilePath(quiFile, buildPath, Project.fileExtensionJs);
            cssFile = GetOutputFilePath(quiFile, buildPath, Project.fileExtensionCss);

            if (File.Exists(jsFile) &&
                !Utilities.FileNewerThan(quiFile, jsFile) &&
                File.Exists(cssFile) &&
                !Utilities.FileNewerThan(quiFile, cssFile))
            {
                return true;
            }

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
        private static string GetOutputFilePath(string quiFile, string buildPath, string fileExtension)
        {
            string quiFileName = Path.GetFileName(quiFile);
            string outputFileName = Path.ChangeExtension(quiFileName, fileExtension);
            return Path.Combine(buildPath, outputFileName);
        }
    }
}
