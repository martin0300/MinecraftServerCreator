# MinecraftServerCreator
**Warning: This is a work in progress, bugs and crashes might happen! If you find any bugs or something crashed and you can reproduce it please submit it in the issues tab.**

Script for creating minecraft servers written in javascript.

# Information
MinecraftServerCreator is currently being rewritten in javascript. Old python3 version will not receive any future updates.

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
``node main.js``

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
- Website: martin0300.github.io
- Github: github.com/martin0300

