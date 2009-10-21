using System;
using System.Collections.Generic;
using System.Text;

namespace qc
{
    /// <summary>
    /// An instance of a Quick control.
    /// </summary>
    /// UNDONE: Should probably derive this from Node directly and remove ControlNode
    public class Control
    {
        public string ClassName { get; set; }
        public Dictionary<string, Node> Properties { get; set; }

        public Control()
        {
            Properties = new Dictionary<string, Node>();
        }

        public Node this[string key]
        {
            get { return Properties[key]; }
            set { Properties[key] = value; }
        }
    }
}
