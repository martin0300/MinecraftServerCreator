"""
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
"""

import platform
import requests
from lxml import html, etree
import xmltodict
import json
import os
import sys

def getbukkitdownloadparser(serverversion, servertype):
    url = database.get("urls").get(servertype).get(serverversion)
    ##download html
    htmldoc = requests.get(url).text
    ##convert html to xml
    htmlxml = html.fromstring(htmldoc)
    ##convert xml to dictionary
    htmldict = xmltodict.parse(etree.tostring(htmlxml))
    ##parse
    filename = htmldict.get("html").get("body").get("div")[1].get("div").get("div").get("div").get("h1")
    downloadurl = htmldict.get("html").get("body").get("div")[3].get("div").get("div").get("div")[1].get("div").get("h2").get("a").get("@href")
    data = [filename, downloadurl]
    return data


def installer(servertype, serverversion, servername, installlocation, buildnumber, createdir, maxram, minram, pluginlist, menuinstall):
    print("Starting installation...")
    if createdir == "yes":
        print("Creating directory...")
        newdir = os.path.join(installlocation, servername)
        os.makedirs(newdir)
        installlocation = newdir
        print("Created directory!")
    print("Downloading server jar...")
    if servertype == "paper":
        print("Downloading buildlist...")
        if buildnumber == "latest":
            buildlistpaper = requests.get("https://api.papermc.io/v2/projects/paper/versions/" + serverversion).json()
            buildnumber = str(buildlistpaper.get("builds")[-1])
        download = requests.get("https://api.papermc.io/v2/projects/paper/versions/" + serverversion + "/builds/" + buildnumber + "/downloads/" + "paper-" + serverversion + "-" + buildnumber + ".jar")
        savejarpath = os.path.join(installlocation, "paper-" + serverversion + "-" + buildnumber + ".jar")
        with open(savejarpath, "wb") as savejar:
            savejar.write(download.content)
        scriptservername = "paper-" + serverversion + "-" + buildnumber + ".jar"
        print("Downloaded server jar!")
    else:
        data = getbukkitdownloadparser(serverversion, servertype)
        download = requests.get(data[1])
        savejarpath = os.path.join(installlocation, data[0])
        with open(savejarpath, "wb") as savejar:
            savejar.write(download.content)
        scriptservername = data[0]
        print("Downloaded server jar!")
    print("Creating start script...")
    if ostype == "Windows":
        if maxram == "default":
            if minram == "default":
                startscript = "@echo off\njava -jar " + scriptservername + "\n@echo on"
            else:
                startscript = "@echo off\njava -Xms" + minram + " -jar " + scriptservername + "\n@echo on"
        else:
            if minram == "default":
                startscript = "@echo off\njava" + " -Xmx" + maxram + " -jar " + scriptservername + "\n@echo on"
            else:
                startscript = "@echo off\njava -Xms" + minram + " -Xmx" + maxram + " -jar " + scriptservername + "\n@echo on"
    else:
        if maxram == "default":
            if minram == "default":
                startscript = "java -jar " + scriptservername
            else:
                startscript = "java -Xms" + minram + " -jar " + scriptservername
        else:
            if minram == "default":
                startscript = "java" + " -Xmx" + maxram + " -jar " + scriptservername
            else:
                startscript = "java -Xms" + minram + " -Xmx" + maxram + " -jar " + scriptservername
    if ostype == "Windows":
        scriptlocation = os.path.join(installlocation, "start.bat")
        with open(scriptlocation, "w") as scriptsave:
            scriptsave.write(startscript)
    else:
        scriptlocation = os.path.join(installlocation, "start.sh")
        with open(scriptlocation, "w") as scriptsave:
            scriptsave.write(startscript)
        os.system("chmod +x " + scriptlocation)
    print("Created start script!")
    if pluginlist != None:
        print("Installing plugins...")
        print("Creating plugins folder...")
        plugindir = os.path.join(installlocation, "plugins")
        os.makedirs(plugindir)
        print("Created plugins folder!")
        for item in pluginlists.get(pluginlist):
            name = item.get("name")
            filename = item.get("filename", None)
            file_type = item.get("file_type")
            if filename == None:
                filename = str(item.get("id"))
            responsedownloadid = requests.get(apiurls.get("searchid") + str(item.get("id"))).json()
            if responsedownloadid.get("external") == True:
                print(name + " is not supported! Please run fixlist to remove it! Skipping...")
                continue
            if responsedownloadid.get("file").get("type") == "external":
                print(name + " is not supported! Please run fixlist to remove it! Skipping...")
                continue
            print("Installing " + name + " with file name " + filename + "!")
            pluginfile = searchplugins(str(item.get("id")), "download")
            pluginsavelocation = os.path.join(plugindir, filename + file_type)
            if pluginfile == False:
                print(name + " installation failed! Afther the installation use fixlist! Continuing...")
                continue
            with open(pluginsavelocation, "wb") as saveplugin:
                saveplugin.write(pluginfile.content)
            print(name + " installed!")
    print("Plugins installed!")
    print("Server created!")
    if menuinstall == True:
        print("Press enter to go back to the menu!")
        input()
    return


