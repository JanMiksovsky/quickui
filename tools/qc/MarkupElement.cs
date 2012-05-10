using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using System.Xml.Linq;

namespace qc
{
    /// <summary>
    /// A Quick markup element: a node that can have an ID.
    /// </summary>
    /// <remarks>
    /// The generated JavaScript for the element will create a JavaScript
    /// object property using the ID as the property name, and bind this
    /// to the DOM element that results from the Quick markup.
    /// 
    /// A markup element can be one of the following classes:
    /// 1) HTMLElement: Plain HTML or text
    /// 2) ControlElement: An instance of a Quick control
    /// 
    /// NOTE: In QuickUI 0.9, the "id" property was changed to "ref". For the time
    /// being, the code still refers to "Id" internally, but this is both parsed and
    /// emitted as "ref".
    /// </remarks>
    public abstract class MarkupElement : MarkupNode
    {
        public string Id { get; set; }

        /// <summary>
        /// Parse the content at the given XNode (of unknown type).
        /// </summary>
        public static MarkupElement Parse(XNode node)
        {
            switch (node.NodeType)
            {
                case XmlNodeType.CDATA:
                    return new MarkupHtmlElement((XCData) node);

                case XmlNodeType.Element:
                    MarkupElement foo = HtmlElementNames.IsHtmlElement((XElement) node)
                        ? new MarkupHtmlElement((XElement) node)
                        : (MarkupElement) new MarkupControlInstance((XElement) node);
                    return foo;

                case XmlNodeType.Text:
                    return new MarkupHtmlElement((XText) node);

                case XmlNodeType.Comment:
                    return new MarkupComment((XComment) node);

                default:
                    throw new CompilerException(
                        String.Format("Couldn't parse unexpected XML element <{0}>.", node));
            }
        }

        /// <summary>
        /// Return true if the given string is valid as a public ID for an element or control.
        /// This returns false if the id starts with an underscore ("_").
        /// </summary>
        protected bool IsPublicId(string id)
        {
            return !id.StartsWith("_");
        }

        /// <summary>
        /// If the node defines an ID, return the JavaScript for that ID.
        /// If there is no ID, return Empty.
        /// </summary>
        protected string EmitIdDeclaration(int indentLevel)
        {
            return (Id == null)
                ? String.Empty
                : Tabs(indentLevel) + "ref: \"" + Id + "\"";
        }
    }
}
