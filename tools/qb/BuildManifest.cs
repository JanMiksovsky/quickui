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
    /// A set of files built by the compiler.
    /// </summary>
    public class BuildManifest : List<BuildFile>
    {
        public BuildManifest()
        {
        }

        public BuildManifest(string buildPath, string fileExtension)
        {
            string searchPattern = "*" + fileExtension;
            string[] files = Directory.GetFiles(buildPath, searchPattern);
            IEnumerable<BuildFile> buildFiles = files.Select(file =>
                new BuildFile(file));
            this.AddRange(buildFiles);
        }

        public void Add(string file)
        {
            this.Add(new BuildFile(file));
        }

        public IEnumerable<string> Files
        {
            get
            {
                return this.Select(buildFile => buildFile.FileName);
            }
        }

        public bool GetBuildFileForClass(string className, out BuildFile fileForClass)
        {
            fileForClass = this.FirstOrDefault(buildFile => buildFile.ClassName == className);
            return fileForClass == null;
        }

        public bool RequiresCompilation(string targetFile)
        {
            return RequiresCompilation(new BuildFile(targetFile));
        }

        public bool RequiresCompilation(BuildFile targetFile)
        {
            string targetClass = targetFile.ClassName;
            BuildFile fileForClass;
            bool found = GetBuildFileForClass(targetClass, out fileForClass);
            if (!found)
            {
                return true;
            }

            return Utilities.FileNewerThan(targetFile.FileName, fileForClass.FileName);
        }

        public IEnumerable<BuildFile> SortDependencies()
        {
            Dictionary<string, BuildFile> classNameToFileNameMap = ClassNameToFileNameMap();
            DependencyMap<string> classDependencyMap = ClassDependencyMap();
            IEnumerable<string> sortedClassNames = classDependencyMap.SortDependencies();
            IEnumerable<BuildFile> sortedBuildFiles = sortedClassNames.Select(
                className => classNameToFileNameMap[className]);
            return sortedBuildFiles;
        }

        private Dictionary<string, BuildFile> ClassNameToFileNameMap()
        {
            Dictionary<string, BuildFile> map = new Dictionary<string, BuildFile>();
            foreach (BuildFile buildFile in this)
            {
                map.Add(buildFile.ClassName, buildFile);
            }
            return map;
        }

        private DependencyMap<string> ClassDependencyMap()
        {
            DependencyMap<string> map = new DependencyMap<string>();
            foreach (BuildFile buildFile in this)
            {
                map.Add(buildFile.ClassName, buildFile.BaseClassName);
            }
            return map;
        }

#if DEBUG
        [TestFixture]
        public class Tests
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
                BuildManifest manifest = new BuildManifest();
                manifest.AddRange(files.Select(file => new BuildFile(file)));

                string[] expected = {
                                        "Foo.UnknownSuperClass.js",
                                        "NoSuperClass.js",
                                        "SuperClass.js",
                                        "Class.SuperClass.js",
                                        "Subclass.Class.js"
                                    };

                BuildFile[] sortedBuildFiles = manifest.SortDependencies().ToArray();
                for (int i = 0; i < sortedBuildFiles.Count(); i++)
                {
                    Assert.AreEqual(expected[i], sortedBuildFiles[i].FileName);
                }
            }
        }
#endif
    }
}
