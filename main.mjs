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

import cliMenu from "./libs/cliMenu.js"
import config, { loadConfig } from "./libs/config.js"
import chalk from "chalk"
import * as cheerio from 'cheerio';
import axios from "axios"
import fs from "fs"

const mscVersion = "2.0-Beta"

//replaced using function setupCreateMenu()
var createMenu = new cliMenu.placeHolderMenu()

var serverInfoMenu = new cliMenu.FreeMenu(serverInfoCallback, printServerInfo, chalk.yellow("#"), {
    pageIndex: 0
})

function printServerInfo() {
    console.log(serverInfoMenu.data.pageIndex)
    switch (serverInfoMenu.data.pageIndex) {
        case 0:
            console.log("Choose server version:")
            console.log("Choices:")
            var serverType = serverInfoMenu.data.version
            for (var version in versions[serverType]) {
                console.log(chalk.green(`-${version}`))
            }
            console.log(chalk.magenta("-back"))
            console.log(chalk.magenta("-menu"))
            break
        case 1:
            var yesno = `(${chalk.underline("y")}es/${chalk.underline("n")}o)`
            console.log(`Download latest build? ${chalk.green(yesno)}`)
            serverInfoMenu.userPrompt = chalk.yellow("?")
            break
        case "1a":
            console.log("Choose build:")
            console.log("Choices:")
            for (var build in serverInfoMenu.data.buildlist) {
                console.log(chalk.green(`-${serverInfoMenu.data.buildlist[build]}`))
            }
            console.log(chalk.magenta("-back"))
            console.log(chalk.magenta("-menu"))
            break
        case 2:
            console.log("guess no buildlist")
            break
    }
}

function serverInfoCallback(input) {
    switch (serverInfoMenu.data.pageIndex) {
        case 0:
            switch (input) {
                case "back":
                    createMenu.showMenu()
                    break
                case "menu":
                    mainMenu.showMenu()
                    break
                default:
                    var found = false
                    for (var version in versions[serverInfoMenu.data.version]) {
                        if (input == version) {
                            found = true
                            break
                        }
                    } 
                    if (!found) {
                        console.log(chalk.red("Not a choice!"))
                        serverInfoMenu.showMenu()
                    }
                    else {
                        serverInfoMenu.data.pageIndex++
                        serverInfoMenu.data.serverVersion = input

                        var found = false
                        for (var api in apis) {
                            if (versions[serverInfoMenu.data.version][serverInfoMenu.data.serverVersion] == api) {
                                found = true
                                break
                            }
                        }
                        if (found) {
                            serverInfoMenu.data.usingAPI = true
                            serverInfoMenu.data.api = versions[serverInfoMenu.data.version][serverInfoMenu.data.serverVersion]
                            if (!apis[serverInfoMenu.data.api].buildlist) {
                                serverInfoMenu.data.pageIndex++
                            }
                            else {
                                apis[serverInfoMenu.data.api].getBuildlist(serverInfoMenu.data.version, serverInfoMenu.data.serverVersion, function(response) {
                                    serverInfoMenu.data.buildlist = response
                                    serverInfoMenu.showMenu()
                                })
                            }
                        }
                        else {
                            serverInfoMenu.data.usingAPI = false
                            serverInfoMenu.data.pageIndex++
                            serverInfoMenu.showMenu()
                        }
                    }
                    break
            }
            break
        case 1:
            switch (input) {
                case "yes":
                    serverInfoMenu.data.buildVersion = "latest"
                    serverInfoMenu.data.pageIndex++
                    serverInfoMenu.showMenu()
                    break
                case "y":
                    serverInfoMenu.data.buildVersion = "latest"
                    serverInfoMenu.data.pageIndex++
                    serverInfoMenu.showMenu()
                    break
                case "no":
                    serverInfoMenu.data.pageIndex = "1a"
                    serverInfoMenu.showMenu()
                    break
                case "n":
                    serverInfoMenu.data.pageIndex = "1a"
                    serverInfoMenu.showMenu()
                    break
                case "back":
                    createMenu.showMenu()
                    break
                case "menu":
                    mainMenu.showMenu()
                    break
                default:
                    console.log(chalk.red("Not a choice!"))
                    serverInfoMenu.showMenu()
                    break
            }
            break
        case "1a":
            switch (input) {
                case "back":
                    serverInfoMenu.data.pageIndex = 1
                    serverInfoMenu.showMenu()
                case "menu":
                    mainMenu.showMenu()
                default:
                    console.log("ok")
                    break
            }
            break
    }
}

