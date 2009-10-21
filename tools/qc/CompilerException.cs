using System;

namespace qc
{
    public class CompilerException : Exception
    {
        public CompilerException(string message) : base(message)
        {
        }
    }
}
