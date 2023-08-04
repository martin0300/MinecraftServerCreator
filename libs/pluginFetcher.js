/*
    Copyright (C) 2023  Martin Magyar

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const axios = require("axios")

function search(searchData, api, isID = false) {
    if (!Object.keys(pluginAPIs).includes(api)) {
        return false
    }
    else {
        return pluginAPIs[api].pluginSearch(searchData, isID)
    }
}

function fetchAuthor(authorID, api) {
    if (!Object.keys(pluginAPIs).includes(api)) {
        return false
    }
    else {
        return pluginAPIs[api].fetchAuthor(authorID)
    }
}

function getAvailableApis() {
    return Object.keys(pluginAPIs)
}

var pluginAPIs = {
    spiget: {
        name: "spigotMC",
        apiURLs: {
            search: "https://api.spiget.org/v2/search/resources/",
            searchID: "https://api.spiget.org/v2/resources/",
            authorInfo: "https://api.spiget.org/v2/authors/"
        },
        pluginSearch: function(searchData, isID) {
            var self = this
            return new Promise(function(resolve, reject) {
                var workingURL = `${isID ? self.apiURLs.searchID : self.apiURLs.search}${searchData}`
                axios({
                    method: "get",
                    url: workingURL
                }).then(function(apiresponse) {
                    var plugins = apiresponse.data
                    var responseList = []
                    for (var x in plugins) {
                        var pluginInfo = plugins[x]
                        var response = {
                            external: pluginInfo.external,
                            id: pluginInfo.id,
                            downloads: pluginInfo.downloads,
                            releaseDate: pluginInfo.releaseDate,
                            updateDate: pluginInfo.updateDate,
                            name: pluginInfo.name,
                            tag: pluginInfo.tag,
                            testedVersions: pluginInfo.testedVersions,
                            contributors: pluginInfo.contributors,
                            file: pluginInfo.file,
                            likes: pluginInfo.likes,
                            premium: pluginInfo.premium,
                            authorID: pluginInfo.author.id
                        }
                        responseList.push(response)
                    }
                    resolve(responseList)
                }).catch(function(error) {
                    reject(error)
                })
            })
        },
        downloadPlugin: function(pluginID) {

        },
        fetchAuthor: function(authorID) {
            var self = this
            return new Promise(function(resolve, reject) {
                axios({
                    method: "get",
                    url: `${self.apiURLs.authorInfo}${authorID}`
                }).then(function(apiresponse) {
                    var response = {
                        name: apiresponse.name
                    }
                    resolve(response)
                }).catch(function(error) {
                    reject(error)
                })
            })
        }
    }
}

module.exports = {
    search,
    fetchAuthor,
    getAvailableApis
}