using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

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
            XDocument document = GetDocument(processed);
            IEnumerable<XComment> comments = GetComments(document);
            XElement controlElement = GetControlElement(document);
            MarkupControlInstance controlInstance = new MarkupControlInstance(controlElement);
            MarkupControlClass controlClass = new MarkupControlClass(controlInstance, script, style);
            AddCommentsToClass(controlClass, comments);

            return controlClass;
        }

        private static void AddCommentsToClass(MarkupControlClass controlClass, IEnumerable<XComment> comments)
        {
            StringBuilder s = new StringBuilder();
            foreach (XComment comment in comments)
            {
                if (s.Length > 0)
                {
                    s.AppendLine();
                }
                s.Append(comment.Value);
            }

            controlClass.Comments = s.ToString();
        }

        /// <summary>
        /// Return any <!-- Comment --> nodes at the top level of the document.
        /// </summary>
        private static IEnumerable<XComment> GetComments(XDocument document)
        {
            IEnumerable<XComment> comments = from node in document.Nodes()
                                        where node is XComment
                                        select ((XComment) node);
            return comments;
        }

        /// <summary>
        /// Return the top-level <Control> element in the document.
        /// </summary>
        private static XElement GetControlElement(XDocument document)
        {
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
        /// Return the top-level document from the given markup.
        /// </summary>
        /// <param name="markup"></param>
        /// <returns></returns>
        private static XDocument GetDocument(string markup)
        {
            StringReader markupReader = new StringReader(markup);

            // Need both XmlReader and XDocument to preserve white space.
            // By default, .Net XDocument seems to preserve white space, but
            // Mono XDocument seems to ignore white space by default.
            XmlReaderSettings xmlReaderSettings = new XmlReaderSettings
            {
                // IgnoreComments = true,
                IgnoreProcessingInstructions = true
            };
            XmlReader xmlReader = XmlReader.Create(markupReader, xmlReaderSettings);
            XDocument document = XDocument.Load(xmlReader, LoadOptions.PreserveWhitespace);

            return document;
        }

        /// <summary>
        /// Return the contents of the given Quick markup with the
        /// contents of the <script/> and <style/> elements (if present) removed
        /// and handed back separately.
        /// </summary>
        public static string PreprocessMarkup(string markup, out string script, out string style)
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
    }
}
