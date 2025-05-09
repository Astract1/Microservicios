# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0-preview AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["RiskService.csproj", "./"]
RUN dotnet restore

# Copy the rest of the code
COPY . .
RUN dotnet build "RiskService.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "RiskService.csproj" -c Release -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create directory for SQLite database
RUN mkdir -p /app/Data

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV DATABASE_CONNECTION=Data Source=/app/Data/RiskService.db

EXPOSE 80

ENTRYPOINT ["dotnet", "RiskService.dll"] 