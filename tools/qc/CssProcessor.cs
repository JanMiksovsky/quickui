using System;
using System.Text;
using System.Text.RegularExpressions;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    /// <summary>
    /// Helper class which can generate the CSS for a control.
    /// </summary>
    public static class CssProcessor
    {
        public static string CssForClass(MarkupControlClass c)
        {
            if (c.Style == null)
            {
                return String.Empty;
            }

            string styles = c.Style.Trim();
            return styles.Length == 0
                ? String.Empty
                : Template.Format(
                    "/*** {ClassName} ***/\n\n{Styles}\n\n",
                    new
                    {
                        ClassName = c.Name,
                        Styles = AddClassNameToStyles(c.Name, styles)
                    });
        }

        /// <summary>
        /// Prepend the class name to all style rules
        /// </summary>
        /// <remarks>
        /// If the class name is "Foo", this will find all rules in the CSS like
        /// "p { color: gray; }" and change them to ".Foo p { color: gray; }".
        /// This ensures the styles will only be applied to the DOM within a control,
        /// and avoids style name conflicts with styles defined by other controls
        /// in use on the same page.
        /// 
        /// Exception: if the rule already begins with .Foo, then the the class name
        /// is *not* prepended. This allows for the definition of rules like ".Foo.Bar".
        /// </remarks>
        static string AddClassNameToStyles(string className, string styles)
        {
            // We could do a simple findClassNames.Replace() if it weren't for the
            // exception about not prepending the class name to the rule if the
            // class name is already there. So, we'll do a manual match-and-replace.
            MatchCollection matches = findClassNames.Matches(styles);

            // Walk backward through the matches so the match indexes stay relevant
            // during the loop.
            string cssClassName = "." + className;
            for (int i = matches.Count - 1; i >= 0; i--)
            {
                Match match = matches[i];
                Group cssRuleGroup = match.Groups[2];

                // Ignore style rules that meet any of the following conditions:
                //  1) the style name is already included,
                //  2) the rule is a @font-face directive.
                if (!cssRuleGroup.Value.StartsWith(cssClassName) &&
                    !cssRuleGroup.Value.StartsWith("@font-face"))
                {
                    // CSS rule doesn't already start with class name, so prepend it.
                    styles = styles.Insert(cssRuleGroup.Index, cssClassName + " ");
                }
            }

            return styles;
        }

        // Regex to find class names in a style.
        // This is in two parts:
        //
        // The first capture group finds white space and comments before a rule.
        //      \s*(?:/\*.*?\*/\s*)*
        //          Whitespace, any number of repetitions
        //          Match expression but don't capture it. [/\*.*?\*/\s*], any number of repetitions
        //              /\*.*?\*/\s*
        //                  /
        //                  Literal *
        //                  Any character, any number of repetitions, as few as possible
        //                  Literal *
        //                  /
        //                  Whitespace, any number of repetitions
        //
        // The second capture group finds the style classes/selectors and style definition.
        // This is basically anything up to an ending curly brace. This regex will FAIL if
        // someone puts a brace inside of a style definition (e.g., in a comment).
        //      [^\{]*\{[^\}]*\}
        //          Any character that is NOT in this class: [\{], any number of repetitions
        //          Literal {
        //          Any character that is NOT in this class: [\}], any number of repetitions
        //          Literal }
        //
        static Regex findClassNames = new Regex(@"(\s*(?:/\*.*?\*/\s*)*)([^\{]*\{[^\}]*\})", RegexOptions.Compiled);

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void ControlWithNoScript()
            {
                MarkupControlClass c = new MarkupControlClass() {
                    // BaseClassName = "Control",
                    Name = "Foo"
                };
                string compiledCss = CssForClass(c);
                Assert.AreEqual(String.Empty, compiledCss);
            }

            [Test]
            public void Basic()
            {
                string styles = "h1 { font-weight: bold; }";
                string result = AddClassNameToStyles("Foo", styles);
                Assert.AreEqual(".Foo h1 { font-weight: bold; }", result);
            }

            [Test]
            public void ClassNameAlreadyIncluded()
            {
                string styles = ".Foo.h1 { font-weight: bold; }";
                string result = AddClassNameToStyles("Foo", styles);
                Assert.AreEqual(".Foo.h1 { font-weight: bold; }", result);
            }

            [Test]
            public void FontFace()
            {
                string styles = "@font-face { font-family: Arial; local('Arial'); }";
                string result = AddClassNameToStyles("Foo", styles);
                Assert.AreEqual(styles, result);
            }
        }
#endif
    }
}
