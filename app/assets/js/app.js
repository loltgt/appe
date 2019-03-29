/*!
 * {appe}
 * ver. 1.0 beta
 *
 * Copyright (c) Leonardo Laureti
 *
 * MIT License
 */

var app = window.app = {};


app._runtime = {
  version: '1.0',
  release: '1.0 beta',
  system: null,
  exec: true,
  title: '',
  storage: false,
  debug: false
};



app.os = {};

/**
 * app.os.fileOpen
 *
 * Opens a file through FileReader api, stores it, returns to callback
 *
 * @global <Object> config
 * @param <Function> callback
 * @return
 */
app.os.fileOpen = function(callback) {
  var config = window.config;

  if (! config) {
    return app.stop('app.os.fileOpen');
  }

  if (! FileReader) {
    return app.error('app.os.fileOpen', 'FileReader');
  }

  if (! (callback && typeof callback === 'function')) {
    return app.error('app.os.fileOpen', arguments);
  }

  if (! this.files.length) {
    return; // silent fail
  }

  var file = this.files[0];

  if (file.type.indexOf('javascript') === -1) {
    return app.error('app.os.fileOpen', 'Il formato di file non è corretto.', arguments);
  }

  var schema = config.schema;
  var reader = new FileReader();

  reader.onload = (function() {
    var source = this.result;

    // try to restore file source
    try {
      source = source.replace(/[\r\n]([\s]+){2}/g, '')
        .replace(new RegExp('window.' + config.app + ' ?= ?'), '')
        .replace(/};/, '');

      source = JSON.parse(source);
    } catch (err) {
      return app.error('app.os.fileOpen', err);
    }

    // check file source before store
    app.checkFile(source);

    for (var i = 0; i < schema.length; i++) {
      if (schema[i] in source === false) {
        return app.error('app.os.fileOpen', 'schema[i]');
      }

      app.store.set(config.app + '_' + schema[i], source[schema[i]]);
    }

    callback(file.name);
  });

  reader.onerror = (function(err) {
    app.error('app.os.fileOpen', err);

    callback(false);
  });

  reader.readAsText(file);
}


/**
 * app.os.fileSave
 *
 * Sends a file to the browser, returns to callback
 *
 * @global <Object> config
 * @param <Function> callback
 * @param <Object> source
 * @param <Date> timestamp
 * @return
 */
app.os.fileSave = function(callback, source, timestamp) {
  var config = window.config;

  if (! config) {
    return app.stop('app.os.fileSave');
  }

  if (! (callback && typeof callback === 'function') || ! (timestamp && timestamp instanceof Date)) {
    return app.error('app.os.fileSave', arguments);
  }

  if (! (source && typeof source === 'object')) {
    return callback(false);
  }


  // prepare file source
  try {
    source = JSON.stringify(source);
    source = source.replace(/\"/g, '"');
    source = 'window.' + config.app + ' = ' + source;
  } catch (err) {
    return app.error('app.os.fileSave', err);
  }


  var file_saves = app.memory.has('file_saves') ? parseInt(app.memory.get('file_saves')) : 0;

  file_saves++;

  var filename = config.app + '_save';
  var filename_date = app.utils.dateFormat(timestamp, 'Y-m-d_H-M-S');

  filename += '_' + filename_date;
  filename += '_' + file_saves;


  var file = new File(
    [ source ],
    filename + '.js',
    { type: 'application/x-javascript;charset=utf-8' }
  );

  try {
    saveAs(file);

    app.memory.set('file_saves', file_saves);

    callback(filename);
  } catch (err) {
    callback(false);
  }
}


/**
 * app.os.scriptOpen
 *
 * Tries to open a script and load asyncronously, returns to callback
 *
 * @param <Function> callback
 * @param <String> file
 * @param <String> fn
 * @param <Number> max_attempts
 */
app.os.scriptOpen = function(callback, file, fn, max_attempts) {
  if (typeof callback !== 'function' || typeof file !== 'string' || (fn && typeof fn !== 'string')) {
    return app.error('app.os.scriptOpen', arguments);
  }

  var _load = function(file) {
    var script = document.createElement('script');
    script.src = file;
    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
  }

  var _check = function(callback, fn) {
    var max = max_attempts || 5;
    var attempts = 0;

    var interr = setInterval(function() {
      attempts++;

      var top = window.top || undefined;
      var obj = top[fn] || parent[fn] || window[fn];

      if (obj || max === attempts) {
        callback();

        clearInterval(interr);
      }
    }, 1000);
  }

  _load(file);

  if (fn) {
    _check(callback, fn);
  } else {
    callback();
  }
}


/**
 * app.os.generateFileHead
 *
 * Generates a file header with file ?
 *
 * @global <Object> config
 * @param <Object> source
 * @param <Date> timestamp
 * @return <Object>
 */
app.os.generateFileHead = function(source, timestamp) {
  var config = window.config;

  if (! config) {
    return app.stop('app.os.generateFileHead');
  }

  if (! (source && typeof source === 'object') && ! (timestamp && timestamp instanceof Date)) {
    return app.error('app.os.generateFileHead', arguments);
  }

  var _checksum = ''; //TODO
  var _timestamp = app.utils.dateFormat(timestamp, 'Q');

  return {
    'checksum': _checksum,
    'date': _timestamp,
    'version': app._runtime.version,
    'release': app._runtime.release
  };
}


/**
 * app.os.getLastFileName
 *
 * Gets the last opened file name
 *
 * @global <Object> config
 * @return <String>
 */
app.os.getLastFileName = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.os.getLastFileName');
  }

  var filename = '';

  //TODO move document.cookie to app.utils
  _cookie_name = window.btoa('appe_last_opened_file');

  if (document.cookie.indexOf(_cookie_name) != -1) {
    filename = document.cookie.replace(new RegExp('/(?:(?:^|.*;\s*)' + _cookie_name + '\s*\=\s*([^;]*).*$)|^.*$/'), '$1');
  }
  if (! filename) {
    filename = app.memory.get('last_opened_file');
  }
  if (! filename) {
    return false;
  }

  //TODO atob whitespace
  filename = filename ? window.atob(filename) + '.js' : null;

  return filename;
}


/**
 * app.os.getLastFileVersion
 *
 * Gets the last opened file version
 *
 * @global <Object> config
 * @global <Object> store
 * @return <String>
 */
app.os.getLastFileVersion = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.os.getLastFileVersion');
  }

  var data_file = window.store[config.app]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileVersion', 'store[config.app][\'file\']');
  }

  var file_version = null;

  if (data_file.version || data_file.release) {
    file_version = [];

    if (data_file.version) { file_version.push(data_file.version); }
    if (data_file.release) { file_version.push(data_file.release); }
  }

  return file_version;
}


/**
 * app.os.getLastFileChecksum
 *
 * Gets the last opened file checksum
 *
 * @global <Object> config
 * @global <Object> store
 * @return <String>
 */
app.os.getLastFileChecksum = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.os.getLastFileChecksum');
  }

  var data_file = window.store[config.app]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileChecksum', 'store[config.app][\'file\']');
  }

  var file_checksum = null;

  if (data_file.checksum) {
    file_checksum = data_file.checksum;
  }

  return file_checksum;
}


/**
 * app.os.getLastFileHead
 *
 * Gets the last opened file header
 *
 * @return <Object>
 */
app.os.getLastFileHead = function() {
  return {
    'name': app.os.getLastFileName(),
    'version': app.os.getLastFileVersion(),
    'checksum': app.os.getLastFileChecksum()
  };
}



app.layout = {};

/**
 * app.layout.renderSelectOption
 *
 * Renders the SELECT element OPTION
 *
 * @param <String> value
 * @param <String> name
 * @param <Boolean> selected
 * @return <String>
 */
app.layout.renderSelectOption = function(value, name, selected) {
  if (! value || ! name) {
    return app.error('app.layout.renderSelectOption', arguments);
  }

  return '<option value="' + value + '"' + (selected ? ' selected' : '') + '>' + name + '<\/option>';
}


/**
 * app.layout.renderSelectOptionGroup
 *
 * Renders the SELECT element OPTGROUP
 *
 * @param <String> label
 * @param <String> options
 * @return <String>
 */
app.layout.renderSelectOptionGroup = function(label, options) {
  if (! label || ! options) {
    return app.error('app.layout.renderSelectOptionGroup', arguments);
  }

  return '<optgroup label="' + label + '">' + options + '<\/optgroup>';
}


/**
 * app.layout.renderSelectOptions
 *
 * Renders SELECT elements
 *
 *    [ {"optgroup_label": [ {"option_name": "option_value"}, ... ]} ]
 *    [ {"option_name": "option_value"}, ... ]
 *    [ "option_value", ... ]
 *
 * @param <String> select_id
 * @param <Object> data
 * @return <String>
 */
app.layout.renderSelectOptions = function(select_id, data, selected) {
  if (! select_id || typeof data !== 'object') {
    return app.error('app.layout.renderSelectOptions', arguments);
  }

  var select_opts = '';

  Array.prototype.forEach.call(data, function(opt) {
    var opt_value = Object.keys(opt)[0];
    var opt_name = opt[opt_value];

    if (opt_name instanceof Array) {
      var opts = '';

      Array.prototype.forEach.call(opt_name, function(opt) {
        if (typeof opt === 'object') {
          var _opt_value = Object.keys(opt)[0];
          var _opt_name = opt[_opt_value];
        } else {
          var _opt_value = _opt_name = opt;
        }

        opts += app.layout.renderSelectOption(_opt_value, _opt_name, selected);
      });

      select_opts += app.layout.renderSelectOptionGroup(opt_value, opts);
    } else {
      select_opts += app.layout.renderSelectOption(opt_value, opt_name, selected);
    }
  });

  return select_opts;
}


/**
 * app.layout.draggable
 *
 * Helper for draggable table, returns requested object method
 *
 * available methods:
 *  - start (e <Object>)
 *  - over (e <Object>)
 *  - enter (e <Object>)
 *  - leave (e <Object>)
 *  - end (e <Object>)
 *  - drop (e <Object>)
 *
 * @param <String> event
 * @param <ElementNode> table
 * @param <ElementNode> field
 * @return <Function>
 */
