using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// A node in Quick markup.
    /// </summary>
    /// <remarks>
    /// Quick markup nodes can be any one of the following subclasses:
    /// 1) MarkupElement (which will be either an HTMLELement or ControlElement)
    /// 2) MarkupElementCollection: A collection of Quick markup elements
    /// </remarks>
    public abstract class MarkupNode
    {
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

        public static string Tabs(int tabCount)
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
                            string hex = String.Format("{0:x4}", Convert.ToInt32(c));
                            stringBuilder.Append("\\u" + hex);
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

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void EscapeString()
            {
                string s = "\tHi\a;\n";
                string escaped = EscapeJavaScript(s);
                Assert.AreEqual("\"\\tHi\\u0007;\\n\"", escaped);
            }
        }
#endif
    }
}
