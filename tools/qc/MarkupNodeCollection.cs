using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// A collection of Quick markup nodes.
    /// </summary>
    public class MarkupNodeCollection : MarkupNode, IEnumerable<MarkupNode>
    {
        private IEnumerable<MarkupNode> Items { get; set; }

        public MarkupNodeCollection(IEnumerable<MarkupNode> items)
        {
            this.Items = items;
        }

        /// <summary>
        /// Return the JavaScript for the collection as an array.
        /// </summary>
        public override string EmitJavaScript(int indentLevel)
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
            // We have to jump through some hoops to ensure the last element of
            // the collection does *not* get a comma after it. This means we can't
            // do a simple LINQ query, so we roll the iteration by hand.
            StringBuilder code = new StringBuilder();
            int nodeCount = Items.Count();
            int i = 0;
            foreach (MarkupNode node in Items)
            {
                bool isLast = (++i == nodeCount);
                code.Append(EmitNodeInCollection(node, isLast, indentLevel));
            }

            return code.ToString();
        }

        /// <summary>
        /// Return the JavaScript to generate a single node.
        /// </summary>
        private string EmitNodeInCollection(MarkupNode node, bool isLast, int indentLevel)
        {
            return Template.Format(
                "{Tabs}{Node}{Comma}\n",
                new {
                    Tabs = Tabs(indentLevel),
                    Node = node.EmitJavaScript(indentLevel),
                    Comma = isLast ? String.Empty : ","
                });
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return Items.GetEnumerator();
        }

        public IEnumerator<MarkupNode> GetEnumerator()
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
                MarkupNodeCollection node = new MarkupNodeCollection(new MarkupNode[] {
                    new HtmlElement("Hi, "),
                    new HtmlElement() {
                        Id = "content",
                        Html = "<span id=\"content\"/>"
                    }
                });

                Assert.AreEqual(
                    "[\n" +
                    "\t\"Hi, \",\n" +
                    "\tthis.content = $(\"<span id=\\\"content\\\"/>\")[0]\n" +
                    "]",
                    node.EmitJavaScript());
            }
        }
#endif
    }
}