def isnoneorempty(string):
    if string == None:
        return True
    string2 = string.replace(" ", "")
    if len(string2) == 0:
        return True
    else:
        if not string2:
            return True
        else:
            return False

##initalise
def init():
    downloaddatabase()
    try:
        if sys.argv[1] == "--i":
            menu()
        elif sys.argv[1] == "--help":
            clihelp()
        elif sys.argv[1] == "--f":
            configinstall()
        elif sys.argv[1] == "--version":
            mscversion()
        else:
            print("Unexpected switch!")
            mscexit()
    except IndexError:
        clihelp()

##menu
def menu():
    print("Minecraft Server Creator V" + ver)
    print("OS type: " + ostype)
    print("Choices:")
    print("-create")
    print("-help")
    print("-pluginmanager")
    print("-exit")
    choice = input(">")
    if choice == "create":
        msccreate()
        menu()
    elif choice == "help":
        mschelp()
        menu()
    elif choice == "exit":
        mscexit()
    elif choice == "debug":
        mscdebug()
    elif choice == "pluginmanager":
        pluginmanager()
    else:
        print("Not a choice!")
        menu()

def mscdebug():
    debugchoice = input()
    if debugchoice == "database":
        print(database)
        mscdebug()
    elif debugchoice == "menu":
        menu()
    elif debugchoice == "savedatabase":
        with open("database.json", "w") as file:
            json.dump(database, file)
        mscdebug()
    elif debugchoice == "exit":
        mscexit()
    elif debugchoice == "testdownloadp":
        serverversion = input("#")
        servertype = input(">")
        print(getbukkitdownloadparser(serverversion, servertype))
        mscdebug()
    else:
        mscdebug()

def msccreate():
    print("Select server type:")
    print("-vanilla\n-spigot\n-craftbukkit\n-paper\n-back")
    servertype = input(">")
    print("Select server version:")
    if servertype == "paper":
        for x in database.get("versions").get("paper"):
            print("-" + x)
    elif servertype == "spigot":
        for x in database.get("versions").get("spigot"):
            chosenbuild = "latest"
            print("-" + x)
    elif servertype == "craftbukkit":
        for x in database.get("versions").get("craftbukkit"):
            chosenbuild = "latest"
            print("-" + x)
    elif servertype == "vanilla":
        for x in database.get("versions").get("vanilla"):
            chosenbuild = "latest"
            print("-" + x)
    elif servertype == "back":
        menu()
    else:
        print("Invalid server type!")
        msccreate()
    serverversion = input("#")
    invalidversion = False
    for x in database.get("versions").get(servertype):
        if x == serverversion:
            invalidversion = False
            break
        else:
            invalidversion = True
    if invalidversion == True:
        print("Invalid version!")
        msccreate()
    if servertype == "paper":
        print("Download latest build? (yes/no)")
        downloadbuild = input(">")
        if downloadbuild == "yes":
            chosenbuild = "latest"
        elif downloadbuild == "no":
            print("Downloading buildlist...")
            buildlistpaper = requests.get("https://api.papermc.io/v2/projects/paper/versions/" + serverversion).json()
            print("Choose a build:")
            for x in buildlistpaper.get("builds"):
                print("-" + str(x))
            chosenbuild = input("#")
            invalidbuild = False
            for x in buildlistpaper.get("builds"):
                if str(x) == chosenbuild:
                    invalidbuild = False
                    break
                else:
                    invalidbuild = True
            if invalidbuild == True:
                print("Invaild build number!")
                msccreate()
        else:
            print("Not a choice!")
            msccreate()
    print("Choose install location:")
    installloc = input("?")
    if isnoneorempty(installloc) == True:
        print("There is nothing entered!")
        msccreate()
    if os.path.isdir(installloc) == False:
        print("Folder does not exist!")
        msccreate()
    print("Enter server name:")
    servername = input("?")
    if isnoneorempty(servername) == True:
        print("There is nothing entered!")
        msccreate()
    print("Do you want to make a folder with this name? (yes/no)")
    createfolder = input(">")
    if createfolder == "yes":
        serverfolder = True
    elif createfolder == "no":
        serverfolder = False
    else:
        print("Not a choice!")
        msccreate()
    print("Enter minimum amount ram for server (in megabytes example: 512M): (enter default if you don't wanna change it)")
    minram = input("#")
    print("Enter maximum amount ram for server (in megabytes example: 1024M): (enter default if you don't wanna change it)")
    maxram = input("#")
    print("Add plugins to the server? (yes/no)")
    addpluginq = input(">")
    if addpluginq == "yes":
        if len(pluginlists) == 0:
            print("There are no lists available! Please use plugin manager to make lists!")
        else:
            while True:
                print("Select a list to install from:")
                listmanager("listlists")
                print("Choices:\n-back\n-listlist\nlistname")
                pluginselchoices = input(">")
                if pluginselchoices == "back":
                    print("Continuing installation...")
                    selectedpluginlist = None
                    break
                elif pluginselchoices == "listlist":
                    listmanager("listlist")
                else:
                    if pluginlists.get(pluginselchoices, None) == None:
                        print("Not a list or choice!")
                    else:
                        selectedpluginlist = pluginselchoices
                        break
    else:
        selectedpluginlist = None
    print("Everything is correct? (yes/no)")
    print("Server type: " + servertype)
    print("Server version: " + serverversion)
    print("Server build: " + chosenbuild)
    print("Install loaction: " + installloc)
    print("Server name: " + servername)
    print("Create folder: " + createfolder)
    print("Maximum ram: " + maxram)
    print("Minimum ram: " + minram)
    if selectedpluginlist != None:
        print("Selected plugin list: " + selectedpluginlist)
    correct = input(">")
    if correct == "yes":
        installer(servertype, serverversion, servername, installloc, chosenbuild, createfolder, maxram, minram, selectedpluginlist, True)
        menu()
    elif correct == "no":
        print("Restarting...")
        msccreate()
    else:
        print("Restarting...")
        msccreate()
    return


