using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    // UNDONE: Rename to avoid confusion with XNode?
    public abstract class Node
    {
        // UNDONE: Push this down into HtmlNode and ControlNode
        public string Id { get; set; }

        /// <summary>
        /// Return the JavaScript for this node, indenting at the given number of tabs.
        /// </summary>
        public abstract string EmitJavaScript(int indentLevel);

        /// <summary>
        /// Return the JavaScript for this node.
        /// </summary>
        public virtual string EmitJavaScript()
        {
            return EmitJavaScript(0);
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

        protected string Tabs(int tabCount)
        {
            StringBuilder output = new StringBuilder();
            for (int i = 0; i < tabCount; i++)
            {
                output.Append('\t');
            }
            return output.ToString();
        }

        protected string IndentLine(string s, int tabCount)
        {
            StringBuilder output = new StringBuilder();
            for (int i = 0; i < tabCount; i++)
            {
                output.Append('\t');
            }
            output.Append(s);
            output.Append('\n');
            return output.ToString();
        }

        /// <summary>
        /// Return an escaped version of the string that will be acceptable to JavaScript.
        /// </summary>
        /// <remarks>
        /// Adapted from "Enquote" found at json.org by Are Bjolseth.
        /// </remarks>
        protected static string EscapeJavaScript(string s)
        {
            StringBuilder stringBuilder = new StringBuilder(s.Length + 2);

            stringBuilder.Append('"');

            foreach (char c in s)
            {
                switch (c)
                {
                    case '\\':
                    case '"':
                        stringBuilder.Append('\\');
                        stringBuilder.Append(c);
                        break;

                    case '\b':
                        stringBuilder.Append("\\b");
                        break;

                    case '\t':
                        stringBuilder.Append("\\t");
                        break;

                    case '\n':
                        stringBuilder.Append("\\n");
                        break;

                    case '\f':
                        stringBuilder.Append("\\f");
                        break;

                    case '\r':
                        stringBuilder.Append("\\r");
                        break;

                    default:
                        if (c < ' ')
                        {
                            // Use hex representation.
                            string hex = "000" + int.Parse(c.ToString(), System.Globalization.NumberStyles.HexNumber);
                            stringBuilder.Append("\\u" + hex.Substring(hex.Length - 4));
                        }
                        else
                        {
                            stringBuilder.Append(c);
                        }
                        break;

                }
            }

            stringBuilder.Append('"');

            return stringBuilder.ToString();
        }
    }
}
