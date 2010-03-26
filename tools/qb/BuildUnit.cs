using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;

namespace qb
{
    public class BuildUnit
    {
        public string BaseClassName { get; private set; }
        public string ClassName { get; private set; }
        public string CssFileName { get; private set; }
        public string Folder { get; private set; }
        public string JsFileName { get; private set; }

        public BuildUnit(string jsFileName)
        {
            Debug.Assert(Path.GetExtension(jsFileName) == Project.fileExtensionJs);
            JsFileName = jsFileName;
            CssFileName = Path.ChangeExtension(jsFileName, Project.fileExtensionCss);

            string className;
            string baseClassName;
            GetClassNamesFromFileName(jsFileName, out className, out baseClassName);
            ClassName = className;
            BaseClassName = baseClassName;
        }

        public static void GetClassNamesFromFileName(string fileName, out string className, out string baseClassName)
        {
            string name = Path.GetFileNameWithoutExtension(fileName);
            string[] parts = name.Split(new Char[] { '.' }, 2);
            className = parts[0];
            baseClassName = (parts.Length == 2) ? parts[1] : null;
        }
    }
}
