using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// Compiles a Quick markup document (the contents of a .qui file)
    /// and returns the control class declaration it contains.
    /// </summary>
    /// <remarks>
    /// This class handles parsing the top-level <Control/> element,
    /// and its child <prototype/>, <style/>, and <script/> elements.
    /// It's responsible for verifying that the markup is generally
    /// well-formed at this outermost level.
    /// </remarks>
    public static class MarkupCompiler
    {
        private static Regex regexTags = new Regex(
            @"<(?<tag>script|style)>(?:(?:\s*<!\[CDATA\[(?'contents'.*?)\]\]>\s*)|(?'contents'.*?))</(?:\k<tag>)>",
            RegexOptions.Compiled | RegexOptions.Singleline);

        public static MarkupControlClass Compile(TextReader markupReader)
        {
            return Compile(markupReader.ReadToEnd());
        }

        /// <summary>
        /// Parse the Quick markup document.
        /// </summary>
        public static MarkupControlClass Compile(string markup)
        {
            // Preprocess to extract any script and/or style tags.
            string script;
            string style;
            string processed = PreprocessMarkup(markup, out script, out style);

            // Parse the remaining (processed) source.
            XElement controlElement = GetControlElement(processed);
            MarkupControlInstance controlInstance = new MarkupControlInstance(controlElement);
            MarkupControlClass controlClass = new MarkupControlClass(controlInstance, script, style);

            return controlClass;
        }

        /// <summary>
        /// Read the markup as XML and return the <Control/> element.
        /// </summary>
        private static XElement GetControlElement(string markup)
        {
            StringReader markupReader = new StringReader(markup);
            XmlReaderSettings xmlReaderSettings = new XmlReaderSettings
            {
                IgnoreComments = true,
                IgnoreProcessingInstructions = true
            };
            XmlReader xmlReader = XmlReader.Create(markupReader, xmlReaderSettings);
            XDocument document = XDocument.Load(xmlReader);
            XElement controlElement = document.Element("Control");

            // Ensure the root element actually is "Control".
            if (controlElement == null)
            {
                throw new CompilerException(
                    String.Format("The root element of a Quick markup file must be a <Control> element."));
            }
            
            return controlElement;
        }

        /// <summary>
        /// Return the contents of the given Quick markup with the
        /// contents of the <script/> and <style/> elements (if present) removed
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
                        VerifyPropertyIsNull(tag, script);
                        script = contents;
                        break;

                    case "style":
                        VerifyPropertyIsNull(tag, style);
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
        /// E.g., you can't set the <script/> tag more than once per control.
        /// </remarks>
        private static void VerifyPropertyIsNull(string propertyName, object propertyValue)
        {
            if (propertyValue != null)
            {
                throw new CompilerException(
                    String.Format("The \"{0}\" property can't be set more than once.", propertyName));
            }
        }

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void Empty()
            {
                string markup = @"<Control name='foo'/>";
                string source = markup;
                CheckExtraction(markup, source, null, null);
            }

            [Test]
            public void ContentImplicit()
            {
                string markup = @"<Control name='foo'>Hello</Control>";
                string source = markup;
                CheckExtraction(markup, source, null, null);
            }

            [Test]
            public void ContentExplicit()
            {
                string markup = @"<Control name='foo'><content>Hello</content></Control>";
                string source = markup;
                CheckExtraction(markup, source, null, null);
            }

            [Test]
            public void Prototype()
            {
                string markup = @"<Control name='foo'><prototype><Button>Hello</Button></prototype></Control>";
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
            [ExpectedException(typeof(XmlException))]
            public void NoRootElement()
            {
                string source = "This source has no root element";
                MarkupControlClass c = MarkupCompiler.Compile(source);
            }

            [Test]
            [ExpectedException(typeof(CompilerException))]
            public void RootElementNotControl()
            {
                string source = "<Foo/>";
                MarkupControlClass c = MarkupCompiler.Compile(source);
            }

            [Test]
            [ExpectedException(typeof(CompilerException))]
            public void DuplicateScript()
            {
                string markup = @"<Control name='foo'><script>alert('Hi');</script><script>alert('Bye');</script></Control>";
                CheckExtraction(markup, null, null, null);
            }

            [Test]
            public void SimpleControl()
            {
                MarkupControlClass c = CompileControlFromEmbeddedFile("qc.Tests.simple.qui");
                Assert.AreEqual("Simple", c.Name);
                MarkupHtmlElement content = (MarkupHtmlElement) ((MarkupElementCollection) c.Content).Items.ToArray()[1];
                Assert.AreEqual("Simple_content", content.Id);
                Assert.AreEqual("<span id=\"Simple_content\" />", content.Html);
            }

            [Test]
            public void SimpleHostControl()
            {
                MarkupControlClass controlClass = CompileControlFromEmbeddedFile("qc.Tests.simplehost.qui");
                Assert.AreEqual("SimpleHost", controlClass.Name);
                MarkupElement[] elements = ((MarkupElementCollection) controlClass.Content).Items.ToArray();
                Assert.AreEqual("\n  Text\n  ", ((MarkupHtmlElement) elements[0]).Html);
                MarkupControlInstance control = (MarkupControlInstance) elements[1];
                Assert.AreEqual("Simple", control.ClassName);
                Assert.IsInstanceOf<MarkupHtmlElement>(control.Properties["content"]);
                Assert.AreEqual("Hello, world!", ((MarkupHtmlElement) control.Properties["content"]).Html);
            }

            private MarkupControlClass CompileControlFromEmbeddedFile(string fileName)
            {
                using (StreamReader reader = Utilities.GetEmbeddedFileReader(fileName))
                {
                    return Compile(reader);
                }
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
        }
#endif
    }
}
