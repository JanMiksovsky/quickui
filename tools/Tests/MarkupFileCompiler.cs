using System.IO;
using System.Reflection;
using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class MarkupFileCompilerTest
    {
        [TestCase("Tests.Tests.simple.qui.js", null, "Tests.Tests.simple.qui")]
        [TestCase("Tests.Tests.content.qui.js", null, "Tests.Tests.content.qui")]
        [TestCase("Tests.Tests.simplehost.qui.js", null, "Tests.Tests.simplehost.qui")]
        [TestCase("Tests.Tests.comprehensive.qui.js", "Tests.Tests.comprehensive.qui.css", "Tests.Tests.comprehensive.qui")]
        [TestCase("Tests.Tests.entities.qui.js", null, "Tests.Tests.entities.qui")]
        public void CompareCompilation(string fileNameExpectedJs, string fileNameExpectedCss, string fileNameSource)
        {
            StreamReader sourceReader = Utilities.GetEmbeddedFileReader(fileNameSource, Assembly.GetExecutingAssembly());
            StringWriter jsWriter = new StringWriter();
            StringWriter cssWriter = (fileNameExpectedCss == null)
                ? null
                : new StringWriter();

            MarkupFileCompiler.Compile(sourceReader, jsWriter, cssWriter);

            string expectedJs = Utilities.GetEmbeddedFileContent(fileNameExpectedJs, Assembly.GetExecutingAssembly());
            string compiledJs = jsWriter.ToString();
            Assert.AreEqual(NormalizeLineEndings(expectedJs), NormalizeLineEndings(compiledJs));

            if (fileNameExpectedCss != null)
            {
                string expectedCss = Utilities.GetEmbeddedFileContent(fileNameExpectedCss, Assembly.GetExecutingAssembly());
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
}
