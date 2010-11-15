using System;
using System.IO;

namespace qc
{
    public class Application
    {
        static void Main(string[] args)
        {
            try
            {
                // Crack arguments.
                string sourceFileName;
                string jsFileName;
                string cssFileName;
                ArgumentProcessor.GetFileNames(args, out sourceFileName, out jsFileName, out cssFileName);
                MarkupFileCompiler.Compile(sourceFileName, jsFileName, cssFileName);
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
    }

    /// <summary>
    /// Process command line arguments.
    /// </summary>
    public static class ArgumentProcessor
    {
        public static void GetFileNames(string[] args,
            out string sourceFileName,
            out string jsFileName,
            out string cssFileName)
        {
            sourceFileName = null;
            jsFileName = null;
            cssFileName = null;

            foreach (string arg in args)
            {
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
