using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    class ControlParser
    {
        // The contents of <script/> and <style/> tags are handled specially
        // to avoid messing with any significant whitespace they contain.
        const string elementNameScript = "script";
        const string elementNameStyle = "style";

        /// <summary>
        /// Parse a control from the given Quick markup and return a top-level control structure.
        /// </summary>
        public static ControlClass ParseControlClass(TextReader sourceReader)
        {
            XmlReaderSettings xmlReaderSettings = new XmlReaderSettings
            {
                IgnoreComments = true,
                IgnoreProcessingInstructions = true,
                IgnoreWhitespace = true
            };
            XmlReader xmlReader = XmlReader.Create(sourceReader, xmlReaderSettings);
            return ParseControlClass(XElement.Load(xmlReader));
        }

        /// <summary>
        /// Parse a control from the given Quick markup and return a top-level control structure.
        /// </summary>
        public static ControlClass ParseControlClass(XElement element)
        {
            ControlNode node = ParseControl(element);
            return new ControlClass(node.Control);
        }

        /// <summary>
        /// Parse the control represented by the given element.
        /// </summary>
        public static ControlNode ParseControl(XElement element)
        {
            // Take the element's tag as the control's class.
            // UNDONE: Ensure tag is uppercase.
            Control c = new Control()
            {
                ClassName = element.Name.ToString()
            };
            ControlNode node = new ControlNode(c);

            // Take all tag attributes as properties.
            foreach (XAttribute attribute in element.Attributes())
            {
                if (attribute.Name == "id" && IsPublicId(attribute.Value))
                {
                    // Promote the ID to the node.
                    node.Id = attribute.Value;
                }
                c[attribute.Name.ToString()] = new HtmlNode(attribute.Value);
            }

            // Take all element content as compound properties and/or
            // control content.
            ParseControlContent(element, c);

            return node;
        }

        /// <summary>
        /// Parse the child nodes of the given element in two ways:
        /// 1) Extract any compound properties and assign them to the control.
        /// 2) Take all remaining children and reduce them to a content property.
        /// </summary>
        static void ParseControlContent(XElement element, Control c)
        {
            List<XNode> contentNodes = new List<XNode>();

            // Factor out compound properties from the content.
            foreach (XNode childNode in element.Nodes())
            {
                XElement childElement = childNode as XElement;
                if (IsPropertyTag(childElement))
                {
                    c[childElement.Name.ToString()] = ParseXNodes(childElement.Nodes());
                }
                else
                {
                    contentNodes.Add(childNode);
                }
            }

            // Parse the remaining children as content.
            Node contentNode = ParseXNodes(contentNodes);
            if (contentNode != null)
            {
                // Set the implicit content property. This will overwrite content
                // set through an attribute or compound property.
                c["content"] = contentNode;
            }
        }

        /// <summary>
        /// Parse a collection of XNodes (of unknown type).
        /// </summary>
        static Node ParseXNodes(IEnumerable<XNode> xNodes)
        {
            if (xNodes == null || xNodes.Count() == 0)
            {
                return null;
            }

            if (xNodes.Count() == 1)
            {
                // Parse singleton.
                return ParseXNode(xNodes.ToArray()[0]);
            }

            // Parse each item in the collection.
            IEnumerable<Node> nodes = xNodes.Select(xNode => ParseXNode(xNode));

            // If the nodes are all HTML, and there are no Ids below this point,
            // the nodes can be collapsed to a single node.
            // UNDONE: Reduce consecutive HTML nodes, even if there are other nodes types,
            // or HTML nodes with Ids, too.
            if (nodes.All(node => 
                node.Id == null
                && node is HtmlNode
                && ((HtmlNode) node).ChildNodes == null))
            {
                return new HtmlNode(nodes.Concatenate(node => ((HtmlNode) node).Html));
            }

            // Return a heterogenous collection.
            return new NodeCollection(nodes);
        }

        /// <summary>
        /// Parse the content at the given XNode (of unknown type).
        /// </summary>
        public static Node ParseXNode(XNode node)
        {
            switch (node.NodeType)
            {
                case XmlNodeType.CDATA:
                    return ParseCData((XCData) node);

                case XmlNodeType.Element:
                    return HtmlElements.IsHtmlElement((XElement) node)
                        ? (Node) ParseHtml((XElement) node)
                        : (Node) ParseControl((XElement) node);

                case XmlNodeType.Text:
                    return ParseText((XText) node);

                default:
                    throw new CompilerException(
                        String.Format("Couldn't parse unexpected XML element <{0}>.", node));
            }
        }

        /// <summary>
        /// Parse the HTML node at the given element.
        /// </summary>
        static HtmlNode ParseHtml(XElement element)
        {
            HtmlNode node = new HtmlNode();

            XAttribute idAttribute = element.Attribute("id");
            if (idAttribute != null && IsPublicId(idAttribute.Value))
            {
                node.Id = idAttribute.Value;
            }          

            IEnumerable<XNode> children = element.Nodes();
            Node childrenNode = ParseXNodes(children);

            if (childrenNode == null
                || (childrenNode is HtmlNode
                    && childrenNode.Id == null
                    && ((HtmlNode) childrenNode).ChildNodes == null))
            {
                // This node and everything it contains is plain HTML; return it as is.
                node.Html = element.ToString(SaveOptions.DisableFormatting);
                return node;
            }

            // UNDONE: Optimization: Any children which are just HTML can be merged into this node.

            // Extract only the top-level tag information. To do this, create a
            // new element that has only the name and attributes.
            XElement topElement = new XElement(element.Name,
                element.Attributes()
            );
            node.Html = topElement.ToString(SaveOptions.DisableFormatting);

            // Add in the children nodes.
            node.ChildNodes =
                childrenNode is NodeCollection
                    ? (NodeCollection) childrenNode
                    : new NodeCollection(new Node[] { childrenNode });

            return node;
        }

        /// <summary>
        /// Parse the text node at the given element.
        /// </summary>
        static HtmlNode ParseText(XText node)
        {
            string s = node.Value;

            // Browsers like WebKit don't like seeing "<" in text.
            // Undo any entity replacement made by the parser in a text node
            // so that at run-time the text can be added as-is to the HTML.
            s = s.Replace("<", "&lt;");

            // Remove extra white space for most text nodes.
            // Exception: leave <style/> and <script/> tags alone.
            string parentName =
                (node.Parent == null) ? null : node.Parent.Name.ToString();
            if (parentName != elementNameStyle && parentName != elementNameScript)
            {
                s = CollapseWhiteSpaceRuns(s);
            }

            return new HtmlNode(s);
        }

        /// <summary>
        /// Parse the CDATA node at the given element.
        /// </summary>
        static HtmlNode ParseCData(XCData node)
        {
            return new HtmlNode(node.Value);
        }

        /// <summary>
        /// Return true if the given node represents a property tag.
        /// </summary>
        /// <remarks>
        /// The name of a property tag node takes the form <property/>,
        /// where "property" is lowercase, and not a recognized HTML element.
        /// </remarks>
        static bool IsPropertyTag(XElement element)
        {
            return element != null
                && !HtmlElements.IsHtmlElement(element)
                && Char.IsLower(element.Name.ToString()[0]);
        }

        /// <summary>
        /// Return true if the given string is valid as a public ID for an element or control.
        /// This returns false if the id starts with an underscore ("_").
        /// </summary>
        static bool IsPublicId(string id)
        {
            return !id.StartsWith("_");
        }

        /// <summary>
        /// Replace all runs of whitespace with a single space.
        /// </summary>
        /// <remarks>
        /// The .NET XML reader doesn't seem to ignore whitespace within a text
        /// node the same way a typical HTML parser does, so we have to do this
        /// ourselves.
        /// </remarks>
        static string CollapseWhiteSpaceRuns(string s)
        {
            return whiteSpaceRuns.Replace(s, " ");
        }
        static Regex whiteSpaceRuns = new Regex(@"\s+");

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void Text()
            {
                XText element = new XText("Hello");
                HtmlNode node = (HtmlNode) ParseXNode(element);
                Assert.AreEqual("Hello", node.Html);
            }

            [Test]
            public void Html()
            {
                XElement element = new XElement("div",
                    new XAttribute("id", "foo")
                );
                HtmlNode node = ParseHtml(element);
                Assert.AreEqual("foo", node.Id);
                Assert.AreEqual("<div id=\"foo\" />", node.Html);
            }

            [Test]
            public void HtmlWithPrivateId()
            {
                XElement element = new XElement("div",
                    new XAttribute("id", "_foo")
                );
                HtmlNode node = ParseHtml(element);
                Assert.IsNull(node.Id);
            }

            [Test]
            public void HtmlContainsText()
            {
                XElement element = new XElement("p",
                    new XText("Hello")
                );
                HtmlNode node = ParseHtml(element);
                Assert.AreEqual("<p>Hello</p>", node.Html);
            }

            [Test]
            public void HtmlContainsHtml()
            {
                XElement element = new XElement("div",
                    new XElement("h1"),
                    new XElement("p",
                        new XText("Hello")
                    )
                );
                HtmlNode node = (HtmlNode) ParseXNode(element);
                Assert.AreEqual("<div><h1 /><p>Hello</p></div>", node.Html);
            }

            [Test]
            public void HtmlContainsHtmlWithId()
            {
                XElement element = new XElement("div",
                    new XElement("p",
                        new XAttribute("id", "content")
                    )
                );
                HtmlNode node = (HtmlNode) ParseXNode(element);
                Assert.AreEqual("<div />", node.Html);
                Assert.IsNotNull(node.ChildNodes);
                Assert.AreEqual(1, node.ChildNodes.Count());
                List<Node> items = new List<Node>(node.ChildNodes);
                Assert.IsInstanceOf<HtmlNode>(items[0]);
                HtmlNode contentNode = (HtmlNode) items[0];
                Assert.AreEqual("<p id=\"content\" />", contentNode.Html);
                Assert.AreEqual("content", contentNode.Id);
            }

            [Test]
            public void HtmlContainsHtmlWithIdContainsText()
            {
                XElement element = new XElement("div",
                    new XElement("h1"),
                    new XElement("p",
                        new XAttribute("id", "content"),
                        new XText("Hello")
                    )
                );
                HtmlNode node = (HtmlNode) ParseXNode(element);
                Assert.AreEqual("<div />", node.Html);
                Assert.AreEqual(2, node.ChildNodes.Count());
                List<Node> items = new List<Node>(node.ChildNodes);
                Assert.IsInstanceOf<HtmlNode>(items[0]);
                Assert.AreEqual("<h1 />", ((HtmlNode) items[0]).Html);
                Assert.IsInstanceOf<HtmlNode>(items[1]);
                HtmlNode contentNode = (HtmlNode) items[1];
                Assert.AreEqual("<p id=\"content\">Hello</p>", contentNode.Html);
                Assert.AreEqual("content", contentNode.Id);
            }

            [Test]
            public void ControlClass()
            {
                XElement element = new XElement("Control",
                    new XAttribute("name", "Minimal")
                );
                ControlClass c = ParseControlClass(element);
                Assert.AreEqual("Minimal", c.Name);
                Assert.AreEqual("QuickControl", c.Prototype.ClassName);
                Assert.AreEqual(0, c.Prototype.Properties.Count);
            }

            [Test]
            public void ControlClassWithImplicitPrototype()
            {
                XElement element = new XElement("Control",
                    new XAttribute("name", "Foo"),
                    new XElement("Bar",
                        new XAttribute("content", "Hello")
                    )
                );
                ControlClass controlClass = ParseControlClass(element);
                Control prototype = (Control) controlClass.Prototype;
                Assert.AreEqual("Bar", prototype.ClassName);
                Assert.AreEqual("Hello", ((HtmlNode) prototype["content"]).Html);
            }

            [Test]
            public void ControlContainsHtml()
            {
                XElement element = new XElement("Foo",
                    new XElement("h1", "heading"),
                    new XElement("p", "paragraph")
                );
                Control c = ParseControl(element).Control;
                Assert.IsInstanceOf<HtmlNode>(c["content"]);
                Assert.AreEqual("<h1>heading</h1><p>paragraph</p>", ((HtmlNode) c["content"]).Html);
            }

            [Test]
            public void ControlWithAttribute()
            {
                XElement element = new XElement("Foo",
                    new XAttribute("bar", "Attribute property value")
                );
                Control c = ParseControl(element).Control;
                Assert.Contains("bar", c.Properties.Keys);
                Assert.AreEqual("Attribute property value", ((HtmlNode) c["bar"]).Html);
            }

            [Test]
            public void CompoundPropertyContainsText()
            {
                XElement element = new XElement("Foo",
                    new XElement("bar", "Compound property value"),
                    new XElement("p", "paragraph")
                );
                Control c = ParseControl(element).Control;
                Assert.Contains("bar", c.Properties.Keys);
                Assert.AreEqual("Compound property value", ((HtmlNode) c["bar"]).Html);
                Assert.AreEqual("<p>paragraph</p>", ((HtmlNode) c["content"]).Html);
            }

            [Test]
            public void CompoundPropertyContainsHtml()
            {
                XElement element = new XElement("Foo",
                    new XElement("bar", 
                        new XElement("p", "Compound property content")
                    ),
                    new XElement("p", "paragraph")
                );
                Control c = ParseControl(element).Control;
                Assert.Contains("bar", c.Properties.Keys);
                Assert.AreEqual("<p>Compound property content</p>", ((HtmlNode) c["bar"]).Html);
                Assert.AreEqual("<p>paragraph</p>", ((HtmlNode) c["content"]).Html);
            }

            [Test]
            public void HtmlContainsControl()
            {
                XElement element = new XElement("div",
                    new XElement("Foo",
                        new XText("Control content")
                    )
                );
                Node node = ParseXNode(element);
                Assert.IsInstanceOf<HtmlNode>(node);
                HtmlNode htmlNode = (HtmlNode) node;
                Assert.AreEqual(1, htmlNode.ChildNodes.Count());
                Node childNode = htmlNode.ChildNodes.ToArray()[0];
                Assert.IsInstanceOf<ControlNode>(childNode);
                ControlNode controlNode = (ControlNode)childNode;
                Assert.AreEqual("Foo", controlNode.Control.ClassName);
            }

            [Test]
            public void Collection()
            {
                XElement element = new XElement("Foo",
                    new XElement("Bar", "Control content"),
                    new XElement("p", "paragraph")
                );
                Node node = ParseXNodes(element.Nodes());
                Assert.IsInstanceOf<NodeCollection>(node);
                NodeCollection collection = (NodeCollection) node;
                Assert.IsNotNull(collection);
                Assert.AreEqual(2, collection.Count());
                List<Node> items = new List<Node>(collection);
                Assert.IsInstanceOf<ControlNode>(items[0]);
                Assert.IsInstanceOf<HtmlNode>(items[1]);
            }

            [Test]
            [ExpectedException(typeof(XmlException))]
            public void NoRootElement()
            {
                string source = "This source has no root element";
                StringReader stringReader = new StringReader(source);
                ControlClass c = ParseControlClass(stringReader);
            }

            [Test]
            [ExpectedException(typeof(CompilerException))]
            public void RootElementNotClass()
            {
                XElement element = new XElement("foo");  // Root element is lowercase, hence not a class.
                ControlClass c = ParseControlClass(element);
            }

            [Test]
            [ExpectedException(typeof(CompilerException))]
            public void MissingClassName()
            {
                XElement element = new XElement("Control");
                ControlClass c = ParseControlClass(element);
            }

            [Test]
            public void SimpleControl()
            {
                ControlClass c = ParseControlFromEmbeddedFile("qc.Tests.simple.qui");
                Assert.AreEqual("Simple", c.Name);
                Assert.AreEqual("QuickControl", c.Prototype.ClassName);
                Assert.AreEqual(1, c.Prototype.Properties.Count);
                Assert.IsTrue(c.Prototype.Properties.ContainsKey("content"));

                HtmlNode property = (HtmlNode) c.Prototype.Properties["content"];
                Assert.AreEqual("Simple_content", property.Id);
                Assert.AreEqual("<span id=\"Simple_content\" />", property.Html);
            }

            [Test]
            public void SimpleHostControl()
            {
                ControlClass controlClass = ParseControlFromEmbeddedFile("qc.Tests.simplehost.qui");
                Assert.AreEqual("SimpleHost", controlClass.Name);
                Assert.IsInstanceOf<NodeCollection>(controlClass.Prototype["content"]);
                List<Node> nodes = new List<Node>((NodeCollection) controlClass.Prototype["content"]);
                Assert.AreEqual(" Text ", ((HtmlNode) nodes[0]).Html);
                Control control = ((ControlNode) nodes[1]).Control;
                Assert.AreEqual("Simple", control.ClassName);
                Assert.IsInstanceOf<HtmlNode>(control["content"]);
                Assert.AreEqual("Hello, world!", ((HtmlNode) control["content"]).Html);
            }

            private ControlClass ParseControlFromEmbeddedFile(string fileName)
            {
                using (StreamReader reader = Utilities.GetEmbeddedFileReader(fileName))
                {
                    return ControlParser.ParseControlClass(reader);
                }
            }
        }
#endif
    }
}
