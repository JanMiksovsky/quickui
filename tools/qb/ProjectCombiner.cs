using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;

namespace qb
{
    /// <summary>
    /// Combines all built files .js and .css files to create a project's
    /// final .js and .css output files.
    /// </summary>
    public class ProjectCombiner
    {
        public string ProjectPath { get; protected set; }
        public string BuildPath { get; protected set; }
        public string FileExtension { get; protected set; }

        public string CombinedJsFile { get; protected set; }
        public string CombinedCssFile { get; protected set; }

        public ProjectCombiner(string projectPath, string buildPath)
        {
            ProjectPath = projectPath;
            BuildPath = buildPath;

            string projectName = Path.GetFileName(ProjectPath);
            CombinedJsFile = Path.Combine(ProjectPath, Path.ChangeExtension(projectName, Project.fileExtensionJs));
            CombinedCssFile = Path.Combine(ProjectPath, Path.ChangeExtension(projectName, Project.fileExtensionCss));
        }

        /// <summary>
        /// Remove the combined output files.
        /// </summary>
        public void Clean()
        {
            DeleteFile(CombinedJsFile);
            DeleteFile(CombinedCssFile);
        }

        /// <summary>
        /// Combine the output of the supplied build to create the project's
        /// output files.
        /// </summary>
        /// <remarks>
        /// If there are no build files of a given type, no combined output file
        /// for that type will be created.
        /// </remarks>
        public void Combine(Build build)
        {
            // See if we need to recombine either of the combined files.
            bool combineJsFile = RequiresCombining(build.JsFiles, CombinedJsFile);
            bool combineCssFile = RequiresCombining(build.CssFiles, CombinedCssFile);
            
            // Only do the work if the combined files are out of date.
            if (combineJsFile || combineCssFile)
            {
                IEnumerable<BuildUnit> buildUnits = build.SortBuildUnits();

                if (combineJsFile)
                {
                    CombineFile(buildUnits, CombinedJsFile);
                }

                if (combineCssFile)
                {
                    CombineFile(buildUnits, CombinedCssFile);
                }
            }
        }

        /// <summary>
        /// Combine the build units to create the indicated combined file.
        /// </summary>
        /// <remarks>
        /// The build units should already be sorted in dependency order.
        /// The combined file will be left read only to prevent accidental editing
        /// during debugging.
        /// </remarks>
        private void CombineFile(IEnumerable<BuildUnit> buildUnits, string combinedFile)
        {
            Console.WriteLine(Path.GetFileName(combinedFile));

            FileInfo fileInfo = new FileInfo(combinedFile);
            if (File.Exists(combinedFile))
            {
                fileInfo.IsReadOnly = false;
            }

            string fileExtension = Path.GetExtension(combinedFile);
            IEnumerable<string> files = buildUnits.Select(
                buildUnit =>
                    (fileExtension == Project.fileExtensionJs)
                        ? buildUnit.JsFileName
                        : buildUnit.CssFileName);

            ConcatenateFiles(files, combinedFile);

            fileInfo.IsReadOnly = true;
        }

        /// <summary>
        /// Concatenate the source files to create the target file.
        /// </summary>
        private static void ConcatenateFiles(IEnumerable<string> files, string combinedFile)
        {
            using (StreamWriter targetWriter = new StreamWriter(combinedFile))
            {
                foreach (string sourcePath in files)
                {
                    string sourceContent = File.ReadAllText(sourcePath);
                    targetWriter.Write(sourceContent);
                }
            }
        }

        /// <summary>
        /// Delete the indicated file (if it exists).
        /// </summary>
        private void DeleteFile(string file)
        {
            if (File.Exists(file))
            {
                (new FileInfo(file)).IsReadOnly = false;
                File.Delete(file);
            }
        }

        /// <summary>
        /// Return true if the indicated file is newer than all the target files.
        /// </summary>
        private bool FileAtLeastAsNewAs(string file, IEnumerable<string> targetFiles)
        {
            DateTime fileLastWriteTime = new FileInfo(file).LastWriteTimeUtc;
            return targetFiles.ToList().TrueForAll(
                (targetFile) => fileLastWriteTime >= new FileInfo(targetFile).LastWriteTimeUtc);
        }
        
        /// <summary>
        /// Return true if the JS or CSS of the given build unit is missing 
        /// or older than the source Quick markup file.
        /// </summary>
        private bool RequiresCombining(IEnumerable<string> files, string combinedFile)
        {
            bool combinedFileOutOfDate =
                files.Count() > 0 &&
                !(File.Exists(combinedFile) &&
                  FileAtLeastAsNewAs(combinedFile, files));
            return combinedFileOutOfDate;
        }
    }
}
