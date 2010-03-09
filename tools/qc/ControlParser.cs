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
    /// <summary>
    /// Compiles the strict XML portion of Quick markup: the top level
    /// <Control> tag and the <prototype> element.
    /// </summary>
    /// <remarks>
    /// Because the script and style elements may not contain legal XML,
    /// they should be removed before this class is invoked.
    /// </remarks>
    static class ControlParser
    {
        public static ControlClass ParseControlClass(string source)
        {
            return ParseControlClass(new StringReader(source));
        }

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
        /// Parse a control from the given XML and return a top-level control structure.
        /// </summary>
        public static ControlClass ParseControlClass(XElement element)
        {
            ControlElement control = ParseControl(element);
            return new ControlClass(control);
        }

        /// <summary>
        /// Parse the control represented by the given element.
        /// </summary>
        public static ControlElement ParseControl(XElement element)
        {
            // Take the element's tag as the control's class.
            // UNDONE: Ensure tag is uppercase.
            ControlElement control = new ControlElement()
            {
                ClassName = element.Name.ToString()
            };

            // Take all tag attributes as properties.
            foreach (XAttribute attribute in element.Attributes())
            {
                if (attribute.Name == "id" && IsPublicId(attribute.Value))
                {
                    // Promote the ID to the node.
                    control.Id = attribute.Value;
                }
                control.Properties[attribute.Name.ToString()] = new HtmlElement(attribute.Value);
            }

            // Take all element content as compound properties and/or
            // control content.
            ParseControlContent(element, control);

            return control;
        }

        /// <summary>
        /// Parse the child nodes of the given element in two ways:
        /// 1) Extract any compound properties and assign them to the control.
        /// 2) Take all remaining children and reduce them to a content property.
        /// </summary>
        static void ParseControlContent(XElement element, ControlElement control)
        {
            List<XNode> contentNodes = new List<XNode>();

            // Factor out compound properties from the content.
            foreach (XNode childNode in element.Nodes())
            {
                XElement childElement = childNode as XElement;
                if (IsPropertyTag(childElement))
                {
                    MarkupNode node = ParseXNodes(childElement.Nodes());
                    if (node == null)
                    {
                        // An empty compound property is equivalent to the empty string.
                        node = new HtmlElement(String.Empty);
                    }
                    control.Properties[childElement.Name.ToString()] = node;

                }
                else
                {
                    contentNodes.Add(childNode);
                }
            }

            // Parse the remaining children as content.
            MarkupNode contentNode = ParseXNodes(contentNodes);
            if (contentNode != null)
            {
                // Set the implicit content property. This will overwrite content
                // set through an attribute or compound property.
                control.Properties["content"] = contentNode;
            }
        }

        /// <summary>
        /// Parse a collection of XNodes (of unknown type).
        /// </summary>
        static MarkupNode ParseXNodes(IEnumerable<XNode> xNodes)
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
            IEnumerable<MarkupNode> nodes = xNodes.Select(xNode => ParseXNode(xNode));

            // If the nodes are all HTML, and there are no Ids below this point,
            // the nodes can be collapsed to a single node.
            // UNDONE: Reduce consecutive HTML nodes, even if there are other nodes types,
            // or HTML nodes with Ids, too.
            if (nodes.All(node => 
                node is HtmlElement
                && ((HtmlElement) node).Id == null
                && ((HtmlElement) node).ChildNodes == null))
            {
                return new HtmlElement(nodes.Concatenate(node => ((HtmlElement) node).Html));
            }

            // Return a heterogenous collection.
            return new MarkupNodeCollection(nodes);
        }

        /// <summary>
        /// Parse the content at the given XNode (of unknown type).
        /// </summary>
        public static MarkupNode ParseXNode(XNode node)
        {
            switch (node.NodeType)
            {
                case XmlNodeType.CDATA:
                    return ParseCData((XCData) node);

                case XmlNodeType.Element:
                    return HtmlElementNames.IsHtmlElement((XElement) node)
                        ? (MarkupNode) ParseHtml((XElement) node)
                        : (MarkupNode) ParseControl((XElement) node);

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
        static HtmlElement ParseHtml(XElement element)
        {
            HtmlElement node = new HtmlElement();

            XAttribute idAttribute = element.Attribute("id");
            if (idAttribute != null && IsPublicId(idAttribute.Value))
            {
                node.Id = idAttribute.Value;
            }          

            MarkupNode childrenNode = ParseXNodes(element.Nodes());
            if (childrenNode == null
                || (childrenNode is HtmlElement
                    && ((HtmlElement) childrenNode).Id == null
                    && ((HtmlElement) childrenNode).ChildNodes == null))
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
                childrenNode is MarkupNodeCollection
                    ? (MarkupNodeCollection) childrenNode
                    : new MarkupNodeCollection(new MarkupNode[] { childrenNode });

            return node;
        }

        /// <summary>
        /// Parse the text node at the given element.
        /// </summary>
        static HtmlElement ParseText(XText node)
        {
            string s = node.Value;

            // Browsers like WebKit don't like seeing "<" in text.
            // Undo any entity replacement made by the parser in a text node
            // so that at run-time the text can be added as-is to the HTML.
            // s = s.Replace("<", "&lt;");

            // Remove extra white space.
            s = CollapseWhiteSpaceRuns(s);

            return new HtmlElement(s);
        }

        /// <summary>
        /// Parse the CDATA node at the given element.
        /// </summary>
        static HtmlElement ParseCData(XCData node)
        {
            return new HtmlElement(node.Value);
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
                && !HtmlElementNames.IsHtmlElement(element)
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
                HtmlElement node = (HtmlElement) ParseXNode(element);
                Assert.AreEqual("Hello", node.Html);
            }

            [Test]
            public void Html()
            {
                XElement element = new XElement("div",
                    new XAttribute("id", "foo")
                );
                HtmlElement node = ParseHtml(element);
                Assert.AreEqual("foo", node.Id);
                Assert.AreEqual("<div id=\"foo\" />", node.Html);
            }

            [Test]
            public void HtmlWithPrivateId()
            {
                XElement element = new XElement("div",
                    new XAttribute("id", "_foo")
                );
                HtmlElement node = ParseHtml(element);
                Assert.IsNull(node.Id);
            }

            [Test]
            public void HtmlContainsText()
            {
                XElement element = new XElement("p",
                    new XText("Hello")
                );
                HtmlElement node = ParseHtml(element);
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
                HtmlElement node = (HtmlElement) ParseXNode(element);
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
                HtmlElement node = (HtmlElement) ParseXNode(element);
                Assert.AreEqual("<div />", node.Html);
                Assert.IsNotNull(node.ChildNodes);
                Assert.AreEqual(1, node.ChildNodes.Count());
                List<MarkupNode> items = new List<MarkupNode>(node.ChildNodes);
                Assert.IsInstanceOf<HtmlElement>(items[0]);
                HtmlElement contentNode = (HtmlElement) items[0];
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
                HtmlElement node = (HtmlElement) ParseXNode(element);
                Assert.AreEqual("<div />", node.Html);
                Assert.AreEqual(2, node.ChildNodes.Count());
                List<MarkupNode> items = new List<MarkupNode>(node.ChildNodes);
                Assert.IsInstanceOf<HtmlElement>(items[0]);
                Assert.AreEqual("<h1 />", ((HtmlElement) items[0]).Html);
                Assert.IsInstanceOf<HtmlElement>(items[1]);
                HtmlElement contentNode = (HtmlElement) items[1];
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
                Assert.AreEqual("QuickUI.Control", c.Prototype.ClassName);
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
                ControlElement prototype = controlClass.Prototype;
                Assert.AreEqual("Bar", prototype.ClassName);
                Assert.AreEqual("Hello", ((HtmlElement) prototype.Properties["content"]).Html);
            }

            [Test]
            public void ControlContainsHtml()
            {
                XElement element = new XElement("Foo",
                    new XElement("h1", "heading"),
                    new XElement("p", "paragraph")
                );
                ControlElement control = ParseControl(element);
                Assert.IsInstanceOf<HtmlElement>(control.Properties["content"]);
                Assert.AreEqual("<h1>heading</h1><p>paragraph</p>", ((HtmlElement) control.Properties["content"]).Html);
            }

            [Test]
            public void ControlWithAttribute()
            {
                XElement element = new XElement("Foo",
                    new XAttribute("bar", "Attribute property value")
                );
                ControlElement control = ParseControl(element);
                Assert.Contains("bar", control.Properties.Keys);
                Assert.AreEqual("Attribute property value", ((HtmlElement) control.Properties["bar"]).Html);
            }

            [Test]
            public void CompoundPropertyContainsText()
            {
                XElement element = new XElement("Foo",
                    new XElement("bar", "Compound property value"),
                    new XElement("p", "paragraph")
                );
                ControlElement control = ParseControl(element);
                Assert.Contains("bar", control.Properties.Keys);
                Assert.AreEqual("Compound property value", ((HtmlElement) control.Properties["bar"]).Html);
                Assert.AreEqual("<p>paragraph</p>", ((HtmlElement) control.Properties["content"]).Html);
            }

            [Test]
            public void CompoundPropertyIsEmpty()
            {
                XElement element = new XElement("Foo",
                    new XElement("bar")
                );
                ControlElement control = ParseControl(element);
                Assert.Contains("bar", control.Properties.Keys);
                Assert.AreEqual(String.Empty, ((HtmlElement) control.Properties["bar"]).Html);
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
                ControlElement control = ParseControl(element);
                Assert.Contains("bar", control.Properties.Keys);
                Assert.AreEqual("<p>Compound property content</p>", ((HtmlElement) control.Properties["bar"]).Html);
                Assert.AreEqual("<p>paragraph</p>", ((HtmlElement) control.Properties["content"]).Html);
            }

            [Test]
            public void HtmlContainsControl()
            {
                XElement element = new XElement("div",
                    new XElement("Foo",
                        new XText("Control content")
                    )
                );
                MarkupNode node = ParseXNode(element);
                Assert.IsInstanceOf<HtmlElement>(node);
                HtmlElement htmlNode = (HtmlElement) node;
                Assert.AreEqual(1, htmlNode.ChildNodes.Count());
                MarkupNode childNode = htmlNode.ChildNodes.ToArray()[0];
                Assert.IsInstanceOf<ControlElement>(childNode);
                ControlElement control = (ControlElement) childNode;
                Assert.AreEqual("Foo", control.ClassName);
            }

            [Test]
            public void Collection()
            {
                XElement element = new XElement("Foo",
                    new XElement("Bar", "Control content"),
                    new XElement("p", "paragraph")
                );
                MarkupNode node = ParseXNodes(element.Nodes());
                Assert.IsInstanceOf<MarkupNodeCollection>(node);
                MarkupNodeCollection collection = (MarkupNodeCollection) node;
                Assert.IsNotNull(collection);
                Assert.AreEqual(2, collection.Count());
                List<MarkupNode> items = new List<MarkupNode>(collection);
                Assert.IsInstanceOf<ControlElement>(items[0]);
                Assert.IsInstanceOf<HtmlElement>(items[1]);
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
                Assert.AreEqual("QuickUI.Control", c.Prototype.ClassName);
                Assert.AreEqual(1, c.Prototype.Properties.Count);
                Assert.IsTrue(c.Prototype.Properties.ContainsKey("content"));

                HtmlElement property = (HtmlElement) c.Prototype.Properties["content"];
                Assert.AreEqual("Simple_content", property.Id);
                Assert.AreEqual("<span id=\"Simple_content\" />", property.Html);
            }

            [Test]
            public void SimpleHostControl()
            {
                ControlClass controlClass = ParseControlFromEmbeddedFile("qc.Tests.simplehost.qui");
                Assert.AreEqual("SimpleHost", controlClass.Name);
                Assert.IsInstanceOf<MarkupNodeCollection>(controlClass.Prototype.Properties["content"]);
                List<MarkupNode> nodes = new List<MarkupNode>((MarkupNodeCollection) controlClass.Prototype.Properties["content"]);
                Assert.AreEqual(" Text ", ((HtmlElement) nodes[0]).Html);
                ControlElement control = (ControlElement) nodes[1];
                Assert.AreEqual("Simple", control.ClassName);
                Assert.IsInstanceOf<HtmlElement>(control.Properties["content"]);
                Assert.AreEqual("Hello, world!", ((HtmlElement) control.Properties["content"]).Html);
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
