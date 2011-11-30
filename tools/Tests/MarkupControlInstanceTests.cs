using System;
using System.Xml.Linq;
using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class MarkupControlInstanceTest
    {
        [Test]
        public void Control()
        {
            MarkupControlInstance control = new MarkupControlInstance()
            {
                ClassName = "Simple",
                Id = "foo"
            };
            control.Properties.Add("id", new MarkupHtmlElement("foo"));
            control.Properties.Add("content", new MarkupHtmlElement("Hello"));
            Assert.AreEqual(
                "{\n" +
                "    control: \"Simple\",\n" +
                "    id: \"foo\",\n" +
                "    content: \"Hello\"\n" +
                "}",
                control.JavaScript());
        }

        [Test]
        public void ControlContainsHtml()
        {
            XElement element = new XElement("Foo",
                new XElement("h1", "heading"),
                new XElement("p", "paragraph")
            );
            MarkupControlInstance control = new MarkupControlInstance(element);
            Assert.IsInstanceOf<MarkupHtmlElement>(control.Properties["content"]);
            Assert.AreEqual("<h1>heading</h1><p>paragraph</p>", ((MarkupHtmlElement)control.Properties["content"]).Html);
        }

        [Test]
        public void ControlWithAttribute()
        {
            XElement element = new XElement("Foo",
                new XAttribute("bar", "Attribute property value")
            );
            MarkupControlInstance control = new MarkupControlInstance(element);
            Assert.Contains("bar", control.Properties.Keys);
            Assert.AreEqual("Attribute property value", ((MarkupHtmlElement)control.Properties["bar"]).Html);
        }
        [Test]

        public void ControlPropertyIsReservedWord()
        {
            MarkupControlInstance control = new MarkupControlInstance()
            {
                ClassName = "Foo",
                Id = "foo"
            };
            control.Properties.Add("id", new MarkupHtmlElement("foo"));
            control.Properties.Add("class", new MarkupHtmlElement("bar"));
            Assert.AreEqual(
                "{\n" +
                "    control: \"Foo\",\n" +
                "    id: \"foo\",\n" +
                "    \"class\": \"bar\"\n" +
                "}",
                control.JavaScript());
        }

        [Test]
        public void CompoundPropertyContainsText()
        {
            XElement element = new XElement("Foo",
                new XElement("bar", "Compound property value"),
                new XElement("p", "paragraph")
            );
            MarkupControlInstance control = new MarkupControlInstance(element);
            Assert.Contains("bar", control.Properties.Keys);
            Assert.AreEqual("Compound property value", ((MarkupHtmlElement)control.Properties["bar"]).Html);
            Assert.AreEqual("<p>paragraph</p>", ((MarkupHtmlElement)control.Properties["content"]).Html);
        }

        [Test]
        public void CompoundPropertyIsEmpty()
        {
            XElement element = new XElement("Foo",
                new XElement("bar")
            );
            MarkupControlInstance control = new MarkupControlInstance(element);
            Assert.Contains("bar", control.Properties.Keys);
            Assert.AreEqual(String.Empty, ((MarkupHtmlElement)control.Properties["bar"]).Html);
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
            MarkupControlInstance control = new MarkupControlInstance(element);
            Assert.Contains("bar", control.Properties.Keys);
            Assert.AreEqual("<p>Compound property content</p>", ((MarkupHtmlElement)control.Properties["bar"]).Html);
            Assert.AreEqual("<p>paragraph</p>", ((MarkupHtmlElement)control.Properties["content"]).Html);
        }
    }
}
