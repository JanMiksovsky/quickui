using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using qc;

namespace qb
{
    /// <summary>
    /// Compiles multiple Quick markup files in a project.
    /// </summary>
    public class ProjectCompiler
    {
        public string BuildFolder { get; set; }

        public ProjectCompiler(string buildFolder)
        {
            this.BuildFolder = buildFolder;
        }

        /// <summary>
        /// Compile the given Quick markup files.
        /// Return true if successful, false if there were errors.
        /// </summary>
        /// <remarks>
        /// The compiled JS and CSS files are returned in the properties
        /// of the corresponding name.
        /// </remarks>
        public bool Compile(IEnumerable<string> quiFiles, Build currentBuild)
        {
            if (!Directory.Exists(BuildFolder))
            {
                Directory.CreateDirectory(BuildFolder);
            }

            bool batchSuccess = true;
            foreach (string quiFile in quiFiles)
            {
                BuildUnit buildUnit;
                bool fileSuccess = Compile(quiFile, out buildUnit);
                if (fileSuccess)
                {
                    currentBuild.Add(buildUnit);
                }
                else
                {
                    batchSuccess = false;
                }
            }

            return batchSuccess;
        }

        /// <summary>
        /// Compile the supplied Quick markup file into the indicate JavaScript and Css files.
        /// Return true if successful, false if there were errors.
        /// </summary>
        private bool Compile(string quiFile, out BuildUnit buildUnit)
        {
            string quiFileName = Path.GetFileName(quiFile);
            Console.WriteLine(quiFileName);

            MarkupControlClass control;
            try
            {
                using (StreamReader markupReader = new StreamReader(quiFile))
                {
                    // Do the actual compile.
                    control = MarkupCompiler.Compile(markupReader);
                }
            }
            catch (Exception e)
            {
                Console.Error.WriteLine("qc: " + e.Message);
                buildUnit = null;
                return false;
            }

            string outputFileNameBase = control.Name;
            if (!String.IsNullOrEmpty(control.BaseClassName) &&
                control.BaseClassName != "Control")
            {
                outputFileNameBase += "." + control.BaseClassName;
            }

            string jsFileName = GetOutputFilePath(outputFileNameBase, Project.fileExtensionJs);
            string cssFileName = GetOutputFilePath(outputFileNameBase, Project.fileExtensionCss);

            WriteOutputFile(control.JavaScript(), jsFileName);
            WriteOutputFile(control.Css(), cssFileName);

            buildUnit = new BuildUnit(jsFileName);
            return true;
        }

        private void WriteOutputFile(string output, string fileName)
        {
            using (StreamWriter textWriter = new StreamWriter(fileName))
            {
                textWriter.Write(output);
            }
        }

        /// <summary>
        /// Return the path that should be used for the given type of output file.
        /// </summary>
        private string GetOutputFilePath(string fileNameBase, string fileExtension)
        {
            // Could use Path.ChangeExtension here, but it gets confused in the elikely
            // case the file name contains a period.
            string outputFileName = fileNameBase + fileExtension;
            return Path.Combine(BuildFolder, outputFileName);
        }
    }
}
