appe__config = {
  "app_ns": "demo",
  "launcher_name": "LAUNCH",
  "app_name": "{appe} demo app",
  "language": null,
  "compression": true,
  "encryption": true,
  "binary": true,
  "secret_passphrase": "test",
  "verify_checksum": true,
  "debug": true,
  "schema": [
    "file",
    "archive",
    "categories",
    "items",
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
    "demo": {
      "open": "demo-edit",
      "list": "demo-wide-list",
      "update": "demo",
    },
    "archive": {
      "add": "archive-edit",
      "edit": "archive-edit",
      "delete": "archive",
      "open": "archive-item-edit",
      "close": "archive",
    },
    "average": {
      "update": "average",
    },
    "items": {
      "add": "items-edit",
      "edit": "items-edit",
      "delete": "items",
    },
    "sample": {
      "add": "sample-edit",
      "edit": "sample-edit",
      "delete": "sample",
    },
    "about": {}
  },
  "default_route": "demo",
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
  },
  "aux": [
    {
      "file": "demo.js",
      "fn": "appe__demo"
    }
  ]
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