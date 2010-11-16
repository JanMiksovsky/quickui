using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NUnit.Framework;
using qb;

namespace Tests
{
    [TestFixture]
    public class DependencyTests
    {
        [Test]
        public void Typical()
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
        public void DegenerateCase()
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
        public void WorstCase()
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
        public void Circle()
        {
            DependencyMap<string> map = new DependencyMap<string>();
            map.Add("A", "B");
            map.Add("B", "C");
            map.Add("C", "A");
            map.SortDependencies();
        }

        [Test]
        public void Empty()
        {
            DependencyMap<string> map = new DependencyMap<string>();
            IEnumerable<string> sorted = map.SortDependencies();
            Assert.AreEqual(0, sorted.Count());
        }

        private void CheckSort(string expected, DependencyMap<string> map)
        {
            IEnumerable<string> sorted = map.SortDependencies();
            string s = sorted.Aggregate("", (seed, item) => seed + item);
            Assert.AreEqual(expected, s);
        }
    }
}
