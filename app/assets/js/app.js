/*!
 * {appe}
 * ver. 1.0 alpha
 *
 * Copyright 2018 Leonardo Laureti
 *
 * MIT License
 */

var app = window.app = {};

app._runtime = {
  system: null,
  version: '1.0',
  release: '1.0 alpha',
  exec: true,
  title: '',
  storage: false,
  saves: 0,
  debug: true
};


app.os = {};

app.os.fileOpen = function(config, callback) {
  if (typeof config !== 'object' || typeof callback !== 'function') {
    return app.error('app.os.fileOpen', arguments);
  }

  if (! this.files.length) {
    return;
  }

  var file = this.files[0];

  if (file.type.indexOf('javascript') === -1) {
    return app.error('app.os.fileOpen', 'Il formato di file non è corretto.', arguments);
  }

  var schema = config.schema;
  var reader = new FileReader();

  reader.onload = (function() {
    var source = this.result;

    source = source.replace(/[\r\n]([\s]+){2}/g, '')
      .replace(new RegExp('window.' + config.app + ' ?= ?'), '')
      .replace(/};/, '');
    source = JSON.parse(source);

    for (var i = 0; i < schema.length; i++) {
      if (schema[i] in source === false) {
        return app.error('app.os.fileOpen', null, 'schema[i]');
      }

      app.store.set(config.app + '_' + schema[i], source[schema[i]]);
    }

    callback(file.name);
  });

  reader.onerror = (function() {
    callback(false);
  });

  reader.readAsText(file);
}

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

app.os.generateFileHeading = function(_date) {
  var _checksum = '';
  var _date = _date || new Date();

  return { 'checksum': _checksum, 'date': _date, 'version': app._runtime.version, 'release': app._runtime.release };
}

app.os.getLastFileName = function(config) {
  if (! config) {
    return app.error('app.os.getLastFileName', arguments);
  }

  var file_name = null;

  if (document.cookie.indexOf('last_opened_file') != -1) {
    file_name = document.cookie.replace(/(?:(?:^|.*;\s*)last_opened_file\s*\=\s*([^;]*).*$)|^.*$/, '$1');
  }
  if (! file_name) {
    file_name = app.store.get('last_opened_file');
  }
  if (! file_name) {
    file_name = app.memory.get('last_opened_file');
  }

  file_name = file_name ? window.atob(file_name) + '.js' : null;

  return file_name;
}

app.os.getLastFileVersion = function(config) {
  if (! config) {
    return app.error('app.os.getLastFileVersion', arguments);
  }

  var data_file = window.store[config.app]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileVersion', null, 'window.store[config.app][\'file\']');
  }

  var file_version = null;

  if (data_file.version || data_file.release) {
    file_version = [];
    if (data_file.version) { file_version.push(data_file.version); }
    if (data_file.release) { file_version.push(data_file.release); }
  }

  return file_version;
}

app.os.getLastFileChecksum = function(config) {
  if (! config) {
    return app.error('app.os.getLastFileChecksum', arguments);
  }

  var data_file = window.store[config.app]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileChecksum', null, 'window.store[config.app][\'file\']');
  }

  var file_checksum = null;

  if (data_file.checksum) {
    file_checksum = data_file.checksum;
  }

  return file_checksum;
}

app.os.getLastFileHeading = function(config) {
  if (! config) {
    return app.error('app.os.getLastFileHeadings', arguments);
  }

  return {
    'name': app.os.getLastFileName(config),
    'version': app.os.getLastFileVersion(config),
    'checksum': app.os.getLastFileChecksum(config)
  };
}


app.layout = {};

app.layout.renderSelectOption = function(value, name, selected) {
  if (! value || ! name) {
    return app.error('app.layout.renderSelectOption', arguments);
  }

  return '<option value="' + value + '"' + (selected ? ' selected' : '') + '>' + name + '<\/option>';
}

