using System;
using System.IO;
using System.Text;
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
        // Find the contents of the <script> tag.
        private static Regex regexScript = new Regex(@".*<script>(.*)</script>.*", RegexOptions.Singleline | RegexOptions.Compiled);

        // Find "&" and "<" (but not "<!", as in a CDATA declaration).
        private static Regex regexEntities = new Regex(@"(&)|(?:(<)[^!])", RegexOptions.Singleline | RegexOptions.Compiled);

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

        /// <summary>
        /// Clean the entities in the source string.
        /// </summary>
        static string Clean(string source)
        {
            string[] replacements = new string[] { "&amp;", "&lt;" };
            MatchCollection matches = regexEntities.Matches(source);
            if (matches.Count > 0)
            {
                StringBuilder clean = new StringBuilder(source.Length);
                int position = 0;
                foreach (Match match in matches)
                {
                    // For each match, there are three groups:
                    // Groups[0] holds the whole match, which we don't care about
                    // Groups[1] holds an "&" match, if found
                    // Groups[2] holds a "<" match, if found
                    // We replace groups 1 and 2 with their respective replacements.
                    for (int i = 1; i < match.Groups.Count; i++)
                    {
                        Group group = match.Groups[i];
                        if (group.Success)
                        {
                            if (group.Index > position)
                            {
                                // Copy over everything up to the start of the match.
                                clean.Append(source.Substring(position, group.Index - position));
                            }
                            // Make the replacement.
                            clean.Append(replacements[i - 1]);

                            position = group.Index + group.Length;
                        }
                    }
                }
                // Copy over everything after the last match.
                clean.Append(source.Substring(position));
                return clean.ToString();
            }
            else
            {
                return source;
            }
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
