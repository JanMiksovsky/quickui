using System;
using System.IO;
using System.Xml;
using System.Xml.Linq;

#if DEBUG
using NUnit.Framework;
#endif

namespace Quic
{
    public class ControlCompiler
    {
        public static void CompileControl(TextReader sourceReader, TextWriter jsWriter, TextWriter cssWriter)
        {
            ControlClass control = ControlParser.ParseControlClass(sourceReader);

            // Only write out the CSS if the caller asked for it.
            if (cssWriter != null)
            {
                cssWriter.Write(ControlCssEmitter.EmitControlClass(control));
            }

            jsWriter.Write(control.EmitJavaScript());
        }

        public static void CompileControl(string sourceFileName, string jsFileName, string cssFileName)
        {
            // Map file names to reader/writers.
            using (TextReader sourceReader = GetReader(sourceFileName, Console.In))
            {
                using (TextWriter jsWriter = GetWriter(jsFileName, Console.Out),
                        cssWriter = GetWriter(cssFileName, null))
                {
                    ControlCompiler.CompileControl(sourceReader, jsWriter, cssWriter);
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
            [TestCase("Hello", Result = "\"Hello\"")]
            public string CompileText(string source)
            {
                XText text = new XText(source);
                Node node = ControlParser.ParseXNode(text);
                return node.EmitJavaScript();
            }

            [TestCase("<div>Hello</div>", Result = "\"<div>Hello</div>\"")]
            [TestCase("<span id=\"foo\">Yo</span>", Result = "this.foo = $(\"<span id=\\\"foo\\\">Yo</span>\")[0]")]
            public string CompileHtml(string source)
            {
                StringReader stringReader = new StringReader(source);
                XElement element = XElement.Parse(source);
                Node node = ControlParser.ParseXNode(element);
                return node.EmitJavaScript();
            }

            [TestCase("Quic.Tests.simple.qui.js", "Quic.Tests.simple.qui")]
            [TestCase("Quic.Tests.content.qui.js", "Quic.Tests.content.qui")]
            [TestCase("Quic.Tests.simplehost.qui.js", "Quic.Tests.simplehost.qui")]
            [TestCase("Quic.Tests.comprehensive.qui.js", "Quic.Tests.comprehensive.qui")]
            public void Compile(string fileNameExpectedOutput, string fileNameSource)
            {
                ControlClass c = ControlParser.ParseControlClass(Utilities.GetEmbeddedFileReader(fileNameSource));
                string compilation = c.EmitJavaScript();
                string expectedCompilation = Utilities.GetEmbeddedFileContent(fileNameExpectedOutput);
                Assert.AreEqual(NormalizeLineEndings(expectedCompilation),
                    NormalizeLineEndings(compilation));
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