app.layout.draggable = function(event, table, field) {
  if (! event || ! table || ! field) {
    return app.error('app.view.draggable', arguments);
  }

  var _draggable = {};

  if (! table._draggable) {
    table._draggable = {};
  }

  table._draggable.current = null;
  table._draggable.prev_index = null;
  table._draggable.next_index = null;

  _draggable.start = function(e) {
    table._draggable.current = this;
    table._draggable.next_index = this.getAttribute('data-index');

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);

    this.classList.add('move');
  }

  _draggable.over = function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    return false;
  }

  _draggable.enter = function(e) {
    this.classList.add('over');
  }

  _draggable.leave = function(e) {
    this.classList.remove('over');
  }

  _draggable.end = function(e) {
    var tbody = table.querySelector('tbody');
    var trows = tbody.querySelectorAll('tr.draggable');

    var items = [];

    Array.prototype.forEach.call(trows, function (trow) {
      items.push(trow.getAttribute('data-index'));

      trow.classList.remove('move');
      trow.classList.remove('over');
    });

    // prepare items
    try {
      items = JSON.stringify(items);
      items = encodeURIComponent(items);

      // set items
      if (field) {
        field.setAttribute('value', items);
      }
    } catch (err) {
      return app.error('app.view.draggable.end', err);
    }
  }

  _draggable.drop = function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (table._draggable.current != this) {
      table._draggable.prev_index = this.getAttribute('data-index');

      table._draggable.current.innerHTML = this.innerHTML;
      table._draggable.current.setAttribute('data-index', table._draggable.prev_index);

      this.setAttribute('data-index', table._draggable.next_index);
      this.innerHTML = e.dataTransfer.getData('text/html');
      this.querySelector('meta').remove();
    } else {
      table._draggable.next_index = null;
    }

    return false;
  }

  return _draggable[event];
}


/**
 * app.layout.dropdown
 *
 * Helper for dropdown, returns requested object method
 *
 * available methods:
 *  - open (e <Object>)
 *  - close (e <Object>)
 *  - toggle (e <Object>)
 *
 * @param <String> event
 * @param <ElementNode> element
 * @param <ElementNode> dropdown
 * @return <Function>
 */
app.layout.dropdown = function(event, element, dropdown) {
  if (! event || ! element || ! dropdown) {
    return app.error('app.view.dropdown', arguments);
  }


  var _dropdown = {};

  _dropdown.open = function(e) {
    if (element.getAttribute('aria-expanded') === 'true') {
      return;
    }
    if (e && e.target && (e.target === element || e.target.offsetParent === element)) {
      return;
    }

    element.parentNode.classList.add('open');
    element.setAttribute('aria-expanded', true);

    dropdown.classList.add('open');
    dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', true);
  }

  _dropdown.close = function(e) {
    if (element.getAttribute('aria-expanded') === 'false') {
      return;
    }
    if (e && e.target && (e.target === element || e.target.offsetParent === element)) {
      return;
    }

    element.parentNode.classList.remove('open');
    element.setAttribute('aria-expanded', false);

    dropdown.classList.remove('open');
    dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', false);
  }

  _dropdown.toggle = function() {
    if (element.getAttribute('aria-expanded') === 'false') {
      _dropdown.open();
    } else {
      _dropdown.close();
    }
  }

  return _dropdown[event];
}


/**
 * app.layout.collapse
 *
 * Helper for collapsable, returns requested object method
 *
 * available methods:
 *  - open (e <Object>)
 *  - close (e <Object>)
 *  - toggle (e <Object>)
 *
 * @param <String> event
 * @param <ElementNode> element
 * @param <ElementNode> collapsable
 * @return <Function>
 */
app.layout.collapse = function(event, element, collapsable) {
  if (! event || ! element || ! collapsable) {
    return app.error('app.view.dropdown', arguments);
  }


  var _collapse = {};

  _collapse.open = function(e) {
    console.log('_open', e && e.target);
    if (element.getAttribute('aria-expanded') === 'true') {
      return;
    }
    if (e && e.target && (e.target === element || e.target.offsetParent === element)) {
      return;
    }

    collapsable.classList.add('collapse');
    collapsable.classList.add('in');
    collapsable.setAttribute('aria-expanded', true);
    element.setAttribute('aria-expanded', true);
    element.classList.remove('collapsed');
  }

  _collapse.close = function(e) {
    console.log('_close', e && e.target);
    if (element.getAttribute('aria-expanded') === 'false') {
      return;
    }
    if (e && e.target && (e.target === element || e.target.offsetParent === element)) {
      return;
    }

    collapsable.classList.remove('collapse');
    collapsable.classList.remove('in');
    collapsable.setAttribute('aria-expanded', false);
    element.setAttribute('aria-expanded', false);
    element.classList.add('collapsed');
  }

  _collapse.toggle = function() {
    if (element.getAttribute('aria-expanded') === 'false') {
      _collapse.open();
    } else {
      _collapse.close();
    }
  }

  return _collapse[event];
}



app.memory = {};

/**
 * app.memory.set
 *
 * Sets persistent storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.memory.set = function(key, value) {
  return app.utils.storage(true, 'set', key, value);
}


/**
 * app.memory.get
 *
 * Gets persistent storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.memory.get = function(key) {
  return app.utils.storage(true, 'get', key);
}


/**
 * app.memory.has
 *
 * Checks existence for persistent storage entry by key, could match value
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.memory.has = function(key, value) {
  return app.utils.storage(true, 'has', key, value);
}


/**
 * app.memory.del
 *
 * Remove persistent storage entry by key
 *
 * @param <String> key
 * @return
 */
app.memory.del = function(key) {
  return app.utils.storage(true, 'del', key);
}


/**
 * app.memory.reset
 *
 * Reset persistent storage
 *
 * @return
 */
app.memory.reset = function() {
  return app.utils.storage(true, 'reset');
}



app.store = {};

/**
 * app.store.set
 *
 * Sets storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.store.set = function(key, value) {
  return app.utils.storage(false, 'set', key, value);
}


/**
 * app.store.set
 *
 * Gets storage entry by key
 *
 * @param <String> key
 * @return
 */
app.store.get = function(key) {
  return app.utils.storage(false, 'get', key);
}


/**
 * app.store.has
 *
 * Checks existence for storage entry by key, could match value
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.store.has = function(key, value) {
  return app.utils.storage(false, 'has', key, value);
}


/**
 * app.memory.del
 *
 * Remove storage entry by key
 *
 * @param <String> key
 * @return
 */
app.store.del = function(key) {
  return app.utils.storage(false, 'del', key);
}


/**
 * app.store.reset
 *
 * Reset storage
 *
 * @return
 */
app.store.reset = function() {
  return app.utils.storage(false, 'reset');
}



app.controller = {};

/**
 * app.controller.setTitle
 *
 * Get or set the controller cursor,
 * it contains current position in the app { view, action, index }
 *
 * @param <Object> loc
 * @return <Object> loc
 */
app.controller.cursor = function(loc) {
  if (loc) {
    if (typeof loc !== 'object') {
      return app.error('app.controller.cursor', arguments);
    }

    app.memory.set('cursor', loc);

    return loc;
  }

  loc = app.memory.get('cursor');

  return loc;
}


/**
 * app.controller.spoof
 *
 * Captures the app position using location.href
 *
 * @param <Object> loc
 */
app.controller.spoof = function() {
  var loc = { view: null, action: null, index: null };

  // path
  if (location.href.indexOf('?') != -1) {
    var ref = location.href.split('?')[1];

    // querystring
    if (ref.indexOf('&') != -1) {
      ref = ref.split('&');

      // values
      if (ref[1].indexOf('=') != -1) {
        var sub = ref[1].split('=');
        loc = { view: ref[0], action: sub[0], index: parseInt(sub[1]) };
      } else {
        loc = { view: ref[0], action: ref[1] };
      }
    } else {
      loc.view = ref;
    }
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
  if (title) {
    title += ' – ' + app._runtime.title;
  } else {
    title = app._runtime.title;
  }

  if (app._runtime.system.navigator === 'safari') {
    location.href = url;
    return;
  } else {
    history.replaceState(null, title, url);
  }

  app.controller.setTitle(title);
}


/**
 * app.controller.setTitle
 *
 * Set and store the document title
 *
 * @param <String> title
 */
app.controller.setTitle = function(title) {
  document.title = title;

  if (! app._runtime.title) {
    app._runtime.title = title;
  }
}


/**
 * app.controller.retrieve
 *
 * Restores data for current session and loads file and scripts, returns to callback
 *
 * @global <Object> store
 * @param <Function> callback
 * @param <Array> routine
 * @return
 */
app.controller.retrieve = function(callback, routine) {
  if (typeof callback !== 'function' || typeof routine !== 'object') {
    return app.stop('app.controller.retrieve', arguments);
  }


  var _retrieve = function(fn, schema) {
    if (typeof fn !== 'string' || typeof schema !== 'object') {
      return app.stop('app.controller.retrieve() > _retrieve', arguments);
    }

    var _data = window.store;

    if (_data[fn] && typeof _data[fn] === 'object') {
      return _data[fn];
    }

    _data = {};

    for (var i = 0; i < schema.length; i++) {
      var obj = app.store.get(fn + '_' + schema[i]);

      if (! obj) {
        return app.stop('app.controller.retrieve() > _retrieve', 'obj');
      }

      _data[schema[i]] = obj;
    }

    return _data;
  }


  for (var i = 0; i < routine.length; i++) {
    if (routine[i].file) {
      routine[i].file = '../' + routine[i].file;
    }

    window.store[routine[i].fn] = _retrieve(routine[i].fn, routine[i].schema);
  }

  callback();
}


/**
 * app.controller.store
 *
 * Memoizes data from current session, returns to callback
 *
 * @global <Object> store
 * @param <Function> callback
 * @param <String> fn
 * @param <Object> schema
 * @param <Object> data
 * @return
 */
app.controller.store = function(callback, fn, schema, data) {
  if (typeof callback !== 'function' || typeof fn !== 'string' || typeof schema !== 'object' || typeof data !== 'object') {
    return app.stop('app.controller.store', arguments);
  }

  var source = window.store[fn];

  if (! source) {
    return app.stop('app.controller.store', 'source');
  }


  var _store = function(key, values) {
    if (typeof key !== 'string' || typeof values !== 'object') {
      return app.stop('app.controller.store() > _store', arguments);
    }

    if (! source[key]) {
      return app.stop('app.controller.store() > _store', 'source[key]');
    }

    var _data = values;
    var obj = app.store.set(fn + '_' + key, _data);

    if (! obj) {
      return app.stop('app.controller.store() > _store', 'obj');
    }

    return _data;
  }


  var _current_timestamp = new Date();
  _current_timestamp = app.utils.dateFormat(_current_timestamp, 'Q');


  var keys = Object.keys(data);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var values = data[key];

    if (schema.indexOf(key) === -1 || ! Object.keys(values).length) {
      return app.stop('app.controller.store', 'keys');
    }

    window.store[fn][key] = _store(key, values);
  }

  app.memory.del('save_reminded');

  app.memory.set('last_stored', _current_timestamp);

  callback();
}


/**
 * app.controller.clear
 *
 * Reset the current session data
 *
 * @global <Object> config
 * @global <Object> store
 * @return <Boolean>
 */
app.controller.clear = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.controller.clear');
  }

  var fn = config.app;
  var schema = config.schema;

  for (var i = 0; i < schema.length; i++) {
    app.store.del(fn + '_' + schema[i]);

    if (window.store && (fn + '_' + schema[i]) in window.store) {
      delete window.store[fn + '_' + schema[i]];
    }
  }

  app.memory.del('last_stored');

  return true;
}



app.start = {};

/**
 * app.start.loader
 * //TODO rename
 *
 * Controls the current load status
 *
 * @param <Number> phase
 */