var mainMenu = new cliMenu.Menu([
    {label: "about", shortcut: "a", callback: function() {
        console.log(`MinecraftServerCreator ${chalk.blue(`V${mscVersion}`)} written by martin0300.`)
        cliMenu.waitForEnter()
        mainMenu.showMenu()
    }},
    {label: "exit", shortcut: "e", callback: function() {
        process.exit(0)
    }},
    {label: "create", shortcut: "c", callback: function() {
        createMenu.showMenu()
    }}
], mainMenuPrint, function() {
    console.log(chalk.red("Not a choice!"))
    mainMenu.showMenu()
}, chalk.yellow("?"))

function mainMenuPrint() {
    console.log(`Welcome to MinecraftServerCreator ${chalk.blue(`V${mscVersion}`)}!`)
    console.log("Choices:")
    console.log(chalk.green(`-${chalk.underline("c")}reate`))
    console.log(chalk.green(`-${chalk.underline("a")}bout`))
    console.log(chalk.green(`-${chalk.underline("e")}xit`))
}

//parses download list for version and download page links
function getBukkitParser(url, versionName, versionCollector, callback) {
    axios({
        method: "get",
        url: url
    }).then(function(response) {
        var parsedHTML = cheerio.load(response.data)
        var downloadLinks = parsedHTML(".download-pane")
        versionCollector[versionName] = {}
        downloadLinks.each(function() {
            var versionNumber = parsedHTML(this).find(".col-sm-3 h2").text()
            var downloadLink = parsedHTML(this).find(".btn-download").attr("href")
            versionCollector[versionName][versionNumber] = downloadLink
        })
        callback()
    })
}

//parses download pages for server jar download links
function getBukkitDownloadParser(url, callback) {
    axios({
        method: "get",
        url: url
    }).then(function(response) {
        var parsedHTML = cheerio.load(response.data)
        var downloadLink = parsedHTML(".well h2 a").attr("href")
        callback(downloadLink)
    })
}

//start fetching
function fetchNonAPIMCJars(callback) {
    console.log("Downloading database...")
    versionCollectorVars.versionLocationsKeys = Object.keys(versionLocations.nonapi)
    versionCollectorVars.doneFunction = callback
    var versionName = versionCollectorVars.versionLocationsKeys[versionCollectorVars.versionLocationsIndex]
    var url = versionLocations.nonapi[versionName].url
    try {
        getBukkitParser(url, versionName, versions, versionCollectorVars.callbackFunction)
    }
    catch {
        console.log("Failed to download database! Please try again! (getbukkit rate limit)")
        process.exit(2)
    }
}

function init() {
    config.initConfig(true)
}

function setupCreateMenu() {
    var createMenuOptions = [{
        label: "back",
        shortcut: "b",
        callback: function() {
            mainMenu.showMenu()
        }
    }]
    for (var version in versionLocations.nonapi) {
        var newOption = {
            label: version,
            shortcut: versionLocations.nonapi[version].shortcut,
            callback: function(userInput, versionName) {
                serverInfoMenu.data.pageIndex = 0
                serverInfoMenu.data.version = versionName
                serverInfoMenu.showMenu()
            }
        }
        createMenuOptions.push(newOption)
    }
    for (var version in versionLocations.api) {
        var newOption = {
            label: version,
            shortcut: versionLocations.api[version].shortcut,
            callback: function(userInput, versionName) {
                serverInfoMenu.data.pageIndex = 0
                serverInfoMenu.data.version = versionName
                serverInfoMenu.showMenu()
            }
        }
        createMenuOptions.push(newOption)
    }
    createMenu = new cliMenu.Menu(createMenuOptions, printCreateMenu, function() {
        console.log(chalk.red("Not a choice!"))
        createMenu.showMenu()
    }, chalk.yellow("?"))
    return
}

