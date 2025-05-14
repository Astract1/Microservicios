# Usar la imagen base de .NET SDK para compilar el proyecto
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

# Copiar los archivos del proyecto al contenedor
COPY . ./

# Restaurar las dependencias
RUN dotnet restore RiskService/RiskService.csproj

# Compilar el proyecto
RUN dotnet publish RiskService/RiskService.csproj -c Release -o /out

# Usar la imagen base de .NET Runtime para ejecutar el proyecto
FROM mcr.microsoft.com/dotnet/aspnet:6.0
# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copiar los archivos compilados desde la etapa anterior
COPY --from=build /out .

# Crear y asegurarse que el directorio Data existe
RUN mkdir -p /app/Data && chmod 777 /app/Data

# Exponer el puerto en el que el microservicio escuchará
EXPOSE 80

# Variable de entorno para asegurar que la aplicación escuche en el puerto 80
ENV ASPNETCORE_URLS=http://+:80

# Comando para ejecutar el microservicio
ENTRYPOINT ["dotnet", "RiskService.dll"]