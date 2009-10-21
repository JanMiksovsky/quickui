using System;
using System.Collections.Generic;
using System.IO;

namespace qb
{
    static class Utilities
    {
        /// <summary>
        /// Return true if the indicated file is newer than all the target files.
        /// </summary>
        public static bool FileNewerThan(string file, params string[] targetFiles)
        {
            DateTime fileLastWriteTime = new FileInfo(file).LastWriteTimeUtc;
            return new List<string>(targetFiles).TrueForAll(
                (targetFile) => fileLastWriteTime > new FileInfo(targetFile).LastWriteTimeUtc);
        }
    }
}
