
# Introduction

The primary intent was to allow simple data manipulation without have to install web servers, tons of software and deps, create a portable app quickly with the possibility to write "spaghetti code", fairly simple to use, executable almost anywhere, with essential features and small footprint.

 

## Folder structure

The folder structure is simplified to facilitate the user, there is a launcher file to open "[LAUNCH.html](https://github.com/loltgt/appe/blob/master/LAUNCH.html)", all the runtime content is inside the "[app](app)" folder, save files are contained in the folder "[save](https://github.com/loltgt/appe/blob/master/save/)", extensions in the folder "[ext](https://github.com/loltgt/appe/blob/master/ext)", the alternative execution in the folder "[alt](https://github.com/loltgt/appe/blob/master/alt)". In the release phase you could delete superfluous files and folders like "docs" and "src".

* [alt](https://github.com/loltgt/appe/blob/master/alt)
* [app](https://github.com/loltgt/appe/blob/master/app)
  * [assets](https://github.com/loltgt/appe/blob/master/app/assets)
  * [views](https://github.com/loltgt/appe/blob/master/app/views)
    * [about.html](https://github.com/loltgt/appe/blob/master/app/views/about.html)
    * [sample-edit.html](https://github.com/loltgt/appe/blob/master/app/views/sample-edit.html)
    * [sample-wide-list.html](https://github.com/loltgt/appe/blob/master/app/views/sample-wide-list.html)
    * [sample.html](https://github.com/loltgt/appe/blob/master/app/views/sample.html)
  * [config.js](https://github.com/loltgt/appe/blob/master/app/config.js)
  * [index.html](https://github.com/loltgt/appe/blob/master/app/index.html)
  * [LICENSE.txt](https://github.com/loltgt/appe/blob/master/app/LICENSE.txt)
  * [README.md](https://github.com/loltgt/appe/blob/master/app/README.md)
  * [robots.txt](https://github.com/loltgt/appe/blob/master/app/robots.txt)
* [ext](https://github.com/loltgt/appe/blob/master/ext)
* [save](https://github.com/loltgt/appe/blob/master/save)
* [LAUNCH.html](https://github.com/loltgt/appe/blob/master/LAUNCH.html)

 

## How it works

The source JavaScript is located in [src/appe/src](https://github.com/loltgt/appe/blob/master/src/appe/src), it is divided into sections to facilitate manipulation, the name of sections is intuitive.

The index file [index.html](https://github.com/loltgt/appe/blob/master/app/index.html) contained in the runtime folder "[app](https://github.com/loltgt/appe/blob/master/app)" acts as a router and controller, it reflects the functions contained in "[main.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js)".

All views, which correspond to routes and events declared in the "config.js" configuration file are contained in the "views" folder, they reflect the functions contained in "[view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)".

The application is started from the launcher file "[LAUNCH.html](https://github.com/loltgt/appe/blob/master/LAUNCH.html)", if it has been previously executed and the configuration foresees the saving in JavaScript file (.js) it will try to resume first the previous session, alternatively will attempt to reload the last file loaded from the "save" save folder. Then you are redirected to the index file [index.html](https://github.com/loltgt/appe/blob/master/app/index.html) which will manage all directions inside the app.

To appreciate the features and functionality of individual functions read the appropriate documentation [[app. functions and hooks|app]].

Further details on customization and extensibility of **appe** in the section [Recipes](Home#Recipes).