app.start.loader = function(phase) {
  var lw = document.getElementById('loader-wait');
  var lo = document.getElementById('loader-open');

  switch (phase) {
    case 2:
      lo.setAttribute('style', 'visibility: visible;');
      lw.setAttribute('style', 'visibility: visible;');
    break;
    case 1:
      lo.setAttribute('style', 'visibility: visible;');
      lw.setAttribute('style', 'visibility: hidden;');
    break;
    default:
      lw.setAttribute('style', 'visibility: visible;');
      lo.setAttribute('style', 'visibility: hidden;');
  }
}


/**
 * app.start.loadAttempt
 *
 * Attemps to load files and scripts, returns to callback
 *
 * @param <Function> callback
 * @param <String> fn
 * @param <String> file
 * @param <Object> schema
 * @param <Boolean> memo
 * @return
 */
app.start.loadAttempt = function(callback, fn, file, schema, memo) {
  var config = window.config;

  if (! config) {
    return app.stop('app.start.loadAttempt');
  }

  if (! callback || ! fn || ! file || ! schema) {
    return app.stop('app.start.loadAttemp', arguments);
  }

  if (typeof callback !== 'function' || typeof fn !== 'string' || typeof file !== 'string' || typeof schema !== 'object') {
    return app.stop('app.start.loadAttemp', arguments);
  }

  var loaded = false;
  var max_attempts = config.openAttempts;

  app.os.scriptOpen(function() {
    if (! window[fn]) {
      console.info('app.start.loadAttempt', fn);
      //TODO check
      //return app.error('app.start.loadAttemp', 'window[fn]');
    }

    for (var i = 0; i < schema.length; i++) {
      if (! memo) {
        loaded = true;

        continue;
      }

      if (schema[i] in window[fn] === false) {
        return app.error('app.start.loadAttemp', 'schema[i]');
      }

      loaded = app.store.set(fn + '_' + schema[i], window[fn][schema[i]]);
    }

    callback(loaded);
  }, file, fn, max_attempts);
}


/**
 * app.start.loadComplete
 *
 * Fires on "start" load complete
 *
 * @global <Object> config
 * @param <String> session_resume
 * @return
 */
app.start.loadComplete = function(session_resume) {
  var config = window.config;

  if (! config) {
    return app.stop('app.start.loadComplete');
  }

  if (! session_resume) {
    return app.start.loader(1);
  }

  session_resume = config.savePath + '/' + session_resume; 

  app.start.loadAttempt(function(loaded) {
    if (loaded) {
      app.start.redirect(true);
    } else {
      app.start.loader(1);
    }
  }, config.app, session_resume, config.schema);

  app.start.loader(1);
}


/**
 * app.start.redirect
 *
 * Tries to redirect after a delay
 *
 * @param <Boolean> loaded
 */
app.start.redirect = function(loaded) {
  var _wait = function() {
    app.start.loader(false);

    app.redirect();

    this.clearTimeout();
  }

  setTimeout(_wait, 1000);
}


/**
 * app.start.alternative
 *
 * Display messages with info and alternatives to help to execute app 
 *
 * @global <Object> config
 * @return
 */
app.start.alternative = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.start.alternative');
  }


  var alt = [
    'Purtroppo non è possibile eseguire l\'applicazione per via di restrizioni nel programma {browser}.',
    'VAI NELLA CARTELLA "{alt_exec_folder}" E APRI "{alt_exec_platform}".'
  ];


  var system = app.utils.system();
  var navigators = {
    'chrome': 'Chrome',
    'safari': 'Safari',
    'firefox': 'Firefox',
    'edge': 'Edge',
    'ie': 'Explorer',
    'iemobile': 'Explorer'
  };

  var browser = navigators[system.navigator];
  var exec_platform = (system.platform in config.altExecPlatform ? system.platform : null);

  if (exec_platform && config.altExecFolder && config.altExecFolder) {
    var alt_exec_folder = config.altExecFolder;
    var alt_exec_platform = config.altExecPlatform[exec_platform];

    alt = alt[0] + '\n\n' + alt[1];
    alt = alt.replace('{alt_exec_folder}', alt_exec_folder).replace('{alt_exec_platform}', alt_exec_platform);
  } else {
    alt = alt[0];
  }

  alt_electron = alt.replace('{browser}', browser);

  app.start.loader(1);

  return app.error(alt_electron);
}


/**
 * app.start.load
 *
 * Default "start" load function
 *
 * @global <Object> config
 * @return
 */
app.start.load = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.start.load');
  }

  app.checkConfig(config);


  var exec = true;

  if (
    ('sessionStorage' in window === false && 'localStorage' in window === false) ||
    'history' in window === false ||
    'atob' in window === false ||
    'btoa' in window === false
  ) {
    exec = false;
  }

  if (
    window.sessionStorage === undefined ||
    'replaceState' in window.history === false ||
    'checkValidity' in document.createElement('form') === false
  ) {
    exec = false;
  }


  app.session(config);


  if (! exec) {
    app.start.alternative();

    setTimeout(function() {
      app.stop();

      this.clearTimeout();
    }, 0);

    return;
  }


  var session_resume = app.resume(config);


  var title = config.name;
  app.controller.setTitle(title);

  var open_action = document.getElementById('start-action-open');
  app.utils.addEvent('click', open_action, app.openSession);

  var new_action = document.getElementById('start-action-new');
  app.utils.addEvent('click', new_action, app.newSession);

  var auxs_loaded = true;

  // load extensions
  var routine = config.auxs || {};

  for (var i = 0; i < routine.length; i++) {
    app.start.loadAttempt(function(aux_loaded) {
      if (! aux_loaded) {
        auxs_loaded = false;
      }
    }, routine[i].fn, routine[i].file, routine[i].schema, routine[i].memo);
  }

  if (auxs_loaded) {
    app.start.loadComplete(session_resume);
  } else {
    return app.error('app.start.alternative', 'aux_loaded');
  }
}



app.main = {};

/**
 * app.main.loadView
 *
 * Init "main" function that fires when "main" document is ready
 *
 * @global <Object> config
 * @param <Object> loc
 * @return
 */
app.main.loadView = function(loc) {
  var config = window.config;

  if (! config) {
    return app.stop('app.main.load');
  }

  var view = document.getElementById('view');

  var routes = config.routes;
  var actions = {};

  Array.prototype.forEach.call(Object.keys(config.events), function(event) {
    actions[config.events[event]] = event;
  });

  if (! loc) {
    loc = app.controller.spoof();
  }

  var default_route = config.defaultRoute;
  var route = default_route + '.html';
  var pass = true;

  if (loc && typeof loc === 'object') {
    if (loc.view) {
      if (routes[loc.view]) {
        route = loc.view + '.html';
      } else {
        pass = false;
      }

      if (loc.action) {
        if (routes[loc.view][loc.action]) {
          route = routes[loc.view][loc.action] + '.html';
          route += '?' + loc.action;
        } else {
          pass = false;
        }

        //TODO index <int>|<string>
        if (loc.index) {
          route += '&id=' + loc.index;
        }
      }
    } else {
      loc = { 'view': default_route };
    }
  } else {
    pass = false;
  }

  if (pass && typeof route === 'string') {
    app.controller.cursor(loc);

    // set view
    view.removeAttribute('height');
    view.setAttribute('src', 'views/' + route);

    // view layout (list|wide)
    if (actions[loc.action] === 'list') {
      document.body.classList.add('full-width');
    } else {
      document.body.classList.remove('full-width');
    }

    // main navigation
    var nav = document.getElementById('master-navigation');
    var nav_selector_active = nav.querySelector('li.active');
    var nav_selector_current = nav.querySelector('a[data-view="' + loc.view + '"]');

    if (nav_selector_active) {
      nav_selector_active.classList.remove('active');
    }
    if (nav_selector_current) {
      nav_selector_current.parentNode.classList.add('active');
    }
  } else {
    return app.stop('app.main.load', arguments);
  }
}


/**
 * app.main.controlView
 *
 * Control "main" function handling actions, could return object constructor
 *
 * avalaible methods:
 *  - getID ()
 *  - setAction ()
 *  - getAction ()
 *  - setTitle (title <String>)
 *  - getTitle ()
 *  - setMsg (msg <String>)
 *  - getMsg ()
 *  - setURL (path <String>, qs <String>)
 *  - redirect ()
 *  - refresh ()
 *  - resize ()
 *  - selection ()
 *  - export ()
 *  - prepare ()
 *  - prevent ()
 *  - open () <=> prepare ()
 *  - add () <=> prepare ()
 *  - edit () <=> prepare ()
 *  - update () <=> prepare ()
 *  - delete () <=> prevent ()
 *  - close () <=> prevent ()
 *  - history ()
 *  - receive ()
 *
 * @global <Object> config
 * @global <Object> main
 * @param <Object> e
 * @return
 */
