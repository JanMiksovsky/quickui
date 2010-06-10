using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Linq;

#if DEBUG
using System.Xml.Linq;
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// The parsed representation of a Quick control class declaration.
    /// </summary>
    public class MarkupControlClass : MarkupNode
    {
        private const string DEFAULT_CLASS_NAME = "QuickUI.Control";

        public string Name { get; set; }
        public string Script { get; set; }
        public string Style { get; set; }
        public string Tag { get; set; }
        public MarkupNode Content { get; set; }
        public MarkupControlInstance Prototype { get; set; }

        public MarkupControlClass()
        {
        }

        public MarkupControlClass(MarkupControlInstance control)
            : this(control, null, null)
        {
        }

        /// <summary>
        /// Elevate the specific control instance to a control class declaration.
        /// </summary>
        /// <remarks>
        /// The simplest way to parse the class definition is to parse it just
        /// like an instance of a control, then pull out specific properties
        /// for the name, prototype, script, and style.
        /// 
        /// The script and style properties are those which were separated out
        /// by the preprocessor before the control instance was parsed. These
        /// must now be folded into the control class declaration.
        /// </remarks>
        public MarkupControlClass(MarkupControlInstance c, string script, string style)
        {
            // Copy over the script and style separated out by the preprocessor.
            Script = script;
            Style = style;

            // Read the explicitly defined class properties.
            ExtractExplicitClassProperties(c);
            VerifyProperties();
        }

        public string Css()
        {
            return CssProcessor.CssForClass(this);
        }

        /// <summary>
        /// Return the JavaScript for this control class.
        /// </summary>
        public override string JavaScript(int indentLevel)
        {
            string renderFunction = EmitRenderFunction(indentLevel + 1);
            string tag = EmitTag(indentLevel + 1);
            return Template.Format(
                "//\n" +
                "// {ClassName}\n" +
                "//\n" +
                "{ClassName} = {BaseClassName}.extend({\n" +
                    "\tclassName: \"{ClassName}\"{Comma1}\n" +
                    "{RenderFunction}{Comma2}{NewLine}" +
                    "{Tag}" +
                "});\n" +
                "{Script}\n", // Extra break at end helps delineate between successive controls in combined output.
                new
                {
                    ClassName = Name,
                    BaseClassName = BaseClassName,
                    Comma1 = EmitCommaIfNotEmpty(renderFunction + tag),
                    RenderFunction = renderFunction,
                    Comma2 = String.IsNullOrEmpty(renderFunction) || String.IsNullOrEmpty(tag) ? "" : ",",
                    NewLine = String.IsNullOrEmpty(renderFunction) ? "" : "\n",
                    Tag = tag,
                    Script = EmitScript()
                });
        }

        public string BaseClassName
        {
            get
            {
                return (Prototype != null) ? Prototype.ClassName : DEFAULT_CLASS_NAME;
            }
        }

        private string EmitCommaIfNotEmpty(string s)
        {
            return String.IsNullOrEmpty(s) ? "" : ",";
        }

        /// <summary>
        /// Extract explicitly declared class properties.
        /// </summary>
        /// <remarks>
        /// The parser will read a .qui file as if the whole thing were an instance
        /// of a class called Control with properties like "name" and "prototype".
        /// We translate those key properties into the relevant members of the
        /// ControlClass type.
        /// 
        /// Note: At this point, the script and style tags are highly unlikely
        /// to appear, having been previously separated out by the preprocessor.
        /// However, for completeness, we check here for those properties. The
        /// only way they could get this far were if they were set as attributes
        /// of the top-level Control node: <Control script="alert('Hi');"/> which
        /// would be pretty odd.
        /// </remarks>
        private void ExtractExplicitClassProperties(MarkupControlInstance control)
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
                        VerifyPropertyIsNull(propertyName, this.Content);
                        this.Content = node;
                        break;

                    case "prototype":
                        VerifyPropertyIsNull(propertyName, this.Prototype);
                        this.Prototype = VerifyPrototype(node);
                        break;

                    case "script":
                        VerifyPropertyIsNull(propertyName, this.Script);
                        this.Script = text;
                        break;

                    case "style":
                        VerifyPropertyIsNull(propertyName, this.Style);
                        this.Style = text;
                        break;

                    case "tag":
                        VerifyPropertyIsNull(propertyName, this.Tag);
                        this.Tag = text;
                        break;

                    default:
                        throw new CompilerException(
                            String.Format("Unknown class definition element: \"{0}\".", propertyName));
                }
            }
        }

        private string EmitRenderFunction(int indentLevel)
        {
            return (Content == null && Prototype == null)
                ? String.Empty
                : Template.Format(
                    "{Tabs}render: function() {\n" +
                        "{Tabs}\t{BaseClassName}.prototype.render.call(this);\n" +
                        "{Tabs}\tthis.setClassProperties({BaseClassName}, {\n" +
                            "{BaseClassProperties}" +
                        "{Tabs}\t});\n" +
                    "{Tabs}}",
                    new {
                        Tabs = Tabs(indentLevel),
                        BaseClassName = BaseClassName,
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
        /// UNDONE: This function has evolved to be nearly identical to code in MarkupControlInstance,
        /// so those functions should probably be refactored and shared.
        private string EmitBaseClassProperties(int indentLevel)
        {
            if (Content != null)
            {
                return EmitBaseClassProperty("content", Content, indentLevel) + "\n";
            }

            // UNDONE: Write out prototype's content property first?
            return Prototype.Properties.Keys.Concatenate(propertyName =>
                EmitBaseClassProperty(propertyName, Prototype.Properties[propertyName], indentLevel), ",\n") + "\n";
        }

        private string EmitBaseClassProperty(string propertyName, MarkupNode propertyValue, int indentLevel)
        {
            return Template.Format(
               "{Tabs}\"{PropertyName}\": {PropertyValue}",
               new
               {
                   Tabs = Tabs(indentLevel),
                   PropertyName = propertyName,
                   PropertyValue = propertyValue.JavaScript(indentLevel)
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
            return String.IsNullOrEmpty(Script)
                ? String.Empty
                : Script.Trim() + "\n";
        }

        /// <summary>
        /// Emit the control's root tag element, if defined.
        /// </summary>
        private string EmitTag(int indentLevel)
        {
            return String.IsNullOrEmpty(Tag)
                ? String.Empty
                : Template.Format(
                    "{Tabs}tag: \"{RootTag}\"\n",
                    new
                    {
                        Tabs = Tabs(indentLevel),
                        RootTag = Tag
                    });
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

        // Perform final tests for a well-formed control.
        private void VerifyProperties()
        {
            if (String.IsNullOrEmpty(Name))
            {
                throw new CompilerException(
                    String.Format("No class \"name\" attribute was defined on the root <Control> element."));
            }

            if (Content != null && Prototype != null)
            {
                throw new CompilerException(
                    String.Format("A control can't define both content and a prototype."));
            }
        }

        /// <summary>
        /// Ensure the prototype is well-formed.
        /// </summary>
        private MarkupControlInstance VerifyPrototype(MarkupNode node)
        {
            if (node is MarkupControlInstance)
            {
                return (MarkupControlInstance) node;
            }
            if (node is MarkupElementCollection)
            {
                // There should be only one non-whitespace node in the collection.
                try
                {
                    MarkupElement element = ((MarkupElementCollection) node)
                        .Single(item => !item.IsWhiteSpace());
                    if (element is MarkupControlInstance)
                    {
                        return (MarkupControlInstance) element;
                    }
                }
                catch (InvalidOperationException e)
                {
                }
            }

            throw new CompilerException(
                "A control's <prototype> must be a single instance of a QuickUI control class.");
        }

#if DEBUG
        [TestFixture]
        public new class Tests
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
                Assert.AreEqual("Hello", ((MarkupHtmlElement) c.Content).Html);
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
                Assert.AreEqual("Hello", ((MarkupHtmlElement) c.Content).Html);
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
                Assert.AreEqual("Hello", ((MarkupHtmlElement) prototype.Properties["content"]).Html);
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
                MarkupControlClass c = new MarkupControlClass(new MarkupControlInstance(element));
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
                MarkupControlClass c = new MarkupControlClass(new MarkupControlInstance(element));
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
                MarkupControlClass c = new MarkupControlClass(new MarkupControlInstance(element));
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
                MarkupControlClass c = new MarkupControlClass(new MarkupControlInstance(element));
            }
        }
#endif
    }
}
