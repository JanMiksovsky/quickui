using System;
using System.Xml.Linq;

namespace qc
{
    /// <summary>
    /// A comment found embedded in the <content> or <prototype> of QuickUI
    /// markup.
    /// </summary>
    /// <remarks>
    /// Comments at the top level of a markup file will be handled separately
    /// as the Comments property on the MarkupControlClass object.
    /// </remarks>
    public class MarkupComment : MarkupElement
    {
        string Value { get; set; }

        /// <summary>
        /// Parse the given comment node comment.
        /// </summary>
        public MarkupComment(XComment node)
        {
            this.Value = node.Value;
        }

        /// <summary>
        /// Return the JavaScript for the given HTML node.
        /// </summary>
        public override string JavaScript(int indentLevel)
        {
            return "/*" + Value + "*/";
        }
    }
}
