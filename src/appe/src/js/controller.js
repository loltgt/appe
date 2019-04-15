/**
 * app.controller
 *
 * Controller functions
 */
app.controller = {};


/**
 * app.controller.spoof
 *
 * Captures the app position using location.href
 *
 * @param <Object> loc  { view, action, index }
 */
app.controller.spoof = function() {
  var loc = { view: null, action: null, index: null };

  // path
  if (app._root.window.location.href.indexOf('?') == -1) {
    return loc;
  }

  var ref = app._root.window.location.href.split('?')[1];

  // querystring
  if (ref.indexOf('&') != -1) {
    ref = ref.split('&');

    // querystring values
    if (ref[1].indexOf('=') != -1) {
      var sub = ref[1].split('=');

      loc = { view: ref[0], action: sub[0], index: parseInt(sub[1]) };
    } else {
      loc = { view: ref[0], action: ref[1] };
    }
  } else {
    loc.view = ref;
  }

  return loc;
}


/**
 * app.controller.history
 *
 * Handles history through the browser api
 *
 * @param <String> title
 * @param <String> url
 */
app.controller.history = function(title, url) {
  var _title = app._runtime.title.toString();

  if (title) {
    title += ' – ' + _title;
  } else {
    title = _title;
  }

  if (app._runtime.system.name == 'safari') {
    app._root.window.location.href = url;
  } else {
    history.replaceState(null, title, url);
  }

  app.controller.setTitle(title);
}


/**
 * app.controller.cursor
 *
 * Get or set the controller cursor, 
 * it contains current position in the app
 *
 * @param <Object> loc
 * @return <Object> loc  { view, action, index }
 */
app.controller.cursor = function(loc) {
  if (loc && typeof loc != 'object') {
    return app.error('app.controller.cursor', [loc]);
  }

  if (loc) {
    app.memory.set('cursor', loc);

    return loc;
  }

  loc = app.memory.get('cursor', loc);

  return loc;
}


/**
 * app.controller.setTitle
 *
 * Set and store the document title
 *
 * @param <String> title
 * @return <String>
 */
app.controller.setTitle = function(title) {
  app._runtime.title = title.toString();

  app._root.document.title = app._runtime.title;

  return app._runtime.title;
}


/**
 * app.controller.getTitle
 *
 * Gets the document title
 *
 * @return <String>
 */
app.controller.getTitle = function() {
  return app._runtime.title.toString();
}


/**
 * app.controller.store
 *
 * Stores data from current session, returns to callback
 *
 * @global <Object> appe__store
 * @param <Function> callback
 * @param <String> fn
 * @param <Object> schema
 * @param <Object> data
 * @return
 */
app.controller.store = function(callback, fn, schema, data) {
  var store = app._root.server.appe__store;

  if (! store) {
    return app.stop('app.controller.store', 'store');
  }

  if (typeof callback != 'function' || typeof fn != 'string' || typeof schema != 'object' || typeof data != 'object') {
    return app.stop('app.controller.store', [callback, fn, schema, data]);
  }

  var source = store[fn];

  if (! source) {
    return app.stop('app.controller.store', 'source');
  }


  var _store = function(key, values) {
    if (typeof key != 'string' || typeof values != 'object') {
      return app.stop('app.controller.store() > _store', [key, values]);
    }

    if (! source[key]) {
      return app.stop('app.controller.store() > _store', 'source');
    }

    var _data = values;

    app.store.set(fn + '_' + key, _data);

    return _data;
  }


  var _current_timestamp = new Date();
  _current_timestamp = app.utils.dateFormat(_current_timestamp, 'Q');


  var keys = Object.keys(data);

  for (var i in keys) {
    var key = keys[i];
    var values = data[key];

    if (schema.indexOf(key) === -1 || ! Object.keys(values).length) {
      return app.stop('app.controller.store', 'data');
    }

    store[fn][key] = _store(key, values);
  }

  app.memory.del('save_reminded');

  app.memory.set('last_stored', _current_timestamp);

  callback();
}


/**
 * app.controller.retrieve
 *
 * Restores data for current session and loads file and scripts, returns to callback
 *
 * @global <Object> appe__store
 * @param <Function> callback
 * @param <Array> routine
 * @return
 */
app.controller.retrieve = function(callback, routine) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.controller.retrieve');
  }

  var store = app._root.server.appe__store;

  if (! store) {
    return app.stop('app.controller.retrieve', 'store');
  }

  if (typeof callback != 'function' || typeof routine != 'object') {
    return app.stop('app.controller.retrieve', [callback, routine]);
  }

  var schema = config.schema;

  if (typeof schema != 'object') {
    return app.error('app.controller.retrieve', 'schema');
  }


  var _retrieve = function(fn, schema) {
    if (typeof fn != 'string' || typeof schema != 'object') {
      return app.stop('app.controller.retrieve() > _retrieve', [fn, schema]);
    }

    if (store[fn] && typeof store[fn] === 'object') {
      return store[fn];
    }

    store = {};

    for (var i in schema) {
      var key = schema[i].toString();
      var obj = app.store.get(fn + '_' + key);

      if (! obj) {
        return app.stop('app.controller.retrieve() > _retrieve', 'schema');
      }

      store[key] = obj;
    }

    return store;
  }


  var i = routine.length;

  while (i--) {
    var fn = routine[i].fn.toString();

    if (routine[i].file) {
      routine[i].file = '../' + routine[i].file.toString();
    }

    store[fn] = _retrieve(fn, routine[i].schema);
  }

  callback();
}


/**
 * app.controller.clear
 *
 * Reset the current session data
 *
 * @global <Object> appe__config
 * @global <Object> appe__store
 * @return <Boolean>
 */
app.controller.clear = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.controller.clear');
  }

  var store = app._root.server.appe__store;

  if (! store) {
    return app.stop('app.controller.clear', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var schema = config.schema;

  if (typeof schema != 'object') {
    return app.error('app.controller.clear', 'schema');
  }

  for (var i in schema) {
    var key = schema[i].toString();

    app.store.del(_app_name + '_' + key);

    if (store[_app_name] && key in store[_app_name]) {
      delete store[_app_name][key];
    }
  }

  app.memory.del('last_stored');

  return true;
}

