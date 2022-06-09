# MinecraftServerCreator
Script for creating minecraft servers written in python.

# How to use
**Main program switches:**
--i (start in interactive mode)
--f (start in config install mode)
--help (show help screen)
--version (show version screen)
**Config install switches:**
--help (shows help screen)
--createconfig (creates a config file to modify)
--listserver (list available server types and versions)
--listbuild {versionnumber} (**only works for paper!** list builds for server version)
filename (config file)
**Config file help:**
**Config file must be in JSON format!**
--servertype (to list server types use --f --listserver)
--serverversion (to list server versions use --f --listserver)
--servername (the servers name also used for folder name when createdir is enabled)
--installlocation (server install location (**on windows use \\ !**)
--build (build number for server to list builds use --f --listbuild {versionnumber} (**only works for paper servers** for other servers use latest also works for paper!))
--createdir (create directory for server with the server name)
--maxram (maximum ram for server **in megabytes** example 1024M (**if you don't wanna change it use default**)
--minram (minimum ram for server **in megabytes** example 512M (**if you don't wanna change it use default**)
--askinstall (ask user before installing server)
