/*!
 * {appe}
 * ver. 1.0 alpha
 *
 * Copyright 2018 Leonardo Laureti
 *
 * MIT License
 */

var app;

window.app = app = {};

app._runtime = {
  system: null,
  version: '1.0',
  release: '1.0 alpha',
  exec: true,
  title: '',
  storage: 'localStorage',
  save: 0
};


app.os = {};

app.os.fileOpen = function(config, callback) {
  if (typeof config !== 'object' || typeof callback !== 'function') {
    return app.error(null, [ 'app.os.fileOpen' ]);
  }

  if (! this.files.length) {
    return;
  }

  var file = this.files[0];

  if (file.type.indexOf('javascript') === -1) {
    return app.error('Il formato di file non è corretto.', [ 'app.os.fileOpen' ]);
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
        return app.error(null, [ 'app.os.fileOpen' ]);
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

app.os.scriptOpen = function(callback, file, fn, memo, max_attempts) {
  if (typeof callback !== 'function' || typeof file !== 'string' || (fn && typeof fn !== 'string')) {
    return app.error(null, [ 'app.os.scriptOpen' ]);
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
    return app.error(null, [ 'app.os.getLastFileName' ]);
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
    return app.error(null, [ 'app.os.getLastFileVersion' ]);
  }

  var data_file = window.store[config.app]['file'];

  if (! data_file) {
    return app.error(null, [ 'app.os.getLastFileVersion' ]);
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
  if (! config || ! data_file) {
    return app.error(null, [ 'app.os.getLastFileChecksum' ]);
  }

  var data_file = window.store[config.app]['file'];

  if (! data_file) {
    return app.error(null, [ 'app.os.getLastFileChecksum' ]);
  }

  var file_checksum = null;

  if (data_file.checksum) {
    file_checksum = data_file.checksum;
  }

  return file_checksum;
}

app.os.getLastFileHeading = function(config) {
  if (! config) {
    return app.error(null, [ 'app.os.getLastFileHeadings' ]);
  }

  return {
    'name': app.os.getLastFileName(config),
    'version': app.os.getLastFileVersion(config),
    'checksum': app.os.getLastFileChecksum(config)
  };
}


app.memory = {};

app.memory.set = function(key, value) {
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  if (sessionStorage) {
    sessionStorage.setItem(key, value);

    var _set = (sessionStorage.getItem(key) == value) ? true : false;
    return _set;
  }

  var obj = window.tmp;

  if (! obj || typeof obj !== 'object') {
    obj = {};
  }

  var _set = (obj[key] == value) ? true : false;
  top.tmp = parent.tmp = window.tmp = obj;
  return _set;
}

app.memory.get = function(key) {
  if (sessionStorage) {
    var obj = sessionStorage.getItem(key);

    try {
      var _obj = obj;
      obj = JSON.parse(obj);
    } catch (err) {
      obj = _obj;
    }

    return obj;
  }

  var obj = window.tmp;

  if (! obj || typeof obj !== 'object') {
    obj = {};
  }

  if (key in obj) {
    if (typeof obj[key] === 'object') {
      obj[key] = JSON.parse(obj[key]);
    }

    return obj[key];
  }

  return '';
}

app.memory.has = function(key, value) {
  if (value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
  } else {
    value = true;
  }

  if (sessionStorage) {
    return (sessionStorage.getItem(key) === value) ? true : false;
  }

  var obj = window.tmp;

  if (! obj || typeof obj !== 'object') {
    obj = {};
  }

  return (key in obj && (obj[key] === value)) ? true : false;
}

app.memory.del = function(key) {
  if (sessionStorage) {
    return sessionStorage.removeItem(key);
  }

  var top = window.top || undefined;
  var obj = top.tmp || parent.tmp || window.tmp;

  if (! obj || typeof obj !== 'object') {
    obj = {};
  }

  var _del = (key in obj && (delete obj[key])) ? true : false;
  window.tmp = obj;
  return _del;
}

app.memory.reset = function() {
  if (sessionStorage) {
    return sessionStorage.clear();
  }

  var obj = top.tmp || parent.tmp || window.tmp;
  obj = {};
  window.tmp = obj;
  return true;
}


app.store = {};

app.store.set = function(key, value) {
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  window[app._runtime.storage].setItem(key, value);

  var _set = (window[app._runtime.storage].getItem(key) == value) ? true : false;
  return _set;
}

app.store.get = function(key) {
  var obj = window[app._runtime.storage].getItem(key);

  try {
    var _obj = obj;
    obj = JSON.parse(obj);
  } catch (err) {
    obj = _obj;
  }

  return obj;
}

app.store.has = function(key, value) {
  if (value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
  } else {
    value = true;
  }

  return (window[app._runtime.storage].getItem(key) == value) ? true : false;
}

app.store.del = function(key) {
  return window[app._runtime.storage].removeItem(key);
}

app.store.reset = function() {
  return window[app._runtime.storage].clear();
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
      return app.error(null, [ app.position(), 'app.controller.cursor' ]);
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

  if (navigator.userAgent.indexOf('Safari') != -1) {
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
    return app.error(null, [ app.position(), 'app.controller.retrieve' ]);
  }

  var _retrieve = function(fn, schema) {
    if (typeof fn !== 'string' || typeof schema !== 'object') {
      return app.error(null, [ app.position(), 'app.controller.retrieve', '_retrieve' ]);
    }

    var _data = window.store;

    if (_data[fn] && typeof _data[fn] === 'object') {
      return _data[fn];
    }

    _data = {};

    for (var i = 0; i < schema.length; i++) {
      var obj = app.store.get(fn + '_' + schema[i]);

      if (! obj) {
        return app.error(null, [ app.position(), 'app.controller.retrieve', '_retrieve' ]);
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
    return app.error(null, [ app.position(), 'app.controller.store' ]);
  }

  var source = window.store[fn];

  if (! source) {
    return app.error(null, [ app.position(), 'app.controller.store' ]);
  }

  var _store = function(key, values) {
    if (typeof key !== 'string' || typeof values !== 'object') {
      return app.error(null, [ app.position(), 'app.controller.store', '_store' ]);
    }

    if (! source[key]) {
      return app.error(null, [ app.position(), 'app.controller.store', '_store' ]);
    }

    /*var _data = source[key];
    var _keys = Object.keys(values);

    for (var i = 0; i < _keys.length; i++) {
      var _key = _keys[i];
      source[key][_key] = values[_key];
    }

    var obj = app.store.set(fn + '_' + key, _data);*/

    var _data = values;
    var obj = app.store.set(fn + '_' + key, _data);

    if (! obj) {
      return app.error(null, [ app.position(), 'app.controller.store', '_store' ]);
    }

    return _data;
  }

  var keys = Object.keys(data);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var values = data[key];

    if (schema.indexOf(key) === -1 || ! Object.keys(values).length) {
      return app.error(null, [ app.position(), 'app.controller.store' ]);
    }

    window.store[fn][key] = _store(key, values);
  }

  app.memory.set('last_stored', new Date().toISOString());

  callback();
}

app.controller.clear = function(fn, schema) {
  if (typeof fn !== 'string' || typeof schema !== 'object') {
    return app.error(null, [ app.position(), 'app.controller.clear' ]);
  }

  if (fn in window.store) {
    delete window.store[fn];
  }

  for (var i = 0; i < schema.length; i++) {
    app.store.del(fn + '_' + schema[i]);
  }

  app.memory.del('last_stored');
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

app.view.resizeView = function() {
  if (! control.temp) {
    return; //TODO improve silentfail
  }

  if (check_time) {
    if ((new Date().getTime() - control.temp.last_resize) < 3000) {
      return;
    }

    control.temp.last_resize = new Date().getTime();
  }

  ctl = { view: app.position(), action: 'resize', height: document.documentElement.scrollHeight };
  ctl = JSON.stringify(ctl);
  window.parent.postMessage(ctl, '*');
  return true;
}

app.view.renderSelect = function(select_id, data) {
  if (! select_id) {
    return app.error(null, [ app.position(), 'app.view.renderSelect' ]);
  }

  var data_keys = [];

  data_keys = Object.keys(data);

  var select_opts = '';

  for (var i = 0; i < Object.keys(data).length; i++) {
    var _opt_key = data_keys[i];
    var _opt_value = data[_opt_key].name;
    var _opt_selected = data[_opt_key].selected ? ' selected' : '';

    var option = '';

    option += '<option value="' + _opt_key + '"' + _opt_selected + '>';
    option += _opt_value;
    option += '</option>';

    select_opts += option;
  }

  return select_opts;
}

app.view.convertTableCSV = function(table) {
  if (! table) {
    return app.error(null, [ app.position(), 'app.view.convertTableCSV' ]);
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

app.view.copyToClipboard = function(table) {
  if (! table) {
    return app.error(null, [ app.position(), 'app.view.copyToClipboard' ]);
  }

  var source = '';
  var table_csv = control.convertTableCSV(table);

  Array.prototype.forEach.call(table_csv, function(line) {
    source += line.join('\t') + '\r\n'; //TODO safari
  });

  var _clipboard = document.createElement('TEXTAREA');
  _clipboard.style = 'width:0;height:0;overflow:hidden';
  _clipboard.value = source;
  document.body.appendChild(_clipboard);
  _clipboard.focus();
  _clipboard.select();
  document.execCommand('copy');
  document.body.removeChild(_clipboard);
}


app.utils = {};

app.utils.addEvent = function(event, element, callback) {
  if (typeof event !== 'string' || ! element || typeof callback !== 'function') {
    return app.error(null, [ app.position(), 'app.utils.addEvent' ]);
  }

  if (element.addEventListener) {
    element.addEventListener(event, callback, false);
  } else if (element.attachEvent) {
    element.attachEvent('on' + event, callback);
  }
}

app.utils.removeEvent = function(event, element, callback) {
  if (typeof event !== 'string' || ! element || typeof callback !== 'function') {
    return app.error(null, [ app.position(), 'app.utils.removeEvent' ]);
  }

  if (element.removeEventListener) {
    element.removeEventListener(event, callback);
  } else if (element.detachEvent) {
    element.detachEvent('on' + event, callback);
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

app.utils.getFormData = function(elements, key) {
  if (! (elements && elements.length)) {
    return app.error(null, [ 'app.utils.getFormData' ]);
  }

  if (key && typeof key !== 'string') {
    return app.error(null, [ 'app.utils.getFormData' ]);
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
      switch (transform) {
        case 'lowercase' : value = value.toLowerCase(); break;
        case 'uppercase' : value = value.toUpperCase(); break;
        case 'numeric' : value = parseFloat(value); break;
        case 'integer' : value = parseInt(value); break;
        case 'json' :
          value = decodeURIComponent(value);
          value = JSON.parse(value);
        break;
      }      
    }

    if (sanitize) {
      switch (sanitize) {
        case 'whitespace' : value = value.replace(/\\s/g, ''); break;
        case 'breakline' : value = value.replace(/\\r\\n/g, ''); break;
        case 'date' : value = new Date(value).toISOString().split('T')[0]; break;
        case 'datetime' : value = new Date(value).toISOString(); break;
        case 'datetime-local' : value = new Date(value).toISOString().split('.')[0]; break;
        case 'array' :
          if (typeof value === 'object' && value instanceof Array) {
            var _value = [];

            Array.prototype.forEach.call(value, function(value, i) {
              if (value === null) {
                return;
              }

              _value[i] = value;
            });

            value = _value;
          }
        break;
      }
    }

    if (value === undefined) {
      value = null;
    }

    if (name) {
      if (name.indexOf('[') != -1) {
        name = name.replace(/\]/g, '').split('[');

        if (! data[name[0]]) {
          data[name[0]] = {};
        }

        if (name.length === 1) {
          data[name[0]] = value;
        } else if (name.length === 2) {
          data[name[0]][name[1]] = value;
        } else if (name.length === 3) {
          if (! data[name[0]][name[1]]) {
            data[name[0]][name[1]] = {};
          }

          data[name[0]][name[1]][name[2]] = value;
        }
      } else {
        data[name] = value;
      }
    }
  }

  return data;
}


app.redirection = function(config) {
  window.location.href = config.basePath + '/index.html';
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

  app._runtime.system = app.utils.system();

  if (navigator.userAgent.indexOf('Safari') != -1) {
    app._runtime.storage = 'sessionStorage';
  }

  document.documentElement.setAttribute('lang', config.language);

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
    window.location.href = config.basePath + '/index.html';
  }
  if (session_resume) {
    session_resume = window.atob(session_resume) + '.js';
  }

  return session_resume;
}

app.stop = function() {
  app._runtime.exec = false;
}

//TODO improve
app.error = function(msg, info, attachs) {
  if (info) {
    console.info(info);
  }

  if (attachs) {
    console.log(attachs);
  }

  if (! app._runtime.exec) {
    console.warn(msg || 'WARN');
    return;
  }

  console.error(msg || 'ERR');

  if (! msg) {
    msg = 'Si è verificato un errore, impossibile proseguire.';
  }

  var alert = top.alert || parent.alert || window.alert;
  //alert(msg);
  return false;
}

app.getVersion = function(info) {
  switch (info) {
    case 'version' : return app._runtime.version;
    case 'release' : return app._runtime.release;
    default : return { 'version': app._runtime.version, 'release': app._runtime.release };
  }
}
