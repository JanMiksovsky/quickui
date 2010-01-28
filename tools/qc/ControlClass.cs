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
    /// A Quick control class declaration.
    /// </summary>
    public class ControlClass
    {
        public string Name { get; set; }
        public string Script { get; set; }
        public string Style { get; set; }
        public Control Prototype { get; set; }

        public ControlClass()
        {
        }

        /// <summary>
        /// Create a control class.
        /// </summary>
        public ControlClass(Control c)
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
        /// of a class called Control with various properties like
        /// "prototype", "script", etc. We translate those key properties into
        /// the relevant members of the ControlClass type.
        /// </remarks>
        private void ExtractClassProperties(Control c)
        {
            foreach (string propertyName in c.Properties.Keys)
            {
                Node node = c[propertyName];
                string text = (node is HtmlNode) ? ((HtmlNode) node).Html : null;

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
        private Control GetPrototypeFromNode(Node node)
        {
            Control prototype = null;

            if (node is ControlNode)
            {
                // Node can be used directly as the prototype.
                prototype = ((ControlNode) node).Control;
            }
            if (node is HtmlNode || node is NodeCollection)
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

        private static Control DefaultPrototype()
        {
            return new Control()
            {
                ClassName = "QuickUI.Control"
            };
        }

        /// <summary>
        /// Return the JavaScript for this control class.
        /// </summary>
        public string EmitJavaScript()
        {
            return Template.Format(
                "//\n" +
                "// {ClassName}\n" +
                "//\n" +
                "{ClassName} = {BaseClassName}.extend({\n" +
                    "\tclassName: \"{ClassName}\",\n" +
                    "{RenderFunction}" +
                "});\n" +
                "{Script}\n", // Extra break at end helps delineate between successive controls in combined output.
                new
                {
                    ClassName = Name,
                    BaseClassName = Prototype.ClassName,
                    RenderFunction = EmitRenderFunction(1),
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

        // HACK! Copied from Node. Should share implementation.
        protected string Tabs(int tabCount)
        {
            StringBuilder output = new StringBuilder();
            for (int i = 0; i < tabCount; i++)
            {
                output.Append('\t');
            }
            return output.ToString();
        }

        /// <summary>
        /// Return the control's script.
        /// </summary>
        /// <remarks>
        /// The only thing that really needs to be done is to add back 
        /// a final newline (which will get stripped during reading)
        /// to make sure the generated code looks pretty.
        /// </remarks>
        private string EmitScript()
        {
            return String.IsNullOrEmpty(Script)
                ? String.Empty
                : Script.Trim() + "\n";
        }

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void ConvertControlToControlClass()
            {
                Control c = new Control()
                {
                    ClassName = "Control",
                };
                c.Properties.Add("name", new HtmlNode("Simple"));
                c.Properties.Add("content", new HtmlNode("<span id=\"Simple_content\" />", "Simple_content"));

                ControlClass controlClass = new ControlClass(c);
                Assert.AreEqual("Simple", controlClass.Name);
                Assert.AreEqual("QuickUI.Control", controlClass.Prototype.ClassName);
                Assert.IsNull(controlClass.Style);
                Assert.IsNull(controlClass.Script);
                Assert.AreEqual(1, controlClass.Prototype.Properties.Count);
                Assert.IsTrue(controlClass.Prototype.Properties.ContainsKey("content"));
                Assert.IsTrue(controlClass.Prototype.Properties["content"] is HtmlNode);
            }

            [Test]
            public void SimpleControl()
            {
                ControlClass c = new ControlClass()
                {
                    Name = "Simple",
                    Prototype = new Control()
                    {
                        ClassName = "QuickUI.Control"
                    }
                };
                c.Prototype.Properties.Add("content", new HtmlNode("<span id=\"Simple_content\" />", "Simple_content"));

                CompileControlAndCompareOutput("qc.Tests.simple.qui.js", c);
            }

            static void CompileControlAndCompareOutput(string expectedCompilationFileName, ControlClass control)
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