def mschelp():
    print("Help:")
    print("Menu:")
    print("-create (starts server creation)")
    print("-help (shows this screen)")
    print("-pluginmanager (starts plugin manager)")
    print("-exit (exits the program)")
    print("Press enter to return!")
    input()
    return

def getostype():
    return platform.system()

def mscexit():
    sys.exit(0)

##download database
def downloaddatabase():
    print("Downloading database...")
    global database
    ##get paper versions
    paperbase = requests.get("https://api.papermc.io/v2/projects/paper").json()
    database.get("versions").update({"paper": paperbase.get("versions")})

    ##get craftbukkit versions
    craftbukkitparser = getbukkitparser("craftbukkit")
    craftbukkitbase = list()
    for x in craftbukkitparser.get("html").get("body").get("div")[3].get("div").get("div").get("div").get("div"):
        version = x.get("div").get("div")[0].get("h2")
        url = x.get("div").get("div")[3].get("div")[1].get("a")[0].get("@href")
        craftbukkitbase.append(version)
        database.get("urls").get("craftbukkit").update({version: url})
    database.get("versions").update({"craftbukkit": craftbukkitbase})


    ##get spigot versions
    spigotparser = getbukkitparser("spigot")
    spigotbase = list()
    for x in spigotparser.get("html").get("body").get("div")[3].get("div").get("div").get("div").get("div"):
        version = x.get("div").get("div")[0].get("h2")
        url = x.get("div").get("div")[3].get("div")[1].get("a")[0].get("@href")
        spigotbase.append(version)
        database.get("urls").get("spigot").update({version: url})
    database.get("versions").update({"spigot": spigotbase})

    ##get vanilla versions
    vanillaparser = getbukkitparser("vanilla")
    vanillabase = list()
    for x in vanillaparser.get("html").get("body").get("div")[3].get("div").get("div").get("div").get("div"):
        version = x.get("div").get("div")[0].get("h2")
        url = x.get("div").get("div")[3].get("div")[1].get("a")[0].get("@href")
        vanillabase.append(version)
        database.get("urls").get("vanilla").update({version: url})
    database.get("versions").update({"vanilla": vanillabase})
    return

def getbukkitparser(type):
    ##download html
    htmldoc = requests.get("https://getbukkit.org/download/" + type).text
    ##convert html to xml
    htmlxml = html.fromstring(htmldoc)
    ##convert xml to dictionary
    htmldict = xmltodict.parse(etree.tostring(htmlxml))
    return htmldict

def clihelp():
    print("Minecraft server creator help:\n--i (start in interactive mode)\n--f (install from config file)\n--help (shows this screen)\n--version (shows version number)")
    mscexit()

def commandinstall():
    try:
        if sys.argv[2] == "--help":
            commandinstallhelp()
        else:
            print("Unexpected switch!")
            mscexit()
    except IndexError:
        commandinstallhelp()

def commandinstallhelp():
    print("--type (server type)\n--version (server version)\n--servername (server name)\n--installloc (install location)\n--buildnumber (latest for latest build (only works for paper (for other server leave it on latest)))\n--createdir (create directory with the server name)\n--minram (minimum ram for server (in megabytes) example: 512M\n--maxram (maximum ram for server (in megabytes) example: 1024M")
    print("Everything needs to be in order!")
    mscexit()

def mscversion():
    print("Minecraft server creator V" + ver + "\nRunning on " + ostype)
    mscexit()

def confighelp():
    print("Config install help:\n--help (shows this screen)\n--createconfig (creates config to modify)\n--listserver (list available server types and versions)\n--listbuild (versionnumber) (lists the builds for the version number specified (only works on paper servers))\n--pluginmanager (starts plugin manager)\nfilename (install from config (JSON) file)")
    print("Config file help:\nIt must be a JSON file!\n-servertype (type afther --f --listserver to list avalible server types)\n"
          "-serverversion (type afther --f --listserver to list avalible server versions)\n-servername (servers name and the folders if createdir is enabled)\n"
          "-installlocation (server install location (on windows use \\\\ !))\n-build (only works on paper servers! (type latest for any server type including paper) to list builds use --f --listbuild (versionnumber))\n"
          "-createdir (create directory with the server name)\n-maxram (maximum ram for server in megabytes example: 1024M (enter default if you don't wanna change it))\n-minram (minimum ram for server in megabytes example: 512M (enter default if you don't wanna change it))\n"
          "-askinstall (ask user to install server)\n-pluginlist (plugin list to install from (leave it at null to not use a list))")
    mscexit()

