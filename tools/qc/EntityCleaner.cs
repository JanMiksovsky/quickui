using System;
using System.IO;
using System.Text.RegularExpressions;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// Converts character entities that would otherwise cause an XML parser to choke.
    /// This maps "&" to "&amp;" and "<" to "&lt;".
    /// </summary>
    public static class EntityCleaner
    {
        private static Regex regexScript = new Regex(@".*<script>(.*)</script>.*", RegexOptions.Singleline);

        /// <summary>
        /// Return the original source, with any entities in the <script> tag cleaned.
        /// </summary>
        public static string CleanScript(string source)
        {
            Match match = regexScript.Match(source);
            if (match.Success)
            {
                Group scriptGroup = match.Groups[1];
                string script = scriptGroup.Value;
                string cleanScript = EntityCleaner.Clean(script);
                return source.Substring(0, scriptGroup.Index)
                        + cleanScript
                        + source.Substring(scriptGroup.Index + scriptGroup.Length);
            }
            else
            {
                // No <script> tag found; return as is.
                return source;
            }
        }

        public static TextReader CleanScript(TextReader sourceReader)
        {
            string source = sourceReader.ReadToEnd();
            string clean = EntityCleaner.CleanScript(source);
            return new StringReader(clean);
        }

        static string Clean(string s)
        {
            return s.Replace("&", "&amp;").Replace("<", "&lt;");
        }

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void Clean()
            {
                string source = "if (1 < 2 && 3 < 4)";
                string clean = EntityCleaner.Clean(source);
                Assert.AreEqual("if (1 &lt; 2 &amp;&amp; 3 &lt; 4)", clean);
            }

            [Test]
            public void CleanScript()
            {
                string source = "<Control name='Foo'>Hello <script>if (1 < 2 && 3 < 4) { alert('Success'); }</script></Control>";
                string expect = "<Control name='Foo'>Hello <script>if (1 &lt; 2 &amp;&amp; 3 &lt; 4) { alert('Success'); }</script></Control>";
                string clean = EntityCleaner.CleanScript(source);
                Assert.AreEqual(expect, clean);
            }
        }
#endif
    }
}
