using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// An instance of a control found in Quick markup.
    /// </summary>
    public class ControlElement : MarkupElement
    {
        public string ClassName { get; set; }
        public Dictionary<string, MarkupNode> Properties { get; set; }

        public ControlElement() : base()
        {
            Properties = new Dictionary<string, MarkupNode>();
        }

        /// <summary>
        /// Return the JavaScript to declare a control.
        /// </summary>
        public override string EmitJavaScript(int indentLevel)
        {
            return Template.Format(
                "{VariableDeclaration}QuickUI.Control.create({ClassName}{ControlConstructorArguments})",
                new
                {
                    VariableDeclaration = EmitVariableDeclaration(),
                    ClassName = ClassName,
                    ControlConstructorArguments = EmitControlConstructorArguments(indentLevel)
                });
        }

        /// <summary>
        /// Return the JavaScript to define a control initial properties.
        /// </summary>
        private string EmitControlConstructorArguments(int indentLevel)
        {
            return (!Properties.Any())
                ? String.Empty
                : Template.Format(
                    ", {\n{ControlProperties}{Tabs}}",
                    new
                    {
                        ControlProperties = EmitControlProperties(indentLevel + 1),
                        Tabs = Tabs(indentLevel)
                    });
        }

        private string EmitControlProperties(int indentLevel)
        {
            StringBuilder code = new StringBuilder();
            int i = 0;
            int propertyCount = Properties.Keys.Count;

            // If subcontrol has a content property, write that out first.
            if (Properties.ContainsKey("content"))
            {
                bool isLast = (++i >= propertyCount);
                code.Append(EmitControlProperty("content", isLast, indentLevel));
            }

            // Write out remaining properties.
            foreach (string propertyName in Properties.Keys)
            {
                if (propertyName != "content")
                {
                    bool isLast = (++i >= propertyCount);
                    code.Append(EmitControlProperty(propertyName, isLast, indentLevel));
                }
            }

            return code.ToString();
        }

        private string EmitControlProperty(string propertyName, bool isLast, int indentLevel)
        {
            return Template.Format(
                "{Tabs}\"{PropertyName}\": {PropertyValue}{Comma}\n",
                new
                {
                    Tabs = Tabs(indentLevel),
                    PropertyName = propertyName,
                    PropertyValue = Properties[propertyName].EmitJavaScript(indentLevel),
                    Comma = isLast ? String.Empty : ","
                });
        }

#if DEBUG
        [TestFixture]
        public new class Tests
        {
            [Test]
            public void Control()
            {
                ControlElement control = new ControlElement()
                {
                    ClassName = "Simple",
                    Id = "foo"
                };
                control.Properties.Add("id", new HtmlElement("foo"));
                control.Properties.Add("content", new HtmlElement("Hello"));
                Assert.AreEqual(
                    "this.foo = QuickUI.Control.create(Simple, {\n" +
                    "\t\"content\": \"Hello\",\n" +
                    "\t\"id\": \"foo\"\n" +
                    "})",
                    control.EmitJavaScript());
            }
        }
#endif
    }
}
