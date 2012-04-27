using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace qc
{
    /// <summary>
    /// A collection of Quick markup elements (HTML and control instances).
    /// </summary>
    public class MarkupElementCollection : MarkupNode, IEnumerable<MarkupElement>
    {
        public IEnumerable<MarkupElement> Items { get; set; }

        public MarkupElementCollection(IEnumerable<MarkupElement> items)
        {
            this.Items = items;
        }

        /// <summary>
        /// Return the JavaScript for the collection as an array.
        /// </summary>
        public override string JavaScript(int indentLevel)
        {
            return Template.Format(
                "[\n{Items}{Tabs}]",
                new
                {
                    Items = EmitItems(indentLevel + 1),
                    Tabs = Tabs(indentLevel)
                });
        }

        /// <summary>
        /// Return just the items in the collection.
        /// </summary>
        public string EmitItems(int indentLevel)
        {
            StringBuilder s = new StringBuilder();
            List<MarkupElement> elements = new List<MarkupElement>(Items);
            for (int i = 0; i < elements.Count; i++)
            {
                MarkupElement element = elements[i];
                s.Append(EmitElementInCollection(element, indentLevel));
                // Add separator between elements.
                if (i < elements.Count - 1)
                {
                    // Add a comma after each element (except comments).
                    if (!(element is MarkupComment))
                    {
                        s.Append(",");
                    }
                    s.Append("\n");
                }
            }
            s.Append("\n");

            return s.ToString();
        }

        public override bool IsWhiteSpace()
        {
            return Items != null && Items.All(element => element.IsWhiteSpace());
        }

        /// <summary>
        /// Return the JavaScript to generate a single node.
        /// </summary>
        private string EmitElementInCollection(MarkupElement element, int indentLevel)
        {
            return Template.Format(
                "{Tabs}{Element}",
                new {
                    Tabs = Tabs(indentLevel),
                    Element = element.JavaScript(indentLevel)
                });
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return Items.GetEnumerator();
        }

        public IEnumerator<MarkupElement> GetEnumerator()
        {
            return Items.GetEnumerator();
        }
    }
}