def createinstallconf():
    newinstallconfig = {
        "servertype": "",
        "serverversion": "",
        "servername": "",
        "installlocation": "",
        "build": "",
        "createdir": False,
        "maxram": "",
        "minram": "",
        "askinstall": True,
        "pluginlist": None
    }
    with open("installconfig.json", "w") as newconfig:
        json.dump(newinstallconfig, newconfig)
    print("Config created!")
    mscexit()

def startinstallconfig(filename):
    if os.path.isfile(filename) == False:
        print("File does not exist or unexpected switch!")
        mscexit()
    try:
        with open(filename, "r") as configfile:
            configinstallfile = json.load(configfile)
    except ValueError:
        print("Could not read file!")
        mscexit()
    print("Checking file...")
    ##load settings
    servertype = configinstallfile.get("servertype")
    serverversion = configinstallfile.get("serverversion")
    servername = configinstallfile.get("servername")
    installlocation = configinstallfile.get("installlocation")
    build = configinstallfile.get("build")
    createdir = configinstallfile.get("createdir")
    maxram = configinstallfile.get("maxram")
    minram = configinstallfile.get("minram")
    askinstall = configinstallfile.get("askinstall")
    pluginlist = configinstallfile.get("pluginlist")
    ##check server type
    if isnoneorempty(servertype) == True:
        print("No server type specified!")
        mscexit()
    badtype = False
    for x in database.get("versions"):
        if x == servertype:
            badtype = False
            break
        else:
            badtype = True
    if badtype == True:
        print("Wrong server type!")
        mscexit()
    ##check server version
    if isnoneorempty(serverversion) == True:
        print("No server version specified!")
        mscexit()
    badversion = False
    for x in database.get("versions").get(servertype):
        if x == serverversion:
            badversion = False
            break
        else:
            badversion = True
    if badversion == True:
        print("Wrong server version!")
        mscexit()
    ##check server name
    if isnoneorempty(servername) == True:
        print("No server name specified!")
        mscexit()
    ##check install location
    if isnoneorempty(installlocation) == True:
        print("No install location specified!")
        mscexit()
    if os.path.isdir(installlocation) == False:
        print("Invalid install location!")
        mscexit()
    ##check build
    if isnoneorempty(build) == True:
        print("No build specified! Only works for paper servers! On other servers use latest! Use --f --listbuild (versionnumber) to list avalible builds!")
        mscexit()
    if servertype != "paper":
        if build != "latest":
            print("Build only works for paper servers! Use latest instead!")
            mscexit()
    else:
        if build != "latest":
            print("Downloading buildlist...")
            buildlistpaper = requests.get("https://api.papermc.io/v2/projects/paper/versions/" + serverversion).json()
            invalidbuild = False
            for x in buildlistpaper.get("builds"):
                if str(x) == build:
                    invalidbuild = False
                    break
                else:
                    invalidbuild = True
            if invalidbuild == True:
                print("Invalid build number!")
                mscexit()
    ##check createdir
    if type(createdir) != bool:
        print("Wrong createdir value!")
        mscexit()
    if createdir == True:
        createdir = "yes"
    else:
        createdir = "no"
    ##check maxram
    if isnoneorempty(maxram) == True:
        print("No maximum ram specified!")
        mscexit()
    ##check minram
    if isnoneorempty(minram) == True:
        print("No minimum ram specified!")
        mscexit()
    ##check askinstall
    if type(askinstall) != bool:
        print("Wrong askinstall value!")
        mscexit()
    ##check pluginlist
    if pluginlist != None:
        if isnoneorempty(pluginlist) == True:
            print("No plugin list specified! If you don't want plugins use null!")
            mscexit()
        if pluginlists.get(pluginlist, None) == None:
            print("Invalid plugin list specified! Please use pluginmanager to create a new one!")
            mscexit()
    ##asking user to install
    if askinstall == True:
        print("Start install? (yes/no)")
        print("Server type: " + servertype)
        print("Server version: " + serverversion)
        print("Server build: " + build)
        print("Install location: " + installlocation)
        print("Server name: " + servername)
        print("Create folder: " + str(createdir))
        print("Maximum ram: " + maxram)
        print("Minimum ram: " + minram)
        if pluginlist != None:
            print("Selected plugin list: " + pluginlist)
        install = input("?")
        if install == "yes":
            installer(servertype, serverversion, servername, installlocation, build, createdir, maxram, minram, pluginlist, False)
            mscexit()
        elif install == "no":
            print("Abort")
            mscexit()
        else:
            print("Not a choice!")
            mscexit()
    else:
        installer(servertype, serverversion, servername, installlocation, build, createdir, maxram, minram, False)
        mscexit()


