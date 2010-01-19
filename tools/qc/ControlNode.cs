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
    public class ControlNode : Node
    {
        public Control Control { get; set; }

        public ControlNode() : base()
        {
        }

        public ControlNode(Control control) : this()
        {
            this.Control = control;
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
                    ClassName = Control.ClassName,
                    ControlConstructorArguments = EmitControlConstructorArguments(indentLevel)
                });
        }

        /// <summary>
        /// Return the JavaScript to define a control initial properties.
        /// </summary>
        private string EmitControlConstructorArguments(int indentLevel)
        {
            return (!Control.Properties.Any())
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

            // UNDONE: Track last property so we don't put a comma after it.

            // If subcontrol has a content property, write that out first.
            if (Control.Properties.ContainsKey("content"))
            {
                code.Append(EmitControlProperty("content", indentLevel));
            }

            // Write out remaining properties.
            code.Append(Control.Properties.Keys
                .Where(propertyName => propertyName != "content")
                .Concatenate(propertyName => EmitControlProperty(propertyName, indentLevel)));

            return code.ToString();
        }

        private string EmitControlProperty(string propertyName, int indentLevel)
        {
            return Template.Format(
                "{Tabs}\"{PropertyName}\": {PropertyValue},\n",
                new
                {
                    Tabs = Tabs(indentLevel),
                    PropertyName = propertyName,
                    PropertyValue = Control[propertyName].EmitJavaScript(indentLevel)
                });
        }

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void Control()
            {
                Control c = new Control()
                {
                    ClassName = "Simple",
                };
                c.Properties.Add("id", new HtmlNode("foo"));
                c.Properties.Add("content", new HtmlNode("Hello"));
                ControlNode node = new ControlNode()
                {
                    Control = c,
                    Id = "foo"
                };
                Assert.AreEqual(
                    "this.foo = QuickUI.Control.create(Simple, {\n" +
                    "\t\"content\": \"Hello\",\n" +
                    "\t\"id\": \"foo\",\n" +
                    "})",
                    node.EmitJavaScript());
            }
        }
#endif
    }
}
