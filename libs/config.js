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

const fs = require("fs");

var configSettings = {
	logger: null,
	loggerEnabled: false,
	canLog: true,
	initalised: false,
};

function initConfig(log = true, logger = null) {
	/*if (typeof logger == "object") {
		configSettings.logger = logger;
		configSettings.loggerEnabled = true;
	}*/
	configSettings.loggerEnabled = false
	configSettings.canLog = log;
	configSettings.initalised = true;
	/*if (log) {
		if (configSettings.canLog) {
			configSettings.logger.info("Started config!");
		} else {
			console.log("Started config!");
		}
	}*/
	return;
}

function configLog(msg, level) {
	if (configSettings.initalised) {
		if (configSettings.canLog) {
			if (configSettings.loggerEnabled) {
				switch (level) {
					case "info":
						configSettings.logger.info(msg);
						break;
					case "warn":
						configSettings.logger.warn(msg);
						break;
					case "error":
						configSettings.logger.error(msg);
						break;
					case "success":
						configSettings.logger.success(msg);
						break;
				}
			} else {
				console.log(msg);
			}
		}
	}
	return;
}

function createConfig(template) {
	if (template === null) {
		configLog("No template provided! Exiting!", "error");
		process.exit(1);
	}
	fs.writeFileSync("./config.json", JSON.stringify(template));
	configLog("Created config file!", "success");
	return;
}

function loadConfig(create = true, template = null) {
	if (configSettings.initalised) {
		configLog("Loading config file!", "info");
		if (!fs.existsSync("./config.json")) {
			configLog("No config file found!", "warn");
			if (create) {
				configLog("Creating config file!", "info");
				createConfig(template);
			} else {
				configLog("Config file creation disabled! Exiting!", "error");
				process.exit(1);
			}
		}
		configFile = fs.readFileSync("./config.json");
		configLog("Loaded config file!", "success");
		return JSON.parse(configFile);
	} else {
		return "noinit";
	}
}

function saveConfig(data) {
	if (configSettings.initalised) {
		configLog("Saving config...", "info");
		fs.writeFileSync("./config.json", JSON.stringify(data));
		configLog("Saved config!", "success");
	}
	return;
}

module.exports = {
	saveConfig,
	initConfig,
	loadConfig,
};