app.main.controlView = function(e) {
  var config = window.config;

  if (! config) {
    return app.stop('app.main.controlView');
  }

  var main = window.main;

  if (! e.data) {
    return app.error('app.main.controlView', arguments);
  }

  try {
    var ctl = JSON.parse(e.data);
  } catch (err) {
    return app.error('app.main.controlView', err);
  }


  // standard events
  var _s_events = { 'resize': 'resize', 'refresh': 'refresh', 'export': 'export' };

  var _events = app.utils.extendObject(config.events, _s_events);
  var _event = null;

  // check is allowed action
  if (ctl.action && ctl.action in _events) {
    _event = ctl.action;
  } else {
    return app.error('app.main.controlView', ctl);
  }

  var _loc = app.utils.extendObject({}, ctl);
  var _href = '';
  var _title = '';
  var _msg = '';


  var _control = {};

  _control.getID = function() {
    var id = parseInt(ctl.index) || 0;

    return id;
  }

  _control.setAction = function() {
    if (ctl.action in _events === false) {
      return app.error('app.main().setAction', 'ctl');
    }

    _loc.action = _events[_loc.action];

    return _loc.action;
  }

  _control.getAction = function() {
    if (! _loc.action) {
      return app.error('app.main().setAction', 'loc');
    }

    return _loc.action;
  }

  _control.setTitle = function(title) {
    if (! (title && typeof title === 'string')) {
      return app.error('app.main().setTitle', 'title');
    }

    _title = title;

    return _title;
  }

  _control.getTitle = function() {
    return _title ? _title : ((ctl.title && typeof ctl.title === 'string') && ctl.title);
  }

  _control.setMsg = function(msg) {
    if (! (msg && typeof msg === 'string')) {
      return app.error('app.main().setTitle', 'title');
    }

    _msg = msg;

    return _msg;
  }

  _control.getMsg = function() {
    return _msg ? _msg : ((ctl.msg && typeof ctl.msg === 'string') && ctl.msg);
  }

  _control.setURL = function(path, qs) {
    _href = 'index.html';

    _href += (path || ctl.view) && '?' + ((path && typeof path === 'string') ? path : ctl.view);
    _href += qs && '&' + ((qs && typeof qs === 'string') && qs);

    return _href;
  }

  _control.getURL = function() {
    return _href;
  }

  _control.redirect = function() {
    var _href = _control.getURL();

    location.href = href;
  }

  _control.refresh = function() {
    location.reload();
  }

  _control.resize = function() {
    if (! ctl.height) {
      return; // silent fail
    }

    var height = parseInt(ctl.height);
    var view = document.getElementById('view');

    view.height = height;
    view.scrolling = 'no';
  }

  _control.selection = function() {
    _control.refresh();
  }

  _control.export = function() {
    if (! ctl.data || ! (ctl.file && typeof ctl.file === 'object')) {
      return app.error('app.main.controlView().export', ctl);
    }

    if (! (ctl.file.name && typeof ctl.file.name === 'string') || ! (ctl.file.options && typeof ctl.file.options === 'object')) {
      return app.error('app.main.controlView().export', 'file');
    }

    var file = new File(
      [ ctl.data ],
      ctl.file.name,
      (ctl.file.options || {})
    );

    saveAs(file);
  }

  // generic method for all actions
  _control.prepare = function() {
    var action = _control.setAction();
    var id = _control.getID();

    _control.setURL(null, action + (id && '=' + id));

    if (ctl.history) {
      _control.history();
    }

    _control.receive();
  }

  // generic method for prevented actions like delete
  _control.prevent = function() {
    var action = _control.setAction();
    var msg = _control.getMsg();

    if (! msg) {
      return app.error('app.main().' + event, ctl);
    }

    _control.setURL(null, action);

    if (! window.confirm(msg)) {
      return;
    }

    _control.receive();
  }

  _control.open = _control.prepare;

  _control.add = _control.prepare;

  _control.edit = _control.prepare;

  _control.update = _control.prepare;

  _control.delete = _control.prevent;

  _control.close = _control.prevent;

  _control.history = function() {
    var _title = _control.getTitle();
    var _url = _control.getURL();

    app.controller.history(_title, _url);
  }

  _control.receive = function() {
    // no submit, reload
    if (! (ctl.submit && ctl.data)) {
      app.main.loadView(_loc);

      return; // silent fail
    }

    var action = _control.getAction();

    try {
      var _data = JSON.parse(ctl.data);

      app.controller.store(function() {
        var loc = app.controller.spoof();

        loc.action = null;
        loc.index = null;

        // action update no needs reload
        if (action != 'update') {
          app.main.loadView(loc);
        }
      }, config.app, config.schema, _data);
    } catch (err) {
      return app.error('main.controlView.submit', err);
    }
  }


  /**
   * main.controlView hook
   *
   * @param <Object> _control
   * @param <String> _event
   * @param <Object> ctl
   */
  if (main && 'controlView' in main && typeof main.controlView === 'function') {
    return main.controlView(_control, _event, ctl);
  } else {
    return _control[_event]();
  }
}


/**
 * app.main.action
 *
 * Actions "main", could return object constructor
 *
 * avalaible methods:
 *  - menu ()
 *
 * @global <Object> config
 * @global <Object> main
 * @param <NodeElement> element
 * @param <String> event
 * @return
 */
app.main.action = function(element, event) {
  var main = window.main;

  if (! element || typeof event !== 'string') {
    return app.error('app.main.action', arguments);
  }


  var _action = {};

  _action.menu = function() {
    if ('jQuery' in window && 'collapse' in jQuery.fn) {
      return;
    }

    var menu = document.querySelector(element.getAttribute('data-target'));

    if (! element.getAttribute('data-is-visible')) {
      element.setAttribute('data-is-visible', true);
      element.setAttribute('aria-expanded', false);
      menu.setAttribute('aria-expanded', false);
    }

    app.layout.collapse('toggle', element, menu)();

    app.utils.addEvent('click', document.body, app.layout.collapse('close', element, menu));
  }


  /**
   * main.action hook
   *
   * @param <Object> _action
   * @param <NodeElement> element
   * @param <String> event
   */
  if (main && 'action' in main && typeof main.action === 'function') {
    return main.action(_action, element, event);
  } else {
    return _action[event]();
  }
}


/**
 * app.main.setupData
 *
 * Setup "main" data
 *
 * @global <Object> main
 */
app.main.setupData = function() {
  var main = window.main;

  // main.setupData hook
  if (main && 'setupData' in main && typeof main.setupData === 'function') {
    main.setupData();
  }

  app.main.loadView();
}


/**
 * app.main.load
 *
 * Default "main" load function
 *
 * @global <Object> config
 * @global <Object> main
 * @global <Object> store
 * @return
 */
app.main.load = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.main.load');
  }

  app.checkConfig(config);


  app.session(config, true);


  app.resume(config, true);


  var title = config.name;

  var routine = config.auxs || {};
  routine.push({ file: '', fn: config.app, schema: config.schema });

  app.controller.retrieve(app.main.setupData, routine);
  app.controller.setTitle(title);


  var navbar_brand = document.getElementById('brand');
  brand.innerHTML = title;


  var open_actions = document.querySelectorAll('.main-action-open');

  if (open_actions.length) {
    Array.prototype.forEach.call(open_actions, function(element) {
      app.utils.addEvent('click', element, app.openSession);
    });
  }


  var new_actions = document.querySelectorAll('.main-action-new');

  if (new_actions.length) {
    Array.prototype.forEach.call(new_actions, function(element) {
      app.utils.addEvent('click', element, app.newSession);
    });
  }


  var save_actions = document.querySelectorAll('.main-action-save');

  if (save_actions.length) {
    Array.prototype.forEach.call(save_actions, function(element) {
      app.utils.addEvent('click', element, app.saveSession);
    });
  }


  app.utils.addEvent('message', window, app.main.controlView);
}


/**
 * app.main.unload
 *
 * Default "main" unload function
 *
 * @return <Boolean>
 */
app.main.unload = function() {
  if (app.memory.has('save_reminded') || app.memory.get('last_time') === app.memory.get('last_stored')) {
    return;
  }

  app.memory.set('save_reminded', true);

  return true;
}



app.view = {};

/**
 * app.view.spoof
 *
 * Captures the current position inside view using location.href
 *
 * @return <Object> loc
 */
app.view.spoof = function() {
  var loc = { action: null, index: null };

  // path
  if (location.href.indexOf('?') != -1) {
    var ref = location.href.split('?')[1];

    // querystring
    if (ref.indexOf('&') != -1) {
      ref = ref.split('&');

      // values
      if (ref[1].indexOf('=') != -1) {
        var sub = ref[1].split('=');
        loc = { action: ref[0], index: parseInt(sub[1]) };
      } else {
        loc = { action: ref[1] };
      }
    }
  }

  return loc;
}


/**
 * app.view.open
 *
 * Control "view" function, returns object contructor
 *
 * avalaible methods:
 *  - uninitialized (funcName <String>)
 *  - begin ()
 *  - end ()
 *  - setID (id <Number>)
 *  - getID ()
 *  - setEvent (event <String>)
 *  - getEvent ()
 *  - setTitle (section_title <String>, view_title <String>, id <String>)
 *  - setActionHandler (label <String>, id <String>)
 *  - denySubmit ()
 *  - fillTable (table <NodeElement>, _data <Object>, _order <Array>)
 *  - fillForm (form <NodeElement>, _data <Object>)
 *  - fillSelection (_data <Object>, id <Number>)
 *  - fillCTA (id <Number>)
 *
 * @global <Object> control
 * @param <Array> events
 * @param <Object> data
 * @param <NodeElement> form
 * @return <Object> _open
 */
app.view.open = function(events, data, form) {
  var control = window.control;

  if (! control) {
    return app.error('app.view.open', 'control');
  }

  if ((events && events instanceof Array === false) || typeof data !== 'object') {
    return app.error('app.view.open', arguments);
  }

  var _initialized = false;

  
  var ctl = {};


  var _open = {};

  _open.uninitialized = function(funcName) {
    return app.error('app.view.open().uninitialized', null, funcName);
  }

  _open.begin = function() {
    var cursor = app.controller.cursor();

    var view = null;
    var event = null;
    var id = 0;

    if ('view' in cursor) {
      view = cursor.view;
    }

    var routes = config.routes;
    var actions = {};

    Array.prototype.forEach.call(Object.keys(config.events), function(event) {
      actions[config.events[event]] = event;
    });

    var loc = app.view.spoof();

    var default_event = config.defaultEvent;  
    var pass = true;

    if (loc && typeof loc === 'object') {
      if (loc.action) {
        if (routes[view][loc.action]) {
          event = actions[loc.action];
        } else {
          pass = false;
        }

        if (loc.index) {
          id = parseInt(loc.index);
        }
      } else {
        event = default_event;
      }
    } else {
      pass = false;
    }

    if ((events && events.indexOf(event) === -1) || ! pass) {
      return app.error();
    }

    control.temp = {};

    _initialized = true;

    if (event) {
      event = _open.setEvent(event);

      if (event === 'add') {
        id = app.view.getLastID(data);
      }
    }

    id = _open.setID(id);

    return id;
  }

  _open.end = function() {
    _initialized || _open.uninitialized('end');

    app.view.resizeView(false);

    if (form) {
      control.temp.form = true;
      control.temp.form_submit = false;
      control.temp.form_elements = form.elements;
      control.temp.form_changes = null;

      // check for edit changes
      try {
        var _changes = app.view.getFormData(form.elements);
        control.temp.form_changes = _changes && JSON.stringify(_changes);
      } catch {}
    }

    _initialized = false;
  }

  _open.setID = function(id) {
    _initialized || _open.uninitialized('setID');

    control.temp.id = parseInt(id);

    return control.temp.id;
  }

  _open.getID = function() {
    _initialized || _open.uninitialized('getID');

    if (control.temp.id) {
      return control.temp.id;
    }

    return parseInt(control.temp.id);
  }

  _open.setEvent = function(event) {
    _initialized || _open.uninitialized('setEvent');

    if ((events && events.indexOf(event) === -1)) {
      return app.error('app.view.open().setEvent', arguments);
    }

    control.temp.event = event;

    return control.temp.event;
  }

  _open.getEvent = function() {
    _initialized || _open.uninitialized('getEvent');

    return control.temp.event;
  }

  _open.setTitle = function(section_title, view_title, id) {
    _initialized || _uninitialized('setTitle');

    var event = _open.getEvent();

    var _view_title = document.getElementById('view-title');
    var _section_title = document.getElementById('section-title');

    id = parseInt(id) || _open.getID();

    if (event === 'edit') {
      section_title += ' # ' + id;
    }

    if (view_title != undefined) {
      _view_title.innerHTML = view_title;
    }
    if (section_title != undefined) {
      _section_title.innerHTML = section_title;
    }
  }

  _open.setActionHandler = function(label, id) {
    _initialized || _open.uninitialized('setActionHandler');

    var event = _open.getEvent();

    id = parseInt(id) || _open.getID();

    var action_handler = document.getElementById('submit');
    var action_index = document.getElementById('index');

    if (action_index) {
      action_index.setAttribute('value', id);
    } else {
      return app.error('app.view.open().setActionHandler', null, 'action_index');
    }

    if (action_handler) {
      var action_handler_event = action_handler.getAttribute('onclick');
      action_handler_event = action_handler_event.replace('{action_event}', event);
      action_handler.setAttribute('onclick', action_handler_event);
    }

    if (label && typeof label === 'string') {
      action_handler.innerHTML = label;
    }
  }

  _open.denySubmit = function() {
    _initialized || _open.uninitialized('denySubmit');

    var action_handler = document.getElementById('submit');

    if (action_handler) {
      action_handler.removeAttribute('onclick');
      action_handler.setAttribute('disabled', '');
    }

    if (form) {
      form.setAttribute('action', '');
    }
  }

  _open.fillTable = function(table, _data, _order) {
    _initialized || _open.uninitialized('fillTable');

    if (! table) {
      return app.error('app.view.open().fillTable', arguments);
    }

    if (_data && typeof _data === 'object') {
      data = _data;
    }

    var order = (_order && _order instanceof Array) ? _order : Object.keys(data);

    var _args = Object.values(arguments).slice(3);

    var tbody = table.querySelector('tbody');
    var trow_tpl = tbody.querySelector('tr.tpl').cloneNode(true);
    trow_tpl.classList.remove('tpl');

    var _rows = '';

    /**
     * control.renderRow hook
     *
     * @param <NodeElement> trow_tpl
     * @param <Number> id
     * @param <Object> data[id]
     * @param <Object> _args
     */
    if ('renderRow' in control && typeof control.renderRow === 'function') {
      Array.prototype.forEach.call(order, function(id) {
        var row = control.renderRow(trow_tpl, id, data[id], _args);
        _rows += row.outerHTML;
      });

      tbody.innerHTML = _rows;
    }

    return { data: data, rows: _rows, tpl: trow_tpl, args: _args };
  }

  _open.fillForm = function(form, _data) {
    _initialized || _open.uninitialized('fillForm');

    if (! form) {
      return app.error('app.view.open().fillForm', arguments);
    }

    if (_data && typeof _data === 'object') {
      data = _data;
    }

    var _args = Object.values(arguments).slice(2);

    /**
     * control.fillForm hook
     *
     * @param <Object> data
     * @param <Object> _args
     */
    if ('fillForm' in control && typeof control.fillForm === 'function') {
      control.fillForm(data, _args);
    }

    return { data: data, args: _args };
  }

  _open.fillSelection = function(_data, id) {
    _initialized || _open.uninitialized('fillSelection');

    if (! (_data && typeof _data === 'object')) {
      return app.error('app.view.open().fillSelection', arguments);
    }

    var selection = document.getElementById('selection');

    id = id || null;

    if (id) {
      selection.innerHTML = app.layout.renderSelectOptions(selection, _data, id);
      selection.value = id;
    } else {

      selection.parentNode.classList.add('hidden');
    }
  } 

  _open.fillCTA = function(id) {
    _initialized || _open.uninitialized('fillCTA');

    id = parseInt(id) || null;

    var section_actions_top = document.getElementById('section-actions-top');
    var section_actions_bottom = document.getElementById('section-actions-bottom');

    if (section_actions_top) {
      if (id) {
        section_actions_top.innerHTML = section_actions_top.innerHTML.replace(/\{id\}/g, id);
      } else {
        Array.prototype.forEach.call(section_actions_top.querySelectorAll('.action'), function(element) {
          element.remove();
        });
      }
    }

    if (section_actions_bottom) {
      if (id) {
        section_actions_bottom.innerHTML = section_actions_bottom.innerHTML.replace(/\{id\}/g, id);
      } else {
        Array.prototype.forEach.call(section_actions_bottom.querySelectorAll('.action'), function(element) {
          element.remove();
        });
      }
    }
  }

  return _open;
}


