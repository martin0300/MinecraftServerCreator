# serverDownloader

## Downloader

**Optional values are indicated with "?"**

### Must include

-   buildlist (boolean)
-   getVersions (function(serverType <type: string>))
-   downloadJar (function(version <type: string>, serverType <type: string>, buildNumber? <type: number>))

### Optional

-   getBuildlist (function(version <type: string>, serverVersion <type: string>))

### Specification

-   buildlist: Indicates if downloader requires a build number.
-   getVersions: Returns all server versions of the server type in a list.
-   downloadJar: Returns download URL of the jar file with the serverType, serverVersion and buildNumber.
-   getBuildlist: Returns all builds of a server version in a list.
