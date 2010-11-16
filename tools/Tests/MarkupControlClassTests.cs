using System.Xml.Linq;
using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class MarkupControlClassTest
    {
        [Test]
        public void ControlClass()
        {
            XElement element = new XElement("Control",
                new XAttribute("name", "Minimal")
            );
            MarkupControlClass c = new MarkupControlClass(new MarkupControlInstance(element));
            Assert.AreEqual("Minimal", c.Name);
            Assert.AreEqual("QuickUI.Control", c.BaseClassName);
        }

        [Test]
        public void ImplicitContent()
        {
            XElement element = new XElement("Control",
                new XAttribute("name", "Foo"),
                new XText("Hello")
            );
            MarkupControlClass c = new MarkupControlClass(new MarkupControlInstance(element));
            Assert.AreEqual("Hello", ((MarkupHtmlElement)c.Content).Html);
        }

        [Test]
        public void ExplicitContent()
        {
            XElement element = new XElement("Control",
                new XAttribute("name", "Foo"),
                new XElement("content",
                    new XText("Hello")
                )
            );
            MarkupControlClass c = new MarkupControlClass(new MarkupControlInstance(element));
            Assert.AreEqual("Hello", ((MarkupHtmlElement)c.Content).Html);
        }

        [Test]
        public void Prototype()
        {
            XElement element = new XElement("Control",
                new XAttribute("name", "Foo"),
                new XElement("prototype",
                    new XElement("Button",
                        new XAttribute("content", "Hello")
                    )
                )
            );
            MarkupControlClass c = new MarkupControlClass(new MarkupControlInstance(element));
            MarkupControlInstance prototype = c.Prototype;
            Assert.AreEqual("Button", prototype.ClassName);
            Assert.AreEqual("Hello", ((MarkupHtmlElement)prototype.Properties["content"]).Html);
        }

        [Test]
        public void ExplicitTag()
        {
            XElement element = new XElement("Control",
                new XAttribute("name", "Foo"),
                new XAttribute("tag", "span")
            );
            MarkupControlClass c = new MarkupControlClass(new MarkupControlInstance(element));
            Assert.AreEqual("span", c.Tag);
        }

        [Test]
        [ExpectedException(typeof(CompilerException))]
        public void MissingClassName()
        {
            XElement element = new XElement("Control");
            new MarkupControlClass(new MarkupControlInstance(element));
        }

        [Test]
        [ExpectedException(typeof(CompilerException))]
        public void PrototypeNotClass()
        {
            XElement element = new XElement("Control",
                new XAttribute("name", "Foo"),
                new XElement("prototype",
                    new XElement("div")
                )
            );
            new MarkupControlClass(new MarkupControlInstance(element));
        }

        [Test]
        [ExpectedException(typeof(CompilerException))]
        public void PrototypeNotSingleton()
        {
            XElement element = new XElement("Control",
                new XAttribute("name", "Foo"),
                new XElement("prototype",
                    new XElement("Link"),
                    new XElement("Button")
                )
            );
            new MarkupControlClass(new MarkupControlInstance(element));
        }

        [Test]
        [ExpectedException(typeof(CompilerException))]
        public void ContentAndPrototype()
        {
            XElement element = new XElement("Control",
                new XAttribute("name", "Foo"),
                new XElement("content",
                    new XText("Hello")
                ),
                new XElement("prototype",
                    new XElement("Button")
                )
            );
            new MarkupControlClass(new MarkupControlInstance(element));
        }
    }
}