/**
 * app.view.action
 *
 * Actions "view", returns object constructor
 *
 * avalaible methods:
 *  - uninitialized (funcName <String>)
 *  - begin ()
 *  - end ()
 *  - getID ()
 *  - validateForm () 
 *  - prepare (_data <Object>, _submit <Boolean>)
 *  - prevent (_data <Object>, _submit <Boolean>, title <String>, name)
 *  - open (_data <Object>, _submit <Boolean>) <=> prepare ()
 *  - add (_data <Object>, _submit <Boolean>) <=> prepare ()
 *  - edit (_data <Object>, _submit <Boolean>) <=> prepare ()
 *  - update (_data <Object>, _submit <Boolean>)<=> prepare ()
 *  - delete (_data <Object>, _submit <Boolean>, title <String>, name) <=> prevent ()
 *  - close (_data <Object>, _submit <Boolean>, title <String>, name) <=> prevent ()
 *  - selection
 *  - print ()
 *
 * @global <Object> control
 * @param <Array> events
 * @param <String> event
 * @param <NodeElement> element
 * @param <Object> data
 * @param <NodeElement> form
 * @return <Object> _action
 */
app.view.action = function(events, event, element, data, form) {
  var control = window.control;

  if (! control) {
    return app.error('app.view.action', 'control');
  }

  if ((events && (events instanceof Array === false)) || ! event || ! element) {
    return app.error('app.view.action', arguments);
  }

  var _initialized = false;

  
  var ctl = {};


  var _action = {};

  _action.uninitialized = function(funcName) {
    return app.error('app.view.action().uninitialized', null, funcName);
  }

  _action.begin = function() {
    if ((events && events.indexOf(event) === -1)) {
      return app.error();
    }

    _initialized = true;
  }

  _action.end = function() {
    _initialized || _action.uninitialized('end');

    _initialized = false;
  }

  _action.getID = function() {
    _initialized || _action.uninitialized('getID');

    var id = 0;

    try {
      var trow = element.parentNode.parentNode;

      id = trow.getAttribute('data-index');
    } catch {}

    if (! id && control.temp.id) {
      id = control.temp.id;
    }

    return parseInt(id);
  }

  _action.validateForm = function() {
    _initialized || _action.uninitialized('validateForm');

    var action_submit = document.getElementById('real-submit');
    var action_index = document.getElementById('index');

    var id = action_index.getAttribute('value');
    id = parseInt(id);

    // not valid form
    if (form.checkValidity()) {
      return false;
    }

    Array.prototype.forEach.call(form.elements, function(field) {
      var closest_group = null;

      if (field.parentNode.className.indexOf('form-group') != -1) {
        closest_group = field.parentNode;
      } else if (field.parentNode.parentNode.className.indexOf('form-group') != -1) {
        closest_group = field.parentNode.parentNode;
      }
      if (closest_group && closest_group.classList) {
        if (closest_group.querySelector(':invalid')) {
          closest_group.classList.remove('has-success');
          closest_group.classList.add('has-error');
        } else {
          closest_group.classList.remove('has-error');
          closest_group.classList.add('has-success');
        }
      }
    });

    action_submit.click();

    // valid form
    return true;
  }

  _action.prepare = function(_data, _submit) {
    _initialized || _action.uninitialized(event);

    if (typeof _data !== 'object') {
      return app.error('app.view.action().' + event, arguments);
    }

    var index = _action.getID();

    try {
      ctl.action = event;

      if (index) {
        ctl.index = parseInt(index);

        // event update no needs history
        if (event != 'update') {
          ctl.history = true;
        }
      }

      if (_submit === true) {
        ctl.submit = true;
        ctl.data = JSON.stringify(_data);

        // check for edit changes
        if (control.temp.form) {
          control.temp.form_submit = true;

          var _changes = app.view.getFormData(form.elements);
          control.temp.form_changes = _changes && JSON.stringify(_changes);
        }
      }

      return ctl;
    } catch (err) {
      return app.error('app.view.action().' + event, null, err);
    }
  }

  _action.prevent = function(_data, _submit, title, name) {
    _initialized || _action.uninitialized(event);

    if (typeof title !== 'string') {
      return app.error('app.view.action().' + event, arguments);
    }

    var event_label = config.events ? config.events[event] : event;

    if (title && (typeof name === 'number' || typeof name === 'string')) {
      ctl.msg  = 'Are you sure to ' + event_label + ' ' + title + ' ';
      ctl.msg += (typeof name === 'number' ? '#' + name : '"' + name + '"');
      ctl.msg +=' ?';
    } else {
      ctl.msg = title;
    }

    return _action.prepare(_data, _submit);
  }

  _action.open = _action.prepare;

  _action.add = _action.prepare;

  _action.edit = _action.prepare;

  _action.update = _action.prepare;

  _action.delete = _action.prevent;

  _action.close = _action.prevent;

  _action.selection = function() {
    _initialized || _action.uninitialized('selection');

    var selected = element.value.toString();

    if (! selected) {
      return app.error('app.view.action().selection', 'selected');
    }

    var _data = { 'id': selected };

    return _action.prepare(_data, true);
  }

  _action.print = function() {
    _initialized || _action.uninitialized('print');

    window.print();
  }

  return _action;
}


/**
 * app.view.sub
 *
 * Sub-actions "view", returns requested object method
 *
 * avalaible methods:
 *  - csv ()
 *  - clipboard ()
 *  - toggler ()
 *
 * @global <Object> config
 * @param <String> method
 * @param <NodeElement> element
 * @param <NodeElement> table
 * @return <Function>
 */
app.view.sub = function(method, element, table) {
  var config = window.config;

  if (! config) {
    return app.stop('app.view.sub');
  }

  if (! method || ! element) {
    return app.error('app.view.sub', arguments);
  }

  var _sub = {};

  _sub.csv = function() {
    if (! table) {
      return app.error('app.view.sub.csv', arguments);
    }

    var source = '';
    var table_csv = app.view.convertTableCSV(table);

    // perform line break replacements for csv
    Array.prototype.forEach.call(table_csv, function(line) {
      source += line.join(';') + '\r\n';
    });

    var filename = (config.csv && config.csv.filename) ? config.csv.filename : 'csv_export';
    var filename_separator = (config.csv && config.csv.filename_separator) ? config.csv.filename_separator : '_';
    var filename_date_format = (config.csv && config.csv.filename_date_format) ? config.csv.filename_date_format : 'Y-m-d_H-M-S';

    filename += filename_separator + app.utils.dateFormat(true, filename_date_format);

    var file = { 'name': filename + '.csv', 'options': { 'type': 'text/csv;charset=utf-8' } };

    var ctl = { action: 'export', file: file, data: source };

    return app.view.send(ctl);
  }

  _sub.clipboard = function() {
    if (! table) {
      return app.error('app.view.sub.clipboard', arguments);
    }

    var source = '';
    var table_csv = app.view.convertTableCSV(table);

    // perform line break replacements for clipboard
    Array.prototype.forEach.call(table_csv, function(line) {
      source += line.join('\t') + '\r\n'; //TODO safari
    });

    app.view.copyToClipboard(source);

    var dropdown = element.parentNode.parentNode.parentNode;
    var dropdown_btn = dropdown.querySelector('.dropdown-toggle');
    dropdown_btn.classList.add('btn-gray-lighter');

    setTimeout(function() {
      dropdown_btn.classList.remove('btn-gray-lighter');
      this.clearTimeout();
    }, 1000);
  }

  _sub.toggler = function() {
    if ('jQuery' in window && 'dropdown' in jQuery.fn) {
      return;
    }

    var dropdown = element.parentNode.parentNode.parentNode;

    app.layout.dropdown('toggle', element, dropdown)();
    app.utils.addEvent('click', document.body, app.layout.dropdown('close', element, dropdown));
  }

  return _sub[method];
}