def listserver():
    print("Paper:")
    for x in database.get("versions").get("paper"):
        print(x)
    print("Spigot:")
    for x in database.get("versions").get("spigot"):
        print(x)
    print("Craftbukkit:")
    for x in database.get("versions").get("craftbukkit"):
        print(x)
    print("Vanilla:")
    for x in database.get("versions").get("vanilla"):
        print(x)
    mscexit()

def listbuild():
    try:
        version = sys.argv[3]
        badversion = False
        for x in database.get("versions").get("paper"):
            if x == version:
                badversion = False
                break
            else:
                badversion = True
        if badversion == True:
            print("Bad version!")
            mscexit()
        print("Downloading buildlist...")
        buildlistpaper = requests.get("https://api.papermc.io/v2/projects/paper/versions/" + version).json()
        print("Listing builds...")
        print(version + ":")
        for x in buildlistpaper.get("builds"):
            print("-" + str(x))
        mscexit()
    except IndexError:
        print("No version specified!")
        mscexit()

def configinstall():
    try:
        if sys.argv[2] == "--help":
            confighelp()
        elif sys.argv[2] == "--createconfig":
            createinstallconf()
        elif sys.argv[2] == "--listserver":
            listserver()
        elif sys.argv[2] == "--listbuild":
            listbuild()
        elif sys.argv[2] == "--pluginmanager":
            pluginmanager(False)
        else:
            startinstallconfig(sys.argv[2])
    except IndexError:
        confighelp()

def pluginmanager(interactive = True):
    print("MSC Plugin Manager V" + plugmanver)
    print("Currently " + str(len(pluginlists)) + " lists available!")
    print("Choices:")
    print("-search\n-searchid\n-addtolist\n-listlists\n-listlist\n-newlist\n-removelist\n-removefromlist\n-renamelist\n-changefilename\n-fixlist\n-help")
    if interactive == True:
        print("-menu")
    else:
        print("-exit")
    choice = input(">")
    if choice == "search":
        searchplugins(None)
        pluginmanager(interactive)
    elif choice == "searchid":
        print("ID:")
        idsearch = input("#")
        searchplugins(idsearch)
        pluginmanager(interactive)
    elif choice == "addtolist":
        print("ID to add:")
        toaddid = input("#")
        if isnoneorempty(toaddid) == True:
            print("Nothing is entered!")
            pluginmanager(interactive)
        listmanager(choice, toaddid)
        pluginmanager(interactive)
    elif choice == "listlists":
        listmanager(choice)
        pluginmanager(interactive)
    elif choice == "listlist":
        listmanager(choice)
        pluginmanager(interactive)
    elif choice == "newlist":
        listmanager(choice)
        pluginmanager(interactive)
    elif choice == "removelist":
        listmanager(choice)
        pluginmanager(interactive)
    elif choice == "removefromlist":
        listmanager(choice)
        pluginmanager(interactive)
    elif choice == "renamelist":
        listmanager(choice)
        pluginmanager(interactive)
    elif choice == "changefilename":
        listmanager(choice)
        pluginmanager(interactive)
    elif choice == "fixlist":
        listmanager("fixlist")
        pluginmanager(interactive)
    elif choice == "help":
        plugmanhelp(interactive)
        pluginmanager(interactive)
    elif interactive == True:
        if choice == "menu":
            menu()
        else:
            print("Not a choice!")
            pluginmanager(interactive)
    elif interactive == False:
        if choice == "exit":
            mscexit()
        else:
            print("Not a choice!")
            pluginmanager(interactive)

