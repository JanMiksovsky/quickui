using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Linq;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// The parsed representation of a Quick control class declaration.
    /// </summary>
    public class MarkupControlClass : MarkupNode
    {
        public string Name { get; set; }
        public string Script { get; set; }
        public string Style { get; set; }
        public MarkupControlInstance Prototype { get; set; }

        public MarkupControlClass()
        {
        }

        /// <summary>
        /// Create a control class.
        /// </summary>
        public MarkupControlClass(MarkupControlInstance c)
        {
            // Ensure the root element actually is "Control".
            if (c.ClassName != "Control")
            {
                throw new CompilerException(
                    String.Format("Expected root element <Control>, but found <{0}>.", c.ClassName));
            }

            ExtractClassProperties(c);

            // Ensure a "name" attribute was specified for the root tag.
            if (String.IsNullOrEmpty(this.Name))
            {
                throw new CompilerException(
                    String.Format("No class \"name\" attribute was defined on the root <Control> element."));
            }

            // If no prototype was specified, use the default one of an empty Control.
            Prototype = Prototype ?? DefaultPrototype();
        }

        /// <summary>
        /// Extract class properties.
        /// </summary>
        /// <remarks>
        /// The parser will read a .qui file as if the whole thing were an instance
        /// of a class called Control with properties like "name" and "prototype".
        /// We translate those key properties into the relevant members of the
        /// ControlClass type.
        /// </remarks>
        private void ExtractClassProperties(MarkupControlInstance control)
        {
            foreach (string propertyName in control.Properties.Keys)
            {
                MarkupNode node = control.Properties[propertyName];
                string text = (node is MarkupHtmlElement) ? ((MarkupHtmlElement) node).Html : null;

                switch (propertyName)
                {
                    case "name":
                        VerifyPropertyIsNull(propertyName, this.Name);
                        this.Name = text;
                        break;

                    case "content":
                    case "prototype":
                        VerifyPropertyIsNull(propertyName, this.Prototype);
                        this.Prototype = GetPrototypeFromNode(node);
                        break;

                    case "script":
                        VerifyPropertyIsNull(propertyName, this.Script);
                        this.Script = text;
                        break;

                    case "style":
                        VerifyPropertyIsNull(propertyName, this.Style);
                        this.Style = text;
                        break;

                    default:
                        throw new CompilerException(
                            String.Format("Unknown class definition element: \"{0}\".", propertyName));
                }
            }
        }

        /// <summary>
        /// Throw an exception if the given property value is not null.
        /// </summary>
        private void VerifyPropertyIsNull(string propertyName, object propertyValue)
        {
            if (propertyValue != null)
            {
                throw new CompilerException(
                    String.Format("The \"{0}\" property can't be set more than once.", propertyName));
            }
        }

        /// <summary>
        /// Return a prototype appropriate to contain the information in the given node.
        /// </summary>
        private MarkupControlInstance GetPrototypeFromNode(MarkupNode node)
        {
            MarkupControlInstance prototype = null;

            if (node is MarkupControlInstance)
            {
                // Node can be used directly as the prototype.
                prototype = (MarkupControlInstance) node;
            }
            if (node is MarkupHtmlElement || node is MarkupElementCollection)
            {
                // Node is HTML content, or HTML mixed with controls.
                // Place that content into the default prototype.
                prototype = DefaultPrototype();
                prototype.Properties.Add("content", node);
            }
            
            if (prototype == null)
            {
                throw new ApplicationException("Unknown node type found.");
            }

            return prototype;
        }

        private static MarkupControlInstance DefaultPrototype()
        {
            return new MarkupControlInstance()
            {
                ClassName = "QuickUI.Control"
            };
        }

        public string EmitCss()
        {
            return ControlCssEmitter.EmitControlClass(this);
        }

        /// <summary>
        /// Return the JavaScript for this control class.
        /// </summary>
        public override string EmitJavaScript(int indentLevel)
        {
            string renderFunction = EmitRenderFunction(indentLevel + 1);
            return Template.Format(
                "//\n" +
                "// {ClassName}\n" +
                "//\n" +
                "{ClassName} = {BaseClassName}.extend({\n" +
                    "\tclassName: \"{ClassName}\"{Comma}\n" +
                    "{RenderFunction}" +
                "});\n" +
                "{Script}\n", // Extra break at end helps delineate between successive controls in combined output.
                new
                {
                    ClassName = Name,
                    BaseClassName = Prototype.ClassName,
                    RenderFunction = renderFunction,
                    Comma = String.IsNullOrEmpty(renderFunction) ? "" : ",",
                    Script = EmitScript()
                });
        }

        private string EmitRenderFunction(int indentLevel)
        {
            return (Prototype.Properties.Count == 0)
                ? String.Empty
                : Template.Format(
                    "{Tabs}render: function() {\n" +
                        "{Tabs}\t{BaseClassName}.prototype.render.call(this);\n" +
                        "{Tabs}\tthis.setClassProperties({BaseClassName}, {\n" +
                            "{BaseClassProperties}" +
                        "{Tabs}\t});\n" +
                    "{Tabs}}\n",
                    new {
                        Tabs = Tabs(indentLevel),
                        BaseClassName = Prototype.ClassName,
                        BaseClassProperties = EmitBaseClassProperties(indentLevel + 2)
                    });
        }

        /// <summary>
        /// Return the JavaScript for the control properties which will be set
        /// via calls to the base class.
        /// </summary>
        /// <remarks>
        /// This covers virtually all the properties (except className) which the
        /// developer will set on a control.
        /// </remarks>
        /// UNDONE: This function has evolved to be nearly identical to code in ControlNode,
        /// so those functions should probably be refactored and shared.
        private string EmitBaseClassProperties(int indentLevel)
        {
            // UNDONE: Write out .content() property first?
            StringBuilder code = new StringBuilder();
            int propertyCount = Prototype.Properties.Keys.Count;
            int i = 0;
            foreach (string propertyName in Prototype.Properties.Keys)
            {
                bool isLast = (++i == propertyCount);
                code.Append(EmitBaseClassProperty(propertyName, isLast, indentLevel));
            }
            return code.ToString();
        }

        private string EmitBaseClassProperty(string propertyName, bool isLast, int indentLevel)
        {
             return Template.Format(
                "{Tabs}\"{PropertyName}\": {PropertyValue}{Comma}\n",
                new
                {
                    Tabs = Tabs(indentLevel),
                    PropertyName = propertyName,
                    PropertyValue = Prototype.Properties[propertyName].EmitJavaScript(indentLevel),
                    Comma = isLast ? String.Empty : ","
                });
        }

        /// <summary>
        /// Return the control's script.
        /// </summary>
        /// <remarks>
        /// We also add back a final newline (which was stripped during reading)
        /// to make sure the generated code looks pretty.
        /// </remarks>
        private string EmitScript()
        {
            if (String.IsNullOrEmpty(Script))
            {
                return String.Empty;
            }

            return Script.Trim() + "\n";
        }

#if DEBUG
        [TestFixture]
        public new class Tests
        {
            [Test]
            public void ConvertControlToControlClass()
            {
                MarkupControlInstance control = new MarkupControlInstance()
                {
                    ClassName = "Control",
                };
                control.Properties.Add("name", new MarkupHtmlElement("Simple"));
                control.Properties.Add("content", new MarkupHtmlElement("<span id=\"Simple_content\" />", "Simple_content"));

                MarkupControlClass controlClass = new MarkupControlClass(control);
                Assert.AreEqual("Simple", controlClass.Name);
                Assert.AreEqual("QuickUI.Control", controlClass.Prototype.ClassName);
                Assert.IsNull(controlClass.Style);
                Assert.IsNull(controlClass.Script);
                Assert.AreEqual(1, controlClass.Prototype.Properties.Count);
                Assert.IsTrue(controlClass.Prototype.Properties.ContainsKey("content"));
                Assert.IsTrue(controlClass.Prototype.Properties["content"] is MarkupHtmlElement);
            }

            [Test]
            public void SimpleControl()
            {
                MarkupControlClass c = new MarkupControlClass()
                {
                    Name = "Simple",
                    Prototype = new MarkupControlInstance()
                    {
                        ClassName = "QuickUI.Control"
                    }
                };
                c.Prototype.Properties.Add("content", new MarkupHtmlElement("<span id=\"Simple_content\" />", "Simple_content"));

                CompileControlAndCompareOutput("qc.Tests.simple.qui.js", c);
            }

            static void CompileControlAndCompareOutput(string expectedCompilationFileName, MarkupControlClass control)
            {
                string compilation = control.EmitJavaScript();
                string expectedCompilation = Utilities.GetEmbeddedFileContent(expectedCompilationFileName);
                Assert.AreEqual(Utilities.NormalizeLineEndings(expectedCompilation),
                    Utilities.NormalizeLineEndings(compilation));
            }
        }
#endif
    }
}