/**
 * app.view.openView
 *
 * Fires when "view" document is loaded
 *
 * @global <Object> control
 * @return
 */
app.view.openView = function() {
  var control = window.control;

  if (! control) {
    return app.error('app.view.openView', 'control');
  }

  /**
   * control.openView hook
   */
  if ('openView' in control && typeof control.openView === 'function') {
    control.openView();
  }

  app.utils.addEvent('resize', window, app.view.resizeView);
  app.utils.addEvent('orientationchange', window, app.view.resizeView);
}


/**
 * app.view.resizeView
 *
 * Fires when "view" frame is resized
 *
 * @global <Object> control
 * @return
 */
app.view.resizeView = function(check_time) {
  var control = window.control;

  if (! (control && control.temp)) {
    return; // silent fail
  }

  if (check_time) {
    if ((new Date().getTime() - control.temp.last_resize) < 3000) {
      return;
    }

    control.temp.last_resize = new Date().getTime();
  }


  var ctl = { action: 'resize', height: document.documentElement.scrollHeight };

  return app.view.send(ctl);
}


/**
 * app.view.send
 *
 * Sends control messages to parent "main" window
 *
 * @param <Object> ctl
 * @return
 */
app.view.send = function(ctl) {
  if (! ctl) {
    return; //silent fail
  }

  if (typeof ctl !== 'object') {
    return app.error('app.view.send', arguments);
  }

  if ('view' in ctl === false) {
    var cursor = app.controller.cursor();

    if ('view' in cursor) {
      ctl.view = cursor.view;
    }
  }

  if ('action' in ctl === false) {
    return;
  }

  try {
    ctl = JSON.stringify(ctl);





console.log(ctl);




    // send control submission to parent "main" window
    window.parent.postMessage(ctl, '*');
  } catch (err) {
    return app.error('app.view.send', err);
  }
}


/**
 * app.view.getLastID
 *
 * Helper to calculate the last ID
 *
 * @param <Object> data
 * @return <Number> last_id
 */
app.view.getLastID = function(data) {
  if (typeof data !== 'object') {
    return app.error('app.view.getLastID', arguments);
  }

  var last_id = Object.keys(data).pop();

  return last_id ? (parseInt(last_id) + 1) : 1;
}


/**
 * app.view.getLastID
 *
 * Helper to get form data with transformation and sanitization
 *
 * @param <NodeElement> elements //TODO NodeElement ?
 * @return <Object>
 */
app.view.getFormData = function(elements) {
  if (! (elements && elements.length)) {
    return app.error('app.view.getFormData', arguments);
  }

  var data = {};

  for (var i = 0; i < elements.length; i++) {
    if (elements[i].nodeName == 'FIELDSET') {
      continue;
    }

    var name = elements[i].name;
    var value = elements[i].value.trim();
    var transform = elements[i].getAttribute('data-transform') || false;
    var sanitize = elements[i].getAttribute('data-sanitize') || false;

    if (elements[i].type) {
      if (elements[i].type === 'date') {
      }

      if (elements[i].type === 'checkbox' || elements[i].type === 'radio') {
        value = elements[i].checked ? true : false;
      }
    }

    if (transform) {
      value = app.utils.transform(transform, value);
    }
    if (sanitize) {
      value = app.utils.sanitize(sanitize, value);
    }

    if (value === undefined) {
      value = null;
    }

    // re-build array name and assign value
    if (name) {
      name = name.match(/([\w]+)/g, '$1');

      var _data = {};

      Array.prototype.reduce.call(name, function(_obj, _key, _i) {
        return _obj[_key] = (_i != (name.length - 1)) && {} || value;
      }, _data);

      app.utils.extendObject(true, data, _data);
    }
  }

  return data;
}


/**
 * app.view.getLastID
 *
 * Helper to convert object data to csv text format
 *
 * @param <NodeElement> table
 * @return <String>
 */
app.view.convertTableCSV = function(table) {
  if (! table) {
    return app.error('app.view.convertTableCSV', arguments);
  }

  var thead_th = table.querySelectorAll('thead tr:not(.hidden-csv) th');
  var tbody_trow = table.querySelectorAll('tbody tr:not(.hidden-csv)');

  var csv = [ [] ];

  Array.prototype.forEach.call(thead_th, function(node) {
    if (node.classList.contains('hidden-print')) { return; }

    csv[0].push(node.textContent);
  });

  var csv_cursor = 0;

  Array.prototype.forEach.call(tbody_trow, function(node) {
    if (node.classList.contains('tpl')) { return; }

    var tbody_td = node.querySelectorAll('td');

    csv_cursor++;
    csv[csv_cursor] = [];

    Array.prototype.forEach.call(tbody_td, function(node) {
      if (node.classList.contains('hidden-print')) { return; }

      var _input = node.querySelector('.form-control');

      if (_input) {
        csv[csv_cursor].push(_input.value);
      } else {
        csv[csv_cursor].push(node.textContent);
      }
    });
  });

  return csv;
}


/**
 * app.view.copyToClipboard
 *
 * Helper to copy to the system clipboard
 *
 * @param <String> source
 * @return
 */
app.view.copyToClipboard = function(source) {
  if (! source) {
    return app.error('app.view.copyToClipboard', arguments);
  }

  var _clipboard = document.createElement('TEXTAREA');
  _clipboard.style = 'position:absolute;top:0;right:0;width:0;height:0;overflow:hidden';
  _clipboard.value = source;
  document.body.appendChild(_clipboard);
  _clipboard.focus();
  _clipboard.select();
  document.execCommand('copy');
  document.body.removeChild(_clipboard);
}


/**
 * app.view.load
 *
 * Default "view" load function
 *
 * @global <Object> config
 * @global <Object> store
 * @return
 */
app.view.load = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.view.load');
  }


  app.session(config, false);


  app.resume(config, false);


  var routine = config.auxs || {};
  routine.push({ fn: config.app, schema: config.schema });

  app.controller.retrieve(app.view.openView, routine);
}


/**
 * app.view.unload
 *
 * Default "view" unload function
 *
 * @global <Object> control
 * @return <Boolean>
 */
app.view.unload = function() {
  var control = window.control;

  if (! control) {
    return app.error('app.view.unload', null);
  }

  if (control.temp.form && ! control.temp.form_submit) {
    try {
      var _changes = app.view.getFormData(control.temp.form_elements);
      _changes = _changes && JSON.stringify(_changes);
    } catch {}

    if (control.temp.form_changes !== _changes) {
      return true;
    }
  }

  return;
}



app.utils = {};

/**!
 * app.utils.isPlainObject
 *
 * Checks if object is a plain object
 *
 * ($.jQuery.fn.isPlainObject)
 * from: jQuery JavaScript Library
 * link: https://jquery.com/
 * copyright: Copyright JS Foundation and other contributors
 * license: MIT license <https://jquery.org/license>
 *
 * @param <Object> obj
 * @return <Boolean>
 */
app.utils.isPlainObject = function( obj ) {
  var proto, Ctor;
  var hasOwn = ({}).hasOwnProperty;

  // Detect obvious negatives
  // Use toString instead of jQuery.type to catch host objects
  if ( !obj || toString.call( obj ) !== "[object Object]" ) {
    return false;
  }

  proto = Object.getPrototypeOf( obj );

  // Objects with no prototype (e.g., `Object.create( null )`) are plain
  if ( !proto ) {
    return true;
  }

  // Objects with prototype are plain iff they were constructed by a global Object function
  Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
  return typeof Ctor === "function" && hasOwn.toString.call( Ctor ) === hasOwn.toString.call( Object );
}


/**!
 * app.utils.extendObject
 *
 * Extend and merge objects
 *
 * ($.jQuery.fn.extend)
 * from: jQuery JavaScript Library
 * link: https://jquery.com/
 * copyright: Copyright JS Foundation and other contributors
 * license: MIT license <https://jquery.org/license>
 *
 * @return <Object> target
 */