app.layout.renderSelectOptionGroup = function(label, options) {
  if (! label || ! options) {
    return app.error('app.layout.renderSelectOptionGroup', arguments);
  }

  return '<optgroup label="' + label + '">' + options + '<\/optgroup>';
}

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

app.layout.draggable = function(event, table, field) {
  if (! event || ! table || ! field) {
    return app.error('app.view.draggable', arguments);
  }


  var _draggable = {};

  var src_el = null;
  var next_index = null;

  _draggable.start = function(e) {
    src_el = this;
    next_index = this.getAttribute('data-index');

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

    try {
      items = JSON.stringify(items);
      items = encodeURIComponent(items);

      if (field) {
        field.setAttribute('value', items);
      }
    } catch (err) {
      return app.error('app.view.draggable.end', null, err);
    }
  }

  _draggable.drop = function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (src_el != this) {
      var prev_index = this.getAttribute('data-index');
      src_el.innerHTML = this.innerHTML;
      src_el.setAttribute('data-index', prev_index);

      this.setAttribute('data-index', next_index);
      this.innerHTML = e.dataTransfer.getData('text/html');
      this.querySelector('meta').remove();
    } else {
      next_index = null;
    }

    return false;
  }

  return _draggable[event];
}

app.layout.dropdown = function(event, element, dropdown) {
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

app.layout.collapse = function(event, element, menu) {
  var _collapse = {};

  _collapse.open = function(e) {
    console.log('_open', e && e.target);
    if (element.getAttribute('aria-expanded') === 'true') {
      return;
    }
    if (e && e.target && (e.target === element || e.target.offsetParent === element)) {
      return;
    }

    menu.classList.add('collapse');
    menu.classList.add('in');
    menu.setAttribute('aria-expanded', true);
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

    menu.classList.remove('collapse');
    menu.classList.remove('in');
    menu.setAttribute('aria-expanded', false);
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

app.memory.set = function(key, value) {
  //if (sessionStorage) {
    return app.utils.storage(true, 'set', key, value);
  //}


  /*var obj = window.tmp;

  if (! obj || typeof obj !== 'object') {
    obj = {};
  }

  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  var _set = (obj[key] == value) ? true : false;
  top.tmp = parent.tmp = window.tmp = obj;
  return _set;*/
}

app.memory.get = function(key) {
  //if (sessionStorage) {
    return app.utils.storage(true, 'get', key);
  //}


  /*var obj = window.tmp;

  if (! obj || typeof obj !== 'object') {
    obj = {};
  }

  if (key in obj) {
    if (typeof obj[key] === 'object') {
      obj[key] = JSON.parse(obj[key]);
    }

    return obj[key];
  }

  return '';*/
}

app.memory.has = function(key, value) {
  //if (sessionStorage) {
    return app.utils.storage(true, 'has', key, value);
  //}


  /*var obj = window.tmp;

  if (! obj || typeof obj !== 'object') {
    obj = {};
  }

  if (value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
  } else {
    value = true;
  }

  return (key in obj && (obj[key] === value)) ? true : false;*/
}

app.memory.del = function(key) {
  //if (sessionStorage) {
    return app.utils.storage(true, 'del', key);
  //}


  /*var top = window.top || undefined;
  var obj = top.tmp || parent.tmp || window.tmp;

  if (! obj || typeof obj !== 'object') {
    obj = {};
  }

  var _del = (key in obj && (delete obj[key])) ? true : false;
  window.tmp = obj;
  return _del;*/
}

app.memory.reset = function() {
  //if (sessionStorage) {
    return app.utils.storage(true, 'reset');
  //}


  /*var obj = top.tmp || parent.tmp || window.tmp;
  obj = {};
  window.tmp = obj;
  return true;*/
}


app.store = {};

app.store.set = function(key, value) {
  return app.utils.storage(false, 'set', key, value);
}

app.store.get = function(key) {
  return app.utils.storage(false, 'get', key);
}

app.store.has = function(key, value) {
  return app.utils.storage(false, 'has', key, value);
}

app.store.del = function(key) {
  return app.utils.storage(false, 'del', key);
}

app.store.reset = function() {
  return app.utils.storage(false, 'reset');
}


app.controller = {};

app.controller.setTitle = function(title) {
  document.title = title;

  if (! app._runtime.title) {
    app._runtime.title = title;
  }
}

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

app.controller.spoof = function() {
  var loc = { view: null, action: null, index: null };

  if (location.href.indexOf('?') != -1) {
    var ref = location.href.split('?')[1];

    if (ref.indexOf('&') != -1) {
      ref = ref.split('&');

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

app.controller.retrieve = function(callback, routine) {
  if (typeof callback !== 'function' || typeof routine !== 'object') {
    return app.error('app.controller.retrieve', arguments);
  }

  var _retrieve = function(fn, schema) {
    if (typeof fn !== 'string' || typeof schema !== 'object') {
      return app.error('app.controller.retrieve() > _retrieve', arguments);
    }

    var _data = window.store;

    if (_data[fn] && typeof _data[fn] === 'object') {
      return _data[fn];
    }

    _data = {};

    for (var i = 0; i < schema.length; i++) {
      var obj = app.store.get(fn + '_' + schema[i]);

      if (! obj) {
        return app.error('app.controller.retrieve() > _retrieve', arguments);
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

app.controller.store = function(callback, fn, schema, data) {
  if (typeof callback !== 'function' || typeof fn !== 'string' || typeof schema !== 'object' || typeof data !== 'object') {
    return app.error('app.controller.store', arguments);
  }

  var source = window.store[fn];

  if (! source) {
    return app.error('app.controller.store', arguments);
  }

  var _store = function(key, values) {
    if (typeof key !== 'string' || typeof values !== 'object') {
      return app.error('app.controller.store() > _store', arguments);
    }

    if (! source[key]) {
      return app.error('_store', arguments);
    }

    var _data = values;
    var obj = app.store.set(fn + '_' + key, _data);

    if (! obj) {
      return app.error('_store', arguments);
    }

    return _data;
  }

  var keys = Object.keys(data);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var values = data[key];

    if (schema.indexOf(key) === -1 || ! Object.keys(values).length) {
      return app.error('app.controller.store() > _store', arguments);
    }

    window.store[fn][key] = _store(key, values);
  }

  app.memory.set('last_stored', new Date().toISOString());

  callback();
}

app.controller.clear = function(fn, schema) {
  if (typeof fn !== 'string' || typeof schema !== 'object') {
    return app.error('app.controller.clear', arguments);
  }

  if (fn in window.store) {
    delete window.store[fn];
  }

  for (var i = 0; i < schema.length; i++) {
    app.store.del(fn + '_' + schema[i]);
  }

  app.memory.del('last_stored');
}


app.start = {};

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

app.start.loadAttempt = function(callback, fn, file, schema, memo) {
  if (! callback || ! fn || ! file || ! schema) {
    return app.error('app.start.loadAttemp', arguments);
  }

  if (typeof callback !== 'function' || typeof fn !== 'string' || typeof file !== 'string' || typeof schema !== 'object') {
    return app.error('app.start.loadAttemp', arguments);
  }

  var loaded = false;
  var max_attempts = config.openAttempts;

  app.os.scriptOpen(function() {
    if (! window[fn]) {
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

app.start.openFile = function() {
  var _open = function() {
    document.cookie = 'last_opened_file=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    //app.store.reset(); //TODO FIX
    //app.memory.reset(); //TODO FIX

    app.os.fileOpen.call(this, config, _complete);
  }

  var _complete = function(filename) {
    app.start.loader(0);

    if (filename) {
      var _filename = window.btoa(filename.replace('.js', ''));

      document.cookie = 'last_opened_file=' + _filename + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';

      app.store.set('last_opened_file', _filename);
      app.memory.set('last_opened_file', _filename);

      app.memory.set('last_opened_time', new Date().toISOString());

      app.start.redirect();
    }
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
    app.start.loader(2);

    open_input.click();
  }
}

app.start.loadComplete = function(session_resume) {
  if (! session_resume) {
    return start.loader(1);
  }

  session_resume = config.savePath + '/' + session_resume; 

  app.start.loadAttempt(function(loaded) {
    if (loaded) {
      app.start.redirect();
    } else {
      app.start.loader(1);
    }
  }, config.app, session_resume, config.schema);

  app.start.loader(1);
}

app.start.redirect = function() {
  var _wait = function() {
    app.start.loader(false);

    app.redirect(config);

    this.clearTimeout();
  }

  setTimeout(_wait, 1000);
}

app.start.alternative = function() {
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

app.start.load = function() {
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

  if (! exec) {
    app.start.alternative();
    setTimeout(function() {
      app.stop();
      this.clearTimeout();
    }, 0);
    return;
  }

  var session_resume = app.resume(config, true);

  var title = config.title;
  app.controller.setTitle(title);

  var open_action = document.querySelector('#start-action-open');
  app.utils.addEvent('click', open_action, app.start.openFile);

  var auxs_loaded = true;

  for (var i = 0; i < config.auxs.length; i++) {
    app.start.loadAttempt(function(aux_loaded) {
      if (! aux_loaded) {
        auxs_loaded = false;
      }
    }, config.auxs[i].fn, config.auxs[i].file, config.auxs[i].schema, config.auxs[i].memo);
  }

  if (auxs_loaded) {
    app.start.loadComplete(session_resume);
  } else {
    return app.error('start.alternative', 'aux_loaded');
  }
}


app.main = {};

app.main.loadView = function(loc) {
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
      loc = { view: default_route };
    }
  } else {
    pass = false;
  }

  if (pass && typeof route === 'string') {
    app.controller.cursor(loc);
    view.removeAttribute('height');
    view.setAttribute('src', 'views/' + route);

    if (actions[loc.action] === 'list') {
      document.body.classList.add('full-width');
    } else {
      document.body.classList.remove('full-width');
    }

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
    app,stop();

    return app.error();
  }
}

app.main.openFile = function() {
  var _open = function() {
    app.os.fileOpen.call(this, config, _complete);
  }

  var _complete = function(_filename) {
    if (_filename) {
      document.cookie = 'last_opened_file=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      //TODO
      //app.controller.clear(config.app, config.schema);

      var filename = _filename.replace('.js', '');
      filename = window.btoa(filename);

      document.cookie = 'last_opened_file=' + filename + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
      app.store.set('last_opened_file', filename);
      app.memory.set('last_opened_file', filename);

      _refresh();
    }
  }

  var _refresh = function() {
    location.reload();
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
    open_input.click();
  }
}

app.main.saveFile = function() {
  var source = {};
  var _current_timestamp = new Date();

  app._runtime.saves++;


  Array.prototype.forEach.call(config.schema, function(key) {
    source[key] = window.store[config.app][key];
  });  

  source.file = app.os.generateFileHeading(_current_timestamp);


  try {
    source = JSON.stringify(source);
    source = source.replace(/\"/g, '"');
    source = 'window.' + config.app + ' = ' + source;
  } catch (err) {
    return app.error('app.main.saveFile', err);
  }


  var filename = config.app + '_save';
  var filename_date = app.utils.dateFormat(_current_timestamp, 'Y-m-d_H-g-s');

  filename += '_' + filename_date;
  filename += '_' + app.utils.numberLendingZero(app._runtime.saves);


  var file = new File(
    [ source ],
    filename + '.js',
    { type: 'application/x-javascript;charset=utf-8' }
  );

  saveAs(file);
}

app.main.controlView = function(e) {
  var config = window.config;
  var main = window.main;

  if (! config) {
    return app.error('app.main.controlView', null, 'config');
  }

  if (! e.data) {
    return app.error('app.main.controlView', arguments);
  }

  try {
    var ctl = JSON.parse(e.data);
  } catch (err) {
    return app.error('app.main.controlView', err);
  }


  var _s_events = { 'resize': 'resize', 'refresh': 'refresh' };
  var _events = app.utils.extendObject(config.events, _s_events);
  var _event = null;

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
      return app.error('app.main().setAction', 'ctl.action');
    }

    _loc.action = _events[_loc.action];

    return _loc.action;
  }

  _control.getAction = function() {
    if (! _loc.action) {
      return app.error('app.main().setAction', 'loc.actionn');
    }

    return _loc.action;
  }

  _control.setTitle = function(title) {
    if (! (title && typeof title === 'string')) {
      return app.error('app.main().setTitle','title');
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

  _control.redirect = function(path, qs) {
    var _href = _control.getURL();

    location.href = href;
  }

  _control.refresh = function() {
    location.reload();
  }

  _control.resize = function() {
    var height = parseInt(ctl.height);
    var view = document.getElementById('view');

    view.height = height;
    view.scrolling = 'no';
  }

  _control.selection = function() {
    _control.setURL();

    _control.redirect();
  }

  _control.prepare = function() {
    var action = _control.setAction();
    var id = _control.getID();

    _control.setURL(null, action + (id && '=' + id));

    if (ctl.history) {
      _control.history();
    }

    _control.submit();
  }

  _control.prevent = function() {
    var action = _control.setAction();
    var msg = _control.getMsg();

    if (! msg) {
      return app.error('app.main().' + event, 'url');
    }

    _control.setURL(null, action);

    if (! window.confirm(msg)) {
      return;
    }

    _control.submit();
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

  _control.submit = function() {
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

        if (action != 'update') {
          app.main.loadView(loc);
        }
      }, config.app, config.schema, _data);
    } catch (err) {
      return app.error('main.controlView.submit', err);
    }
  }


  if (main && 'controlView' in main) {
    return main.controlView(_control, _event, ctl);
  } else {
    return _control[_event]();
  }
}

app.main.action = function(element, event) {
  var main = window.main;

  if (! element || typeof event !== 'string') {
    return app.error('main.action', arguments);
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


  if (main && 'action' in main) {
    return main.action(_action, element, event);
  } else {
    return _control[event]();
  }

  return _action[event];
}

app.main.setupData = function(loc) {
  var main = window.main;

  if (main && 'setupData' in main) {
    main.setupData.apply(loc);
  }

  app.main.loadView(loc);
}

app.main.load = function() {
  window.store = {};


  app.resume(config);


  var title = config.title;
  var routine = config.auxs;
  routine.push({ file: '', fn: config.app, schema: config.schema });

  app.controller.retrieve(app.main.setupData, routine);
  app.controller.setTitle(title);


  var navbar_brand = document.getElementById('brand');
  brand.innerHTML = title;


  var open_actions = document.querySelectorAll('.main-action-open');

  if (open_actions.length) {
    Array.prototype.forEach.call(open_actions, function(element) {
      app.utils.addEvent('click', element, app.main.openFile);
    });
  }

  var save_actions = document.querySelectorAll('.main-action-save');

  if (save_actions.length) {
    Array.prototype.forEach.call(save_actions, function(element) {
      app.utils.addEvent('click', element, app.main.saveFile);
    });
  }


  app.utils.addEvent('message', window, app.main.controlView);
}

app.main.unload = function() {
  if (! app.memory.has('save_reminded') && app.memory.get('last_opened_file') !== app.memory.get('last_stored')) {
    return;
  }

  app.memory.set('save_reminded', true);

  return true;
}


app.view = {};

app.view.spoof = function() {
  var loc = { action: null, index: null };

  if (location.href.indexOf('?') != -1) {
    var ref = location.href.split('?')[1];

    if (ref.indexOf('&') != -1) {
      ref = ref.split('&');

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

  _open.uninitialized = function(fnName) {
    return app.error('app.view.open().uninitialized', null, fnName);
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

  _open.setTitle = function(sectionTitle, viewTitle, id) {
    _initialized || _uninitialized('setTitle');

    var event = _open.getEvent();

    var _view_title = document.getElementById('view-title');
    var _section_title = document.getElementById('section-title');

    id = parseInt(id) || _open.getID();

    if (event === 'edit') {
      sectionTitle += ' # ' + id;
    }

    if (viewTitle) {
      _view_title.innerHTML = viewTitle;
    }
    if (sectionTitle) {
      _section_title.innerHTML = sectionTitle;
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
      action_handler_event = action_handler_event.replace('{event}', event);
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

    var order = ((_order && _order instanceof Array) && _order) || Object.keys(data);

    if (_data && typeof _data === 'object') {
      data = _data;
    }

    var _args = Object.values(arguments).slice(3);

    var tbody = table.querySelector('tbody');
    var trow_tpl = tbody.querySelector('tr.tpl').cloneNode(true);
    trow_tpl.classList.remove('tpl');

    var _rows = '';

    Array.prototype.forEach.call(order, function(id) {
      var row = control.renderRow(trow_tpl, id, data[id], _args);
      _rows += row.outerHTML;
    });

    tbody.innerHTML = _rows;

    return { table: table, tbody: tbody, trow_tpl: trow_tpl, rows: _rows, data: data, args: _args };
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

    control.fillForm(data, _args);

    return { form: form, data: data, args: _args };
  }

  _open.fillSelection = function(_data, id) {
    _initialized || _open.uninitialized('fillSelection');

    if (! (_data && typeof _data === 'object')) {
      return app.error('app.view.open().fillSelection', arguments);
    }

    var selection = document.getElementById('selection');

    id = id || '';

    selection.innerHTML = app.layout.renderSelectOptions(selection, _data, id);
    selection.value = id;
  } 

  _open.fillCTA = function(id) {
    _initialized || _open.uninitialized('fillCTA');

    id = parseInt(id) || _open.getID();

    var section_actions_top = document.getElementById('section-actions-top');
    var section_actions_bottom = document.getElementById('section-actions-bottom');

    if (section_actions_top) {
      section_actions_top.innerHTML = section_actions_top.innerHTML.replace(/\{id\}/g, id);
    }

    if (section_actions_bottom) {
      section_actions_bottom.innerHTML = section_actions_bottom.innerHTML.replace(/\{id\}/g, id);
    }
  }

  return _open;
}

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

  _action.uninitialized = function(fnName) {
    return app.error('app.view.action().uninitialized', null, fnName);
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
      }

      if (_submit === true) {
        ctl.submit = true;
        ctl.data = JSON.stringify(_data);

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

  _action.selection = function(_data, _submit) {
    _initialized || _action.uninitialized('selection');

    _data = _data || element.value.toString();

    return _action.prepare(_data, _submit);
  }

  _action.print = function() {
    _initialized || _action.uninitialized('print');

    window.print();
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

    return true;
  }

  return _action;
}

app.view.sub = function(method, element, table) {
  if (! method || ! element) {
    return app.error('app.view.sub', arguments);
  }

  var _sub = {};

  _sub.csv = function(filename_prefix, filename_date_format, filename_separator) {
    if (! table) {
      return app.error('app.view.sub.csv', arguments);
    }

    var source = '';
    var table_csv = app.view.convertTableCSV(table);

    Array.prototype.forEach.call(table_csv, function(line) {
      source += line.join(';') + '\r\n';
    });

    var filename = filename_prefix ? filename_prefix : 'csv_export';

    filename_separator = filename_separator || '_';
    filename_date_format = filename_date_format || 'Y-m-d_H-g';
    filename += filename_separator + app.utils.dateFormat(true, filename_date_format);

    var file = new File(
      [ source ],
      filename + '.csv',
      { type: 'text/csv;charset=utf-8' }
    );

    saveAs(file);
  }

  _sub.clipboard = function() {
    if (! table) {
      return app.error('app.view.sub.clipboard', arguments);
    }

    var source = '';
    var table_csv = app.view.convertTableCSV(table);

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

app.view.openView = function() {
  var control = window.control;

  if (! control) {
    return app.error('app.view.openView', null);
  }

  control.openView();

  app.utils.addEvent('resize', window, app.view.resizeView);
  app.utils.addEvent('orientationchange', window, app.view.resizeView);
}

app.view.resizeView = function(check_time) {
  var control = window.control;

  if (! (control && control.temp)) {
    return; //TODO improve silentfail
  }

  if (check_time) {
    if ((new Date().getTime() - control.temp.last_resize) < 3000) {
      return;
    }

    control.temp.last_resize = new Date().getTime();
  }


  var ctl = { action: 'resize', height: document.documentElement.scrollHeight };

  var cursor = app.controller.cursor();

  if ('view' in cursor) {
    ctl.view = cursor.view;
  }

  ctl = JSON.stringify(ctl);

  window.parent.postMessage(ctl, '*');

  return true;
}

app.view.submit = function(ctl) {
  if (! ctl) {
    return; //silent fail
  }

  if (typeof ctl !== 'object') {
    return app.error('app.view.submit', arguments);
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





    window.parent.postMessage(ctl, '*');
  } catch (err) {
    return app.error('app.view.submit', null, err);
  }
}

app.view.getLastID = function(data) {
  if (typeof data !== 'object') {
    return app.error('app.view.getLastID', arguments);
  }

  var last_id = Object.keys(data).pop();

  return last_id ? (parseInt(last_id) + 1) : 1;
}

app.view.getFormData = function(elements, key) {
  if (! (elements && elements.length)) {
    return app.error('app.view.getFormData', arguments);
  }

  if (key && typeof key !== 'string') {
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

app.view.convertTableCSV = function(table) {
  if (! table) {
    return app.error('app.view.convertTableCSV', arguments);
  }

  var thead_th = table.querySelectorAll('thead th');
  var tbody_trow = table.querySelectorAll('tbody tr');

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

app.view.load = function() {
  var config = window.config;

  if (! config) {
    return app.error('app.view.load', null);
  }

  window.store = {};

  app.resume(config);

  var routine = config.auxs;
  routine.push({ fn: config.app, schema: config.schema });

  app.controller.retrieve(app.view.openView, routine);
}

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
 * app.utils.isPlainObject ($.jQuery.fn.isPlainObject)
 *
 * from: jQuery JavaScript Library
 * link: https://jquery.com/
 * copyright: Copyright JS Foundation and other contributors
 * license: MIT license <https://jquery.org/license>
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
 * app.utils.extendObject ($.jQuery.fn.extend)
 *
 * from: jQuery JavaScript Library
 * link: https://jquery.com/
 * copyright: Copyright JS Foundation and other contributors
 * license: MIT license <https://jquery.org/license>
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

app.utils.addEvent = function(event, element, callback) {
  if (typeof event !== 'string' || ! element || typeof callback !== 'function') {
    return app.error('app.utils.addEvent', arguments);
  }

  if (element.addEventListener) {
    element.addEventListener(event, callback, false); 
  } else if (element.attachEvent) {
    element.attachEvent('on' + event, callback);
  }
}

app.utils.removeEvent = function(event, element, callback) {
  if (! event || ! element || typeof callback !== 'function') {
    return app.error('app.utils.removeEvent', arguments);
  }

  if (element.addEventListener) {
    element.removeEventListener(event, callback, false); 
  } else if (element.attachEvent) {
    element.detachEvent('on' + event, callback);
  }
}

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

app.utils.storage = function(type, method, key, value) {
  if (type === undefined || method === undefined) {
    return app.error('app.utils.storage', arguments);
  }

  var _fn = type ? 'sessionStorage' : app._runtime.storage;

  if (_fn in window === false) {
    return app.error('app.utils.storage', _fn);
  }


  var _storage = {};

  _storage.set = function(key, value) {
    if (key === undefined || value === undefined) {
      return app.error('app.utils.storage', arguments);
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
      return app.error('app.utils.storage', arguments);
    }

    var obj = window[_fn].getItem(key);

    try {
      var _obj = obj;
      obj = JSON.parse(obj);
    } catch (err) {
      obj = _obj;
    }

    return obj;
  }

  _storage.has = function(key, value) {
    if (key === undefined) {
      return app.error('app.utils.storage', arguments);
    }

    if (value) {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
    } else {
      value = true;
    }

    return (window[_fn].getItem(key) == value) ? true : false;
  }

  _storage.del = function(key) {
    if (key === undefined) {
      return app.error('app.utils.storage', arguments);
    }

    return window[_fn].removeItem(key);
  }

  _storage.reset = function() {
    return window[_fn].clear();
  }


  return _storage[method](key, value);
}

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
      case 'm': return app.utils.numberLendingZero(date.getMonth() + 1);
      case 'Y': return date.getFullYear();
      case 'y': return date.getFullYear().toString().slice(2);
      case 'H': return app.utils.numberLendingZero(date.getHours());
      case 'g': return app.utils.numberLendingZero(date.getMinutes());
      case 's': return app.utils.numberLendingZero(date.getSeconds());
      case 'u': return date.toISOString();
    }
  }

  format = format || 'Y-m-d H:g';
  format = format.match(/.{1}/g);

  var formatted_date = '';

  for (var i = 0; i < format.length; i++) {
    formatted_date += /[\W_]/.test(format[i]) ? format[i] : _date(format[i]);
  }

  return formatted_date;
}

app.utils.numberLendingZero = function(number) {
  return number < 10 ? '0' + number : number.toString();
}


app.load = function(fn) {
  var _loaded = false;

  var _proxy = function() {
    _loaded = true;

    if (! _loaded) {
      fn();
    }
  }

  if (document.readyState === 'complete') {
    _proxy();
  } else {
    document.addEventListener('DOMContentLoaded', _proxy);
  }

  if (! _loaded) {
    window.onload = fn;
  }
}

app.unload = function(fn) {
  window.onbeforeunload = fn;
}

app.redirect = function(config) {
  var _base = config.basePath;
  var _filename = 'index';

  if (window.location.href.indexOf(config.basePath + '/') != -1) {
    _base = '..';
    _filename = config.launcherName;
  }

  window.location.href = _base + '/' + _filename + '.html';
}

app.position = function() {
  var position = 'undefined';
  var loc = app.controller.cursor();

  if (loc && typeof loc === 'object') {
    position = JSON.stringify(loc);
  }

  return position;
}

app.resume = function(config, start) {
  if (! config) {
    app._runtime.exec = false;

    return app.error();
  }

  var _session = function() {
    var session_resume = null;

    if (document.cookie.indexOf('last_opened_file') != -1) {
      session_resume = document.cookie.replace(/(?:(?:^|.*;\s*)last_opened_file\s*\=\s*([^;]*).*$)|^.*$/, '$1');
    }
    if (! session_resume) {
      session_resume = app.store.get('last_opened_file');
    }
    if (! session_resume) {
      session_resume = app.memory.get('last_opened_file');
    }
    if (! session_resume && ! start) {
      app._runtime.exec = false;
      app.error();
      //app.redirect(config);
    }
    if (session_resume) {
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

app.stop = function() {
  app._runtime.exec = false;
}

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
      console.error(msg || 'ERR', fnn, app.position());
    } else {
      console.warn(msg || 'WARN', fnn, app.position());
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

  if (app._runtime.notify !== undefined && ! app._runtime.notify) {
    var _alert = top.alert || parent.alert || window.alert;
    _alert(msg);
  }

  if (! app._runtime.exec) {
    app._runtime.notify = false;

    app.blind();
  }

  return app._runtime.exec;
}

app.blind = function() {
  var _high = top.document || parent.document || window.document;
  var _blind = document.createElement('div');
  _blind.setAttribute('style', 'position:absolute;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,0.3);');

  _high.body.appendChild(_blind);
}

app.getVersion = function(info) {
  switch (info) {
    case 'version' : return app._runtime.version;
    case 'release' : return app._runtime.release;
    default : return { 'version': app._runtime.version, 'release': app._runtime.release };
  }
}
