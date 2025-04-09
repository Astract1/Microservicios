namespace PreventionService.Utils
{
    public static class ValidationUtils
    {
        public static bool IsValidUserId(int userId)
        {
            return userId > 0;
        }
    }
}