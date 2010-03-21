using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace qb
{
    public class BuildFile
    {
        public string ClassName { get; private set; }
        public string BaseClassName { get; private set; }

        public BuildFile(string fileName)
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

    //public class BuildFileClassComparer : IEqualityComparer<BuildFile>
    //{
    //    public bool Equals(BuildFile buildFile1, BuildFile buildFile2)
    //    {
    //        return (buildFile1.ClassName == buildFile2.ClassName);
    //    }

    //    public int GetHashCode(BuildFile buildFile)
    //    {
    //        return buildFile.ClassName.GetHashCode();
    //    }
    //}
}
