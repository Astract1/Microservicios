# Usar la imagen base de .NET SDK para compilar el proyecto
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Instalar la herramienta dotnet-ef (si se usa Entity Framework)
RUN dotnet tool install --global dotnet-ef

# Agregar la carpeta de herramientas globales al PATH
ENV PATH="$PATH:/root/.dotnet/tools"

# Copiar los archivos del proyecto al contenedor
COPY . ./

# Restaurar las dependencias
RUN dotnet restore PreventionService/PreventionService.csproj

# Compilar el proyecto
RUN dotnet publish PreventionService/PreventionService.csproj -c Release -o /out

# Usar la imagen base de .NET Runtime para ejecutar el proyecto
FROM mcr.microsoft.com/dotnet/aspnet:9.0
# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copiar los archivos compilados desde la etapa anterior
COPY --from=build /out .

# Exponer el puerto en el que el microservicio escuchará
EXPOSE 80

# Comando para ejecutar el microservicio
ENTRYPOINT ["dotnet", "PreventionService.dll"]