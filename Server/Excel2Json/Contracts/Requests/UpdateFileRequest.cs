namespace Excel2Json.Contracts.Requests
{
    public class UpdateFileRequest
    {
        public string Name { get; set; }
        public string Text { get; set; }
        public bool CanShare { get; set; }
    }
}
