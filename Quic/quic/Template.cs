using System;
using System.ComponentModel;

namespace Quic
{
    public class Template
    {
        public string Value { get; protected set; }

        public Template(string value)
        {
            Value = value;
        }

        public string Format(object o)
        {
            return Template.Format(Value, o);
        }

        /// <summary>
        /// Given an anonymous object with name-value property pairs, return
        /// the result of performing string replacments in the given template
        /// where all {name} occurrences are replaced with the corresponding value.
        /// </summary>
        /// <example>
        /// After calling
        /// 
        ///     string s = Template.Format("{Foo}, {Bar}!", new {
        ///         Bar = "world",
        ///         Foo = "Hello"
        ///     });
        ///     
        /// the string s is "Hello, world!".
        /// </example>
        public static string Format(string template, object o)
        {
            string s = template;

            foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(o))
            {
                string findValue = "{" + property.Name + "}";
                string replaceValue = (string) property.GetValue(o);
                s = s.Replace(findValue, replaceValue);
            }

            return s;
        }
    }
}
