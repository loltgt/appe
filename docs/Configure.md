
# How to configure

Read comments in the global _"appe__config"_ object.

```js
appe__config = {
  "app_ns": "your_app_namespace", // the namespace of the app (required)
  "launcher_name": "LAUNCH", // the name of the launcher (required)
  "app_name": "your app name", // the name of the app (required)
  "language": "en", // language, set to null for auto-select (required)
  "language_direction": "ltr", // language direction, accepted values are "ltr" or "rtl", default to "ltr"
  "compression": false, // session file compression
  "encryption": true, // session file encryption
  "binary": true, // saves session to binary file
  "secret_passphrase": "test", // the secret passphrase needed with session file compression active
  "verify_checksum": true, // whenever to verify JSON file checksum
  "debug": true, // turns on debug
  "schema": [ // the file schema (required)
    "file",
    ...
  ],
  "events": { // app events, { "event name": "event slug", ... } (required)
    "event-name": "event-slug",
    ...
  },
  "routes": { // app routes, { "parent route slug/filename": { "child route event slug": "child route filename", ... }, ... } (required)
    "parent-route-filename": {
      "child-route-event-slug": "child-route-filename",
      "child-route-event-slug-edit": "child-route-filename-edit",
      "child-route-event-slug-whole": "child-route-filename-whole",
      ...
    },
    ...
  },
  "default_route": "parent-route-filename", // default route (required)
  "default_event": "event", // default event (required)
  "base_path": "appe", // where is located the root folder (required)
  "runtime_path": "app", // where is located the runtime folder (required)
  "save_path": "save", // where is located the save folder (required)
  "aux_path": "ext", // where is located the extensions folder
  "load_attempts": 50, // number of attempts to resume file session or load extensions, default to 50 for best effort
  "alt": { // alternate execution, used when occurring browser or system limitations, it is a fallback
    "exec_folder": "alt", // where is located the alternate folder
    "exec_platform": { // system specifics
      "win": "LAUNCH.win.exe",
      "mac": "LAUNCH.mac.app",
      "hta": "LAUNCH.hta"
    }
  }
  "aux": [ // extensions, asyncronous loaded
  	{
      "file": "filename.js", // extension filename (required)
      "fn": "extension_global_scope", // the global name to declare inside the extension, used to verify load and expose features (required)
      "memo": false // stores the extension exposed features into app global store
  	}
  ],
  "license": { // license app related
    "text": "LGPL-3.0-or-later", // textile license
    "file": "LICENSE.txt" // file license
  },
  "file": { // session file settings
    "binary": true,
    "compress": true,
    "filename_prefix": "appe_save",
    "filename_separator": "_",
    "filename_date_format": "Y-m-d_H-M-S",
  },
  "csv": { // csv export settings
    "filename_prefix": "csv_export",
    "filename_separator": "_",
    "filename_date_format": "Y-m-d_H-M-S",
  },
}
```
