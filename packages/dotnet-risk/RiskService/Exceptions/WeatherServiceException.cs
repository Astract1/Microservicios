namespace RiskService.Exceptions
{
    public class WeatherServiceException : Exception
    {
        public WeatherServiceException(string message) : base(message)
        {
        }

        public WeatherServiceException(string message, Exception innerException) 
            : base(message, innerException)
        {
        }
    }
}