def listmanager(task, id = None):
    ##amogus
    if task == "loadlists":
        try:
            print("Loading plugin lists...")
            if os.path.isfile("pluginlist.json") == False:
                print("No plugin list file found!")
                print("Creating new one...")
                newpluginlist = {}
                with open("pluginlist.json", "w", encoding="utf-8") as newpluginfile:
                    json.dump(newpluginlist, newpluginfile)
                print("Created plugin list file!")
            with open("pluginlist.json", "r") as pluginfile:
                pluginlistload = json.load(pluginfile)
            return pluginlistload
        except (UnicodeDecodeError, ValueError):
            print("Plugin list cannot be loaded because of a corrupted file or incompatible character! Exiting!")
            mscexit()
    elif task == "addtolist":
        print("To which list?")
        for x in pluginlists:
            print("-" + x)
        print('Choose a name or type "new"!')
        choiceaddlist = input(">")
        if isnoneorempty(choiceaddlist) == True:
            print("Nothing is entered!")
            listmanager(task, id)
        if choiceaddlist == "new":
            if listmanager("newlist") == False:
                print("Try again!")
                listmanager(task, id)
            listmanager(task, id)
        else:
            if pluginlists.get(choiceaddlist, None) == None:
                print("List does not exist!")
            info = searchplugins(id, True)
            if info == False:
                print("Plugin cannot be added!")
                return
            elif info == "badid":
                return
            print("Do you wanna set a custom file name? (yes/no) (default is plugin id)")
            addfilenameq = input(">")
            if addfilenameq == "yes":
                print("Enter name:")
                newfilename = input("?")
                if isnoneorempty(newfilename) == True:
                    print("Nothing is entered! Defaulting to ID!")
                else:
                    info.update({"filename": newfilename})
                    print("File name set!")
            else:
                info.update({"filename": None})
            pluginlists.get(choiceaddlist).append(info)
            listmanager("savelist")
            print("Added to list!")
            return
    elif task == "newlist":
        print("Name:")
        newname = input("?")
        if isnoneorempty(newname) == True:
            print("No name entered!")
            return False
        if pluginlists.get(newname, None) != None:
            print("List already exist!")
            return False
        print("Creating list...")
        pluginlists.update({newname: []})
        listmanager("savelist")
        print("List created!")
        return True
    elif task == "savelist":
        print("Saving list...")
        with open("pluginlist.json", "w", encoding="utf-8") as savelist:
            json.dump(pluginlists, savelist, ensure_ascii=False)
        print("List saved!")
        return
    elif task == "listlists":
        if len(pluginlists) == 0:
            print("No available lists!")
            return False
        print("Available lists:")
        for x in pluginlists:
            print("-" + x + " (" + str(len(pluginlists.get(x))) + " plugins)")
        return
    elif task == "listlist":
        if listmanager("listlists") == False:
            return
        else:
            print("Choose a name:")
            llname = input("?")
            if isnoneorempty(llname) == True:
                print("Nothing is entered!")
                return
            if pluginlists.get(llname, None) == None:
                print("List does not exist!")
                return
            if len(pluginlists.get(llname)) == 0:
                print("List is empty!")
                return
            print(llname + ":")
            i = 1
            try:
                for item in pluginlists.get(llname):
                    print(str(i) + ":")
                    print("Name: " + item.get("name"))
                    if item.get("tag") != None:
                        print("Tag: " + item.get("tag"))
                    if item.get("contributors") != None:
                        print("Contributors: " + item.get("contributors"))
                    print("Likes: " + str(item.get("likes")))
                    print("Downloads: " + str(item.get("downloads")))
                    print("ID: " + str(item.get("id")))
                    print("File type: " + item.get("file_type"))
                    if item.get("filename", None) != None:
                        print("Custom file name: " + item.get("filename"))
                    i += 1
                return
            except TypeError:
                print("Invalid item in list! Please run fixlist!")
                return
    elif task == "removelist":
        if listmanager("listlists") == False:
            return
        print("Choose a list to remove:")
        removelistname = input("?")
        if isnoneorempty(removelistname) == True:
            print("Nothing is entered!")
            return
        if pluginlists.get(removelistname, None) == None:
            print("List does not exist!")
            return
        print("Do you want to remove " + removelistname + "? (yes/no)")
        removechoice = input(">")
        if removechoice == "yes":
            print("Removing list...")
            pluginlists.pop(removelistname)
            listmanager("savelist")
            print("List removed!")
            return
        else:
            return
    elif task == "removefromlist":
        if listmanager("listlists") == False:
            return
        print("Choose a list to remove from:")
        removefrominput = input("?")
        if isnoneorempty(removefrominput) == True:
            print("Nothing is entered!")
            return
        if pluginlists.get(removefrominput, None) == None:
            print("List does not exist!")
            return
        if len(pluginlists.get(removefrominput)) == 0:
            print("List is empty!")
            return
        print(removefrominput + ":")
        i = 1
        try:
            for item in pluginlists.get(removefrominput):
                print(str(i) + ":")
                print("Name: " + item.get("name"))
                if item.get("tag") != None:
                    print("Tag: " + item.get("tag"))
                if item.get("contributors") != None:
                    print("Contributors: " + item.get("contributors"))
                print("Likes: " + str(item.get("likes")))
                print("Downloads: " + str(item.get("downloads")))
                print("ID: " + str(item.get("id")))
                print("File type: " + item.get("file_type"))
                if item.get("filename", None) != None:
                    print("Custom file name: " + item.get("filename"))
                i += 1
        except TypeError:
            print("Invalid item in list! Please run fixlist!")
            return
        i -= 1
        print("Choose a number to remove:")
        removenum = input("#")
        try:
            if isnoneorempty(removenum) == True:
                print("Nothing is entered!")
                return
            if i < int(removenum):
                print("Result does not exist!")
                return
            if int(removenum) < 1:
                print("Invalid number!")
                return
            print("Do you want to remove number " + str(removenum) + "? (yes/no)")
            removelistitem = input("?")
            if removelistitem == "yes":
                print("Removing item...")
                pluginlists.get(removefrominput).pop(int(removenum) - 1)
                listmanager("savelist")
                print("Removed item!")
                return
            else:
                return
        except ValueError:
            print("Not a number!")
            return
    elif task == "fixlist":
        print("Starting fix process...")
        if len(pluginlists) == 0:
            print("Nothing to fix.")
            return
        for list in pluginlists:
            if len(list) == 0:
                print("Skipping " + list + " because it's empty!")
                continue
            for item in pluginlists.get(list):
                if item.get("id", None) == None:
                    print("Removing one item from " + list + " because ID is missing!")
                    pluginlists.get(list).remove(item)
                    print("Item removed!")
                    continue
                fixeditem = searchplugins(str(item.get("id")), True)
                setfilename = item.get("filename", None)
                if fixeditem == False:
                    print("Item cannot be fixed!")
                    print("Removing one item from " + list + " because plugin is not supported!")
                    pluginlists.get(list).remove(item)
                    print("Item removed!")
                    continue
                if fixeditem == "badid":
                    print("Item cannot be fixed!")
                    print("Removing one item from " + list + " because ID is invalid!")
                    pluginlists.get(list).remove(item)
                    print("Item removed!")
                    continue
                fixeditem.update({"filename": setfilename})
                pluginlists.get(list).remove(item)
                pluginlists.get(list).append(fixeditem)
                print("One item in " + list + " fixed!")
        listmanager("savelist")
        print("List fixed!")
        return
    elif task == "renamelist":
        if listmanager("listlists") == False:
            return
        print("Select a list to rename:")
        renamechoice = input(">")
        if isnoneorempty(renamechoice) == True:
            print("Nothing is entered!")
            return
        if pluginlists.get(renamechoice, None) == None:
            print("List does not exist!")
            return
        print("New name:")
        renamenew = input("?")
        if isnoneorempty(renamenew) == True:
            print("Nothing is entered!")
            return
        if pluginlists.get(renamenew, None) != None:
            print("Name is already in use!")
            return
        print("Renaming " + renamechoice + " to " + renamenew + "!")
        if len(pluginlists.get(renamechoice)) == 0:
            pluginlists.pop(renamechoice)
            pluginlists.update({renamenew: []})
            listmanager("savelist")
            print("Renamed successfully!")
            return
        renamelistcontents = pluginlists.get(renamechoice)
        pluginlists.pop(renamechoice)
        pluginlists.update({renamenew: renamelistcontents})
        listmanager("savelist")
        print("Renamed successfully!")
        return
    elif task == "changefilename":
        if listmanager("listlists") == False:
            return
        print("Choose a list to change from:")
        changefilenfrominput = input("?")
        if isnoneorempty(changefilenfrominput) == True:
            print("Nothing is entered!")
            return
        if pluginlists.get(changefilenfrominput, None) == None:
            print("List does not exist!")
            return
        if len(pluginlists.get(changefilenfrominput)) == 0:
            print("List is empty!")
            return
        print(changefilenfrominput + ":")
        i = 1
        try:
            for item in pluginlists.get(changefilenfrominput):
                print(str(i) + ":")
                print("Name: " + item.get("name"))
                if item.get("tag") != None:
                    print("Tag: " + item.get("tag"))
                if item.get("contributors") != None:
                    print("Contributors: " + item.get("contributors"))
                print("Likes: " + str(item.get("likes")))
                print("Downloads: " + str(item.get("downloads")))
                print("ID: " + str(item.get("id")))
                print("File type: " + item.get("file_type"))
                if item.get("filename", None) == None:
                    print("Current file name: " + str(item.get("id")))
                else:
                    print("Current file name: " + item.get("filename"))
                i += 1
        except TypeError:
            print("Invalid item in list! Please run fixlist!")
            return
        i -= 1
        print("Choose a number to change:")
        changefilennum = input("#")
        try:
            if isnoneorempty(changefilennum) == True:
                print("Nothing is entered!")
                return
            if i < int(changefilennum):
                print("Result does not exist!")
                return
            if int(changefilennum) < 1:
                print("Invalid number!")
                return
        except ValueError:
            print("Not a number!")
            return
        print("New file name:")
        changefilennew = input("?")
        if isnoneorempty(changefilennew) == True:
            print("Nothing is entered!")
            return
        print("Changing number " + str(changefilennum) + "'s file name to " + changefilennew + "!")
        pluginlists.get(changefilenfrominput)[int(changefilennum) - 1].update({"filename": changefilennew})
        listmanager("savelist")
        print("File name changed!")
        return

