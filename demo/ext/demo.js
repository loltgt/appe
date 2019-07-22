appe__demo = function() {
  var config = app._root.server.appe__config;

  if (! config) {
    console.warn('aux: appe_demo', '\t', 'config');

    return;
  }

  var _app_name = app._runtime.name.toString();

  var store = app._root.server.appe__store;

  if (store && typeof store == 'object' && app.memory.has('last_session') || (store[_app_name] && store[_app_name].length != 0)) {
    console.info('aux: appe_demo', '\t', 'skip demo data');

    return;
  } else {
    console.info('aux: appe_demo', '\t', 'load demo data');
  }


  var _session = function() {
    var current_file = app.utils.base64('encode', src_file);

    // only "start"
    if (target === undefined) {
      app.utils.cookie('set', 'last_opened_file', current_file);
      app.utils.cookie('set', 'last_session', current_timestamp_enc);
    }

    app.memory.set('last_opened_file', current_file);
    app.memory.set('last_session', current_timestamp_enc);
  }

  var _timers = function() {
    app.memory.set('last_stored', current_timestamp);
    app.memory.set('last_time', current_timestamp);
  }

  var _complete = function(loaded) {
    if (! loaded) {
      console.error('aux: appe_demo', '\t', '_complete');

      return;
    }

    if (app._runtime.storage) {
      _session();
    }

    var data = app._root.server[_app_name];

    store[file_heads] = data;

    app.controller.store(function() {
      if (app._runtime.storage) {
        _timers();
      }

      callback(routine);

      if (target === undefined) {
        app.start.redirect(true);
      }
    }, file_heads, schema, data);
  }

  var _rote = function(_routine) {
    routine = _routine;
  }


  var start = app._root.server.start || false;
  var main = app._root.server.main || false;
  var control = app._root.server.control || false;

  var target;
  var routine = [];
  var callback = function() {}

  // "start"
  if (start) {
    start.loadComplete = _rote;
    callback = app.start.loadComplete;
  // "main"
  } else if (main) {
    target = true;
    main.loadComplete = _rote;
    callback = app.main.loadComplete;
  // "view"
  } else if (control) {
    target = false;
  }


  store[_app_name] = {};


  var current_timestamp = app.utils.dateFormat(true, 'Q');
  var current_timestamp_enc = app.utils.base64('encode', current_timestamp);

  var src_file = 'demo_save_2019-03-29_14-29-42_1.js';


  var file = app.os.fileFindRoot(config.save_path.toString() + '/' + src_file);
  var schema = typeof config.schema === 'object' ? config.schema : [];
  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : app._runtime.name.toString();

  // only "start" and "main"
  if (target !== false) {
    app.os.scriptOpen(_complete, file, file_heads);
  }
}

appe__demo();