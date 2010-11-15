using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class HtmlElementNameTest
    {
        [Test]
        public void CheckElements()
        {
            Assert.IsTrue(HtmlElementNames.IsHtmlElement("div"));
            Assert.IsTrue(HtmlElementNames.IsHtmlElement("table"));
            Assert.IsFalse(HtmlElementNames.IsHtmlElement("foo"));
        }
    }
}
