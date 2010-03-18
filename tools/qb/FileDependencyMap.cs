using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

#if DEBUG
using NUnit.Framework;
#endif

namespace qb
{
    /// <summary>
    /// Determine which files are dependent on other files.
    /// </summary>
    /// <remarks>
    /// This class depends upon significant information being stored in a file's
    /// name. Specifically, if the compiler parses Foo.qui, and the class therein
    /// called Foo depends on another class Bar, the generated JavaScript file
    /// will be called Foo.Bar.js. If the other class Bar has no dependencies,
    /// it will be called Bar.js. The dependency map will detect that Foo.Bar.js
    /// depends on Bar.js, and ensure that Bar.js comes *first* in the sorted output.
    /// This allows the JavaScript engine to read the class definitions in the
    /// required order.
    /// </remarks>
    public static class FileDependencyMap
    {
        public static IEnumerable<string> SortDependencies(IEnumerable<string> files)
        {
            Dictionary<string, string> classNameToFileNameMap = ClassNameToFileNameMap(files);
            DependencyMap<string> classDependencyMap = ClassDependencyMap(files);
            IEnumerable<string> sortedClassNames = classDependencyMap.SortDependencies();
            IEnumerable<string> sortedFileNames = sortedClassNames.Select(
                className => classNameToFileNameMap[className]);
            return sortedFileNames;
        }

        private static DependencyMap<string> ClassDependencyMap(IEnumerable<string> files)
        {
            DependencyMap<string> map = new DependencyMap<string>();
            foreach (string fileName in files)
            {
                ClassInfo classInfo = new ClassInfo(fileName);
                map.Add(classInfo.ClassName, classInfo.BaseClassName);
            }
            return map;
        }

        private static Dictionary<string, string> ClassNameToFileNameMap(IEnumerable<string> files)
        {
            Dictionary<string, string> map = new Dictionary<string, string>();
            foreach (string file in files)
            {
                ClassInfo classInfo = new ClassInfo(file);
                map.Add(classInfo.ClassName, file);
            }
            return map;
        }

        private class ClassInfo
        {
            public string ClassName { get; private set; }
            public string BaseClassName { get; private set; }

            public ClassInfo(string fileName)
            {
                FileName = fileName;
            }

            public string FileName {
                get
                {
                    return fileName;
                }
                set
                {
                    fileName = value;
                    string name = Path.GetFileNameWithoutExtension(fileName);
                    string[] parts = name.Split(new Char[] { '.' }, 2);
                    ClassName = parts[0];
                    BaseClassName = (parts.Length == 2) ? parts[1] : null;
                }
            }
            private string fileName;
        }
 
#if DEBUG
        [TestFixture]
        public static class Tests
        {
            [Test]
            public static void Typical()
            {
                string[] files = {
                                        "Subclass.Class.js",
                                        "SuperClass.js",
                                        "NoSuperClass.js",
                                        "Foo.UnknownSuperClass.js",
                                        "Class.SuperClass.js"
                                   };
                string[] expected = {
                                        "SuperClass.js",
                                        "NoSuperClass.js",
                                        "Foo.UnknownSuperClass.js",
                                        "Class.SuperClass.js",
                                        "Subclass.Class.js"
                                    };

                string[] sorted = FileDependencyMap.SortDependencies(files).ToArray();
                for (int i = 0; i < sorted.Count(); i++)
                {
                    Assert.AreEqual(expected[i], sorted[i]);
                }
            }
        }
#endif

    }
}
