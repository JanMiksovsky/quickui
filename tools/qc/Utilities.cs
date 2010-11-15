using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Xml.Serialization;

namespace qc
{
    public static class Utilities
    {
        /// <summary>
        /// Map each list item to a string and concatenate the results.
        /// </summary>
        public static string Concatenate<T>(this IEnumerable<T> list, Func<T, string> f)
        {
            return list.Concatenate(f, String.Empty);
        }

        /// <summary>
        /// Map each list item to a string and concatenate the results, separating
        /// the instances with the given separator.
        /// </summary>
        public static string Concatenate<T>(this IEnumerable<T> list, Func<T, string> f, string separator)
        {
            StringBuilder stringBuilder = list.Aggregate(new StringBuilder(),
                (s, item) =>
                {
                    if (s.Length > 0)
                    {
                        s.Append(separator);
                    }
                    return s.Append(f(item));
                }
            );
            return stringBuilder.ToString();
        }

        /// <summary>
        /// Read the XML resource with the given name, deserialize it, and return the result.
        /// </summary>
        public static T DeserializeXml<T>(string resourceName, Assembly assembly)
        {
            using (Stream resourceStream = GetResourceStream(resourceName, assembly))
            {
                XmlSerializer xmlSerializer = new XmlSerializer(typeof(T));
                return (T)xmlSerializer.Deserialize(resourceStream);
            }
        }

        public static Stream GetResourceStream(string resourceName, Assembly assembly)
        {
            var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
            {
                throw new ArgumentException(string.Format("Could not find resource '{0}' in assembly '{1}'", resourceName, assembly));
            }
            return stream;
        }

        public static StreamReader GetEmbeddedFileReader(string fileName, Assembly assembly)
        {
            Stream stream = GetResourceStream(fileName, assembly);
            if (stream != null)
            {
                return new StreamReader(stream);
            }
            else
            {
                return null;
            }
        }

        public static string GetEmbeddedFileContent(string fileName, Assembly assembly)
        {
            using (StreamReader reader = new StreamReader(GetResourceStream(fileName, assembly)))
            {
                return reader.ReadToEnd();
            }
        }

#if DEBUG
        /// <summary>
        /// Convert all "\r\n" sequences to "\n" for purposes of checking compilations.
        /// </summary>
        /// <remarks>
        /// Otherwise way too much time is wasted trying to chase down irrelevant
        /// inconsistencies in unit tests that result from writing tests on different
        /// platforms.
        /// </remarks>
        public static string NormalizeLineEndings(string s)
        {
            return s.Replace("\r\n", "\n");
        }
#endif
    }
}
