using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// A collection of Quick markup elements (HTML and control instances).
    /// </summary>
    public class MarkupElementCollection : MarkupNode, IEnumerable<MarkupElement>
    {
        public IEnumerable<MarkupElement> Items { get; set; }

        public MarkupElementCollection(IEnumerable<MarkupElement> items)
        {
            this.Items = items;
        }

        /// <summary>
        /// Return the JavaScript for the collection as an array.
        /// </summary>
        public override string JavaScript(int indentLevel)
        {
            return Template.Format(
                "[\n{Items}{Tabs}]",
                new
                {
                    Items = EmitItems(indentLevel + 1),
                    Tabs = Tabs(indentLevel)
                });
        }

        /// <summary>
        /// Return just the items in the collection.
        /// </summary>
        public string EmitItems(int indentLevel)
        {
            return Items.Concatenate(element => EmitElementInCollection(element, indentLevel), ",\n") + "\n";
        }

        /// <summary>
        /// Return the JavaScript to generate a single node.
        /// </summary>
        private string EmitElementInCollection(MarkupElement element, int indentLevel)
        {
            return Template.Format(
                "{Tabs}{Element}",
                new {
                    Tabs = Tabs(indentLevel),
                    Element = element.JavaScript(indentLevel)
                });
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return Items.GetEnumerator();
        }

        public IEnumerator<MarkupElement> GetEnumerator()
        {
            return Items.GetEnumerator();
        }

#if DEBUG
        [TestFixture]
        public new class Tests
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
                MarkupElementCollection collection = (MarkupElementCollection) node;
                Assert.IsNotNull(collection);
                Assert.AreEqual(2, collection.Count());
                List<MarkupElement> items = new List<MarkupElement>(collection);
                Assert.IsInstanceOf<MarkupControlInstance>(items[0]);
                Assert.IsInstanceOf<MarkupHtmlElement>(items[1]);
                Assert.AreEqual(
                    "[\n" +
                    "\tthis.bar = QuickUI.Control.create(Bar, {\n" +
                    "\t\t\"content\": \"Control content\",\n" +
                    "\t\t\"id\": \"bar\"\n" +
                    "\t}),\n" +
                    "\t\"<p>paragraph</p>\"\n" +
                    "]",
                    node.JavaScript());
            }
        }
#endif
    }
}
