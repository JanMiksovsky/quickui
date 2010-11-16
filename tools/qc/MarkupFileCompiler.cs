using System;
using System.IO;
using System.Xml;
using System.Xml.Linq;

namespace qc
{
    /// <summary>
    /// Top-level Quick markup file compiler: reads a markup stream, compiles it,
    /// and writes out streams of the generated JavaScript and CSS.
    /// </summary>
    public class MarkupFileCompiler
    {
        public static void Compile(TextReader markupReader, TextWriter jsWriter, TextWriter cssWriter)
        {
            MarkupControlClass control = MarkupCompiler.Compile(markupReader);

            // Only write out the CSS if the caller asked for it.
            if (cssWriter != null)
            {
                cssWriter.Write(control.Css());
            }

            jsWriter.Write(control.JavaScript());
        }

        public static void Compile(string sourceFileName, string jsFileName, string cssFileName)
        {
            // Map file names to reader/writers.
            using (TextReader sourceReader = GetReader(sourceFileName, Console.In))
            {
                using (TextWriter jsWriter = GetWriter(jsFileName, Console.Out),
                        cssWriter = GetWriter(cssFileName, null))
                {
                    Compile(sourceReader, jsWriter, cssWriter);
                }
            }
        }

        static TextReader GetReader(string fileName, TextReader defaultReader)
        {
            return String.IsNullOrEmpty(fileName) ?
                defaultReader :
                new StreamReader(fileName);
        }

        static TextWriter GetWriter(string fileName, TextWriter defaultWriter)
        {
            return String.IsNullOrEmpty(fileName) ?
                defaultWriter :
                new StreamWriter(fileName);
        }
    }
}
