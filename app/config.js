appe__config = {
  "app_ns": "your_app_namespace",
  "launcher_name": "LAUNCH",
  "app_name": "your app name",
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
    "list": "list"
  },
  "routes": {
    "sample": {
      "list": "sample-wide-list",
      "add": "sample-edit",
      "edit": "sample-edit",
      "delete": "sample"
    },
    "about": {}
  },
  "default_route": "sample",
  "default_event": "add",
  "base_path": "appe",
  "runtime_path": "app",
  "save_path": "save",
  "aux_path": "ext",
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
}