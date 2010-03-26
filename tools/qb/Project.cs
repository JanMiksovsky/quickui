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
        private const string buildFolderName = "build";

        public string ProjectFolder { get; protected set; }

        private string BuildFolder { get; set; }
        private ProjectScanner scanner;
        private ProjectCompiler compiler;
        private ProjectCombiner combiner;

        public Project(string projectFolder)
        {
            ProjectFolder = Path.GetFullPath(projectFolder);
            BuildFolder = Path.Combine(ProjectFolder, buildFolderName);

            scanner = new ProjectScanner(ProjectFolder, BuildFolder);
            compiler = new ProjectCompiler(BuildFolder);
            combiner = new ProjectCombiner(ProjectFolder, BuildFolder);
        }

        /// <summary>
        /// Clean the project, including all compiled files and output files.
        /// </summary>
        public void Clean()
        {
            if (Directory.Exists(BuildFolder))
            {
                Directory.Delete(BuildFolder, true);
            }

            combiner.Clean();
        }

        /// <summary>
        /// Perform an incremental build of the project.
        /// </summary>
        public void Build()
        {
            Build build = new Build(BuildFolder);

            // Phase 1: Scan the project's Quick markup source files and previous
            // build output to determine which files need to be recompiled.
            IEnumerable<string> quiFilesToCompile = scanner.Scan(build);

            // Phase 2: Compile files that need it and add the output to the build.
            bool compileSuccess;
            if (quiFilesToCompile.Count() == 0)
            {
                // All build files up to date.
                compileSuccess = true;
            }
            else
            {
                compileSuccess = compiler.Compile(quiFilesToCompile, build);
            }

            // Phase 3: Create the project's combined output files.
            if (compileSuccess)
            {
                combiner.Combine(build);
            }
            else
            {
                // Fail; remove any (now out of date) project output.
                combiner.Clean();
            }

            // Phase 4: Clean up and remove any obsolete build files.
            build.RemoveObsoleteFiles();
        }
    }
}
