using System.IO;
using System.Linq;
using System.Reflection;
using System.Xml;
using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class MarkupCompilerTest
    {
        [Test]
        public void Empty()
        {
            string markup = @"<Control name='foo'/>";
            string source = markup;
            CheckExtraction(markup, source, null, null);
        }

        [Test]
        public void ContentImplicit()
        {
            string markup = @"<Control name='foo'>Hello</Control>";
            string source = markup;
            CheckExtraction(markup, source, null, null);
        }

        [Test]
        public void ContentExplicit()
        {
            string markup = @"<Control name='foo'><content>Hello</content></Control>";
            string source = markup;
            CheckExtraction(markup, source, null, null);
        }

        [Test]
        public void Prototype()
        {
            string markup = @"<Control name='foo'><prototype><Button>Hello</Button></prototype></Control>";
            string source = markup;
            CheckExtraction(markup, source, null, null);
        }

        [Test]
        public void Script()
        {
            string markup = @"<Control name='foo'>Hello<script>alert('Hi');</script></Control>";
            string source = @"<Control name='foo'>Hello</Control>";
            string script = @"alert('Hi');";
            CheckExtraction(markup, source, script, null);
        }

        [Test]
        public void ScriptCData()
        {
            string markup = @"<Control name='foo'>Hello<script><![CDATA[alert('Hi');]]></script></Control>";
            string source = @"<Control name='foo'>Hello</Control>";
            string script = @"alert('Hi');";
            CheckExtraction(markup, source, script, null);
        }

        [Test]
        public void Style()
        {
            string markup = @"<Control name='foo'>Hello<style>{ color: red; }</style></Control>";
            string source = @"<Control name='foo'>Hello</Control>";
            string style = @"{ color: red; }";
            CheckExtraction(markup, source, null, style);
        }

        [Test]
        public void PrototypeScriptStyle()
        {
            string markup = @"<Control name='foo'><prototype>Hello</prototype><style>{ color: red; }</style><script>alert('Hi');</script></Control>";
            string source = @"<Control name='foo'><prototype>Hello</prototype></Control>";
            string script = @"alert('Hi');";
            string style = @"{ color: red; }";
            CheckExtraction(markup, source, script, style);
        }

        [Test]
        [ExpectedException(typeof(XmlException))]
        public void NoRootElement()
        {
            string source = "This source has no root element";
            MarkupCompiler.Compile(source);
        }

        [Test]
        [ExpectedException(typeof(CompilerException))]
        public void RootElementNotControl()
        {
            string source = "<Foo/>";
            MarkupCompiler.Compile(source);
        }

        [Test]
        [ExpectedException(typeof(CompilerException))]
        public void DuplicateScript()
        {
            string markup = @"<Control name='foo'><script>alert('Hi');</script><script>alert('Bye');</script></Control>";
            CheckExtraction(markup, null, null, null);
        }

        [Test]
        public void SimpleControl()
        {
            MarkupControlClass c = CompileControlFromEmbeddedFile("Tests.Tests.simple.qui");
            Assert.AreEqual("Simple", c.Name);
            MarkupHtmlElement content = (MarkupHtmlElement)((MarkupElementCollection)c.Content).Items.ToArray()[1];
            Assert.AreEqual("Simple_content", content.Id);
            Assert.AreEqual("<span />", content.Html);
        }

        [Test]
        public void SimpleHostControl()
        {
            MarkupControlClass controlClass = CompileControlFromEmbeddedFile("Tests.Tests.simplehost.qui");
            Assert.AreEqual("SimpleHost", controlClass.Name);
            MarkupElement[] elements = ((MarkupElementCollection)controlClass.Content).Items.ToArray();
            Assert.AreEqual(" Text ", ((MarkupHtmlElement)elements[0]).Html);
            MarkupControlInstance control = (MarkupControlInstance)elements[1];
            Assert.AreEqual("Simple", control.ClassName);
            Assert.IsInstanceOf<MarkupHtmlElement>(control.Properties["content"]);
            Assert.AreEqual("Hello, world!", ((MarkupHtmlElement)control.Properties["content"]).Html);
        }

        private MarkupControlClass CompileControlFromEmbeddedFile(string fileName)
        {
            using (StreamReader reader = Utilities.GetEmbeddedFileReader(fileName, Assembly.GetCallingAssembly()))
            {
                return MarkupCompiler.Compile(reader);
            }
        }

        private void CheckExtraction(string markup, string expectedSource, string expectedScript, string expectedStyle)
        {
            string script;
            string style;
            string source = MarkupCompiler.PreprocessMarkup(markup, out script, out style);
            Assert.AreEqual(expectedSource, source);
            Assert.AreEqual(expectedStyle, style);
            Assert.AreEqual(expectedScript, script);
        }
    }
}
