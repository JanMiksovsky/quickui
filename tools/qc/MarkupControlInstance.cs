using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace qc
{
    /// <summary>
    /// An instance of a control found in Quick markup.
    /// </summary>
    public class MarkupControlInstance : MarkupElement
    {
        public string ClassName { get; set; }
        public Dictionary<string, MarkupNode> Properties { get; set; }

        public MarkupControlInstance()
        {
            Properties = new Dictionary<string, MarkupNode>();
        }

        /// <summary>
        /// Parse the control represented by the given element.
        /// </summary>
        public MarkupControlInstance(XElement element)
            : this()
        {
            // Take the element's tag as the control's class.
            // UNDONE: Ensure tag is uppercase.
            ClassName = element.Name.ToString();

            // Take all tag attributes as properties.
            foreach (XAttribute attribute in element.Attributes())
            {
                if (attribute.Name == "id" && IsPublicId(attribute.Value))
                {
                    // Promote the ID to the node.
                    Id = attribute.Value;
                }
                Properties[attribute.Name.ToString()] = new MarkupHtmlElement(attribute.Value);
            }

            // Take all element content as compound properties and/or
            // control content.
            ParseControlContent(element);
        }

        /// <summary>
        /// Return the JavaScript to declare a control.
        /// </summary>
        public override string JavaScript(int indentLevel)
        {
            return EmitVariableDeclaration(
                Template.Format(
                    "{ClassName}.create({ControlConstructorArguments})",
                    new
                    {
                        ClassName = ClassName,
                        ControlConstructorArguments = EmitControlConstructorArguments(indentLevel)
                    }));
        }

        /// <summary>
        /// Return the JavaScript to define a control initial properties.
        /// </summary>
        private string EmitControlConstructorArguments(int indentLevel)
        {
            return (!Properties.Any())
                ? String.Empty
                : Template.Format(
                    "{\n{ControlProperties}{Tabs}}",
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
                    PropertyValue = Properties[propertyName].JavaScript(indentLevel),
                    Comma = isLast ? String.Empty : ","
                });
        }

        /// <summary>
        /// Return true if the given node represents a property tag.
        /// </summary>
        /// <remarks>
        /// The name of a property tag node takes the form <property/>,
        /// where "property" is lowercase, and not a recognized HTML element.
        /// </remarks>
        private bool IsPropertyTag(XElement element)
        {
            return element != null
                && !HtmlElementNames.IsHtmlElement(element)
                && Char.IsLower(element.Name.ToString()[0]);
        }

        /// <summary>
        /// Parse the child nodes of the given element in two ways:
        /// 1) Extract any compound properties and assign them to the control.
        /// 2) Take all remaining children and reduce them to a content property.
        /// </summary>
        private void ParseControlContent(XElement element)
        {
            // Factor out compound properties from the content.
            List<XNode> contentNodes = new List<XNode>();
            foreach (XNode childNode in element.Nodes())
            {
                XElement childElement = childNode as XElement;
                if (IsPropertyTag(childElement))
                {
                    // Found a compound property.
                    MarkupNode node = MarkupNode.Parse(childElement.Nodes());
                    if (node == null)
                    {
                        // An empty compound property is equivalent to the empty string.
                        node = new MarkupHtmlElement(String.Empty);
                    }
                    Properties[childElement.Name.ToString()] = node;
                }
                else
                {
                    contentNodes.Add(childNode);
                }
            }

            // Parse the remaining children as content.
            MarkupNode contentNode = MarkupNode.Parse(contentNodes);
            if (contentNode != null && !contentNode.IsWhiteSpace())
            {
                // Set the implicit content property. This will overwrite content
                // set through an attribute or compound property.
                Properties["content"] = contentNode;
            }
        }

    }
}
