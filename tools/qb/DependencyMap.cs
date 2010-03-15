using System;
using System.Collections.Generic;
using System.Linq;

#if DEBUG
using NUnit.Framework;
#endif

namespace qb
{
    /// <summary>
    /// Tracks which items in a set are dependent upon which other item(s).
    /// </summary>
    /// <remarks>
    /// Each item can only be directly dependent upon a single other item.
    /// This can be used, for example, to define a single-inheritance class
    /// hierarchy.
    /// </remarks>
    class DependencyMap<T> : Dictionary<T, T>
    {
        /// <summary>
        /// Return the map such that each item comes after all items it's
        /// dependent upon.
        /// </summary>
        public IEnumerable<T> SortDependencies()
        {
            Queue<T> queue = new Queue<T>(this.Keys);
            List<T> sorted = new List<T>();

            // Each pass through the map should sort at least one item.
            // This gives us a maximum number of passes as n*(n+1) / 2.
            int maxPass = (this.Keys.Count * (this.Keys.Count + 1)) / 2;
            for (int i = 0; i < maxPass; i++)
            {
                T key = queue.Dequeue();
                T value = this[key];
                if (value == null ||
                    sorted.Contains(value) ||
                    !this.ContainsKey(value))
                {
                    sorted.Add(key);
                    if (queue.Count == 0)
                    {
                        break;  // Done
                    }
                }
                else
                {
                    queue.Enqueue(key);
                }
            }

            if (queue.Count > 0)
            {
                throw new ArgumentException("Dependency map contains a circular reference.");
            }

            return sorted;
        }
    }

#if DEBUG
    [TestFixture]
    static public class Tests
    {
        [Test]
        public static void Typical()
        {
            DependencyMap<string> map = new DependencyMap<string>();
            map.Add("A", "C");  // Forward reference
            map.Add("B", "E");  // Forward reference
            map.Add("D", null); // No dependency
            map.Add("C", "B");  // Backward reference
            map.Add("E", null); // No dependency
            map.Add("F", "G");  // Dependent on something outside map

            CheckSort("DEFBCA", map);
        }

        [Test]
        public static void DegenerateCase()
        {
            DependencyMap<string> map = new DependencyMap<string>();
            map.Add("A", null);
            map.Add("B", null);
            map.Add("C", null);
            map.Add("D", null);
            map.Add("E", null);

            CheckSort("ABCDE", map);
        }

        [Test]
        public static void WorstCase()
        {
            DependencyMap<string> map = new DependencyMap<string>();
            map.Add("A", "B");
            map.Add("B", "C");
            map.Add("C", "D");
            map.Add("D", "E");
            map.Add("E", null);

            CheckSort("EDCBA", map);
        }

        [Test]
        [ExpectedException(typeof(ArgumentException))]
        public static void Circle()
        {
            DependencyMap<string> map = new DependencyMap<string>();
            map.Add("A", "B");
            map.Add("B", "C");
            map.Add("C", "A");
            IEnumerable<string> sorted = map.SortDependencies();
        }

        private static void CheckSort(string expected, DependencyMap<string> map)
        {
            IEnumerable<string> sorted = map.SortDependencies();
            string s = sorted.Aggregate("", (seed, item) => seed + item);
            Assert.AreEqual(expected, s);
        }
    }
#endif
}
