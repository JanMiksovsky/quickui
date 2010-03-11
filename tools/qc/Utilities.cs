using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Xml;
using System.Xml.Serialization;
using System.Text;

namespace qc
{
    static class Utilities
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
                (s, item) => {
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
        public static T DeserializeXml<T>(string resourceName)
        {
            using (Stream resourceStream = GetResourceStream(resourceName))
            {
                XmlSerializer xmlSerializer = new XmlSerializer(typeof(T));
                return (T)xmlSerializer.Deserialize(resourceStream);
            }
        }

        public static Stream GetResourceStream(string resourceName)
        {
            return Assembly.GetCallingAssembly().GetManifestResourceStream(resourceName);
        }

        public static StreamReader GetEmbeddedFileReader(string fileName)
        {
            Stream stream = GetResourceStream(fileName);

            // HACK: The following StreamReader call appears to always fail if it
            // directly follows the GetResourceStream call above. For some reason,
            // inserting executable code between the calls seems to make it work.
            // God help us.
            int foo = 1; foo++;

            return new StreamReader(stream);
        }

        public static string GetEmbeddedFileContent(string fileName)
        {
            using (StreamReader reader = new StreamReader(GetResourceStream(fileName)))
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
