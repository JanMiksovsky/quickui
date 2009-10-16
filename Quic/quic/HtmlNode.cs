using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

#if DEBUG
using NUnit.Framework;
#endif

namespace Quic
{
    public class HtmlNode : Node
    {
        public string Html { get; set; }
        public NodeCollection ChildNodes { get; set; }

        public HtmlNode()
        {
        }

        public HtmlNode(string html)
        {
            this.Html = html;
        }

        public HtmlNode(string html, string id) : this(html)
        {
            this.Id = id;
        }

        public HtmlNode(IEnumerable<Node> items)
        {
            this.ChildNodes = new NodeCollection(items);
        }

        /// <summary>
        /// Return the JavaScript for the given HTML node.
        /// </summary>
        public override string EmitJavaScript(int indentLevel)
        {
            string html = EscapeJavaScript(Html);

            if (Id == null && ChildNodes == null)
            {
                // Simplest case; just quote the HTML and return it.
                return Template.Format(
                    "{Html}",
                    new {
                        Html = html
                    });
            }

            return Template.Format(
                "{VariableDeclaration}$({Html}){ChildNodes}[0]",
                new
                {
                    VariableDeclaration = EmitVariableDeclaration(),
                    Html = html,
                    ChildNodes = EmitChildren(indentLevel)
                });
        }

        private string EmitChildren(int indentLevel)
        {
            return (ChildNodes == null)
                ? String.Empty
                : Template.Format(
                    "\n{Tabs}.append(\n{TabsPlusOne}{ChildNodes}\n{Tabs})",
                    new
                    {
                        ChildNodes = ChildNodes.EmitJavaScript(indentLevel + 1),
                        Tabs = Tabs(indentLevel),
                        TabsPlusOne = Tabs(indentLevel + 1)
                    });
        }

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void Text()
            {
                HtmlNode node = new HtmlNode("Hello");
                Assert.AreEqual("\"Hello\"", node.EmitJavaScript());
            }

            [TestCase("<div>Hi</div>", Result = "\"<div>Hi</div>\"")]
            [TestCase("<div><h1/><p>Hello</p></div>", Result = "\"<div><h1/><p>Hello</p></div>\"")]
            public string Html(string source)
            {
                HtmlNode node = new HtmlNode(source);
                return node.EmitJavaScript();
            }

            [Test]
            public void HtmlWithId()
            {
                HtmlNode node = new HtmlNode("<div id=\"foo\">Hi</div>", "foo");
                Assert.AreEqual("this.foo = $(\"<div id=\\\"foo\\\">Hi</div>\")[0]", node.EmitJavaScript());
            }

            [Test]
            public void HtmlContainsHtmlWithId()
            {
                // <div><h1/><p id="content">Hello</p></div>
                HtmlNode node = new HtmlNode("<div />")
                {
                    ChildNodes = new NodeCollection(new Node[] {
                        new HtmlNode("<h1 />"),
                        new HtmlNode("<p id=\"content\">Hello</p>", "content")
                    })
                };
                Assert.AreEqual(
                    "$(\"<div />\")\n" +
                    ".append(\n" +
                    "\tQuickControl.nodes(\n" +
                    "\t\t\"<h1 />\",\n" +
                    "\t\tthis.content = $(\"<p id=\\\"content\\\">Hello</p>\")[0]\n" +
                    "\t)\n" +
                    ")[0]",
                    node.EmitJavaScript());
            }
        }
#endif
    }
}
