using System;
using System.IO;
using System.Xml;
using System.Xml.Linq;

#if DEBUG
using NUnit.Framework;
#endif

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

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [TestCase("qc.Tests.simple.qui.js", null, "qc.Tests.simple.qui")]
            [TestCase("qc.Tests.content.qui.js", null, "qc.Tests.content.qui")]
            [TestCase("qc.Tests.simplehost.qui.js", null, "qc.Tests.simplehost.qui")]
            [TestCase("qc.Tests.comprehensive.qui.js", "qc.Tests.comprehensive.qui.css", "qc.Tests.comprehensive.qui")]
            [TestCase("qc.Tests.entities.qui.js", null, "qc.Tests.entities.qui")]
            public void CompareCompilation(string fileNameExpectedJs, string fileNameExpectedCss, string fileNameSource)
            {
                StreamReader sourceReader = Utilities.GetEmbeddedFileReader(fileNameSource);
                StringWriter jsWriter = new StringWriter();
                StringWriter cssWriter = (fileNameExpectedCss == null)
                    ? null
                    : new StringWriter();

                Compile(sourceReader, jsWriter, cssWriter);

                string expectedJs = Utilities.GetEmbeddedFileContent(fileNameExpectedJs);
                string compiledJs = jsWriter.ToString();
                Assert.AreEqual(NormalizeLineEndings(expectedJs), NormalizeLineEndings(compiledJs));

                if (fileNameExpectedCss != null)
                {
                    string expectedCss = Utilities.GetEmbeddedFileContent(fileNameExpectedCss);
                    string compiledCss = cssWriter.ToString();
                    Assert.AreEqual(NormalizeLineEndings(expectedCss), NormalizeLineEndings(compiledCss));
                }
            }

            /// <summary>
            /// Convert all "\r\n" sequences to "\n" for purposes of checking compilations.
            /// </summary>
            /// <remarks>
            /// Otherwise way too much time is wasted trying to chase down irrelevant
            /// inconsistencies in unit tests that result from writing tests on different
            /// platforms.
            /// </remarks>
            static string NormalizeLineEndings(string s)
            {
                return s.Replace("\r\n", "\n");
            }
        }
#endif
    }
}
