using System;
using System.Collections.Generic;
using System.IO;

namespace qb
{
    class Application
    {
        const string fileExtensionProject = ".qb";

        /// <summary>
        /// Main entry point.
        /// </summary>
        /// <remarks>
        /// Usage:
        /// qb [ -clean | -rebuild | -version ] [ project1 ... projectN ]
        /// 
        /// -clean Cleans project
        /// -rebuild Cleans project, then builds
        /// 
        /// project: Either a folder whose subtree includes .qui files that will be compiled,
        /// or a file name ending in .qb that contains a list of project files/folders to build.
        /// 
        /// Default is incremental build.
        /// If no project is specified, the current directory is used.
        /// The outputs for a project folder called /foo will be called foo.js and foo.css.
        /// </remarks>
        static void Main(string[] args)
        {
            bool doBuild;
            bool doClean;
            bool doVersion;
            List<string> projectPaths;

            try
            {
                ArgumentProcessor.ProcessArguments(args,
                    out doBuild,
                    out doClean,
                    out doVersion,
                    out projectPaths);

                if (doVersion)
                {
                    WriteVersion();
                }

                if (doBuild || doClean)
                {
                    if (projectPaths.Count == 0)
                    {
                        // No projects explicitly listed; process current directory as a project.
                        projectPaths.Add(Directory.GetCurrentDirectory());
                    }

                    CompileProjects(projectPaths, doBuild, doClean);
                }
            }
            catch (Exception e)
            {
                WriteError(e.Message);
                Environment.Exit(1);
            }
        }

        /// <summary>
        /// Compile the listed qb projects.
        /// </summary>
        static void CompileProjects(List<string> projectPaths, bool doBuild, bool doClean)
        {
            foreach (string projectPath in projectPaths)
            {
                if (Path.GetExtension(projectPath) == fileExtensionProject)
                {
                    CompileProjectFile(projectPath, doBuild, doClean);
                }
                else
                {
                    CompileProjectFolder(projectPath, doBuild, doClean);
                }
            }
        }

        /// <summary>
        /// Compile a single qb project.
        /// </summary>
        static void CompileProjectFolder(string projectFolder, bool doBuild, bool doClean)
        {
            string defaultProjectFilePath = Path.Combine(projectFolder, "build" + fileExtensionProject);
            if (File.Exists(defaultProjectFilePath))
            {
                CompileProjectFile(defaultProjectFilePath, doBuild, doClean);
            }
            else
            {
                Project project = new Project(projectFolder);
                if (doClean)
                {
                    project.Clean();
                }
                if (doBuild)
                {
                    project.Build();
                }
            }
        }

        /// <summary>
        /// Compile the projects listed in a qb build file.
        /// </summary>
        static void CompileProjectFile(string projectFile, bool doBuild, bool doClean)
        {
            string projectFileFolder = Path.GetDirectoryName(projectFile);
            List<string> projects = new List<string>();
            using (StreamReader streamReader = new StreamReader(projectFile))
            {
                while (!streamReader.EndOfStream)
                {
                    string subProject = streamReader.ReadLine();
                    if (!String.IsNullOrEmpty(subProject))
                    {
                        string subProjectPath = Path.Combine(projectFileFolder, subProject);
                        projects.Add(subProjectPath);
                    }
                }
            }

            CompileProjects(projects, doBuild, doClean);
        }

        static void WriteError(string message)
        {
            Console.Error.WriteLine(String.Format("qb: Error: {0}", message));
        }

        static void WriteVersion()
        {
            String version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString(); 
            Console.WriteLine(String.Format("qb {0}", version));
        }
    }

    static class ArgumentProcessor
    {
        const string argumentClean = "-clean";
        const string argumentRebuild = "-rebuild";
        const string argumentVersion = "-version";

        /// <summary>
        /// Crack command-line arguments.
        /// </summary>
        public static void ProcessArguments(string[] args,
            out bool doBuild,
            out bool doClean,
            out bool doVersion,
            out List<string> projectPaths)
        {

            projectPaths = new List<string>();
            doBuild = false;
            doClean = false;
            doVersion = false;

            foreach (string arg in args)
            {
                switch (arg)
                {
                    case argumentClean:
                        doClean = true;
                        break;

                    case argumentRebuild:
                        doClean = true;
                        doBuild = true;
                        break;

                    case argumentVersion:
                        // Version trumps other arguments.
                        doVersion = true;
                        return;

                    default:
                        doBuild = true;
                        projectPaths.Add(arg);
                        break;
                }
            }
        }
    }
}
