using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.IO;
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
        public static MarkupControlClass ParseControlClass(string source)
        {
            return ParseControlClass(new StringReader(source));
        }

        public static MarkupControlClass ParseControlClass(TextReader sourceReader)
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
        public static MarkupControlClass ParseControlClass(XElement element)
        {
            MarkupControlInstance control = new MarkupControlInstance(element);
            return new MarkupControlClass(control);
        }


#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void ControlClass()
            {
                XElement element = new XElement("Control",
                    new XAttribute("name", "Minimal")
                );
                MarkupControlClass c = ParseControlClass(element);
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
                MarkupControlClass controlClass = ParseControlClass(element);
                MarkupControlInstance prototype = controlClass.Prototype;
                Assert.AreEqual("Bar", prototype.ClassName);
                Assert.AreEqual("Hello", ((MarkupHtmlElement) prototype.Properties["content"]).Html);
            }

            [Test]
            [ExpectedException(typeof(XmlException))]
            public void NoRootElement()
            {
                string source = "This source has no root element";
                StringReader stringReader = new StringReader(source);
                MarkupControlClass c = ParseControlClass(stringReader);
            }

            [Test]
            [ExpectedException(typeof(CompilerException))]
            public void RootElementNotClass()
            {
                XElement element = new XElement("foo");  // Root element is lowercase, hence not a class.
                MarkupControlClass c = ParseControlClass(element);
            }

            [Test]
            [ExpectedException(typeof(CompilerException))]
            public void MissingClassName()
            {
                XElement element = new XElement("Control");
                MarkupControlClass c = ParseControlClass(element);
            }

            [Test]
            public void SimpleControl()
            {
                MarkupControlClass c = ParseControlFromEmbeddedFile("qc.Tests.simple.qui");
                Assert.AreEqual("Simple", c.Name);
                Assert.AreEqual("QuickUI.Control", c.Prototype.ClassName);
                Assert.AreEqual(1, c.Prototype.Properties.Count);
                Assert.IsTrue(c.Prototype.Properties.ContainsKey("content"));

                MarkupHtmlElement property = (MarkupHtmlElement) c.Prototype.Properties["content"];
                Assert.AreEqual("Simple_content", property.Id);
                Assert.AreEqual("<span id=\"Simple_content\" />", property.Html);
            }

            [Test]
            public void SimpleHostControl()
            {
                MarkupControlClass controlClass = ParseControlFromEmbeddedFile("qc.Tests.simplehost.qui");
                Assert.AreEqual("SimpleHost", controlClass.Name);
                Assert.IsInstanceOf<MarkupElementCollection>(controlClass.Prototype.Properties["content"]);
                List<MarkupElement> nodes = new List<MarkupElement>((MarkupElementCollection) controlClass.Prototype.Properties["content"]);
                Assert.AreEqual(" Text ", ((MarkupHtmlElement) nodes[0]).Html);
                MarkupControlInstance control = (MarkupControlInstance) nodes[1];
                Assert.AreEqual("Simple", control.ClassName);
                Assert.IsInstanceOf<MarkupHtmlElement>(control.Properties["content"]);
                Assert.AreEqual("Hello, world!", ((MarkupHtmlElement) control.Properties["content"]).Html);
            }

            private MarkupControlClass ParseControlFromEmbeddedFile(string fileName)
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
