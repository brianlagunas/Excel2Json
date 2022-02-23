namespace Excel2Json.Contracts.v1.Requests
{
    public class UpdateFileRequest
    {
        public string Name { get; set; }
        public string Text { get; set; }
        public bool CanShare { get; set; }
    }
}