app.utils.extendObject = function() {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[ 0 ] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;

    // Skip the boolean and the target
    target = arguments[ i ] || {};
    i++;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !(typeof target === "function" && typeof target.nodeType !== "number") ) {
    target = {};
  }

  // Extend jQuery itself if only one argument is passed
  if ( i === length ) {
    target = this;
    i--;
  }

  for ( ; i < length; i++ ) {

    // Only deal with non-null/undefined values
    if ( ( options = arguments[ i ] ) != null ) {

      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( app.utils.isPlainObject( copy ) ||
          ( copyIsArray = Array.isArray( copy ) ) ) ) {

          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && Array.isArray( src ) ? src : [];

          } else {
            clone = src && app.utils.isPlainObject( src ) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = app.utils.extendObject( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
}


/**!
 * app.utils.system
 *
 * Detects browser and system environments
 *
 * @return <Object> system
 */
app.utils.system = function() {
  var system = { 'platform': null, 'architecture': null, 'navigator': null, 'release': null };

  var _platform = window.navigator.userAgent.match(/(iPad|iPhone|iPod|android|windows phone)/i);
  var _navigator = window.navigator.userAgent.match(/(Chrome|CriOS|Safari|Firefox|Edge|IEMobile|MSIE|Trident)\/([\d]+)/i);
  var _release = null;

  if (_platform) {
    _platform = _platform[0].toLowerCase();

    if (_platform === 'android') {
      system.platform = 'android';
    } else if (_platform === 'windows phone') {
      system.platform = 'wm';
    } else if (_platform === 'ipad') {
      system.platform = 'ios';
      system.model = 'ipad';
    } else {
      system.platform = 'ios';
      system.model = 'iphone';
    }
  } else {
    _platform = window.navigator.userAgent.match(/(Win|Mac|Linux)/i)

    if (_platform) {
      _platform = _platform[0].substring(0, 3).toLowerCase();

      if (_platform === 'win') {
        if (window.navigator.userAgent.indexOf('WOW64') != -1 || window.navigator.userAgent.indexOf('Win64') != -1) {
          system.architecture = 64;
        } else {
          system.architecture = 32;
        }
      }

      if (_platform === 'lin') {
        _platform = 'nxl';
      }

      system.platform = _platform;
    }
  }

  if (_navigator) {
    _release = _navigator[2] || null;
    _navigator = _navigator[1] || _navigator[0];
    _navigator = _navigator.toLowerCase();

    if (_navigator) {
      if (_navigator === 'crios') {
        _navigator = 'chrome';
      }

      if (_navigator.indexOf('ie') != -1 || _navigator == 'trident') {
        if (_navigator === 'trident') {
          _release = window.navigator.userAgent.match(/rv:([\d]+)/i);

          if (_release) {
            _navigator = 'ie';
            _release = _release[1];
          } else {
            _navigator = null;
            _release = null;
          }
        } else {
          _navigator = 'ie';
        }
      }

      system.navigator = _navigator;

      if (_release) {
        system.release = parseFloat(_release);
      }
    }
  }

  return system;
}


/**!
 * app.utils.addEvent
 *
 * Helper to add element event listener
 *
 * @param <String> event
 * @param <NodeElement> element
 * @param <Function> func
 * @return
 */
app.utils.addEvent = function(event, element, func) {
  if (typeof event !== 'string' || ! element || typeof func !== 'function') {
    return app.error('app.utils.addEvent', arguments);
  }

  if (element.addEventListener) {
    element.addEventListener(event, func, false); 
  } else if (element.attachEvent) {
    element.attachEvent('on' + event, func);
  }
}


/**!
 * app.utils.addEvent
 *
 * Helper to remove element event listener
 *
 * @param <String> event
 * @param <NodeElement> element
 * @param <Function> func
 * @return
 */
app.utils.removeEvent = function(event, element, func) {
  if (! event || ! element || typeof func !== 'function') {
    return app.error('app.utils.removeEvent', arguments);
  }

  if (element.addEventListener) {
    element.removeEventListener(event, func, false); 
  } else if (element.attachEvent) {
    element.detachEvent('on' + event, func);
  }
}


/**!
 * app.utils.transform
 *
 * Transforms type of passed value
 *
 * @param <String> method
 * @param value
 * @return value
 */
app.utils.transform = function(method, value) {
  if (! method) {
    return app.error('app.utils.transform', arguments);
  }

  switch (method) {
    case 'lowercase': return value.toLowerCase();
    case 'uppercase': return value.toUpperCase();
    case 'numeric': return parseFloat(value);
    case 'integer': return parseInt(value);
    case 'json':
      try {
        value = decodeURIComponent(value);
        return JSON.parse(value);
      } catch {}
    break;
  }
}


/**!
 * app.utils.sanitize
 *
 * Sanitizes passed value
 *
 * @param <String> method
 * @param value
 * @return value
 */
app.utils.sanitize = function(method, value) {
  if (! method) {
    return app.error('app.utils.sanitize', arguments);
  }

  switch (method) {
    case 'whitespace': return value.replace(/\\s/g, '');
    case 'breakline': return value.replace(/\\r\\n/g, '');
    case 'date':
      try {
        return new Date(value).toISOString().split('T')[0];
      } catch {}
    break;
    case 'datetime':
      try {
        return new Date(value).toISOString();
      } catch {}
    break;
    case 'datetime-local':
      try {
        return new Date(value).toISOString().split('.')[0];
      } catch {}
    break;
    case 'array':
      if (typeof value === 'object' && value instanceof Array) {
        var _value = [];

        Array.prototype.forEach.call(value, function(value, i) {
          if (value === null) {
            return;
          }

          _value[i] = value;
        });

        return _value;
      }
    break;
  }
}


/**!
 * app.utils.storage
 *
 * Storage utility, it memoizes persistent and non-persistent data using localStorage and sessionStorage
 *
 * //TODO prefix storage keys with appe_
 *
 * @param <String> fn
 * @param <String> method
 * @param <String> key
 * @param value
 * @return
 */
app.utils.storage = function(fn, method, key, value) {
  if (fn === undefined || method === undefined) {
    return app.error('app.utils.storage', arguments);
  }

  var _fn = fn ? 'sessionStorage' : app._runtime.storage;

  if (_fn in window === false) {
    return app.error('app.utils.storage', _fn);
  }


  var _storage = {};

  _storage.set = function(key, value) {
    if (key === undefined || value === undefined) {
      return app.error('app.utils.storage().set', arguments);
    }

    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    window[_fn].setItem(key, value);

    var _r = (window[_fn].getItem(key) == value) ? true : false;

    return _r;
  }

  _storage.get = function(key) {
    if (key === undefined) {
      return app.error('app.utils.storage().get', arguments);
    }

    var obj = window[_fn].getItem(key);

    try {
      var _obj = obj;
      obj = JSON.parse(obj);
    } catch {
      obj = _obj;
    }

    return obj;
  }

  _storage.has = function(key, value) {
    if (key === undefined) {
      return app.error('app.utils.storage().has', arguments);
    }

    if (value != undefined) {
      if (typeof value === 'object') {
        try {
          value = JSON.stringify(value);
        } catch (err) {
          return app.error('app.utils.storage().has', err);
        }
      }

      return (window[_fn].getItem(key) === value) ? true : false;
    }

    return window[_fn].getItem(key) ? true : false;
  }

  _storage.del = function(key) {
    if (key === undefined) {
      return app.error('app.utils.storage().del', arguments);
    }

    return window[_fn].removeItem(key);
  }

  _storage.reset = function() {
    return window[_fn].clear();
  }


  return _storage[method](key, value);
}


/**
 * app.utils.dateFormat
 *
 * Formats date, supported format specifiers are like them used in strftime() C library function, 
 * it accepts Date time format or true for 'now'
 *
 * format specifiers:
 *  - d  <Number> Day of the month, digits preceded by zero (01-31)
 *  - J  <Number> Day of the month (1-31)
 *  - w  <Number> Day of the week (1 Mon - 7 Sun)
 *  - m  <Number> Month, digits preceded by zero (01-12)
 *  - n  <Number> Month (1-12)
 *  - N  <Number> Month, start from zero (0-11)
 *  - Y  <Number> Year, four digits (1970)
 *  - y  <Number> Year, two digits (70)
 *  - H  <Number> Hours, digits preceded by zero (00-23)
 *  - G  <Number> Hours (0-23)
 *  - M  <Number> Minutes, digits preceded by zero (00-59)
 *  - I  <Number> Minutes (0-59)
 *  - S  <Number> Seconds, digits preceded by zero (00-59)
 *  - K  <Number> Seconds (0-59)
 *  - v  <Number> Milliseconds, three digits
 *  - a  <String> Abbreviated day of the week name (Thu)
 *  - b  <String> Abbreviated month name (Jan)
 *  - x  <String> Date representation (1970/01/01)
 *  - X  <String> Time representation (01:00:00)
 *  - s  <Number> Seconds since the Unix Epoch
 *  - V  <Number> Milliseconds since the Unix Epoch
 *  - O  <String> Difference to Greenwich time GMT in hours (+0100)
 *  - z  <String> Time zone offset (+0100 (CEST))
 *  - C  <String> Date and time representation (Thu, 01 Jan 1970 00:00:00 GMT)
 *  - Q  <String> ISO 8601 date representation (1970-01-01T00:00:00.000Z)
 *
 * @param <Date> | <Boolean> time
 * @return <String> formatted_date
 */
app.utils.dateFormat = function(time, format) {
  var date = null;

  if (date instanceof Date === true) {
    date = time;
  } else if (time === true) {
    date = new Date();
  } else {
    date = new Date(time);
  }

  var _date = function(f) {
    switch (f) {
      case 'd': return app.utils.numberLendingZero(date.getDate());
      case 'J': return date.getDate();
      case 'w': return date.getDay();
      case 'm': return app.utils.numberLendingZero(date.getMonth() + 1);
      case 'n': return (date.getMonth() + 1);
      case 'N': return date.getMonth();
      case 'Y': return date.getFullYear();
      case 'y': return date.getFullYear().toString().slice(2);
      case 'H': return app.utils.numberLendingZero(date.getHours());
      case 'G': return date.getHours();
      case 'M': return app.utils.numberLendingZero(date.getMinutes());
      case 'I': return date.getMinutes();
      case 'S': return app.utils.numberLendingZero(date.getSeconds());
      case 'K': return date.getSeconds();
      case 'v': return date.getMilliseconds();
      case 'a': return date.toDateString().split(' ')[0];
      case 'b': return date.toDateString().split(' ')[1];
      case 'x': return date.toISOString().split('T')[0].replace(/-/g, '/');
      case 'X': return date.toTimeString().split(' ')[0];
      case 's': return Math.round(date.getTime() / 1000);
      case 'V': return date.getTime();
      case 'O': return date.toTimeString().match(/([\+[\d]{4,})/)[0];
      case 'z': return date.toTimeString().split('GMT')[1];
      case 'C': return date.toUTCString();
      case 'Q': return date.toISOString();
    }
  }

  format = format || 'Y-m-d H:M';
  format = format.match(/.{1}/g);

  var formatted_date = '';

  for (var i = 0; i < format.length; i++) {
    formatted_date += /[\W_]/.test(format[i]) ? format[i] : _date(format[i]);
  }

  return formatted_date;
}


/**
 * app.utils.numberLendingZero
 *
 * Pads number from left with zero
 *
 * @param number
 * @return
 */
app.utils.numberLendingZero = function(number) {
  return number < 10 ? '0' + number : number.toString();
}



/**
 * app.utils.load
 *
 * Helper document unload event
 *
 * @param <Function> func
 * @return
 */
app.load = function(func) {
  if (typeof func !== 'function') {
    return app.stop('app.load');
  }

  var _loaded = false;

  var _proxy = function() {
    _loaded = true;

    if (! _loaded) {
      func();
    }
  }

  if (document.readyState === 'complete') {
    _proxy();
  } else {
    document.addEventListener('DOMContentLoaded', _proxy);
  }

  if (! _loaded) {
    window.onload = func;
  }
}


/**
 * app.utils.unload
 *
 * Helper document load event
 *
 * @param <Function> func
 * @return
 */
app.unload = function(func) {
  if (typeof func !== 'function') {
    return app.stop('app.unload');
  }

  window.onbeforeunload = func;
}


/**
 * app.utils.redirect
 *
 * Performs app redirects
 *
 * @global <Object> config
 * @return
 */
app.redirect = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.redirect');
  }

  var _base = config.basePath;
  var _filename = 'index';

  if (window.location.href.indexOf(config.basePath + '/') != -1) {
    _base = '..';
    _filename = config.launcherName;
  }

  window.location.href = _base + '/' + _filename + '.html';
}


/**
 * app.position
 *
 * Returns serialized app position
 *
 * @return <String> position
 */
app.position = function() {
  var position = 'undefined';
  var loc = app.controller.cursor();

  if (! (loc && typeof loc === 'object')) {
    return app.error('app.position', 'loc');
  }

  try {
    position = JSON.stringify(loc);
  } catch (err) {
    return app.error('app.position', err);
  }

  return position;
}


/**
 * app.session
 *
 * Start the session
 *
 * @global <Object> store
 * @param <Object> config
 * @param <String> target
 * @return
 */
app.session = function(config, target) {
  if (! config) {
    return app.stop('app.resume');
  }

  window.store = {};

  app._runtime.debug = config.debug || false;

  if (! target) {
    return;
  }

  setTimeout(function() {
    app.store.has('notify') && app.store.del('notify');

    this.clearTimeout();
  }, 0);
}


/**
 * app.resume
 *
 * Resume session, return last opened file
 *
 * @param <Object> config
 * @param <Boolean> target
 * @return <String> session_resume
 */
app.resume = function(config, target) {
  if (! config) {
    return app.stop('app.resume');
  }

  var _session = function() {
    var session_resume = '';
    var session_last = '';


    //TODO app.utils.cookie, btoa whitespace
    var _cookie_name = '';

    _cookie_name = encodeURIComponent(window.btoa('appe_last_opened_file'));

    if (document.cookie.indexOf(_cookie_name) != -1) {
      session_resume = document.cookie.replace(new RegExp('/(?:(?:^|.*;\s*)' + _cookie_name + '\s*\=\s*([^;]*).*$)|^.*$/'), '$1');
    }
    if (! session_resume) {
      session_resume = app.memory.get('last_opened_file');
    }


    //TODO app.utils.cookie, btoa whitespace
    _cookie_name = encodeURIComponent(window.btoa('appe_last_session'));

    if (document.cookie.indexOf(_cookie_name) != -1) {
      session_last = document.cookie.replace(new RegExp('/(?:(?:^|.*;\s*)' + _cookie_name + '\s*\=\s*([^;]*).*$)|^.*$/'), '$1');
    }
    if (! session_last) {
      session_last = app.memory.get('last_session');
    }


    if (! session_resume && target === undefined) {
      return app.stop('app.resume', 'session_resume');
    } else if (app._runtime.debug) {
      return (! session_last) && app.newSession();
    } else if (! session_last) {
      return app.redirect();
    }

    if (session_resume) {
      //TODO atob whitespace
      session_resume = window.atob(session_resume) + '.js';
    }

    return session_resume;
  }


  app._runtime.system = app.utils.system();
  
  if ('localStorage' in window === false) {
    app._runtime.storage = 'sessionStorage';
  } else if ('sessionStorage' in window === false) {
    app._runtime.storage = 'localStorage';
  } else if (app._runtime.system.navigator === 'safari') {
    app._runtime.storage = 'sessionStorage';
  } else {
    app._runtime.storage = 'localStorage';
  }

  document.documentElement.setAttribute('lang', config.language);

  return _session();
}


/**
 * app.checkConfig
 *
 * Verifies config file
 *
 * @param <Object> config
 * @return <Boolean>
 */
app.checkConfig = function(config) {
  if (! (config && typeof config === 'object')) {
    return app.stop('app.checkConfig');
  }

  var _error = false;
  var _required_keys = [ 'app', 'launcherName', 'name', 'language', 'debug', 'schema', 'events', 'routes', 'defaultRoute', 'defaultEvent', 'verifyFileChecksum', 'basePath', 'savePath', 'openAttempts' ];

  Array.prototype.forEach.call(_required_keys, function(key) {
    if (key in config === false) {
      _error = true;
    }
  });

  return !! _error && app.stop('app.checkConfig');
}


/**
 * app.checkFile
 *
 * Verifies opened file
 *
 * @global <Object> config
 * @param <Object> source
 * @return <Boolean>
 */
app.checkFile = function(source) {
  var config = window.config;

  if (! config) {
    return app.stop('app.checkFile');
  }

  if (! (source && typeof source === 'object')) {
    return app.error('app.checkFile', arguments);
  }

  if (app._runtime.version !== source.file.version) {
    return app.error('app.checkFile', 'This file is incompatible with running version: ' + app._runtime.version + '.', source.file);
  }

  if (config.verifyFileChecksum) {
    try {
      source = JSON.stringify(source);

      //TODO checksum
    } catch (err) {
      return app.error('app.checkFile', 'source');
    }

  }

  return true;
}


/**
 * app.newSession
 *
 * Create a new empty session
 *
 * @global <Object> config
 * @return <Boolean>
 */
app.newSession = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.newSession');
  }

  var _is_start = ! (window.start === undefined);

  var _current_timestamp = new Date();
  _current_timestamp = app.utils.dateFormat(_current_timestamp, 'Q');


  var schema = config.schema;

  var _new = function() {
    // reset current session data
    app.controller.clear();

    //TODO cookie utils
    var _cookie_name = '';

    _cookie_name = encodeURIComponent(window.btoa('appe_last_opened_file'));
    document.cookie = _cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    _cookie_name = encodeURIComponent(window.btoa('appe_last_session'));
    document.cookie = _cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    app.memory.del('last_opened_file');

    _cookie_name = encodeURIComponent(window.btoa('appe_last_session'));
    document.cookie = _cookie_name + '=' + encodeURIComponent(window.btoa(_current_timestamp)) + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';

    app.memory.set('last_stored', _current_timestamp);
    app.memory.set('last_time', _current_timestamp);
    app.memory.set('last_session', window.btoa(_current_timestamp));

    for (var i = 0; i < schema.length; i++) {
      app.store.set(config.app + '_' + schema[i], {});
    }

    _complete();
  }

  var _complete = function() {
    _is_start ? app.start.redirect(false) : location.reload();
  }

  _new();
}


