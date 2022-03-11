namespace Excel2Json.Options
{
    public class EmailOptions
    {
        public const string Key = "Email";

        public string ApiKey { get; set; }
        public string FromEmail { get; set; }
        public string FromName { get; set; }
    }
}
