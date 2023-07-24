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
import http from "http"
import https from "https"
import path from "path";
import os from "os"
import dns from "dns"

const mscVersion = "2.0-Beta"
var ostype = os.platform()

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
        case "0a":
            serverInfoMenu.userPrompt = chalk.yellow("?")
            var choices = chalk.green(`(${chalk.underline("r")}etry/${chalk.underline("m")}enu/${chalk.underline("b")}ack)`)
            console.log(chalk.red(`Buildlist download failed! There is no internet connection! Please try again! ${choices}`))
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
        case "5a":
            serverInfoMenu.userPrompt = chalk.yellow("?")
            var choices = chalk.green(`(${chalk.underline("r")}etry/${chalk.underline("m")}enu)`)
            console.log(chalk.red(`Download failed! Please try again! ${choices}`))
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
                            checkInternet(function(response) {
                                if (response) {
                                    apis[serverInfoMenu.data.api].getBuildlist(serverInfoMenu.data.version, serverInfoMenu.data.serverVersion, function(response) {
                                        serverInfoMenu.data.buildlist = response
                                        serverInfoMenu.showMenu()
                                    })
                                }
                                else {
                                    serverInfoMenu.data.pageIndex = "0a"
                                    serverInfoMenu.showMenu()
                                }
                            })
                        }
                    }
                    break
            }
            break
        case "0a":
            switch (input) {
                case "menu":
                case "m":
                    mainMenu.showMenu()
                    break
                case "back":
                case "b":
                    serverInfoMenu.data.pageIndex = 0
                    serverInfoMenu.showMenu()
                    break
                case "retry":
                case "r":
                    serverInfoMenu.data.pageIndex = 1
                    checkInternet(function(response) {
                        if (response) {
                            apis[serverInfoMenu.data.api].getBuildlist(serverInfoMenu.data.version, serverInfoMenu.data.serverVersion, function(response) {
                                serverInfoMenu.data.buildlist = response
                                serverInfoMenu.showMenu()
                            })
                        }
                        else {
                            serverInfoMenu.data.pageIndex = "0a"
                            serverInfoMenu.showMenu()
                        }
                    })
                    break
            }
            break
        case 1:
            switch (input) {
                case "yes":
                case "y":
                    serverInfoMenu.data.buildVersion = "latest"
                    serverInfoMenu.data.pageIndex++
                    serverInfoMenu.showMenu()
                    break
                case "no":
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
                case "yes":
                    serverInfoMenu.data.createDir = true
                    serverInfoMenu.data.pageIndex = 4
                    serverInfoMenu.showMenu()
                    break
                case "n":
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
                case "m":
                    mainMenu.showMenu()
                    break
                case "back":
                case "b":
                    serverInfoMenu.data.pageIndex = "4a"
                    serverInfoMenu.showMenu()
                    break
                case "no":
                case "n":
                    console.log("Restarting...")
                    createMenu.showMenu()
                    break
                case "yes":
                case "y":
                    installer(serverInfoMenu.data.version, serverInfoMenu.data.serverVersion, serverInfoMenu.data.installDir, serverInfoMenu.data.createDir, serverInfoMenu.data.serverName, serverInfoMenu.data.minRAM, serverInfoMenu.data.maxRAM, function(finish) {
                        if (!finish) {
                            serverInfoMenu.data.pageIndex = "5a"
                            serverInfoMenu.showMenu()
                        }
                        else {
                            cliMenu.waitForEnter()
                            mainMenu.showMenu()
                        }
                    }, serverInfoMenu.data.buildVersion, serverInfoMenu.data.buildlist ? serverInfoMenu.data.buildlist : null)
                    break
            }
            break
        case "5a":
            switch (input) {
                case "menu":
                case "m":
                    mainMenu.showMenu()
                    break
                case "retry":
                case "r":
                    console.log("Retrying...")
                    installer(serverInfoMenu.data.version, serverInfoMenu.data.serverVersion, serverInfoMenu.data.installDir, serverInfoMenu.data.createDir, serverInfoMenu.data.serverName, serverInfoMenu.data.minRAM, serverInfoMenu.data.maxRAM, function(finish) {
                        if (!finish) {
                            serverInfoMenu.data.pageIndex = "5a"
                            serverInfoMenu.showMenu()
                        }
                        else {
                            cliMenu.waitForEnter()
                            mainMenu.showMenu()
                        }
                    }, serverInfoMenu.data.buildVersion, serverInfoMenu.data.buildlist ? serverInfoMenu.data.buildlist : null)
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

function installer(version, serverVersion, installDir, createDir, serverName, minRAM, maxRAM, callback, build = null, buildlist = null) {
    var installStage2 = function(finish) {
        if (!finish) {
            callback(false)
            return
        }
        else {
            console.log(chalk.green("Downloaded server jar!"))
        }
        console.log("Creating start script...")
        var scriptTemplate = startScriptTemplates[ostype].link ? startScriptTemplates[startScriptTemplates[ostype].link] : startScriptTemplates[ostype]
        var startScript = `${scriptTemplate}java${minRAM == "" ? "" : ` -Xms${minRAM}`}${maxRAM == "" ? "" : ` -Xmx${maxRAM}`} -jar ${filename}${scriptTemplate.templateEnd}`
        var startScriptPath = path.join(workingDir, `start.${scriptTemplate.fileextension}`)
        fs.writeFileSync(startScriptPath, startScript)
        console.log(chalk.green("Created start script!"))
        if (scriptTemplate.chmod) {
            console.log("Changing permissions...")
            var stats = fs.statSync(startScriptPath);
            var currentPermissions = stats.mode;
            var newPermissions = currentPermissions | 0o111;
            fs.chmodSync(startScriptPath, newPermissions)
            console.log(chalk.green("Changed permissions successfully!"))
        }
        console.log(chalk.green("Server created!"))
        callback(true)
    }

    console.log("Starting installation...")
    var api = versionLocations[version].method
    var workingDir
    if (createDir) {
        console.log("Creating directory...")
        var newDir = path.join(installDir, serverName)
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir)
            console.log(chalk.green("Created directory!"))
        }
        else {
            console.log(chalk.yellow("Directory already exists! Continuing..."))
        }
        workingDir = newDir
    }
    else {
        workingDir = installDir
    }
    console.log("Downloading server jar...")
    var savePath
    if (apis[api].buildlist) {
        var buildnumber
        if (build == "latest") {
            buildnumber = getBiggestNumber(buildlist)
        }
        else {
            buildnumber = build
        }
        var filename = `${version}-${serverVersion}-${buildnumber}.jar`
        var savePath = path.join(workingDir, filename)
        checkInternet(function(response) {
            if (response) {
                apis[api].downloadJar(version, serverVersion, savePath, installStage2, buildnumber)
            }
            else {
                callback(false)
                return
            }
        })
    }
    else {
        var filename = `${version}-${serverVersion}.jar`
        var savePath = path.join(workingDir, filename)
        checkInternet(function(response) {
            if (response) {
                apis[api].downloadJar(version, serverVersion, savePath, installStage2)
            }
            else {
                callback(false)
                return
            }
        })
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

function downloadFile(url, savePath, callback) {
    var file = fs.createWriteStream(savePath)
    var protocol = url.startsWith('https') ? https : http;
    var calledBack = false
    var downloadRequest = protocol.get(url, function(response) {
        response.pipe(file)

        if (response.statusCode !== 200) {
            file.close()
            if (fs.existsSync(savePath)) {
                fs.unlinkSync(savePath)
            }
            if (!calledBack) {
                calledBack = true
                callback(false)
            }
        }

        file.on("finish", function() {
            file.close()
            console.log("finished", calledBack)
            callback(true)
        })
        file.on("error", function() {
            file.close()
            if (fs.existsSync(savePath)) {
                fs.unlinkSync(savePath)
            }
            if (!calledBack) {
                calledBack = true
                callback(false)
            }
        })
    })

    downloadRequest.on("error", function() {
        file.close()
        if (fs.existsSync(savePath)) {
            fs.unlinkSync(savePath)
        }
        if (!calledBack) {
            calledBack = true
            callback(false)
        }
    })
}

//thx stackoverflow
function checkInternet(callback) {
    dns.lookup('google.com',function(err) {
        if (err && err.code == "ENOTFOUND") {
            callback(false);
        } else {
            callback(true);
        }
    })
}

function getBiggestNumber(array) {
    var largestFound = 0
    for (var x in array) {
        if (array[x] > largestFound) {
            largestFound = array[x]
        }
    }
    return largestFound
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
    /*
    serverType: {
        //can be used to faster access servertype from create menu
        shortcut: "",
        //how it appears in create menu
        displayName: "",
        //what api it uses to download versions/jars/buildlists (api is specified in apis)
        method: ""
    }
    */
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
    /*
    customapi: {
        //specifies that api needs a buildlist to download jar
        buildlist: true,
        //when called gets all server versions and puts it into the provided versionCollector (Example: versionCollector[version][versionNumber] = {
            method: customapi,
            //put optional data here
            optdata: {}
        })
        getVersions: function(version, versionCollector, callback) {
            //version = versionLocations name
            //versionCollector = versions object provided by installer
            //callback = return to when done
        },
        //if buildlist is true, needs to return a list of numbers
        getBuildlist: function(version, serverVersion, callback) {
            //version = versionLocations name
            //versionCollector = versions object provided by installer
            //callback = return to when done
        },
        //when called it needs to download the server jar with the helper function downloadFile, you need to specify downloadURL, savePath (provided by installer), callback (provided)
        downloadJar: function(version, serverVersion, savePath, callback, buildNumber) {
            version = versionLocations name
            serverVersion = server version
            savePath = path to download jar to (provided by installer)
            callback = return to when done / pass to downloadFile
            buildNumber = optional only specify when buildlist is true
        }
    }
    */
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
        downloadJar: function(version, serverVersion, savePath, callback, buildNumber) {
            var downloadURL = `https://api.papermc.io/v2/projects/${version}/versions/${serverVersion}/builds/${buildNumber}/downloads/${version}-${serverVersion}-${buildNumber}.jar`
            downloadFile(downloadURL, savePath, callback)
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
        //it finished
        downloadJar: function(version, serverVersion, savePath, callback) {
            axios({
                method: "get",
                url: versions[version][serverVersion].optdata.url
            }).then(function(response) {
                var parsedHTML = cheerio.load(response.data)
                var downloadLink = parsedHTML(".well h2 a").attr("href")
                downloadFile(downloadLink, savePath, callback)
            })
        }
    }
}

var startScriptTemplates = {
    //usage
    /*
    platform: {
        //start of start script
        template: "",
        //end of start script
        templateEnd: "",
        //file extension of start script
        fileextension: "",
        //run chmod on start script
        chmod: false,
        //link to another same template (optional (only when template duplicate but with different name))
        link: "win32"
    }
    */
    win32: {
        template: "@echo off\n",
        templateEnd: "\n@echo on",
        fileextension: "bat",
        chmod: false
    },
    linux: {
        template: "#!/bin/bash\n",
        templateEnd: "",
        fileextension: "sh",
        chmod: true
    },
    //termux
    android: {
        link: "linux"
    } 

}

//parsed versions
var versions = {}

checkInternet(function(response) {
    if (response) {
        fetchAPIMCJars(function() {
            setupCreateMenu()
            mainMenu.showMenu()
        })
    }
    else {
        console.log(chalk.red("No internet connection!"))
        process.exit(1)
    }
})

