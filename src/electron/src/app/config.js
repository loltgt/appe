appe__config = {
  "app_ns": "demo",
  "launcher_name": "LAUNCH",
  "app_name": "{appe} demo app",
  "language": "en",
  "compression": true,
  "encryption": true,
  "binary": true,
  "secret_passphrase": "test",
  "verify_checksum": true,
  "debug": true,
  "schema": [
    "file",
    "sample"
  ],
  "events": {
    "selection": "selection",
    "update": "update",
    "open": "open",
    "close": "close",
    "add": "add",
    "edit": "edit",
    "delete": "delete",
    "list": "list",
  },
  "routes": {
    "sample": {
      "list": "sample-wide-list",
      "add": "sample-edit",
      "edit": "sample-edit",
      "delete": "sample",
    },
    "about": {}
  },
  "default_route": "sample",
  "default_event": "add",
  "base_path": "appe",
  "runtime_path": "app",
  "save_path": "save",
  "aux_path": "ext",
  "open_attempts": 20,
  "alt": {
    "exec_folder": "alt",
    "exec_platform": {
      "win": "LAUNCH.win.exe",
      "mac": "LAUNCH.mac.app",
      "hta": "LAUNCH.hta"
    }
  },
  "license": {
    "text": "LGPL-3.0-or-later",
    "file": "LICENSE.txt"
  }
  //"file": {
  //  "compress": false
  //  "heads": "e"
  //}
  /**
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
  */
}