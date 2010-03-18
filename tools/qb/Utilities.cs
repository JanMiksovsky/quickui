using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;

namespace qb
{
    static class Utilities
    {
        /// <summary>
        /// Return true if the indicated file is newer than all the target files.
        /// </summary>
        public static bool FileNewerThan(string file, IEnumerable<string> targetFiles)
        {
            DateTime fileLastWriteTime = new FileInfo(file).LastWriteTimeUtc;
            return targetFiles.ToList().TrueForAll(
                (targetFile) => fileLastWriteTime > new FileInfo(targetFile).LastWriteTimeUtc);
        }

        public static bool FileNewerThan(string file, string targetFile)
        {
            DateTime fileLastWriteTime = new FileInfo(file).LastWriteTimeUtc;
            DateTime targetLastWriteTime = new FileInfo(targetFile).LastWriteTimeUtc;
            return (fileLastWriteTime > targetLastWriteTime);
        }
    }
}