function printCreateMenu() {
    console.log("Choose server type:")
    console.log("Choices:")
    for (var version in versionLocations.nonapi) {
        console.log(chalk.green(`-${versionLocations.nonapi[version].displayName}`))
    }
    for (var version in versionLocations.api) {
        console.log(chalk.green(`-${versionLocations.api[version].displayName}`))
    }
    console.log(chalk.green(`-${chalk.underline("b")}ack`))
    return
}

//uses apis to fetch server jars
//apis can be easily added to the switch (i think)
function fetchAPIMCJars(callback) {
    versionCollectorVars.versionLocationsKeys = Object.keys(versionLocations.api)
    versionCollectorVars.doneFunction = callback
    versionCollectorVars.versionLocationsIndex = 0
    versionCollectorVars.callbackFunction = function(start = false) {
        if (!start) {
            versionCollectorVars.versionLocationsIndex++
        }
        if (versionCollectorVars.versionLocationsIndex != versionCollectorVars.versionLocationsKeys.length) {
            var version = versionCollectorVars.versionLocationsKeys[versionCollectorVars.versionLocationsIndex]
            var method = versionLocations.api[version].method
            apis[method].getVersions(version, versions, versionCollectorVars.callbackFunction)
        }
        else {
            versionCollectorVars.doneFunction()
        }
    }
    versionCollectorVars.callbackFunction(true)
}

init()
var configFile = loadConfig(true, {})

//async sux
var versionCollectorVars = {
    versionLocationsKeys: [],
    versionLocationsIndex: 0,
    callbackFunction: function() {
        versionCollectorVars.versionLocationsIndex++
        if (versionCollectorVars.versionLocationsIndex != versionCollectorVars.versionLocationsKeys.length) {
            var versionName = versionCollectorVars.versionLocationsKeys[versionCollectorVars.versionLocationsIndex]
            var url = versionLocations.nonapi[versionName].url
            try {
                getBukkitParser(url, versionName, versions, versionCollectorVars.callbackFunction)
            }
            catch {
                console.log("Failed to download database! Please try again! (getbukkit rate limit)")
                process.exit(2)
            }
        }
        else {
            versionCollectorVars.doneFunction()
        }
    },
    doneFunction: function() {}
}

/*
nonapi links will get parsed by getbukkit parser
api will get parsed using the specified api
*/
var versionLocations = {
    nonapi: {
        craftbukkit: {
            shortcut: "c",
            displayName: `${chalk.underline("c")}raftbukkit`,
            url: "https://getbukkit.org/download/craftbukkit",
        },
        vanilla: {
            shortcut: "v",
            displayName: `${chalk.underline("v")}anilla`,
            url: "https://getbukkit.org/download/vanilla",
        },
        spigot: {
            shortcut: "s",
            displayName: `${chalk.underline("s")}pigot`,
            url: "https://getbukkit.org/download/spigot",
        }
    },
    api: {
        paper: {
            shortcut: "p",
            displayName: `${chalk.underline("p")}aper`,
            method: "paperapi"
        }
    }
}

var apis = {
    paperapi: {
        buildlist: true,
        getVersions: function(version, versionCollector, callback) {
            axios({
                method: "get",
                url: `https://api.papermc.io/v2/projects/${version}`
            }).then(function(response) {
                versionCollector[version] = {}
                for (var versionIndex in response.data.versions) {
                    var versionNumber = response.data.versions[versionIndex]
                    versionCollector[version][versionNumber] = "paperapi"
                }
                callback()
            })
        },
        getBuildlist: function(version, serverVersion, callback) {
            axios({
                method: "get",
                url: `https://api.papermc.io/v2/projects/${version}/versions/${serverVersion}`
            }).then(function(response) {
                callback(response.data.builds)
            })
        },
        downloadJar: function(version, serverVersion) {

        }
    }
}

//parsed versions
var versions = {}

fetchNonAPIMCJars(function() {
    fetchAPIMCJars(function() {
        setupCreateMenu()
        mainMenu.showMenu()
    })
})