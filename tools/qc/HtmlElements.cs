using System;
using System.Collections;
using System.Xml.Linq;

#if DEBUG
using NUnit.Framework;
#endif

namespace qc
{
    public static class HtmlElements
    {
        public static ArrayList Elements
        {
            get
            {
                if (elements == null)
                {
                    elements = new ArrayList(Utilities.DeserializeXml<string[]>("qc.HtmlElements.xml"));
                }

                return elements;
            }
        }
        private static ArrayList elements;

        public static bool IsHtmlElement(string s)
        {
            return Elements.BinarySearch(s) >= 0;
        }

        public static bool IsHtmlElement(XElement element)
        {
            return element != null
                && element.Name != null
                && IsHtmlElement(element.Name.ToString());
        }

#if DEBUG
        [TestFixture]
        public class Tests
        {
            [Test]
            public void CheckElements()
            {
                Assert.IsTrue(IsHtmlElement("div"));
                Assert.IsTrue(IsHtmlElement("table"));
                Assert.IsFalse(IsHtmlElement("foo"));
            }
        }
#endif
    }
}