/**
 * app.openSession
 *
 * Opens session from an app js file
 *
 * @param <Object> source
 * @return
 */
app.openSession = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.openSession');
  }

  var _is_start = ! (window.start === undefined);

  var _current_timestamp = new Date();
  _current_timestamp = app.utils.dateFormat(_current_timestamp, 'Q');


  var _open = function() {
    app.os.fileOpen.call(this, _complete);
  }

  var _complete = function(filename) {
    _is_start && app.start.loader(0);

    if (! filename) {
      return; // silent fail
    }

    //TODO app.utils.cookie, btoa whitespace
    var _cookie_name = '';

    _cookie_name = encodeURIComponent(window.btoa('appe_last_opened_file'));
    document.cookie = _cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    _cookie_name = encodeURIComponent(window.btoa('appe_last_session'));
    document.cookie = _cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';


    var _filename = filename.replace('.js', '');
    _filename = window.btoa(_filename);


    _cookie_name = encodeURIComponent(window.btoa('appe_last_opened_file'));
    document.cookie = _cookie_name + '=' + _filename + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';

    _cookie_name = encodeURIComponent(window.btoa('appe_last_session'));
    document.cookie = _cookie_name + '=' + encodeURIComponent(window.btoa(_current_timestamp)) + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';


    app.memory.set('last_opened_file', _filename);

    app.memory.set('last_stored', _current_timestamp);
    app.memory.set('last_time', _current_timestamp);
    app.memory.set('last_session', window.btoa(_current_timestamp));


    _is_start ? app.start.redirect(true) : location.reload();
  }


  var open_input = null;
  var open_input__std = this.getAttribute('data-open');

  if (! open_input__std) {
    this.setAttribute('data-open', '');

    var open_input_ref = this.getAttribute('data-open-input');
    var open_input = this.parentNode.querySelector(open_input_ref);

    app.utils.addEvent('change', open_input, _open);
  }

  if (open_input) {
    _is_start && app.start.loader(2);

    open_input.click();
  }
}


/**
 * app.saveSession
 *
 * Saves session to app js file
 *
 * @global <Object> store
 * @param <Object> source
 */
app.saveSession = function() {
  var config = window.config;

  if (! config) {
    return app.stop('app.saveSession');
  }

  var _is_start = ! (window.start === undefined);

  var source = {};

  var _current_timestamp = new Date();


  Array.prototype.forEach.call(config.schema, function(key) {
    source[key] = window.store[config.app][key];
  });  

  source.file = app.os.generateFileHead(source, _current_timestamp);


  app.os.fileSave(function(filename) {
    if (app._runtime.debug) {
      console.info('save', filename);
    }
  }, source, _current_timestamp);
}


/**
 * app.debug
 *
 * Utility debug, returns boolean
 *
 * @param <Object> source
 * @return <Boolean>
 */
app.debug = function() {
  return app.getInfo('config', 'debug');
}


/**
 * app.stop
 *
 * Stops app execution
 *
 * @return <Boolean>
 */
app.stop = function() {
  if (! app._runtime.exec) {
    return false;
  }

  app._runtime.exec = false;

  var _args = Object.values(arguments).slice(0);

  if (arguments.length == 1) {
    _args.push(null);
  }

  app.error.apply(this, _args);

  app.blind();

  return false;
}


/**
 * app.error
 *
 * Helper to debug and display error messages
 *
 * @return <Boolean>
 */
app.error = function() {
  var fnn = null;
  var msg = null;
  var dbg = null;

  if (arguments.length == 3) {
    fnn = arguments[0];
    msg = arguments[1];
    dbg = arguments[2];
  } else if (arguments.length == 2) {
    fnn = arguments[0];
    dbg = arguments[1];
  } else if (arguments.length == 1) {
    msg = arguments[0];
  }

  if (app._runtime.debug) {
    if (app._runtime.exec) {
      console.error('ERR', fnn, app.position(), msg);
    } else {
      console.warn('WARN', fnn, app.position(), msg);
    }

    if (dbg) {
      console.log(dbg);
    }
  }

  if (! msg) {
    msg = 'Si è verificato un errore, impossibile proseguire.';

    if (! app._runtime.exec) {
      msg += '\n\nRicarica l\'applicazione.';
    }
  }

  if (! app.store.has('notify', 'false')) {
    window.alert(msg);

    if (! app._runtime.exec) {
      app.store.set('notify', 'false');
    }
  }

  return false;
}


/**
 * app.blind
 *
 * Helper to freeze document "main" screen
 *
 * @return
 */
app.blind = function() {
  var _is_main = ! (window.main === undefined);

  if (! _is_main) {
    return;
  }

  var _blind = document.createElement('div');
  _blind.setAttribute('style', 'position:absolute;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,0.3);');

  window.document.body.appendChild(_blind);
}


/**
 * app.getInfo
 *
 * Utility to get app info(s)
 *
 * @global <Object> config
 * @param <String> from
 * @param <String> info
 * @return
 */
app.getInfo = function(from, info) {
  var config = window.config;

  if (! config) {
    return app.stop('app.getConfig');
  }

  var _available_infos = null;

  switch (from) {
    case 'config':
      _available_infos = {
        'debug': config.debug ? true : false,
        'name': config.name,
        'language': config.language,
        'schema': config.schema,
        'license': config.license && (typeof config.license === 'object' ? { 'text': config.license.text, 'file': config.license.file } : config.license) || false
      };
    break;
    case 'runtime':
      _available_infos = {
        'version': app._runtime.version,
        'release': app._runtime.release
      };
    break;
    default:
      return app.error('app.getInfo', arguments);
  }

  if (info) {
    if (info in _available_infos) {
      return _available_infos[info];
    } else {
      return app.error('app.getInfo', 'info');
    }
  }

  return _available_infos;
}


/**
 * app.getName
 *
 * Gets app name
 *
 * @return <String>
 */
app.getName = function() {
  return app.getInfo('config', 'name');
}


/**
 * app.getVersion
 *
 * Gets app version
 *
 * @param <String> info
 * @return
 */
app.getVersion = function(info) {
  if (info == 'version' || info == 'release') {
    return app.getInfo('runtime', info);
  }

  return {
    'version': app.getInfo('runtime', 'version'),
    'release': app.getInfo('runtime', 'release')
  };
}


/**
 * app.getLicense
 *
 * Gets app license
 *
 * @return
 */
app.getLicense = function() {
  return app.getInfo('config', 'license');
}

