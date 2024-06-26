# serverDownloader

## Downloader

**Optional values are indicated with "?"**

self is a link to the main downloader object.

### Must include

-   id (string)
-   serverTypes (list)
-   buildlist (boolean)
-   getVersions (function(self, serverType <type: string>))
-   downloadJar (function(self, serverType <type: string>, serverVersion <type: string>, buildNumber? <type: number>))

### Optional

-   getBuildlist (function(self, serverType <type: string>, serverVersion <type: string>))

### Specification

-   id: Identifier of the downloader.
-   serverTypes: A list containing objects with keys serverTypeID and serverTypeName. This will be displayed in the menu.
-   buildlist: Indicates if downloader requires a build number.
-   getVersions: Returns all server versions of the server type in a list.
-   downloadJar: Returns download URL of the jar file with the serverType, serverVersion and buildNumber.
-   getBuildlist: Returns all builds of a server version in a list. (Only required if buildlist is true)

### Example

```js
{
    id: "paperapi",
    serverTypes: [
        {
            serverTypeID: "paper",
            serverTypeName: "paper"
        }
    ],
    buildlist: true,
    getVersions: (self, serverType) => {
        //get versions logic
    },
    downloadJar: (self, serverType, serverVersion, buildNumber) => {
        //download jar logic
    },
    getBuildlist: (self, serverType, serverVersion) => {
        //get buildlist logic
    }
}
```
