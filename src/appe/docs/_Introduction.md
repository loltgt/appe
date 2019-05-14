
# Introduction

The primary intent was to allow simple data manipulation without have to install web servers, tons of software and deps, create a portable app quickly with the possibility to write _spaghetti code_, fairly simple to use, executable almost anywhere, with essential features and small footprint.

 

## Folder structure

The folder structure is simplified to facilitate the user, there is a launcher file to open _"[LAUNCH.html](https://github.com/loltgt/appe/blob/master/LAUNCH.html)"_, all the runtime content is inside the folder "[app](https://github.com/loltgt/appe/blob/master/app)", save files are contained in the folder "[save](https://github.com/loltgt/appe/blob/master/save)", extensions in the folder "[ext](https://github.com/loltgt/appe/blob/master/ext)", the alternative execution in the folder "[alt](https://github.com/loltgt/appe/blob/master/alt)". In the release phase you could delete superfluous files and folders like "docs" and "src".

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

The source JavaScript is located in "[src/appe/src](https://github.com/loltgt/appe/blob/master/src/appe/src)", it is divided into sections to facilitate manipulation, the name of sections is intuitive.

The index file _"[index.html](https://github.com/loltgt/appe/blob/master/app/index.html)"_ contained in the runtime folder "[app](https://github.com/loltgt/appe/blob/master/app)" acts as a router and controller, it reflects the functions contained in _"[main.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js)"_.

All views, which correspond to routes and events declared in the configuration file _"[config.js](https://github.com/loltgt/appe/blob/master/app/config.js)"_ are contained in the "[views](https://github.com/loltgt/appe/blob/master/app/views)" folder, they reflect the functions contained in _"[view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)"_.

The application is started from the launcher file _"[LAUNCH.html](https://github.com/loltgt/appe/blob/master/LAUNCH.html)"_, if it has been previously executed and the configuration foresees the saving in JavaScript file (.js) it will try to resume first the previous session, alternatively will attempt to reload the last file loaded from the save folder "[save](https://github.com/loltgt/appe/blob/master/save)". Then you are redirected to the index file _"[index.html](https://github.com/loltgt/appe/blob/master/app/index.html)"_ which will manage all directions in the app.

The storage into the application is provided by "[localStorage](https://html.spec.whatwg.org/multipage/webstorage.html#the-localstorage-attribute)" and "[sessionStorage](https://html.spec.whatwg.org/multipage/webstorage.html#the-sessionstorage-attribute)" browser apis.

To appreciate the features and functionality of individual functions read the documentation section [[app. functions and hooks|app]].

Further details on customization and extensibility of **appe** in the section [Recipes](Home#Recipes).

