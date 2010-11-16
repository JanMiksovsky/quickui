using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;
using qc;

namespace Tests
{
    [TestFixture]
    public class ArgumentProcessorTests
    {
        [Test]
        public void NoArguments()
        {
            string sourceFileName;
            string jsFileName;
            string cssFileName;
            string[] args = new string[] { };
            ArgumentProcessor.GetFileNames(args, out sourceFileName, out jsFileName, out cssFileName);
            Assert.IsNull(sourceFileName);
            Assert.IsNull(jsFileName);
            Assert.IsNull(cssFileName);
        }

        [Test]
        public void FullArguments()
        {
            string sourceFileName;
            string jsFileName;
            string cssFileName;
            string[] args = new string[] {
                        "foo.css",
                        "foo.qui",
                        "foo.js"
                    };
            ArgumentProcessor.GetFileNames(args, out sourceFileName, out jsFileName, out cssFileName);
            Assert.AreEqual("foo.qui", sourceFileName);
            Assert.AreEqual("foo.js", jsFileName);
            Assert.AreEqual("foo.css", cssFileName);
        }

        [Test]
        [ExpectedException(typeof(ArgumentException))]
        public void DuplicateArgument()
        {
            string sourceFileName;
            string jsFileName;
            string cssFileName;
            string[] args = new string[] {
                        "foo.qui",
                        "foo.js",
                        "foo.qui"
                    };
            ArgumentProcessor.GetFileNames(args, out sourceFileName, out jsFileName, out cssFileName);
        }
    }
}
