using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class MarkupElementCollectionTest
    {
        [Test]
        public void Collection()
        {
            XElement element = new XElement("Foo",
                new XElement("Bar",
                    new XAttribute("id", "bar"),
                    "Control content"),
                new XElement("p", "paragraph")
            );
            MarkupNode node = MarkupNode.Parse(element.Nodes());
            Assert.IsInstanceOf<MarkupElementCollection>(node);
            MarkupElementCollection collection = (MarkupElementCollection)node;
            Assert.IsNotNull(collection);
            Assert.AreEqual(2, collection.Count());
            List<MarkupElement> items = new List<MarkupElement>(collection);
            Assert.IsInstanceOf<MarkupControlInstance>(items[0]);
            Assert.IsInstanceOf<MarkupHtmlElement>(items[1]);
            Assert.AreEqual(
                "[\n" +
                "\tthis._define( \"$bar\", Bar.create({\n" +
                "\t\t\"content\": \"Control content\",\n" +
                "\t\t\"id\": \"bar\"\n" +
                "\t}) ),\n" +
                "\t\"<p>paragraph</p>\"\n" +
                "]",
                node.JavaScript());
        }
    }
}
