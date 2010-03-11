using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Xml;
using System.Xml.Linq;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// A node in Quick markup.
    /// </summary>
    /// <remarks>
    /// Each markup node class is essentially a mini compiler: it can
    /// parse a specific type of Quick markup (XML) element, and generate
    /// JavaScript code that can construct that element at run-time.
    /// 
    /// Quick markup nodes can be any one of the following subclasses:
    /// 1) MarkupElement (which will be either an HTMLELement or ControlElement)
    /// 2) MarkupElementCollection: A collection of Quick markup elements
    /// </remarks>
    public abstract class MarkupNode
    {
        /// <summary>
        /// Return the JavaScript for this node, indenting at the given number of tabs.
        /// </summary>
        public abstract string JavaScript(int indentLevel);

        /// <summary>
        /// Return the JavaScript for this node.
        /// </summary>
        public virtual string JavaScript()
        {
            return JavaScript(0);
        }

        /// <summary>
        /// Parse a collection of XNodes (of unknown type).
        /// </summary>
        public static MarkupNode Parse(IEnumerable<XNode> xNodes)
        {
            if (xNodes == null || xNodes.Count() == 0)
            {
                return null;
            }

            if (xNodes.Count() == 1)
            {
                // Parse singleton.
                return MarkupHtmlElement.Parse(xNodes.ToArray()[0]);
            }

            // Parse each item in the collection.
            IEnumerable<MarkupElement> elements = xNodes.Select(
                                    xNode => MarkupHtmlElement.Parse(xNode));

            // If the nodes are all HTML, and there are no Ids below this point,
            // the nodes can be collapsed to a single node.
            // UNDONE: Reduce consecutive HTML nodes, even if there are other nodes types,
            // or HTML nodes with Ids, too.
            if (elements.All(element =>
                element is MarkupHtmlElement
                && ((MarkupHtmlElement) element).Id == null
                && ((MarkupHtmlElement) element).ChildNodes == null))
            {
                return new MarkupHtmlElement(elements.Concatenate(node => ((MarkupHtmlElement) node).Html));
            }

            // Return a heterogenous collection.
            return new MarkupElementCollection(elements);
        }

        /// <summary>
        /// Return an escaped version of the string that will be acceptable to JavaScript.
        /// </summary>
        /// <remarks>
        /// Adapted from "Enquote" found at json.org by Are Bjolseth.
        /// </remarks>
        protected static string EscapeJavaScript(string s)
        {
            StringBuilder stringBuilder = new StringBuilder(s.Length + 2);

            stringBuilder.Append('"');

            foreach (char c in s)
            {
                switch (c)
                {
                    case '\\':
                    case '"':
                        stringBuilder.Append('\\');
                        stringBuilder.Append(c);
                        break;

                    case '\b':
                        stringBuilder.Append("\\b");
                        break;

                    case '\t':
                        stringBuilder.Append("\\t");
                        break;

                    case '\n':
                        stringBuilder.Append("\\n");
                        break;

                    case '\f':
                        stringBuilder.Append("\\f");
                        break;

                    case '\r':
                        stringBuilder.Append("\\r");
                        break;

                    default:
                        if (c < ' ')
                        {
                            // Use hex representation.
                            string hex = String.Format("{0:x4}", Convert.ToInt32(c));
                            stringBuilder.Append("\\u" + hex);
                        }
                        else
                        {
                            stringBuilder.Append(c);
                        }
                        break;

                }
            }

            stringBuilder.Append('"');

            return stringBuilder.ToString();
        }

        protected string IndentLine(string s, int tabCount)
        {
            StringBuilder output = new StringBuilder();
            output.Append(Tabs(tabCount));
            output.Append(s);
            output.Append('\n');
            return output.ToString();
        }

        protected string Tabs(int tabCount)
        {
            StringBuilder output = new StringBuilder();
            for (int i = 0; i < tabCount; i++)
            {
                output.Append('\t');
            }
            return output.ToString();
        }

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void EscapeString()
            {
                string s = "\tHi\a;\n";
                string escaped = EscapeJavaScript(s);
                Assert.AreEqual("\"\\tHi\\u0007;\\n\"", escaped);
            }
        }
#endif
    }
}
