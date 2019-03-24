window.config = {
  "app": "demo",
  "launcherName": "LAUNCH",
  "title": "{appe} demo app",
  "language": "it",
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
    "main": {
      "open": "main-edit",
      "list": "main-list",
      "update": "main",
    },
    "archive": {
      "add": "archive-edit",
      "edit": "archive-edit",
      "delete": "archive",
      "open": "archive-item-edit",
      "chiudi": "archive",
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
  "defaultRoute": "main",
  "defaultEvent": "add",
  "verifyFileChecksum": true,
  "basePath": "app",
  "savePath": "save",
  "openAttempts": 10,
  "auxs": [],
  "altExecFolder": "alt",
  "altExecPlatform": {
    "win": "LAUNCH.win.exe",
    "mac": "LAUNCH.mac.app",
    "hta": "LAUNCH.hta"
  }
}