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
                    return HtmlElementNames.IsHtmlElement((XElement) node)
                        ? new MarkupHtmlElement((XElement) node)
                        : (MarkupElement) new MarkupControlInstance((XElement) node);

                case XmlNodeType.Text:
                    return new MarkupHtmlElement((XText) node);

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
        /// If the node defines an ID, return the JavaScript for the
        /// left-hand side of a variable declaration on the control class
        /// that will use that ID. If there is no ID, return Empty.
        /// </summary>
        protected string EmitVariableDeclaration()
        {
            return (Id == null)
                ? String.Empty
                : String.Format("this.{0} = ", Id);
        }
    }
}
