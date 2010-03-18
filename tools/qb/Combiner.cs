using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;

namespace qb
{
    /// <summary>
    /// Combines a set of files of a given type (namely, .js or .css) to create
    /// a combined output file.
    /// </summary>
    public class Combiner
    {
        public string ProjectPath { get; protected set; }
        public string BuildPath { get; protected set; }
        public string FileExtension { get; protected set; }
        public string CombinedFile { get; protected set; }

        private IEnumerable<string> SourceFiles {
            get
            {
                string searchPattern = "*" + FileExtension;
                return Directory.GetFiles(BuildPath, searchPattern);
            }
        }

        public Combiner(string projectPath, string buildPath, string fileExtension)
        {
            ProjectPath = projectPath;
            BuildPath = buildPath;
            FileExtension = fileExtension;

            string projectName = Path.GetFileName(ProjectPath);
            CombinedFile = Path.Combine(ProjectPath, Path.ChangeExtension(projectName, fileExtension));
        }

        /// <summary>
        /// Remove the combined output file.
        /// </summary>
        public void Clean()
        {
            if (File.Exists(CombinedFile))
            {
                (new FileInfo(CombinedFile)).IsReadOnly = false;
                File.Delete(CombinedFile);
            }
        }

        /// <summary>
        /// Combine the supplied source files to create the output file.
        /// </summary>
        public void Combine(IEnumerable<string> sourceFiles)
        {
            if (sourceFiles.Count() == 0)
            {
                // Nothing to combine.
                return;
            }

            // Only do the work if the combined file is out of date.
            if (!File.Exists(CombinedFile) ||
                !Utilities.FileNewerThan(CombinedFile, sourceFiles))
            {
                Console.WriteLine(Path.GetFileName(CombinedFile));

                FileInfo fileInfo = new FileInfo(CombinedFile);
                if (File.Exists(CombinedFile))
                {
                    fileInfo.IsReadOnly = false;
                }
                ConcatenateFiles(sourceFiles, CombinedFile);
                fileInfo.IsReadOnly = true;
            }
        }

        /// <summary>
        /// Concatenate the source files to create the target file.
        /// </summary>
        private static void ConcatenateFiles(IEnumerable<string> sourcePaths, string targetPath)
        {
            using (StreamWriter targetWriter = new StreamWriter(targetPath))
            {
                foreach (string sourcePath in sourcePaths)
                {
                    string sourceContent = File.ReadAllText(sourcePath);
                    targetWriter.Write(sourceContent);
                }
            }
        }
    }
}
