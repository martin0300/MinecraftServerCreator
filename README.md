# MinecraftServerCreator
**Warning: This is a work in progress, bugs and crashes might happen! If you find any bugs or something crashed and you can reproduce it please submit it in the issues tab.**

Script for creating minecraft servers written in javascript.

# Information
MinecraftServerCreator is currently being rewritten in javascript. Old python3 version will not receive any future updates.

# Usage
**Use the underlined characters for faster navigation**
- Navigation:
   - For easier navigation use the underlined characters as shortcuts
   - Type back or "b" to go back one page or menu or "m" to go to the main menu (works in any menu unless specified)
   - Green text are choices or success messages
   - Purple text are alternative choices or values in create summary
   - Red text are errors 
   - Yellow text is user prompts
   - White text is questions or general information
   - Underlined characters are shortcuts
- Create Server (Made readable by ChatGPT. I can't write lol):
  1. **Getting Started**: If you haven't installed MinecraftServerCreator yet, refer to the [Installing](#installing) section in the README.
  2. **Create a Server**: Type "create" or simply "c" to initiate the server creation process.
  3. **Server Type**: Choose the type of server you want to create.
  4. **Server Version**: Select the desired version of the server software.
  5. **Download Latest Build**: If prompted, choose whether to download the latest build. You can also specify a specific build version if preferred.
  6. **Install Location**: Specify the path where you want to install the server. Make sure the path already exists.
  7. **Server Name**: Enter a name for your server.
  8. **Create Folder**: Decide whether to create a new folder for the server within the specified path using the server name or install directly into the specified path.
  9. **Allocating RAM**: Enter the minimum and maximum amount of RAM (in MB or GB) for the server. Leave it empty for unlimited RAM.
  10. **Create Server Data File**: Generate a server data file containing essential information for MinecraftServerCreator.
  11. **Review and Confirm**: Check if all the information is correct. Type "yes" to proceed, "no" to restart from the beginning, or "back" to return to the previous page.
  12. **Finalize**: Press Enter and type "exit" or simply "e" to complete the process.
  13. **Navigate to Server Directory**: Go into the server directory to access the server files.
  14. **Accept EULA and Start**: Make sure to accept the End User License Agreement (EULA) and run the start script to start the server.


# Installing
**Prebuilt binaries will be available after stable release**
1. Install Node.js, npm and git if not installed
   - Windows:
     - https://nodejs.org/
     - https://git-scm.com/
   - Linux or Android (Termux):
     - Debian:
        1. ``apt update``
        2. ``apt install nodejs npm git -y``
     - Arch Linux:
        1. ``pacman -Syy``
        2. ``pacman -S nodejs npm git``
     - Android (Termux):
        1. ``pkg update``
        2. ``pkg install nodejs npm git -y``
     - Other Distros:
        - https://nodejs.org/en/download/package-manager
        - https://git-scm.com/download/linux
2. Open terminal (idk why i wrote this)
   - Windows:
      - Windows Terminal
      - Powershell
      - CMD
      - Other
   - Linux:
      - Any terminal
   - Android:
      - Termux
3. Clone this repository\
``git clone -b beta-js https://github.com/martin0300/MinecraftServerCreator``
4. Change directory info MinecraftServerCreator\
``cd MinecraftServerCreator``
5. Run npm to install dependencies\
``npm i``
6. Run MinecraftServerCreator\
``node main.mjs``

# Database and apis
- getbukkit.org (web scraped)
   - vanilla
   - spigot
   - craftbukkit
- Paper API (papermc.io)
   - paper

# Supported platforms
- Windows
- Linux
- Android (Termux)
- Other OS (if has a start script template and node.js)

# Improvements
- Add color for easier usability
- Add shortcuts to menus for faster navigation
- Improve menus:
   - Being able to go back one page or return to menu at any time
   - Color code choices and messages for better understandability
- Modular system:
   - Add custom server jars
   - Add custom download apis
   - Add custom start script OS platforms
- Better code quality, less hard coded stuff

# Implemented Features
- [X] Server creator
- [ ] Plugin manager
- [ ] Config file install
- [ ] CLI switches

# Future features
- [ ] Server manager
- [ ] Plugin system

# Dependencies and usage
- [chalk](https://github.com/chalk/chalk) - Text styling
- [prompt-sync](https://github.com/heapwolf/prompt-sync) - User input
- [axios](https://github.com/axios/axios) - Make HTTP requests for apis or web scraping
- [cheerio](https://github.com/cheeriojs/cheerio) - Web scraping

# Contact info
- E-mail: martin0300a@gmail.com
- Website: https://martin0300.github.io
- Github: https://github.com/martin0300

