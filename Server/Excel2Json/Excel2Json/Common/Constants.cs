using System;
using System.IO;

namespace Excel2Json.Common
{
    public class Constants
    {
        public static string UPLOAD_URL = Path.Combine(Environment.CurrentDirectory, "Uploads");
        public const string JSON = "json";
    }
}
