using System.Linq;
using NUnit.Framework;
using qb;

namespace Tests
{
    [TestFixture]
    public class BuildTest
    {
        [Test]
        public void Typical()
        {
            string[] files = {
                                        "Class.SuperClass.js",
                                        "Foo.UnknownSuperClass.js",
                                        "NoSuperClass.js",
                                        "Subclass.Class.js",
                                        "SuperClass.js"
                                   };

            Build build = new Build();
            foreach (BuildUnit unit in files.Select(file => new BuildUnit(file)))
            {
                build.Add(unit);
            }

            string[] expected = {
                                        "Foo.UnknownSuperClass.js",
                                        "NoSuperClass.js",
                                        "SuperClass.js",
                                        "Class.SuperClass.js",
                                        "Subclass.Class.js"
                                    };

            BuildUnit[] sortedBuildFiles = build.SortBuildUnits().ToArray();
            for (int i = 0; i < sortedBuildFiles.Count(); i++)
            {
                Assert.AreEqual(expected[i], sortedBuildFiles[i].JsFileName);
            }
        }
    }
}
