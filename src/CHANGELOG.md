
# CHANGELOG


## [1.0.8-beta]

- Removed yarn.lock from src/electron


## [1.0.7-beta]

- Improvements to the documentation
- Update package.json


## [1.0.6-beta]

- Broken previous 1.0.5-beta release, add the "app.utils.storage.prototype.fake" method to reproduce a fake Storage prototype
- Fix data retrieving in "app.view.load" with "_retrieve" function
- Fix an undefined error in "app.view.beforeunload", missing "control.temp" temporary data object
- Remove accidental non-breakable spaces from code
- Commenting some unclear things
- Updates to the demo extension code
- Prevent demo load breaks in remote context, "load_attempts" tuning
- Update package.json


## [1.0.5-beta]

- Fix in "app.view.action.prototype.prepare" function
- Revert back "app.controller.cursor" function
- Introducing "app.main.handle.prototype.fetch" and "app.view.fetch" functions
- Add sender/receiver mechanism in "app.view.load" function (window.postMessage)
- Add sender mechanism in "app.main.handle" prototype function (window.postMessage)
- Fake storage inside "view" in "app.session" function to avoid same-origin policy in localfile context
- Update package.json


## [1.0.4-beta]

- Improvements to "app.controller"
- Fix the position of decode URI in "app.utils.cookie.prototype.get"
- Fix ctl.history behaviour in "app.view.action.prototype.prepare"
- Edit UglifyJS options in build.js
- Version bump in package.json


## [1.0.3-beta]

- Update npm and yarn deps


## [1.0.2-beta]

- Orderable and paginable table lists
- Fix internal function "_prepare" in "app.os.fileSessionOpen" with js files
- css fixes and improvements


## [1.0.1-beta]

- localStorage/sessionStorage assignment on mobile
- Fix delay Export dropdown toggler close on mobile
- Rename in "config.js", "open_attempts" to "load_attempts", it is more generic
- Fix prevent demo load breaks, "load_attempts" tuning
- Check file schema


## [1.0.0-beta]

- first public release

