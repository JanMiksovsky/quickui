using System;
using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class CssProcessorTest
    {
        [Test]
        public void ControlWithNoScript()
        {
            MarkupControlClass c = new MarkupControlClass()
            {
                // BaseClassName = "Control",
                Name = "Foo"
            };
            string compiledCss = CssProcessor.CssForClass(c);
            Assert.AreEqual(String.Empty, compiledCss);
        }

        [Test]
        public void Basic()
        {
            string styles = "h1 { font-weight: bold; }";
            string result = CssProcessor.AddClassNameToSelectors("Foo", styles);
            Assert.AreEqual(".Foo h1 { font-weight: bold; }", result);
        }

        [Test]
        public void RuleOnDifferentLine()
        {
            string styles = "h1\n{ font-weight: bold; }";
            string result = CssProcessor.AddClassNameToSelectors("Foo", styles);
            Assert.AreEqual(".Foo h1\n{ font-weight: bold; }", result);
        }

        [Test]
        public void Multiple()
        {
            string styles = "h1 { color: red; }\nh2 { color: orange; }";
            string result = CssProcessor.AddClassNameToSelectors("Foo", styles);
            Assert.AreEqual(".Foo h1 { color: red; }\n.Foo h2 { color: orange; }", result);
        }

        [Test]
        public void CommaSeparatedRules()
        {
            string styles = "h1, h2, h3 { font-weight: bold; }";
            string result = CssProcessor.AddClassNameToSelectors("Foo", styles);
            Assert.AreEqual(".Foo h1, .Foo h2, .Foo h3 { font-weight: bold; }", result);
        }

        [Test]
        public void ClassNameAlreadyAtStart()
        {
            string styles = ".Foo.selected { font-weight: bold; }";
            string result = CssProcessor.AddClassNameToSelectors("Foo", styles);
            Assert.AreEqual(".Foo.selected { font-weight: bold; }", result);
        }

        [Test]
        public void ClassNameAlreadyInMiddle()
        {
            string styles = "body .Foo.selected { font-weight: bold; }";
            string result = CssProcessor.AddClassNameToSelectors("Foo", styles);
            Assert.AreEqual("body .Foo.selected { font-weight: bold; }", result);
        }

        [Test]
        public void ClassNameWithinAnotherClassName()
        {
            string styles = "div.FooBar { font-weight: bold; }";
            string result = CssProcessor.AddClassNameToSelectors("Foo", styles);
            Assert.AreEqual(".Foo div.FooBar { font-weight: bold; }", result);
        }

        [Test]
        public void FontFace()
        {
            string styles = "@font-face { font-family: Arial; local('Arial'); }";
            string result = CssProcessor.AddClassNameToSelectors("Foo", styles);
            Assert.AreEqual(styles, result);
        }
    }
}
