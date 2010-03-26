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
    public class Build
    {
        public string Path { get; protected set; }
        private List<BuildUnit> BuildUnits = new List<BuildUnit>();

        public Build()
        {
            Path = String.Empty;
        }

        public Build(string path)
        {
            Path = path;
        }

        public void Add(string fileName)
        {
            Add(new BuildUnit(fileName));
        }

        public void Add(BuildUnit unit)
        {
            BuildUnits.Add(unit);
        }

        public void AddExistingFiles()
        {
            string searchPattern = "*" + Project.fileExtensionJs;
            string[] files = Directory.GetFiles(Path, searchPattern);
            BuildUnits.AddRange(files.Select(file =>
                new BuildUnit(file)));
        }

        public IEnumerable<string> CssFiles
        {
            get
            {
                return BuildUnits.Select(unit => unit.CssFileName);
            }
        }

        public IEnumerable<string> Files
        {
            get
            {
                return JsFiles.Concat(CssFiles);
            }
        }

        public bool GetCorrespondingBuildUnit(string fileName, out BuildUnit buildUnit)
        {
            string className;
            string baseClassName;
            BuildUnit.GetClassNamesFromFileName(fileName, out className, out baseClassName);
            return GetBuildUnitForClass(className, out buildUnit);
        }

        public IEnumerable<string> JsFiles
        {
            get
            {
                return BuildUnits.Select(unit => unit.JsFileName);
            }
        }

        /// <summary>
        /// Remove any files in the build folder that are not in this build,
        /// i.e., files that are left over from a previous compilation.
        /// </summary>
        public void RemoveObsoleteFiles()
        {
            string[] jsFiles = Directory.GetFiles(Path, "*" + Project.fileExtensionJs);
            string[] cssFiles = Directory.GetFiles(Path, "*" + Project.fileExtensionCss);
            IEnumerable<string> allFiles = jsFiles.Concat(cssFiles);
            IEnumerable<string> orphanedFiles = allFiles.Except(Files);
            foreach (string orphanedFile in orphanedFiles)
            {
                File.Delete(orphanedFile);
            }
        }

        public IEnumerable<BuildUnit> SortBuildUnits()
        {
            Dictionary<string, BuildUnit> classNameToFileNameMap = ClassNameToFileNameMap();
            DependencyMap<string> classDependencyMap = ClassDependencyMap();
            IEnumerable<string> sortedClassNames = classDependencyMap.SortDependencies();
            IEnumerable<BuildUnit> sortedBuildUnits = sortedClassNames.Select(
                className => classNameToFileNameMap[className]);
            return sortedBuildUnits;
        }

        private Dictionary<string, BuildUnit> ClassNameToFileNameMap()
        {
            Dictionary<string, BuildUnit> map = new Dictionary<string, BuildUnit>();
            foreach (BuildUnit buildFile in BuildUnits)
            {
                if (map.ContainsKey(buildFile.ClassName))
                {
                    throw new Exception(
                        String.Format("Attempt to define control class {0} more than once.", buildFile.ClassName));
                }
                map.Add(buildFile.ClassName, buildFile);
            }
            return map;
        }

        private DependencyMap<string> ClassDependencyMap()
        {
            // Sort the units by class name before adding them to the map.
            // This ensures that classes with equivalent dependency depths
            // ultimately end up sorted by class name as well.
            IEnumerable<BuildUnit> sortedBuildUnits = BuildUnits.OrderBy(
                buildUnit => buildUnit.ClassName);

            DependencyMap<string> map = new DependencyMap<string>();
            foreach (BuildUnit buildFile in sortedBuildUnits)
            {
                map.Add(buildFile.ClassName, buildFile.BaseClassName);
            }
            return map;
        }

        private bool GetBuildUnitForClass(string className, out BuildUnit buildUnit)
        {
            buildUnit = BuildUnits.FirstOrDefault(buildFile => buildFile.ClassName == className);
            return buildUnit != null;
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
#endif
    }
}
