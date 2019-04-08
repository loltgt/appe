
# Configure

```js
window.appe__config = {
  "app_ns": "demo", // the namespace of the app (required)
  "launcher_name": "LAUNCH", // the name of the launcher (required)
  "app_name": "App name", // the name of the app (required)
  "language": "en", // default language (required)
  "compression": false,
  "encryption": true,
  "binary": true, // save to binary file
  "secret_passphrase": "test",
  "verify_checksum": true, // (required)
  "debug": true,
  "schema": [ // (required)
    "file",
    ...
  ],
  "events": { // (required)
    "event": "selection",
    ...
  },
  "routes": { // (required)
    "route": {
      "action-1": "file",
      "action-2": "file",
      "action-3": "file",
      ...
    },
    ...
  },
  "default_route": "action-1", // default route (required)
  "default_event": "event", // default event (required)
  "base_path": "app", // where is located app folder (required)
  "save_path": "save", // where is located save folder (required)
  "open_attempts": 10, // how many attempts to resume file session and load extensions (required)
  "alt": {
    "exec_folder": "alt", // where is located app folder
    "exec_platform": {
      "win": "LAUNCH.win.exe",
      "mac": "LAUNCH.mac.app",
      "hta": "LAUNCH.hta"
    }
  }
  "aux": [
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