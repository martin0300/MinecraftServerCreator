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
    switch (serverInfoMenu.data.pageIndex) {
        case 0:
            serverInfoMenu.userPrompt = chalk.yellow("#")
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
            serverInfoMenu.userPrompt = chalk.yellow("?")
            var yesno = `(${chalk.underline("y")}es/${chalk.underline("n")}o)`
            console.log(`Download latest build? ${chalk.green(yesno)}`)
            break
        case "1a":
            serverInfoMenu.userPrompt = chalk.yellow("#")
            console.log("Choose build:")
            console.log("Choices:")
            for (var build in serverInfoMenu.data.buildlist) {
                console.log(chalk.green(`-${serverInfoMenu.data.buildlist[build]}`))
            }
            console.log(chalk.magenta("-latest"))
            console.log(chalk.magenta("-back"))
            console.log(chalk.magenta("-menu"))
            break
        case 2:
            serverInfoMenu.userPrompt = chalk.yellow("?")
            console.log("Choose install location:")
            break
        case 3:
            serverInfoMenu.userPrompt = chalk.yellow("?")
            console.log("Enter server name:")
            break
        case "3a":
            serverInfoMenu.userPrompt = chalk.yellow("?")
            var choices = `(${chalk.underline("y")}es/${chalk.underline("n")}o)`
            console.log(`Do you want to create a directory with this name? ${chalk.green(choices)}`)
            break
        case 4:
            serverInfoMenu.userPrompt = chalk.yellow("#")
            console.log(`Enter minimum amount of ram for server: (${chalk.green("MB")} or ${chalk.green("GB")} (defaults to ${chalk.green("MB")}) or leave empty)`)
            break
        case "4a":
            serverInfoMenu.userPrompt = chalk.yellow("#")
            console.log(`Enter maximum amount of ram for server: (${chalk.green("MB")} or ${chalk.green("GB")} (defaults to ${chalk.green("MB")}) or leave empty)`)
            break
        case 5:
            serverInfoMenu.userPrompt = chalk.yellow("?")
            var choices = `(${chalk.underline("y")}es/${chalk.underline("n")}o/${chalk.underline("b")}ack/${chalk.underline("m")}enu)`
            console.log(`Everything is correct? ${chalk.green(choices)}`)
            console.log(`Server type: ${chalk.magenta(serverInfoMenu.data.version)}`)
            console.log(`Server version: ${chalk.magenta(serverInfoMenu.data.serverVersion)}`)
            console.log(`Server build: ${chalk.magenta(serverInfoMenu.data.buildVersion)}`)
            console.log(`Installation location: ${chalk.magenta(serverInfoMenu.data.installDir)}`)
            console.log(`Server name: ${chalk.magenta(serverInfoMenu.data.serverName)}`)
            console.log(`Create directory: ${chalk.magenta(serverInfoMenu.data.createDir ? "yes" : "no")}`)
            console.log(`Minimum ram: ${chalk.magenta(serverInfoMenu.data.minRAM == "" ? "default": serverInfoMenu.data.minRAM)}`)
            console.log(`Maximum ram: ${chalk.magenta(serverInfoMenu.data.maxRAM == "" ? "default": serverInfoMenu.data.maxRAM)}`)
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
                        serverInfoMenu.data.api = versions[serverInfoMenu.data.version][serverInfoMenu.data.serverVersion].method

                        if (!apis[serverInfoMenu.data.api].buildlist) {
                            serverInfoMenu.data.pageIndex++
                            serverInfoMenu.showMenu()
                        }
                        else {
                            apis[serverInfoMenu.data.api].getBuildlist(serverInfoMenu.data.version, serverInfoMenu.data.serverVersion, function(response) {
                                serverInfoMenu.data.buildlist = response
                                serverInfoMenu.showMenu()
                            })
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
                    serverInfoMenu.data.pageIndex--
                    serverInfoMenu.showMenu()
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
                    break
                case "menu":
                    mainMenu.showMenu()
                    break
                case "latest":
                    serverInfoMenu.data.buildVersion = "latest"
                    serverInfoMenu.data.pageIndex = 2
                    serverInfoMenu.showMenu()
                    break
                default:
                    var found = false
                    for (var build in serverInfoMenu.data.buildlist) {
                        if (input == serverInfoMenu.data.buildlist[build]) {
                            found = true
                            break
                        }
                    }
                    if (found) {
                        serverInfoMenu.data.buildVersion = input
                        serverInfoMenu.data.pageIndex = 2
                        serverInfoMenu.showMenu()
                    }
                    else {
                        console.log(chalk.red("Not a choice!"))
                        serverInfoMenu.showMenu()
                    }
                    break
            }
            break
        case 2:
            switch (input) {
                case "menu":
                    mainMenu.showMenu()
                    break
                case "back":
                    if (apis[serverInfoMenu.data.api].buildlist) {
                        serverInfoMenu.data.pageIndex--
                    }
                    else {
                        serverInfoMenu.data.pageIndex -= 2
                    }
                    serverInfoMenu.showMenu()
                    break
                default:
                    if (fs.existsSync(input)) {
                        serverInfoMenu.data.pageIndex++
                        serverInfoMenu.data.installDir = input
                        serverInfoMenu.showMenu()
                    } 
                    else {
                        console.log(chalk.red("Invalid directory!"))
                        serverInfoMenu.showMenu()
                    }
                    break
            }
            break
        case 3:
            if (!isnullorempty(input)) {
                serverInfoMenu.data.serverName = input
                serverInfoMenu.data.pageIndex = "3a"
                serverInfoMenu.showMenu()
            }
            else {
                console.log(chalk.red("There is nothing entered!"))
                serverInfoMenu.data.pageIndex--
                serverInfoMenu.showMenu()
            }
            break
        case "3a":
            switch (input) {
                case "y":
                    serverInfoMenu.data.createDir = true
                    serverInfoMenu.data.pageIndex = 4
                    serverInfoMenu.showMenu()
                    break
                case "yes":
                    serverInfoMenu.data.createDir = true
                    serverInfoMenu.data.pageIndex = 4
                    serverInfoMenu.showMenu()
                    break
                case "n":
                    serverInfoMenu.data.createDir = false
                    serverInfoMenu.data.pageIndex = 4
                    serverInfoMenu.showMenu()
                    break
                case "no":
                    serverInfoMenu.data.createDir = false
                    serverInfoMenu.data.pageIndex = 4
                    serverInfoMenu.showMenu()
                    break
                case "back":
                    serverInfoMenu.data.pageIndex = 3
                    serverInfoMenu.showMenu()
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
        case 4:
            switch (input) {
                case "back":
                    serverInfoMenu.data.pageIndex = "3a"
                    serverInfoMenu.showMenu()
                    break
                case "menu":
                    mainMenu.showMenu()
                    break
                case "":
                    serverInfoMenu.data.maxRAM = false
                    serverInfoMenu.data.pageIndex = "4a"
                    serverInfoMenu.showMenu()
                    break
                default:
                    var maxram = checkRAM(input)
                    if (maxram == false) {
                        console.log(chalk.red("Not a number or a valid ram amount!"))
                        serverInfoMenu.showMenu()
                        break
                    }
                    else {
                        serverInfoMenu.data.maxRAM = maxram
                        serverInfoMenu.data.pageIndex = "4a"
                        serverInfoMenu.showMenu()
                        break
                    }
            }
            break
        case "4a":
            switch (input) {
                case "back":
                    serverInfoMenu.data.pageIndex = 4
                    serverInfoMenu.showMenu()
                    break
                case "menu":
                    mainMenu.showMenu()
                    break
                case "":
                    serverInfoMenu.data.minRAM = false
                    serverInfoMenu.data.pageIndex = 5
                    serverInfoMenu.showMenu()
                    break
                default:
                    var minram = checkRAM(input)
                    if (minram == false) {
                        console.log(chalk.red("Not a number or a valid ram amount!"))
                        serverInfoMenu.showMenu()
                        break
                    }
                    else {
                        serverInfoMenu.data.minRAM = minram
                        serverInfoMenu.data.pageIndex = 5
                        serverInfoMenu.showMenu()
                        break
                    }
            }
            break
        case 5:
            switch (input) {
                case "menu":
                    mainMenu.showMenu()
                    break
                case "m":
                    mainMenu.showMenu()
                    break
                case "back":
                    serverInfoMenu.data.pageIndex = "4a"
                    serverInfoMenu.showMenu()
                    break
                case "b":
                    serverInfoMenu.data.pageIndex = "4a"
                    serverInfoMenu.showMenu()
                    break
                case "no":
                    console.log("Restarting...")
                    createMenu.showMenu()
                    break
                case "n":
                    console.log("Restarting...")
                    createMenu.showMenu()
                    break
            }
            break
    }
}

