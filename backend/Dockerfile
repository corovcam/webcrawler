# FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
# WORKDIR /webcrawler

# # Copy everything
# COPY . ./
# # Restore as distinct layers
# RUN dotnet restore
# # Build and publish a release
# RUN dotnet publish -c Release -o out

# # Build runtime image
# FROM mcr.microsoft.com/dotnet/aspnet:6.0
# WORKDIR /backend
# COPY --from=build-env webcrawler/backend/out .
# ENTRYPOINT ["dotnet", "HelloWorld.dll"]

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /webcrawler/backend
COPY bin/Release/net6.0/publish .
ENTRYPOINT ["dotnet", "HelloWorld.dll"]