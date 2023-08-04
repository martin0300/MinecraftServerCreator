const pluginFetcher = require("../libs/pluginFetcher")

var searchRequest = pluginFetcher.search("nonexistantshit", "spiget")
if (searchRequest != false) {
    searchRequest.then(function(response) {
        console.log(response)
    })
}
else {
    console.log(searchRequest)
}
