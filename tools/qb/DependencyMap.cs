using System;
using System.Collections.Generic;
using System.Linq;

namespace qb
{
    /// <summary>
    /// Determine which items in a set are dependent upon which other item(s).
    /// </summary>
    /// <remarks>
    /// Each item can only be directly dependent upon a single other item.
    /// A call to DependencyMap.Add(x, y) adds the fact that x depends on y.
    /// </remarks>
    public class DependencyMap<T> : Dictionary<T, T>
    {
        /// <summary>
        /// Return the map such that each item comes after all items it's
        /// dependent upon.
        /// </summary>
        public IEnumerable<T> SortDependencies()
        {
            Queue<T> queue = new Queue<T>(this.Keys);   // Items not yet sorted.
            List<T> sorted = new List<T>();             // Items already sorted.

            // Each pass through the map should sort at least one item.
            // This gives us a maximum number of passes as n*(n+1) / 2.
            int maxPass = (this.Keys.Count * (this.Keys.Count + 1)) / 2;
            for (int i = 0; i < maxPass; i++)
            {
                // On each pass, we pull out anything that has no dependencies,
                // or whose dependent item has already been sorted.
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
                    queue.Enqueue(key); // Defer sorting for a later pass.
                }
            }

            if (queue.Count > 0)
            {
                throw new ArgumentException("Dependency map contains a circular reference.");
            }

            return sorted;
        }
    }
}
