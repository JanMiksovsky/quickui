using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace qc
{
    /// <summary>
    /// An HTML fragment found in Quick markup.
    /// </summary>
    public class MarkupHtmlElement : MarkupElement
    {
        public string Html { get; set; }
        public MarkupElementCollection ChildNodes { get; set; }

        public MarkupHtmlElement(string html)
        {
            this.Html = html;
        }

        public MarkupHtmlElement(string html, string id)
            : this(html)
        {
            this.Id = id;
        }

        /// <summary>
        /// Parse the HTML node at the given element.
        /// </summary>
        public MarkupHtmlElement(XElement element)
        {
            XAttribute idAttribute = element.Attribute("id");
            if (idAttribute != null && IsPublicId(idAttribute.Value))
            {
                Id = idAttribute.Value;
                // TODO: Make a copy of the element instead of destructively modifying it.
                idAttribute.Remove();
            }

            MarkupNode childrenNode = MarkupNode.Parse(element.Nodes());
            if ( childrenNode == null
                || (childrenNode is MarkupHtmlElement
                    && ((MarkupHtmlElement)childrenNode).Id == null
                    && ((MarkupHtmlElement)childrenNode).ChildNodes == null))
            {
                // This node and everything it contains is plain HTML; use it as is.
                Html = element.ToString(SaveOptions.DisableFormatting);
            }
            else
            {
                // UNDONE: Optimization: Any children which are just HTML can be merged into this node.

                // Extract only the top-level tag information. To do this, create a
                // new element that has only the name and attributes.
                XElement topElement = new XElement(element.Name,
                    element.Attributes()
                );
                Html = topElement.ToString(SaveOptions.DisableFormatting);

                // Add in the children nodes.
                ChildNodes =
                    childrenNode is MarkupElementCollection
                        ? (MarkupElementCollection)childrenNode
                        : new MarkupElementCollection(new MarkupElement[] { (MarkupElement)childrenNode });
            }
        }

        /// <summary>
        /// Parse the text node at the given element.
        /// </summary>
        public MarkupHtmlElement(XText node)
            : this(EscapeLessThans(CollapseWhiteSpaceRuns(node.Value)))
        {
        }

        /// <summary>
        /// Parse the CDATA node at the given element.
        /// </summary>
        public MarkupHtmlElement(XCData node)
            : this(node.Value)
        {
        }

        /// <summary>
        /// Return the JavaScript for the given HTML node.
        /// </summary>
        public override string JavaScript(int indentLevel)
        {
            string html = EscapeJavaScript(Html);

            if (Id == null && ChildNodes == null)
            {
                // Simplest case; just quote the HTML and return it.
                return Template.Format(
                    "{Html}",
                    new
                    {
                        Html = html
                    });
            }

            string idDeclaration = EmitIdDeclaration(indentLevel + 1);
            string children = EmitChildren(indentLevel + 1);
            
            return Template.Format(
                "{\n" +
                "{Tabs}    html: {Html}{Comma1}\n" +
                "{IdDeclaration}{Comma2}{NewLine}" + 
                "{Children}" +
                "{Tabs}}",
                new
                {
                    Tabs = Tabs(indentLevel),
                    Html = html,
                    Comma1 = String.IsNullOrEmpty(idDeclaration) && String.IsNullOrEmpty(children)
                        ? ""
                        : ",",
                    IdDeclaration = idDeclaration,
                    Comma2 = String.IsNullOrEmpty(idDeclaration) || String.IsNullOrEmpty(children)
                        ? ""
                        : ",",
                    NewLine = String.IsNullOrEmpty(idDeclaration) ? "" : "\n",
                    Children = children
                });
        }

        public override bool IsWhiteSpace()
        {
            return Html != null && Html.Trim().Length == 0;
        }

        private string EmitChildren(int indentLevel)
        {
            if (ChildNodes == null)
            {
                return String.Empty;
            }

            return Template.Format(
                "{Tabs}content: {ChildNodes}\n",
                new
                {
                    Tabs = Tabs(indentLevel),
                    ChildNodes = ChildNodes.JavaScript(indentLevel)
                });

        }

        /// <summary>
        /// Replace all runs of whitespace with a single space.
        /// </summary>
        /// <remarks>
        /// As a stylistic choice, the Quick markup compiler collapses
        /// contiguous runs of whitespace into a single space. HTML rendering
        /// engines generally treat whitespace runs as a single space, so
        /// in most cases this optimization won't affect run-time rendering,
        /// and it leaves the compiled JavaScript a bit easier to read.
        /// 
        /// Note that we don't trim whitespace (e.g., at the beginning or end
        /// of text), because that *would* affect rendering in situations
        /// involving adjoining text elements.
        /// </remarks>
        private static string CollapseWhiteSpaceRuns(string s)
        {
            return whiteSpaceRuns.Replace(s, " ");
        }
        private static readonly Regex whiteSpaceRuns = new Regex(@"\s+", RegexOptions.Compiled);

        // WebKit doesn't seem to like seeing "<" in text.
        // Undo any entity replacement made by the parser in a text node
        // so that at run-time the text can be added as-is to the HTML.
        private static string EscapeLessThans(string s)
        {
            return s.Replace("<", "&lt;");
        }
    }
}
