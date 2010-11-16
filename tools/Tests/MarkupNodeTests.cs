using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class MarkupNodeTest
    {
        [Test]
        public void EscapeString()
        {
            string s = "\tHi\a;\n";
            string escaped = MarkupNode.EscapeJavaScript(s);
            Assert.AreEqual("\"\\tHi\\u0007;\\n\"", escaped);
        }
    }
}
