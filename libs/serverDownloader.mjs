/*
    Copyright (C) 2024  Martin Magyar

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

import axios from "axios";
import { functionResponse, error } from "./errorHandler.mjs";

/** @module serverDownloader */

class ServerDownloader {
    constructor() {
        this.downloaders = [
            {
                id: "paperapi",
                serverTypes: [
                    {
                        serverTypeID: "paper",
                        serverTypeName: "paper",
                    },
                ],
                buildlist: true,
                baseURL: "https://api.papermc.io/v2/projects/",
                getVersions: async (self, serverType) => {
                    try {
                        let response = await axios({
                            method: "GET",
                            url: `${self.baseURL}${serverType}`,
                        });
                        return functionResponse(true, null, response.data.versions);
                    } catch (err) {
                        return functionResponse(false, "requestError", err.code);
                    }
                },
            },
        ];

        this.database = [];
    }

    /**
     * Fetches the database for all downloaders.
     */
    async fetchDatabase() {
        for (let downloader of this.downloaders) {
            let newDownloaderDatabase = {
                downloaderID: downloader.id,
                serverTypes: downloader.serverTypes.map((serverType) => {
                    return {
                        ...serverType,
                        serverVersions: [],
                    };
                }),
            };
            for (let serverType of newDownloaderDatabase.serverTypes) {
                const getVersionsResponse = await downloader.getVersions(downloader, serverType.serverTypeID);
                if (!getVersionsResponse.success) {
                    error(`Failed to download versions for server type: ${serverType.serverTypeID}!`);
                } else {
                    serverType.serverVersions = getVersionsResponse.returnData;
                }
            }
            this.database.push(newDownloaderDatabase);
        }
    }

    /**
     * Gets all server types.
     * @returns
     */
    getServerTypes() {
        let serverTypes = [];
        for (let downloaderDatabase of this.database) {
            for (var serverType of downloaderDatabase.serverTypes) {
                serverTypes.push({
                    serverTypeName: serverType.serverTypeName,
                    serverTypeID: serverType.serverTypeID,
                    downloaderID: downloaderDatabase.downloaderID,
                });
            }
        }
        return serverTypes;
    }

    /**
     * Returns if downloader requires a buildlist.
     * @param {string} downloaderID
     * @returns
     */
    downloaderBuildlist(downloaderID) {
        const downloader = this.downloaders.find((downloaderFind) => downloaderFind.id === downloaderID);
        if (downloader === undefined) {
            return functionResponse(false, "invalidDownloaderID");
        } else {
            return functionResponse(true, downloader.buildlist);
        }
    }

    /**
     * Returns all versions for server type.
     * @param {string} downloaderID
     * @param {string} serverTypeID
     * @returns
     */
    getServerVersions(downloaderID, serverTypeID) {
        const downloaderDatabase = this.database.find((downloaderDatabaseFind) => downloaderDatabaseFind.downloaderID === downloaderID);
        if (downloaderDatabase === undefined) {
            return functionResponse(false, "invalidDownloaderID");
        }
        const serverTypeDatabase = downloaderDatabase.serverTypes.find((serverTypeFind) => serverTypeFind.serverTypeID === serverTypeID);
        if (serverTypeDatabase === undefined) {
            return functionResponse(false, "invalidServerTypeID");
        }
        return functionResponse(true, null, serverTypeDatabase.serverVersions);
    }
}

export default ServerDownloader;
