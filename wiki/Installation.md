# Installation

rAppid.js can be installed using [npm](http://npmjs.org/) - a node package manager - or by forking the github repository.

## Installation using npm

The installation using npm is the preferred choice, because:

* all dependencies are automatically installed
* the rappidjs command is registered in your ```PATH```
* updating of rAppid.js and rAppid packages is easy

For installing npm visit http://npmjs.org/. Npm is now shipped with node, download and install load from http://nodejs.org. 

To install rAppid.js open a command-line as privileged user and type: 

```
npm install rAppid.js -d -g
```

The option `-d` will install all required dependencies. The option `-g` will install rAppid.js in the global npm directory and register the `rappidjs` command in your system `PATH`. 

### Installation notice

rAppid.js has many dependencies, but most of them are optional and not necessary to run and develop RIA applications. These dependencies are required for some rappidjs commands or to run a rappidjs server.

#### Mac OS & *nix

Because the npm option `-g` will install rAppid.js in the global npm directory, make sure you run the install command with `sudo` or as `root`.  

#### Windows

npm and rAppid.js uses symbolic links. Windows supports symlinks with `ntfs` as file system. Make sure your global `node_modules` directory is on an `ntfs` partition (default since Windows XP).

Creating symlinks under Windows using node required administrative privileges. Since `Windows Vista` you have to run the command-line as administrator even if you're in the group administrators. Open the start menu, search for `cmd`. Right click the `cmd` and select run as administrator. Within this terminal the installation using the above command should succeed.

## Manual installation

// TODO: document this! 
If the installation using npm isn't possible, [contact us](mailto:support@rappidjs.com). 
