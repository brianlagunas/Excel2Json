# Stage 1 - build Angular app
FROM node:14.17-alpine as node
WORKDIR /src/client
COPY ["Client/package*.json",  "./"]
RUN npm install
COPY ["Client/", "./"]
RUN npm run build

# Stage 2 - build web API
FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src/server
COPY ["Server/Excel2Json/Excel2Json.csproj", "./"]
RUN dotnet restore "Excel2Json.csproj"
COPY ["Server/Excel2Json/", "./"]
COPY --from=node /src/client/dist/excel2json ./wwwroot
RUN dotnet build "Excel2Json.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Excel2Json.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Excel2Json.dll"]