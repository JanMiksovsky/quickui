using System.Collections;
using System.Xml.Linq;

namespace qc
{
    public static class HtmlElementNames
    {
        public static ArrayList Elements
        {
            get
            {
                if (elements == null)
                {
                    elements = new ArrayList(Utilities.DeserializeXml<string[]>("qc.HtmlElementNames.xml", typeof(HtmlElementNames).Assembly));
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
    }
}
