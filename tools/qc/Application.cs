using System;
using System.IO;

namespace qc
{
    public class Application
    {
        /// <summary>
        /// Main entry point.
        /// </summary>
        /// <remarks>
        /// See WriteHelp for command line parameter explanation.
        /// </remarks>
        static void Main(string[] args)
        {
            try
            {
                // Crack arguments.
                string sourceFileName;
                string jsFileName;
                string cssFileName;
                bool doHelp;
                bool doVersion;

                ArgumentProcessor.GetFileNames(args,
                                                out sourceFileName,
                                                out jsFileName,
                                                out cssFileName,
                                                out doHelp,
                                                out doVersion);

                if (doHelp)
                {
                    WriteHelp();
                }
                else if (doVersion)
                {
                    WriteVersion();
                }
                else
                {
                    MarkupFileCompiler.Compile(sourceFileName, jsFileName, cssFileName);
                }
            }
            catch (Exception e)
            {
                WriteError(e.Message);
                Environment.Exit(1);
            }
        }

        static void WriteError(string message)
        {
            Console.Error.WriteLine(String.Format("qc: Error: {0}", message));
        }

        static void WriteHelp()
        {
            var help =
@"usage: qc [ file.qui ] [ file.js ] [ file.css ]

Options and arguments:
--help      Print this help
--version   Print the application version number
file.qui    The name, ending in .qui, of the file to compile. Default: stdin.
file.js     The name, ending in .js, of the JavaScript output. Default: stdout.
file.css    The name, ending in .css, of the CSS output. Default: stdout.
";
            Console.Write(help);
        }

        static void WriteVersion()
        {
            String version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString();
            Console.WriteLine(String.Format("qc {0}", version));
        }

    }

    /// <summary>
    /// Process command line arguments.
    /// </summary>
    public static class ArgumentProcessor
    {
        public static void GetFileNames(string[] args,
            out string sourceFileName,
            out string jsFileName,
            out string cssFileName,
            out bool doHelp,
            out bool doVersion)
        {
            const string argumentHelp = "--help";
            const string argumentVersion = "--version";

            sourceFileName = null;
            jsFileName = null;
            cssFileName = null;
            doHelp = false;
            doVersion = false;

            foreach (string arg in args)
            {
                if (arg == argumentHelp)
                {
                    doHelp = true;
                    return;
                }
                else if (arg == argumentVersion)
                {
                    doVersion = true;
                    return;
                }
                else if (arg.StartsWith("-"))
                {
                    // Unknown argument
                    doHelp = true;
                    return;
                }

                string extension = Path.GetExtension(arg);
                switch (extension)
                {
                    case ".qui":
                        AssignIfNotPreassigned(ref sourceFileName, arg, extension);
                        break;

                    case ".js":
                        AssignIfNotPreassigned(ref jsFileName, arg, extension);
                        break;

                    case ".css":
                        AssignIfNotPreassigned(ref cssFileName, arg, extension);
                        break;
                }
            }
        }

        static void AssignIfNotPreassigned(ref string s, string value, string extension)
        {
            if (s != null)
            {
                throw new ArgumentException(String.Format(
                    "Can't have more than one argument with file extension \"{0}\".", extension));
            }

            s = value;
        }
    }
}