function checkRAM(inputRAM) {
    var ram
    if (/^\d+(\.\d+)?[gG][bB]?$/.test(inputRAM)) {
        ram = inputRAM.replace("gb", "G").replace("GB", "G").replace("gB", "G").replace("Gb", "G").replace("g", "G")
    }
    else if (/^\d+[mM][bB]?$/.test(inputRAM)) {
        ram = inputRAM.replace("mb", "M").replace("MB", "M").replace("mB", "M").replace("Mb", "M").replace("m", "M")
    }
    else {
        if (!isNaN(inputRAM)) {
            ram = inputRAM + "M"
        }
        else {
            return false
        }
    }
    return ram
}

function isnullorempty(string) {
	if (string == null) {
		return true;
	}
	var string2 = string.split(" ").join("");
	if (string2.length == 0) {
		return true;
	} else {
		if (!string2) {
			return true;
		} else {
			return false;
		}
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
    for (var version in versionLocations) {
        var newOption = {
            label: version,
            shortcut: versionLocations[version].shortcut,
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
    for (var version in versionLocations) {
        console.log(chalk.green(`-${versionLocations[version].displayName}`))
    }
    console.log(chalk.green(`-${chalk.underline("b")}ack`))
    return
}

//uses apis to fetch server jars
//apis can be easily added to the switch (i think)
function fetchAPIMCJars(callback) {
    console.log("Downloading database...")
    versionCollectorVars.versionLocationsKeys = Object.keys(versionLocations)
    versionCollectorVars.doneFunction = callback
    versionCollectorVars.versionLocationsIndex = 0
    versionCollectorVars.callbackFunction = function(start = false) {
        if (!start) {
            versionCollectorVars.versionLocationsIndex++
        }
        if (versionCollectorVars.versionLocationsIndex != versionCollectorVars.versionLocationsKeys.length) {
            var version = versionCollectorVars.versionLocationsKeys[versionCollectorVars.versionLocationsIndex]
            var method = versionLocations[version].method
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
    callbackFunction: function() {},
    doneFunction: function() {}
}

/*
api will get parsed using the specified api
*/
var versionLocations = {
    craftbukkit: {
        shortcut: "c",
        displayName: `${chalk.underline("c")}raftbukkit`,
        method: "getbukkit"
    },
    vanilla: {
        shortcut: "v",
        displayName: `${chalk.underline("v")}anilla`,
        method: "getbukkit"
    },
    spigot: {
        shortcut: "s",
        displayName: `${chalk.underline("s")}pigot`,
        method: "getbukkit"
    },
    paper: {
        shortcut: "p",
        displayName: `${chalk.underline("p")}aper`,
        method: "paperapi"
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
                    versionCollector[version][versionNumber] = {
                        method: "paperapi"
                    }
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
    },
    getbukkit: {
        buildlist: false,
        getVersions: function(version, versionCollector, callback) {
            axios({
                method: "get",
                url: `https://getbukkit.org/download/${version}`
            }).then(function(response) {
                var parsedHTML = cheerio.load(response.data)
                var downloadLinks = parsedHTML(".download-pane")
                versionCollector[version] = {}
                downloadLinks.each(function() {
                    var versionNumber = parsedHTML(this).find(".col-sm-3 h2").text()
                    var downloadLink = parsedHTML(this).find(".btn-download").attr("href")
                    versionCollector[version][versionNumber] = {
                        method: "getbukkit",
                        optdata: {
                            url: downloadLink
                        }
                    }
                })
                callback()
            })
        },
        //TODO: finish this
        downloadJar: function(version, serverVersion) {
            axios({
                method: "get",
                url: versions[version][serverVersion].optdata.url
            }).then(function(response) {
                var parsedHTML = cheerio.load(response.data)
                var downloadLink = parsedHTML(".well h2 a").attr("href")
                callback(downloadLink)
            })
        }
    }
}

//parsed versions
var versions = {}

fetchAPIMCJars(function() {
    setupCreateMenu()
    mainMenu.showMenu()
})