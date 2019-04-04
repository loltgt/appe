
# Configure

```js
window.appe__config = {
  "app": "demo", // the namespace of the app
  "launcherName": "LAUNCH", // the name of the launcher
  "name": "App name", // the name of the app
  "language": "en", // default language
  "compression": false,
  "encryption": true,
  "secret_passphrase": "test",
  "debug": true,
  "schema": [ "file", ... ],
  "events": {
    "event": "selection",
    ...
  },
  "routes": {
    "route": {
      "action-1": "file",
      "action-2": "file",
      "action-3": "file",
      ...
    },
    ...
  },
  "defaultRoute": "action-1", // default route
  "defaultEvent": "event", // default event
  "verifyFileChecksum": true,
  "basePath": "app", // where is located app folder
  "savePath": "save", // where is located save folder
  "openAttempts": 10, // how many attempts to resume file session and load extensions 
  "altExecFolder": "alt", // where is located app folder
  "altExecPlatform": {
    "win": "LAUNCH.win.exe",
    "mac": "LAUNCH.mac.app",
    "hta": "LAUNCH.hta"
  },
  "auxs": [
  	{"": {

  	}}
  ],
  "license": {
    "text": "LGPL-3.0-or-later",
    "file": "../LICENSE"
  },
  "file": {
    "binary": true,
    "compress": true,
    "filename_prefix": "appe_save",
    "filename_separator": "_",
    "filename_date_format: "Y-m-d_H-M-S",
	},
  "csv": {
    "filename_prefix": "csv_export",
    "filename_separator": "_",
    "filename_date_format": "Y-m-d_H-M-S",
  },
}
```