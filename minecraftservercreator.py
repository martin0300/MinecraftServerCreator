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


def installer(servertype, serverversion, servername, installlocation, buildnumber, createdir, maxram, minram, menuinstall):
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
    print("Everything is correct? (yes/no)")
    print("Server type: " + servertype)
    print("Server version: " + serverversion)
    print("Server build: " + chosenbuild)
    print("Install loaction: " + installloc)
    print("Server name: " + servername)
    print("Create folder: " + createfolder)
    print("Maximum ram: " + maxram)
    print("Minimum ram: " + minram)
    correct = input(">")
    if correct == "yes":
        installer(servertype, serverversion, servername, installloc, chosenbuild, createfolder, maxram, minram, True)
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
    print("-exit (exits the program)")
    print("Press enter to return!")
    input()
    return

def getostype():
    return platform.system()

def mscexit():
    exit(0)

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
    print("Config install help:\n--help (shows this screen)\n--createconfig (creates config to modify)\n--listserver (list available server types and versions)\n--listbuild (versionnumber) (lists the builds for the version number specified (only works on paper servers))\nfilename (install from config (JSON) file)")
    print("Config file help:\nIt must be a JSON file!\n-servertype (type afther --f --listserver to list avalible server types)\n"
          "-serverversion (type afther --f --listserver to list avalible server versions)\n-servername (servers name and the folders if createdir is enabled)\n"
          "-installlocation (server install location (on windows use \\\\ !))\n-build (only works on paper servers! (type latest for any server type including paper) to list builds use --f --listbuild (versionnumber))\n"
          "-createdir (create directory with the server name)\n-maxram (maximum ram for server in megabytes example: 1024M (enter default if you don't wanna change it))\n-minram (minimum ram for server in megabytes example: 512M (enter default if you don't wanna change it))\n"
          "-askinstall (ask user to install server)")
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
        "askinstall": True
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
        install = input("?")
        if install == "yes":
            installer(servertype, serverversion, servername, installlocation, build, createdir, maxram, minram, False)
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
        else:
            startinstallconfig(sys.argv[2])
    except IndexError:
        confighelp()

ostype = getostype()
ver = "1.0"
database = {"versions": {}, "urls": {"craftbukkit": {}, "spigot": {}, "vanilla": {}}}

if __name__ == "__main__":
    init()