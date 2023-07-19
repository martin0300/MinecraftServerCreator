const prompt = require("prompt-sync")({sigint: true})

class Menu {
    constructor(options, printMenu, userPrompt = "?") {
        this.options = options
        this.printMenu = printMenu
        this.userPrompt = userPrompt
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
    }

    showMenu() {
        this.printMenu()
        var userInput = prompt(this.userPrompt)
        for (var findLabel in this.options) {
            var element = this.options[findLabel]
            if (element.label == userInput || element.shortcut == userInput) {
                if (element.callback.length == 0) {
                    element.callback()
                }
                else {
                    element.callback(userInput)
                }
                break
            }
        }
        return
    }
}

class FreeMenu {
    constructor(callback, printMenu, userPrompt = "?") {
        this.printMenu = printMenu
        this.userPrompt = userPrompt
        this.callback = callback

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
    }

    showMenu() {
        this.printMenu()
        var userInput = prompt(this.userPrompt)
        this.callback(userInput)
        return
    }
}

module.exports = {
    Menu,
    FreeMenu
}