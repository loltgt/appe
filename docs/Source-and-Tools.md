
# Source files and tools

The source JavaScript is located in [src/appe/src](https://github.com/loltgt/appe/blob/master/src/appe/src), it is divided into sections to facilitate manipulation, the name of sections is intuitive.

* controller.js (Controller functions)
* index.js (Index with most important functions)
* layout.js (Handles layout functions)
* lockdown.js (Object.freeze)
* main.js ("main" functions)
* memory.js (Handles storage entries)
* os.js (Handles filesystem functions)
* start.js (Launcher functions)
* store.js (Handles persistent storage entries)
* utils.js (Utils functions)
* view.js ("view" functions)

 

## Scripting tools

Scripts available in appe via `npm run-script`:

|Task|Description| 
|-|-|
|watch|build/watch all js and css assets|
|watch-js|build/watch all js assets|
|watch-css|build/watch all css assets|
|build|build all js and css assets|
|build-js|build all js assets|
|build-css|build all css assets|
|build-docs|build all documentation files, shortcut to `php generate_docs.php`|
|copy-demo|recursively copy all app assets in "demo" folder|
|copy-electron|recursively copy all app files in "[src/electron/src](https://github.com/loltgt/appe/blob/master/src/electron/src)" folder|
|copy-docs|recursively copy all documentation files in "docs" folder|

 

## Electron (as an alternate execution)

To allow **appe** to work in the extreme cases in which the browser or the system do not allow direct execution, [Electron](https://github.com/electron/electron) is used, you can use the strategy that suits your needs.

The package configuration and the necessary dependencies are provided by [Electron Forge](https://github.com/electron-userland/electron-forge), to install it `npm install -g electron-forge
`.

After installing the necessary dependencies from the [src/electron](https://github.com/loltgt/appe/blob/master/src/electron) folder with the `electron-forge start electron` command, it is possible to create distribution packages for operating systems with the `electron-forge package` command.

All informations are available on the website [https://electronforge.io](https://electronforge.io).
