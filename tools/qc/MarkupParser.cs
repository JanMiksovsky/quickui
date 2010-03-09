using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// Parses Quick Markup (the contents of .qui files).
    /// </summary>
    /// <remarks>
    /// This class handles parsing the top-level <Control> element,
    /// and its child <prototype>, <style>, and <script> elements.
    /// It's responsible for verifying that the markup is generally
    /// well-formed at this outermost level.
    /// </remarks>
    class MarkupParser
    {
        private static Regex regexTags = new Regex(
            @"<(?<tag>script|style)>(?:(?:\s*<!\[CDATA\[(?'contents'.*?)\]\]>\s*)|(?'contents'.*?))</(?:\k<tag>)>",
            RegexOptions.Compiled | RegexOptions.Singleline);

        public static Control Parse(TextReader markupReader)
        {
            return Parse(markupReader.ReadToEnd());
        }

        /// <summary>
        /// Return a control class definition defined in the given markup.
        /// </summary>
        public static Control Parse(string markup)
        {
            // Preprocess to extract any script and/or style tags.
            string script;
            string style;
            string processed = PreprocessMarkup(markup, out script, out style);

            // Parse the remaining source.
            Control c = ControlParser.ParseControlClass(processed);

            // Double-check the (unlikely) specification of script or style that
            // may have been set via attributes on the top-level <Control> element.
            VerifyPropertyIsNull(c.Script, "script");
            c.Script = script;
            VerifyPropertyIsNull(c.Style, "style");
            c.Style = style;

            return c;
        }

        /// <summary>
        /// Return the contents of the given Quick markup with the
        /// contents of the <script> and <style> elements (if present) removed
        /// and handed back separately.
        /// </summary>
        private static string PreprocessMarkup(string markup, out string script, out string style)
        {
            StringBuilder source = new StringBuilder(markup.Length);
            script = null;
            style = null;

            int position = 0;
            foreach (Match match in regexTags.Matches(markup))
            {
                string tag = match.Groups["tag"].Value;
                string contents = match.Groups["contents"].Value;
                switch (tag)
                {
                    case "script":
                        VerifyPropertyIsNull(script, tag);
                        script = contents;
                        break;

                    case "style":
                        VerifyPropertyIsNull(style, tag);
                        style = contents;
                        break;
                }

                if (match.Index > position)
                {
                    // Copy over everything up to the start of the match.
                    source.Append(markup.Substring(position, match.Index - position));
                }
                position = match.Index + match.Length;
            }

            // Copy over everything after the last match.
            source.Append(markup.Substring(position));
            return source.ToString();
        }

        /// <summary>
        /// Throw an exception if the given control property is not null.
        /// </summary>
        /// <remarks>
        /// E.g., you can't set the <script> tag more than once per control.
        /// </remarks>
        private static void VerifyPropertyIsNull(object tag, string tagName)
        {
            if (tag != null)
            {
                throw new CompilerException(
                    String.Format("The \"{0}\" property can't be set more than once.", tagName));
            }
        }

#if DEBUG
        [TestFixture]
        public class ExtractionTests
        {
            [Test]
            public void Empty()
            {
                string markup = @"<Control name='foo'/>";
                string source = markup;
                CheckExtraction(markup, source, null, null);
            }

            [Test]
            public void PrototypeImplicit()
            {
                string markup = @"<Control name='foo'>Hello</Control>";
                string source = markup;
                CheckExtraction(markup, source, null, null);
            }

            [Test]
            public void PrototypeExplicit()
            {
                string markup = @"<Control name='foo'><prototype>Hello</prototype></Control>";
                string source = markup;
                CheckExtraction(markup, source, null, null);
            }

            [Test]
            public void Script()
            {
                string markup = @"<Control name='foo'>Hello<script>alert('Hi');</script></Control>";
                string source = @"<Control name='foo'>Hello</Control>";
                string script = @"alert('Hi');";
                CheckExtraction(markup, source, script, null);
            }

            [Test]
            public void ScriptCData()
            {
                string markup = @"<Control name='foo'>Hello<script><![CDATA[alert('Hi');]]></script></Control>";
                string source = @"<Control name='foo'>Hello</Control>";
                string script = @"alert('Hi');";
                CheckExtraction(markup, source, script, null);
            }

            [Test]
            public void Style()
            {
                string markup = @"<Control name='foo'>Hello<style>{ color: red; }</style></Control>";
                string source = @"<Control name='foo'>Hello</Control>";
                string style = @"{ color: red; }";
                CheckExtraction(markup, source, null, style);
            }

            [Test]
            public void PrototypeScriptStyle()
            {
                string markup = @"<Control name='foo'><prototype>Hello</prototype><style>{ color: red; }</style><script>alert('Hi');</script></Control>";
                string source = @"<Control name='foo'><prototype>Hello</prototype></Control>";
                string script = @"alert('Hi');";
                string style = @"{ color: red; }";
                CheckExtraction(markup, source, script, style);
            }

            [Test]
            [ExpectedException(typeof(CompilerException))]
            public void DuplicateScript()
            {
                string markup = @"<Control name='foo'><script>alert('Hi');</script><script>alert('Bye');</script></Control>";
                CheckExtraction(markup, null, null, null);
            }

            private void CheckExtraction(string markup, string expectedSource, string expectedScript, string expectedStyle)
            {
                string script;
                string style;
                string source = PreprocessMarkup(markup, out script, out style);
                Assert.AreEqual(expectedSource, source);
                Assert.AreEqual(expectedStyle, style);
                Assert.AreEqual(expectedScript, script);
            }

            //private void CheckControlProperties(string source, Control prototype, string script, string style)
            //{
            //    ControlClass c = MarkupParser.Parse(source);
            //    Assert.AreEqual(prototype, c.Prototype);
            //    Assert.AreEqual(style, c.Style);
            //    Assert.AreEqual(script, c.Script);
            //}
        }
#endif
    }
}
