FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["GamePrice.csproj", "./"]
RUN dotnet restore "GamePrice.csproj"
COPY . .
RUN dotnet publish "GamePrice.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Configura a porta padrão para 80 (padrão web)
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "GamePrice.dll"]