def searchplugins(id, getinfo = False):
    if getinfo == True:
        try:
            responsegetinfoid = requests.get(apiurls.get("searchid") + id).json()
            if responsegetinfoid.get("external") == True:
                return False
            if responsegetinfoid.get("file").get("type") == "external":
                return False
            name = responsegetinfoid.get("name")
            if responsegetinfoid.get("tag", None) != None:
                tag = responsegetinfoid.get("tag")
            else:
                tag = None
            if responsegetinfoid.get("contributors", None) != None:
                contributors = responsegetinfoid.get("contributors")
            else:
                contributors = None
            likes = responsegetinfoid.get("likes")
            downloads = responsegetinfoid.get("downloads")
            id = responsegetinfoid.get("id")
            if responsegetinfoid.get("external") != True:
                if responsegetinfoid.get("file").get("type") != "external":
                    file_type = responsegetinfoid.get("file").get("type")
                else:
                    file_type = None
            else:
                file_type = None
            info = {
                "name": name,
                "tag": tag,
                "contributors": contributors,
                "likes": likes,
                "downloads": downloads,
                "id": id,
                "file_type": file_type
            }
            return info
        except (TypeError, AttributeError):
            print("Invalid ID!")
            return "badid"
    elif getinfo == "download":
        responsedownloadidfile = requests.get(apiurls.get("searchid") + id + "/download")
        try:
            checkdownload = responsedownloadidfile.json()
        except ValueError:
            return responsedownloadidfile
        if checkdownload.get("error", None) != None:
            return False
        else:
            return False
    elif id == None:
        print("Query:")
        searchquery = input(">")
        if isnoneorempty(searchquery) == True:
            print("Nothing is entered!")
            return
        print("How many results?")
        searchsize = input("#")
        responsesearch = requests.get(apiurls.get("search") + searchquery + "?field=name&size=" + searchsize).json()
        print(apiurls.get("search") + searchquery + "?field=name&size=" + searchsize)
        i = 1
        for result in responsesearch:
            print(str(i) + ":")
            print("Name: " + result.get("name"))
            if result.get("tag", None) != None:
                print("Tag: " + result.get("tag"))
            if result.get("contributors", None) != None:
                print("Contributors: " + result.get("contributors"))
            print("Likes: " + str(result.get("likes")))
            print("Downloads: " + str(result.get("downloads")))
            print("ID: " + str(result.get("id")))
            if result.get("external") != True:
                if result.get("file").get("type") != "external":
                    print("File type: " + result.get("file").get("type"))
            if result.get("external") == True:
                print("Can be downloaded: no")
            else:
                if result.get("file").get("type") == "external":
                    print("Can be downloaded: no")
                else:
                    print("Can be downloaded: yes")
            i += 1
        print(str(i)) ##remove this
        i -= 1
        if i == 0:
            print("Nothing found! :(")
            return
        print("Add one to the list? (yes/no)")
        addtolist = input("?")
        if addtolist == "yes":
            print("Which one? (result number)")
            resultnumber = input("#")
            try:
                if isnoneorempty(resultnumber) == True:
                    print("Nothing is entered!")
                    return
                if i < int(resultnumber):
                    print("Result does not exist!")
                    return
                if int(resultnumber) < 1:
                    print("Invalid number!")
                    return
                listmanager("addtolist", str(responsesearch[int(resultnumber) - 1].get("id")))
                return
            except ValueError:
                print("Not a number!")
                return
        else:
            return
    else:
        if isnoneorempty(id) == True:
            print("No id is entered!")
            return
        searchidinput = id
        responsesearchid = requests.get(apiurls.get("searchid") + searchidinput).json()
        try:
            print("Name: " + responsesearchid.get("name"))
            if responsesearchid.get("tag", None) != None:
                print("Tag: " + responsesearchid.get("tag"))
            if responsesearchid.get("contributors", None) != None:
                print("Contributors: " + responsesearchid.get("contributors"))
            print("Likes: " + str(responsesearchid.get("likes")))
            print("Downloads: " + str(responsesearchid.get("downloads")))
            print("ID: " + str(responsesearchid.get("id")))
            if responsesearchid.get("external") != True:
                if responsesearchid.get("file").get("type") != "external":
                    print("File type: " + responsesearchid.get("file").get("type"))
            if responsesearchid.get("external") == True:
                print("Can be downloaded: no")
            else:
                if responsesearchid.get("file").get("type") == "external":
                    print("Can be downloaded: no")
                else:
                    print("Can be downloaded: yes")
            if responsesearchid.get("external") == True:
                return
            if responsesearchid.get("file").get("type") == "external":
                return
            print("Add it to the list? (yes/no)")
            addtolist = input("?")
            if addtolist == "yes":
                listmanager("addtolist", str(responsesearchid.get("id")))
                return
            else:
                return
        except TypeError:
            print("Invalid ID!")
        return

def plugmanhelp(interactive):
    print("Plugin manager help:")
    print("-search (search plugins)\n-searchid (search for plugins by id)\n-addtolist (adds plugin id to plugin list)\n"
          "-listlists (lists created plugin lists)\n-listlist (list plugins stored in selected list)\n-newlist (creates a new plugin list)\n-removelist (delete an existing list)"
          "\n-removefromlist (removes plugin id from plugin list)\n-renamelist (renames a selected list)\n-changefilename (changes the file name of a selected item)\n-fixlist (detects and fixes problems with the list)\n-help (shows this screen)")
    if interactive == True:
        print("-menu (goes back to menu)")
    else:
        print("-exit (exits the program)")
    print("Press enter to return!")
    input()
    return

ostype = getostype()
ver = "1.1"
plugmanver = "1.0"
database = {"versions": {}, "urls": {"craftbukkit": {}, "spigot": {}, "vanilla": {}}}
pluginlists = listmanager("loadlists")
apiurls = {
    "search": "https://api.spiget.org/v2/search/resources/",
    "searchid" : "https://api.spiget.org/v2/resources/"
}

if __name__ == "__main__":
    init()
