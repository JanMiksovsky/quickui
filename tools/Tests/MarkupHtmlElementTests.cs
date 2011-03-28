using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class MarkupHtmlElementTest
    {
        [Test]
        public void Text()
        {
            XText element = new XText("Hello");
            MarkupHtmlElement node = new MarkupHtmlElement(element);
            Assert.AreEqual("Hello", node.Html);
        }

        [Test]
        public void Html()
        {
            XElement element = new XElement("div",
                new XAttribute("id", "foo"),
                new XText("Hi")
            );
            MarkupHtmlElement node = new MarkupHtmlElement(element);
            Assert.AreEqual("foo", node.Id);
            Assert.AreEqual("<div id=\"foo\">Hi</div>", node.Html);
            Assert.AreEqual("this.$foo = $(\"<div id=\\\"foo\\\">Hi</div>\")", node.JavaScript());
        }

        [Test]
        public void HtmlWithPrivateId()
        {
            XElement element = new XElement("div",
                new XAttribute("id", "_foo")
            );
            MarkupHtmlElement node = new MarkupHtmlElement(element);
            Assert.IsNull(node.Id);
        }

        [Test]
        public void HtmlContainsText()
        {
            XElement element = new XElement("p",
                new XText("Hello")
            );
            MarkupHtmlElement node = new MarkupHtmlElement(element);
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
            MarkupHtmlElement node = new MarkupHtmlElement(element);
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
            MarkupHtmlElement node = new MarkupHtmlElement(element);
            Assert.AreEqual("<div />", node.Html);
            Assert.IsNotNull(node.ChildNodes);
            Assert.AreEqual(1, node.ChildNodes.Count());
            List<MarkupElement> items = new List<MarkupElement>(node.ChildNodes);
            Assert.IsInstanceOf<MarkupHtmlElement>(items[0]);
            MarkupHtmlElement contentNode = (MarkupHtmlElement)items[0];
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
            MarkupHtmlElement node = new MarkupHtmlElement(element);
            Assert.AreEqual("<div />", node.Html);
            Assert.AreEqual(2, node.ChildNodes.Count());
            List<MarkupElement> items = new List<MarkupElement>(node.ChildNodes);
            Assert.IsInstanceOf<MarkupHtmlElement>(items[0]);
            Assert.AreEqual("<h1 />", ((MarkupHtmlElement)items[0]).Html);
            Assert.IsInstanceOf<MarkupHtmlElement>(items[1]);
            MarkupHtmlElement contentNode = (MarkupHtmlElement)items[1];
            Assert.AreEqual("<p id=\"content\">Hello</p>", contentNode.Html);
            Assert.AreEqual("content", contentNode.Id);
        }

        [Test]
        public void HtmlContainsControl()
        {
            XElement element = new XElement("div",
                new XElement("Foo",
                    new XText("Control content")
                )
            );
            MarkupHtmlElement htmlNode = new MarkupHtmlElement(element);
            Assert.AreEqual(1, htmlNode.ChildNodes.Count());
            MarkupNode childNode = htmlNode.ChildNodes.ToArray()[0];
            Assert.IsInstanceOf<MarkupControlInstance>(childNode);
            MarkupControlInstance control = (MarkupControlInstance)childNode;
            Assert.AreEqual("Foo", control.ClassName);
        }
    }
}
