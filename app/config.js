window.config = {
  "app": "demo",
  "launcherName": "LAUNCH",
  "name": "{appe} demo app",
  "language": "en",
  "debug": true,
  "schema": [ "file", "archive", "categories", "items", "sample" ],
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
    "demo": {
      "open": "demo-edit",
      "list": "demo-wide-list",
      "update": "demo"
    },
    "archive": {
      "add": "archive-edit",
      "edit": "archive-edit",
      "delete": "archive",
      "open": "archive-item-edit",
      "close": "archive"
    },
    "average": {
      "update": "average"
    },
    "items": {
      "add": "items-edit",
      "edit": "items-edit",
      "delete": "items"
    },
    "sample": {
      "add": "sample-edit",
      "edit": "sample-edit",
      "delete": "sample"
    },
    "about": {}
  },
  "defaultRoute": "demo",
  "defaultEvent": "add",
  "verifyFileChecksum": true,
  "basePath": "app",
  "savePath": "save",
  "openAttempts": 10,
  "altExecFolder": "alt",
  "altExecPlatform": {
    "win": "LAUNCH.win.exe",
    "mac": "LAUNCH.mac.app",
    "hta": "LAUNCH.hta"
  },
  "auxs": [],
  "license": {
    "text": "LGPL-3.0-or-later",
    "file": "../LICENSE"
  }
}