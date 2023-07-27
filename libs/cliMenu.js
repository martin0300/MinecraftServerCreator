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

const prompt = require("prompt-sync")({sigint: true})

class Menu {
    constructor(options, printMenu, errorCallback, userPrompt = "?", onCreation = function() {}) {
        this.options = options
        this.printMenu = printMenu
        this.userPrompt = userPrompt
        this.errorCallback = errorCallback
        this.data = {}
        this.optionsTemplate = {
            label: "",
            shortcut: "",
            callback: function() {}
        }

        //check
        if (typeof this.options !== "object") {
            throw new Error("options must be an array!")
        }
        if (typeof this.printMenu !== "function") {
            throw new Error("printMenu must be a function!")
        }
        if (typeof this.errorCallback !== "function") {
            throw new Error("errorCallback must be a function!")
        }
        if (this.options.length == 0) {
            throw new Error("options can't be empty!")
        }
        for (var x in this.options) {
            var element = this.options[x]
            var elementKeys = Object.keys(element)
            var templateKeys = Object.keys(this.optionsTemplate)
            for (var i in templateKeys) {
                if (!elementKeys.includes(templateKeys[i])) {
                    throw new Error(`${templateKeys[i]} value is missing from option with index: ${x}!`)
                }
                var templateKeyType = typeof this.optionsTemplate[templateKeys[i]]
                var elementKeyType = typeof element[templateKeys[i]]
                if (templateKeyType != elementKeyType) {
                    throw new Error(`${templateKeys[i]} must be type ${templateKeyType} at index: ${x}`)
                }
                if (templateKeyType == "string" && element[templateKeys[i]].length == 0) {
                    throw new Error(`${templateKeys[i]} cannot be empty with index: ${x}!`)
                }
            }
        }
        onCreation()
    }

    showMenu(data = null) {
        if (this.printMenu.length == 0) {
            this.printMenu()
        }
        else {
            this.printMenu(data)
        }
        var userInput = prompt(this.userPrompt)
        var found = false
        for (var findLabel in this.options) {
            var element = this.options[findLabel]
            if (element.label == userInput || element.shortcut == userInput) {
                if (element.callback.length == 0) {
                    element.callback()
                }
                else if (element.callback.length == 1) {
                    element.callback(userInput)
                }
                else {
                    element.callback(userInput, element.label)
                }
                found = true
                break
            }
        }
        if (!found) {
            this.errorCallback()
        }
        return
    }
}

class FreeMenu {
    constructor(callback, printMenu, userPrompt = "?", data = {}, onCreation = function() {}) {
        this.printMenu = printMenu
        this.userPrompt = userPrompt
        this.callback = callback
        this.data = data

        //check
        if (typeof this.callback !== "function") {
            throw new Error("callback must be a function!")
        }
        if (typeof this.printMenu !== "function") {
            throw new Error("printMenu must be a function!")
        }
        if (this.callback.length == 0) {
            throw new Error("callback doesn't have args!")
        }
        onCreation()
    }

    showMenu() {
        this.printMenu()
        var userInput = prompt(this.userPrompt)
        this.callback(userInput)
        return
    }
}

class placeHolderMenu {
    showMenu() {
        return
    }
}

class nestedMenu {
    constructor(menus, startMenu) {
        this.menus = menus
        this.currentMenu = startMenu
        this.currentMenuPos = 0
        this.menuTemplate = {
            label: "",
            menu: class {}
        }

        if (typeof this.menus !== "object") {
            throw new Error("menus must be an array")
        }
        if (typeof this.startMenu !== "string") {
            throw new Error("startMenu must be a string")
        }
        if (this.currentMenu.length == 0) {
            throw new Error("startMenu can't be empty!")
        }

        for (var x in this.menus) {
            var element = this.menus[x]
            var elementKeys = Object.keys(element)
            var templateKeys = Object.keys(this.menuTemplate)
            for (var i in templateKeys) {
                if (!elementKeys.includes(templateKeys[i])) {
                    throw new Error(`${templateKeys[i]} is missing from menus with index: ${x}!`)
                }
                var templateKeyType = typeof this.optionsTemplate[templateKeys[i]]
                var elementKeyType = typeof element[templateKeys[i]]
                if (templateKeyType != elementKeyType) {
                    throw new Error(`${templateKeys[i]} must be type ${templateKeyType} at index: ${x}`)
                }
                if (templateKeyType == "string" && element[templateKeys[i]].length == 0) {
                    throw new Error(`${templateKeys[i]} cannot be empty with index: ${x}!`)
                }
            }
        }

        this.jumpToMenu(this.currentMenu)
    }

    jumpToMenu(menuName) {
        var found = false
        for (var x in this.menus) {
            if (this.menus[x].label == menuName) {
                found = true
                this.currentMenu = menuName
                this.currentMenuPos = x
                break
            }
        }
        if (found) {
            return true
        }
        else {
            return false
        }
    } 

    showMenu() {
        this.menus[this.currentMenuPos].menu.showMenu()
        return
    }
}

function waitForEnter() {
    prompt("Press enter to continue!")
    return
}

module.exports = {
    Menu,
    FreeMenu,
    placeHolderMenu,
    nestedMenu,
    waitForEnter
}