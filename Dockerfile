FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["GamePrice/GamePrice.csproj", "GamePrice/"]
COPY ["GamePrice.Api/GamePrice.Api.csproj", "GamePrice.Api/"]
RUN dotnet restore "GamePrice/GamePrice.csproj"
COPY . .
WORKDIR "/src/GamePrice"
RUN dotnet publish "GamePrice.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "GamePrice.dll"]