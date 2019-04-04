/*!
 * {appe}
 *
 * @version 1.0.0~beta
 * @copyright Copyright 2018-2019 (c) Leonardo Laureti
 * @license MIT License
 *
 * contains:
 * - ($.jQuery.fn.isPlainObject) from jQuery JavaScript Library <https://jquery.com/>, Copyright JS Foundation and other contributors, MIT license <https://jquery.org/license>
 * - ($.jQuery.fn.extend) from jQuery JavaScript Library <https://jquery.com/>, Copyright JS Foundation and other contributors, MIT license <https://jquery.org/license>
 */

var app = window.app = {};


app._runtime = {
  version: '1.0',
  release: '1.0 beta',
  system: null,
  exec: true,
  title: '',
  name: '',
  storage: false,
  compression: false,
  encryption: false,
  debug: false,
  hangs: 0
};


/**
 * app.load
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

  var _func = function() {
    _loaded = true;

    if (! _loaded) {
      func();
    }
  }

  if (document.readyState === 'complete') {
    _func();
  } else {
    document.addEventListener('DOMContentLoaded', _func);
  }

  if (! _loaded) {
    window.onload = func;
  }
}


/**
 * app.unload
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
 * app.redirect
 *
 * Performs app redirects
 *
 * @global <Object> appe__config
 * @return
 */
app.redirect = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.redirect');
  }

  var _base = config.basePath.toString();
  var _filename = 'index';

  if (window.location.href.indexOf(_base + '/') != -1) {
    _base = '..';
    _filename = config.launcherName.toString();
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
 * Starts the session
 *
 * @global <Object> appe__store
 * @param <Object> config
 * @param <String> target
 * @return
 */
app.session = function(config, target) {
  if (! config) {
    return app.stop('app.session');
  }

  window.appe__store = {};

  app._runtime.name = config.app.toString();
  app._runtime.debug = !! config.debug ? true : false;
  app._runtime.encryption = !! config.encryption ? true : false;
  app._runtime.compression = !! config.compression || !! (config.file && config.file.binary) ? app._runtime.encryption : false;


  // only main
  if (target) {
    setTimeout(function() {
      app.store.has('notify') && app.store.del('notify');

      this.clearTimeout();
    }, 0);

  }

  // only start and main
  if (target === false) {
    return;
  }


  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    return app.error('app.session', 'pako');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    return app.error('app.session', 'CryptoJS');
  }


  var _secret_passphrase = null;

  var loaded = false;
  var max_attempts = config.openAttempts;


  var _loadAttempt = function(callback, fn) {
    var max = parseInt(max_attempts) || 5;
    var attempts = 0;

    var interr = setInterval(function() {
      attempts++;

      console.log(target, attempts);

      if (!! window[fn] || max === attempts) {
        clearInterval(interr);

        callback();
      }
    }, 1000);
  }

  var _binary = function() {
    if (! (pako && pako.inflate && pako.deflate)) {
      return app.error('app.session', 'pako');
    }
  }

  var _doBinary = function() {
    if ('pako' in window === false) {
      loaded = false;

      _loadAttempt(_binary, 'pako');
    } else {
      _binary();
    }
  }

  var _crypto = function() {
    if (! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
      return app.error('app.session', 'CryptoJS');
    }

    var _secret = CryptoJS.SHA512(Math.random().toString(), { outputLength: 384 });

    app._runtime.secret = _secret.toString(CryptoJS.enc.Hex);

    document[app._runtime.secret] = _secret_passphrase;
  }

  var _doCrypto = function() {
    if (! (config.secret_passphrase && typeof config.secret_passphrase === 'string')) {
      return app.error('app.session', 'config');
    }

    _secret_passphrase = config.secret_passphrase.toString();

    delete config.secret_passphrase;


    if ('CryptoJS' in window === false) {
      loaded = false;

      _loadAttempt(_crypto, 'CryptoJS');
    } else {
      _crypto();
    }
  }

  if (!! app._runtime.compression || !! app._runtime.encryption) {
    app._runtime.compression && _doBinary();
    app._runtime.encryption && _doCrypto();
  }
}


/**
 * app.resume
 *
 * Resumes session, return last opened file
 *
 * @param <Object> config
 * @param <Boolean> target
 * @return <String> session_resume
 */
app.resume = function(config, target) {
  if (! config) {
    return app.stop('app.resume');
  }


  var _try = function() {
    var session_resume = '';
    var session_last = '';


    if (app.utils.cookie('has', 'last_opened_file')) {
      session_resume = app.utils.cookie('get', 'last_opened_file');
    }
    if (! session_resume) {
      session_resume = app.memory.get('last_opened_file');
    }


    if (app.utils.cookie('has', 'last_session')) {
      session_last = app.utils.cookie('get', 'last_session');
    }
    if (! session_last) {
      session_last = app.memory.get('last_session');
    }


    if (target === undefined && !! (! session_resume || session_last)) {
      // there's nothing to do
      //session_resume = false;
    } else if (!! app._runtime.debug && target !== undefined) {
      return (! session_last) && app.newSession();
    } else if (! session_last) {
      return app.redirect();
    }

    if (session_resume) {
      session_resume = app.utils.atob(session_resume) + '.js';
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

  document.documentElement.setAttribute('lang', config.language.toString());


  return _try();
}

/**
 * app.data
 *
 * Get data store
 *
 * @global <Object> appe__store
 * @param <String> key
 * @return <Object>
 */
app.data = function(key) {
  var store = window.appe__store;

  if (! store) {
    return app.stop('app.data', 'store');
  }

  //TODO fn
  var _app_name = app._runtime.name.toString();

  if (! store[_app_name]) {
    return app.stop('app.data', 'store');
  }

  if (key && typeof key === 'string') {
    if (key in store[_app_name]) {
      return store[_app_name][key];
    } else {
      return app.error('app.data', 'key');
    }
  }

  return store[_app_name];
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
    } else if ((key == 'schema' || key == 'events' || key == 'routes') && typeof config[key] != 'object') {
      _error = true;
    } else if (typeof config[key] != 'object' && typeof config[key] != 'string' && typeof config[key] != 'number' && typeof config[key] != 'boolean') {
      _error = true;
    }
  });

  if (
    (config.encryption && ! (config.secret_passphrase && typeof config.secret_passphrase == 'string')) ||
    (config.file && typeof config.file != 'object') ||
    (config.csv && typeof config.csv != 'object')
  ) {
    _error = true;
  }

  return !! _error && app.stop('app.checkConfig');
}


/**
 * app.checkFile
 *
 * Verifies opened file
 *
 * @global <Object> appe__config
 * @param <Object> source
 * @return <Boolean>
 */
app.checkFile = function(source) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.checkFile');
  }

  if (! (source && typeof source === 'object')) {
    return app.error('app.checkFile', arguments);
  }

  var _app_version = app._runtime.version.toString();

  if (_app_version !== source.file.version) {
    return app.error('app.checkFile', 'This file is incompatible with running version: ' + _app_version + '.', source.file);
  }

  if (!! config.verifyFileChecksum) {
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
 * @global <Object> appe__config
 * @global <Object> appe__start
 * @return <Boolean>
 */
app.newSession = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.openSession');
  }

  var _is_start = ! (window.appe__start === undefined);

  var _app_name = app._runtime.name.toString();

  var _current_timestamp = new Date();
  _current_timestamp = app.utils.dateFormat(_current_timestamp, 'Q');

  var _current_timestamp_enc = app.utils.btoa(_current_timestamp);


  var schema = config.schema;

  if (typeof schema !== 'object') {
    return app.error('app.openSession', 'schema');
  }


  var _new = function() {
    // reset current session data
    app.controller.clear();


    app.utils.cookie('del', 'last_opened_file');
    app.utils.cookie('del', 'last_session');

    app.utils.cookie('set', 'last_session', _current_timestamp_enc);


    app.memory.del('last_opened_file');
    app.memory.del('file_saves');

    app.memory.set('last_stored', _current_timestamp);
    app.memory.set('last_time', _current_timestamp);
    app.memory.set('last_session', _current_timestamp_enc);


    for (var i = 0; i < schema.length; i++) {
      app.store.set(_app_name + '_' + schema[i], {});
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
 * @global <Object> appe__config
 * @global <Object> appe__start
 * @param <Object> source
 * @return
 */
app.openSession = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.openSession');
  }

  var _is_start = ! (window.appe__start === undefined);

  var schema = config.schema;

  if (typeof schema !== 'object') {
    return app.error('app.openSession', 'schema');
  }

  var _current_timestamp = new Date();
  _current_timestamp = app.utils.dateFormat(_current_timestamp, 'Q');

  var _current_timestamp_enc = app.utils.btoa(_current_timestamp);


  var _open = function() {
    app.os.fileOpen.call(this, _complete);
  }

  var _complete = function(filename) {
    _is_start && app.start.progress(0);

    if (! filename) {
      return; // silent fail
    }


    app.utils.cookie('del', 'last_opened_file');
    app.utils.cookie('del', 'last_session');


    var _filename = filename.replace('.js', '');
    _filename = app.utils.btoa(_filename);


    app.utils.cookie('set', 'last_opened_file', _filename);
    app.utils.cookie('set', 'last_session', _current_timestamp_enc);


    app.memory.set('last_opened_file', _filename);

    app.memory.set('last_stored', _current_timestamp);
    app.memory.set('last_time', _current_timestamp);
    app.memory.set('last_session', _current_timestamp_enc);


    _is_start ? app.start.redirect(true) : location.reload();
  }


  var open_input = null;
  var _se_open_input = this.getAttribute('data-open');

  if (! _se_open_input) {
    this.setAttribute('data-open', '');

    var open_input_ref = this.getAttribute('data-open-input');
    var open_input = this.parentNode.querySelector(open_input_ref);

    app.utils.addEvent('change', open_input, _open);
  }

  if (open_input) {
    _is_start && app.start.progress(2);

    open_input.click();
  }
}


/**
 * app.saveSession
 *
 * Saves session to app js file
 *
 * @global <Object> appe__config
 * @global <Object> appe__store
 * @global <Object> appe__start
 * @param <Object> source
 */
app.saveSession = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.saveSession');
  }

  var store = window.appe__store;

  if (! store) {
    return app.stop('app.saveSession', 'store');
  }

  var _is_start = ! (window.appe__start === undefined);

  var _app_name = app._runtime.name.toString();

  var schema = config.schema;

  if (typeof schema !== 'object') {
    return app.error('app.saveSession', 'schema');
  }

  var source = {};

  var _current_timestamp = new Date();


  Array.prototype.forEach.call(schema, function(key) {
    source[key] = store[_app_name][key];
  });  

  source.file = app.os.generateFileHead(source, _current_timestamp);


  app.os.fileSave(function(filename) {
    if (!! app._runtime.debug) {
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

  var args = Object.values(arguments).slice(0);

  if (arguments.length == 1) {
    args.push(null);
  }

  app.error.apply(this, args);

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

  // avoid too much recursions
  if (!! app._runtime.hangs++) {
    return;
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
  var _is_main = ! (window.appe__main === undefined);

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
 * @global <Object> appe__config
 * @param <String> from
 * @param <String> info
 * @return
 */
app.getInfo = function(from, info) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.getConfig');
  }

  var _available_infos = null;

  switch (from) {
    case 'config':
      _available_infos = {
        'debug': !! config.debug ? true : false,
        'name': config.name.toString(),
        'language': config.language.toString(),
        'schema': typeof config.schema === 'object' ? config.schema : {},
        'license': config.license && (typeof config.license === 'object' ? { 'text': config.license.text.toString(), 'file': config.license.file.toString() } : config.license.toString()) || false
      };
    break;
    case 'runtime':
      _available_infos = {
        'version': app._runtime.version.toString(),
        'release': app._runtime.release.toString()
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
/**
 * app.os
 *
 * Handles filesystem functions
 */
app.os = {};


/**
 * app.os.fileOpen
 *
 * Opens a file through FileReader api, stores it, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> FileReader
 * @param <Function> callback
 * @return
 */
app.os.fileOpen = function(callback) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.os.fileOpen');
  }

  if (config.file && typeof config.file !== 'object') {
    return app.error('app.os.fileOpen', 'config');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    return app.error('app.os.fileOpen', 'zlib');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    return app.error('app.os.fileSave', 'CryptoJS');
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

  var _app_name = app._runtime.name.toString();

  var file = this.files[0];

  if (file.type.indexOf('javascript') === -1) {
    return app.error('app.os.fileOpen', 'The file format is not correct.', arguments);
  }

  var schema = config.schema;

  var file_binary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.compression;
  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_crypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;


  var _secret = null;

  if (file_crypt) {
    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in document) {
      _secret = document[app._runtime.secret];
    } else {
      return app.error('app.os.fileOpen', 'runtime');
    }
  }


  var reader = new FileReader();

  reader.onload = (function() {
    var source = this.result;

    // try to restore file source
    try {
      source = source.replace(new RegExp(file_heads + '\=(?![^"]+)'), '')
        .replace(/(^"|"$)/g, '');

      if (file_binary) {
        source = source.replace(/\"/g, '"'); //TODO test
        //source = app.utils.atob(source);
        source = pako.inflate(source, { level: 9, to: 'string' });

        if (! source) {
          throw 'binary';
        }
      }

      //source = source.replace(/[\r\n]([\s]+){2}/g, '');

      if (file_crypt && !! _secret) {
        source = CryptoJS.AES.decrypt(source, _secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
        source = source.toString(CryptoJS.enc.Utf8);

        if (! source) {
          throw 'crypt';
        }
      }

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

      app.store.set(_app_name + '_' + schema[i], source[schema[i]]);
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
 * @global <Object> appe__config
 * @param <Function> callback
 * @param <Object> source
 * @param <Date> timestamp
 * @return
 */
app.os.fileSave = function(callback, source, timestamp) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.os.fileSave');
  }

  if (config.file && typeof config.file !== 'object') {
    return app.error('app.os.fileSave', 'config');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    return app.error('app.os.fileSave', 'pako');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    return app.error('app.os.fileSave', 'CryptoJS');
  }

  if (! (callback && typeof callback === 'function') || ! (timestamp && timestamp instanceof Date)) {
    return app.error('app.os.fileSave', arguments);
  }

  if (! (source && typeof source === 'object')) {
    return callback(false);
  }

  var _app_name = app._runtime.name.toString();

  var file_binary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.compression;
  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_crypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;


  var _binary = null;

  if (file_binary) {
    _binary = true;
  }

  var _secret = null;

  if (file_crypt) {
    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in document) {
      _secret = document[app._runtime.secret];
    } else {
      return app.error('app.session', 'runtime');
    }
  }


  var wrapped = !! ((file_crypt && _secret) || (file_binary && _binary));

  // prepare file source
  try {
    source = JSON.stringify(source);
    source = source.replace(/\"/g, '"');

    if (file_crypt && !! _secret) {
      source = CryptoJS.AES.encrypt(source, _secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
      source = source.toString();

      if (! source) {
        throw 'crypt';
      }
    }
    if (file_binary) {
      source = pako.deflate(source, { level: 9, to: 'string' });
      //source = app.utils.btoa(source);
      source = source.replace(/"/g, '\"'); //TODO test

      if (! source) {
        throw 'binary';
      }
    }

    if (wrapped) {
      source = '"' + source + '"';
    }

    source = file_heads + '=' + source;
  } catch (err) {
    return app.error('app.os.fileSave', err);
  }


  var file_saves = app.memory.has('file_saves') ? parseInt(app.memory.get('file_saves')) : 0;

  file_saves++;

  var filename_prefix = config.file && config.file.filename_prefix ? config.file.filename_prefix.toString() : _app_name + '_save';
  var filename_separator = config.file && config.file.filename_separator ? config.file.filename_separator.toString() : '_';
  var filename_date_format = config.file && config.file.filename_date_format ? config.file.filename_date_format.toString() : 'Y-m-d_H-M-S';

  var filename = filename_prefix;
  var filename_date = app.utils.dateFormat(timestamp, filename_date_format);

  filename += filename_separator + filename_date;
  filename += filename_separator + file_saves;


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

  fn = fn.toString();


  var _load = function(file) {
    var script = document.createElement('script');
    script.src = file;
    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
  }

  var _check = function(callback, fn) {
    var max = parseInt(max_attempts) || 5;
    var attempts = 0;

    var interr = setInterval(function() {
      attempts++;

      if (!! window[fn] || max === attempts) {
        clearInterval(interr);

        callback();        
      }
    }, 1000);
  }

  _load(file);

  if (fn in window === false) {
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
 * @global <Object> appe__config
 * @param <Object> source
 * @param <Date> timestamp
 * @return <Object>
 */
app.os.generateFileHead = function(source, timestamp) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.os.generateFileHead');
  }

  if (! (source && typeof source === 'object') && ! (timestamp && timestamp instanceof Date)) {
    return app.error('app.os.generateFileHead', arguments);
  }

  var checksum = ''; //TODO
  var timestamp = app.utils.dateFormat(timestamp, 'Q');

  return {
    'checksum': checksum,
    'date': timestamp,
    'version': app._runtime.version.toString(),
    'release': app._runtime.release.toString()
  };
}


/**
 * app.os.getLastFileName
 *
 * Gets the last opened file name
 *
 * @global <Object> appe__config
 * @return <String>
 */
app.os.getLastFileName = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.os.getLastFileName');
  }

  var filename = '';

  if (app.utils.cookie('has', 'last_opened_file')) {
    filename = app.utils.cookie('get', 'last_opened_file');
  }
  if (! filename) {
    filename = app.memory.get('last_opened_file');
  }
  if (! filename) {
    return false;
  }


  filename = filename ? app.utils.atob(filename) + '.js' : null;

  return filename;
}


/**
 * app.os.getLastFileVersion
 *
 * Gets the last opened file version
 *
 * @global <Object> appe__store
 * @return <String>
 */
app.os.getLastFileVersion = function() {
  var store = window.appe__store;

  if (! store) {
    return app.stop('app.os.getLastFileVersion', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var data_file = store[_app_name]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileVersion', 'data_file');
  }

  var file_version = null;

  if (data_file.version) {
    file_version = data_file.version;
  }

  return file_version;
}


/**
 * app.os.getLastFileChecksum
 *
 * Gets the last opened file checksum
 *
 * @global <Object> appe__store
 * @return <String>
 */
app.os.getLastFileChecksum = function() {
  var store = window.appe__store;

  if (! store) {
    return app.stop('app.os.getLastFileChecksum', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var data_file = store[_app_name]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileChecksum', 'data_file');
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
/**
 * app.controller
 *
 * Controller functions
 */
app.controller = {};


/**
 * app.controller.cursor
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
  var _title = app._runtime.title.toString();

  if (title) {
    title += ' – ' + _title;
  } else {
    title = _title;
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
 * @return <String>
 */
app.controller.setTitle = function(title) {
  app._runtime.title = title.toString();

  document.title = app._runtime.title;

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
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.controller.retrieve');
  }

  var store = window.appe__store;

  if (! store) {
    return app.stop('app.controller.retrieve', 'store');
  }

  if (typeof callback !== 'function' || typeof routine !== 'object') {
    return app.stop('app.controller.retrieve', arguments);
  }

  var schema = config.schema;

  if (typeof schema !== 'object') {
    return app.error('app.controller.retrieve', 'schema');
  }


  var _retrieve = function(fn, schema) {
    if (typeof fn !== 'string' || typeof schema !== 'object') {
      return app.stop('app.controller.retrieve() > _retrieve', arguments);
    }

    if (store[fn] && typeof store[fn] === 'object') {
      return store[fn];
    }

    store = {};

    for (var i = 0; i < schema.length; i++) {
      var key = schema[i].toString();
      var obj = app.store.get(fn + '_' + key);

      if (! obj) {
        return app.stop('app.controller.retrieve() > _retrieve', 'obj');
      }

      store[key] = obj;
    }

    return store;
  }


  for (var i = 0; i < routine.length; i++) {
    var fn = routine[i].fn.toString();

    if (routine[i].file) {
      routine[i].file = '../' + routine[i].file.toString();
    }

    store[fn] = _retrieve(fn, routine[i].schema);
  }

  callback();
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
  var store = window.appe__store;

  if (! store) {
    return app.stop('app.controller.store', 'store');
  }

  if (typeof callback !== 'function' || typeof fn !== 'string' || typeof schema !== 'object' || typeof data !== 'object') {
    return app.stop('app.controller.store', arguments);
  }

  var source = store[fn];

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

    app.store.set(fn + '_' + key, _data);

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

    store[fn][key] = _store(key, values);
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
 * @global <Object> appe__config
 * @global <Object> appe__store
 * @return <Boolean>
 */
app.controller.clear = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.controller.clear');
  }

  var store = window.appe__store;

  if (! store) {
    return app.stop('app.controller.clear', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var schema = config.schema;

  if (typeof schema !== 'object') {
    return app.error('app.controller.clear', 'schema');
  }

  for (var i = 0; i < schema.length; i++) {
    var key = schema[i].toString();

    app.store.del(_app_name + '_' + key);

    if (store[_app_name] && key in store[_app_name]) {
      delete store[_app_name][key];
    }
  }

  app.memory.del('last_stored');

  return true;
}
/**
 * app.memory
 *
 * Handles persistent storage entries
 *
 * available methods:
 *  - set (key <String>, value)
 *  - get (key <String>)
 *  - has (has <String>, value)
 *  - del (key <String>)
 *  - reset ()
 */
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
/**
 * app.store
 *
 * Handles storage entries
 *
 * available methods:
 *  - set (key <String>, value)
 *  - get (key <String>)
 *  - has (has <String>, value)
 *  - del (key <String>)
 *  - reset ()
 */
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
/**
 * app.start
 *
 * Launcher functions
 */
app.start = {};

/**
 * app.start.progress
 *
 * Controls the current load status
 *
 * @param <Number> phase
 */
app.start.progress = function(phase) {
  var progress_wait = document.getElementById('start-progress-wait');
  var progress_open = document.getElementById('start-progress-open');

  switch (phase) {
    case 2:
      progress_open.setAttribute('style', 'visibility: visible;');
      progress_wait.setAttribute('style', 'visibility: visible;');
    break;
    case 1:
      progress_open.setAttribute('style', 'visibility: visible;');
      progress_wait.setAttribute('style', 'visibility: hidden;');
    break;
    default:
      progress_wait.setAttribute('style', 'visibility: visible;');
      progress_open.setAttribute('style', 'visibility: hidden;');
  }
}


/**
 * app.start.loadAttempt
 *
 * Attemps to load files and scripts, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> appe__store
 * @param <Function> callback
 * @param <String> fn
 * @param <String> file
 * @param <Object> schema
 * @param <Boolean> memoize
 * @return
 */
app.start.loadAttempt = function(callback, fn, file, schema, memoize) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.start.loadAttempt');
  }

  if (config.file && typeof config.file !== 'object') {
    return app.error('app.start.loadAttemp', 'config');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    return app.error('app.start.loadAttemp', 'pako');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    return app.error('app.start.loadAttemp', 'CryptoJS');
  }

  if (! callback || ! fn || ! file || ! schema) {
    return app.stop('app.start.loadAttemp', arguments);
  }

  if (typeof callback !== 'function' || typeof fn !== 'string' || typeof file !== 'string' || typeof schema !== 'object') {
    return app.stop('app.start.loadAttemp', arguments);
  }

  fn = fn.toString();

  var file_binary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.compression;
  var file_crypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;


  var _secret = null;

  if (file_crypt) {
    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in document) {
      _secret = document[app._runtime.secret];
    } else {
      return app.error('app.start.loadAttemp', 'runtime');
    }
  }


  var _binary = function(source) {
    try {
      source = source.replace(/\"/g, '"'); //TODO test
      //source = app.utils.atob(source);
      source = pako.inflate(source, { level: 9, to: 'string' });

      if (! source) {
        throw 'binary';
      }

      return source;
    } catch (err) {
      return app.error('app.start.loadAttempt() > _binary', err);
    }
  }

  var _crypto = function(source) {
    try {
      source = CryptoJS.AES.decrypt(source, _secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
      source = source.toString(CryptoJS.enc.Utf8);

      if (! source) {
        throw 'crypt';
      }

      return source;
    } catch (err) {
      return app.error('app.start.loadAttempt() > _crypto', err);
    }
  }

  var _try = function() {
    if (fn in window === false) {
      return app.error('app.start.loadAttemp', 'source');
    }

    var source = window[fn];

    if (! memoize) {
      return callback(false);
    }

    try {
      if (file_binary || file_crypt) {
        if (file_binary) {
          source = _binary(source);
        }
        if (file_crypt && !! _secret) {
          source = _crypto(source);
        }

        source = JSON.parse(source);
      }
    } catch (err) {
      return app.error('app.start.loadAttemp', err);
    }

    if (! source) {
      return callback(false);
    }

    for (var i = 0; i < schema.length; i++) {
      var key = schema[i].toString();

      if (key in source === false) {
        return app.error('app.start.loadAttemp', 'schema');
      }

      loaded = app.store.set(fn + '_' + key, source[key]);
    }

    callback(loaded);
  }


  var loaded = false;
  var max_attempts = parseInt(config.openAttempts);

  app.os.scriptOpen(_try, file, fn, max_attempts);
}


/**
 * app.start.loadComplete
 *
 * Fires on "start" load complete
 *
 * @global <Object> appe__config
 * @param <String> session_resume
 * @return
 */
app.start.loadComplete = function(session_resume) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.start.loadComplete');
  }

  if (config.file && typeof config.file !== 'object') {
    return app.error('app.start.loadComplete', 'config');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    return app.error('app.start.loadComplete', 'pako');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    return app.error('app.start.loadComplete', 'CryptoJS');
  }

  if (! session_resume) {
    return app.start.progress(1);
  }

  var _app_name = app._runtime.name.toString();

  var schema = config.schema;

  if (typeof schema !== 'object') {
    return app.error('app.start.loadComplete', 'schema');
  }

  session_resume = config.savePath.toString() + '/' + session_resume; 


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;


  app.start.loadAttempt(function(loaded) {
    if (loaded) {
      app.start.redirect(true);
    } else {
      app.start.progress(1);
    }
  }, file_heads, session_resume, schema, true);

  app.start.progress(1);
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
    app.start.progress(false);

    app.redirect();

    this.clearTimeout();
  }

  setTimeout(_wait, 1000);
}


/**
 * app.start.alternative
 *
 * //TODO hook
 *
 * Display messages with info and alternatives to help to execute app 
 *
 * @global <Object> appe__config
 * @return
 */
app.start.alternative = function() {
  var config = window.appe__config;

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
  //TODO check config.altExecPlatform before
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

  app.start.progress(1);

  return app.error(alt_electron);
}


/**
 * app.start.load
 *
 * Default "start" load function
 *
 * @global <Object> appe__config
 * @return
 */
app.start.load = function() {
  var config = window.appe__config;

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

  app.controller.setTitle(config.name);

  var open_action = document.getElementById('start-action-open');
  app.utils.addEvent('click', open_action, app.openSession);

  var new_action = document.getElementById('start-action-new');
  app.utils.addEvent('click', new_action, app.newSession);

  var _loaded = true;

  // try to load extensions
  var routine = (config.auxs && typeof config.auxs === 'object') ? config.auxs : {};

  if (routine.length) {
    for (var i = 0; i < routine.length; i++) {
      app.start.loadAttempt(function(aux_loaded) {
        if (! aux_loaded) {
          _loaded = false;
        }
      }, routine[i].fn, routine[i].file, routine[i].schema, routine[i].memoize);
    }
  }

  if (_loaded) {
    app.start.loadComplete(session_resume);
  } else {
    return app.error('app.start.alternative', 'aux_loaded');
  }
}
/**
 * app.main
 *
 * "main" functions
 */
app.main = {};

/**
 * app.main.control
 *
 * Init "main" function that fires when "main" document is ready
 *
 * @global <Object> appe__config
 * @param <Object> loc
 * @return
 */
app.main.control = function(loc) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.main.control');
  }

  if (! (config.routes && typeof config.routes === 'object') || ! (config.events && typeof config.events === 'object')) {
    return app.error('app.main.control', 'config');
  }

  var view = document.getElementById('view');

  var _routes = config.routes;
  var _events = config.events;

  var actions = {};

  Array.prototype.forEach.call(Object.keys(_events), function(event) {
    actions[_events[event]] = event;
  });

  if (! loc) {
    loc = app.controller.spoof();
  }

  var default_route = config.defaultRoute.toString();
  var route = default_route + '.html';
  var step = true;

  if (loc && typeof loc === 'object') {
    if (loc.view) {
      if (!! _routes[loc.view]) {
        route = encodeURIComponent(loc.view) + '.html';
      } else {
        step = false;
      }

      if (loc.action) {
        if (!! _routes[loc.view][loc.action]) {
          route = _routes[loc.view][loc.action].toString() + '.html';
          route += '?' + encodeURIComponent(loc.action);
        } else {
          step = false;
        }

        //TODO <Number> | <String>
        if (loc.index) {
          route += '&id=' + encodeURIComponent(loc.index);
        }
      }
    } else {
      loc = { 'view': default_route };
    }
  } else {
    step = false;
  }

  if (step && typeof route === 'string') {
    app.controller.cursor(loc);

    // set view
    var _view_src = 'views/' + route;

    view.removeAttribute('height');
    view.setAttribute('src', _view_src);

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
    return app.stop('app.main.control', arguments);
  }
}


/**
 * app.main.handle
 *
 * Control "main" function handling requests, could return object constructor
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
 * @global <Object> appe__config
 * @global <Object> appe__main
 * @param <Object> e
 * @return
 */
app.main.handle = function(e) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.main.handle');
  }

  if (! (config.events && typeof config.events === 'object')) {
    return app.error('app.main.handle', 'config');
  }

  var main = window.appe__main;

  var self = app.main.handle.prototype;

  if (! e.data) {
    return app.error('app.main.handle', arguments);
  }

  try {
    self.ctl = JSON.parse(e.data);
  } catch (err) {
    return app.error('app.main.handle', err);
  }


  // standard events
  var _s_events = { 'resize': 'resize', 'refresh': 'refresh', 'export': 'export' };

  var _events = config.events;

  self.events = app.utils.extendObject(_events, _s_events);

  self.event = null;

  // check is allowed action
  if (self.ctl.action && self.ctl.action in self.events) {
    self.event = self.ctl.action;
  } else {
    return app.error('app.main.handle', self.ctl);
  }

  self.loc = app.utils.extendObject({}, self.ctl);

  self._href = '';
  self._title = '';
  self._msg = '';


  /**
   * main.handle hook
   *
   * @param <Object> __constructor
   * @param <String> event
   * @param <Object> ctl
   */
  if (main && 'handle' in main && typeof main.handle === 'function') {
    return main.handle(self, self.event, self.ctl);
  } else {
    return self[self.event].apply(self);
  }
}

app.main.handle.prototype.getID = function() {
  var id = parseInt(this.ctl.index) || 0;

  return id;
}

app.main.handle.prototype.setAction = function() {
  if (this.ctl.action in this.events === false) {
    return app.error('app.main.prototype.setAction', 'ctl');
  }

  this.loc.action = this.events[this.loc.action].toString();

  return this.loc.action;
}

app.main.handle.prototype.getAction = function() {
  if (! this.loc.action) {
    return app.error('app.main.prototype.setAction', 'loc');
  }

  return this.loc.action;
}

app.main.handle.prototype.setTitle = function(title) {
  if (! (title && typeof title === 'string')) {
    return app.error('app.main.handle.prototype.setTitle', 'title');
  }

  this._title = title;

  return this._title;
}

app.main.handle.prototype.getTitle = function() {
  return this._title ? this._title : ((this.ctl.title && typeof this.ctl.title === 'string') && this.ctl.title);
}

app.main.handle.prototype.setMsg = function(msg) {
  if (! (msg && typeof msg === 'string')) {
    return app.error('app.main.handle.prototype.setTitle', 'title');
  }

  this._msg = msg;

  return this._msg;
}

app.main.handle.prototype.getMsg = function() {
  return this._msg ? this._msg : ((this.ctl.msg && typeof this.ctl.msg === 'string') && this.ctl.msg);
}

app.main.handle.prototype.setURL = function(path, qs) {
  var href = 'index.html';

  href += (path || this.ctl.view) && '?' + ((path && typeof path === 'string') ? path : this.ctl.view);
  href += qs && '&' + ((qs && typeof qs === 'string') && qs);

  this._href = href;

  return this._href;
}

app.main.handle.prototype.getURL = function() {
  return this._href;
}

app.main.handle.prototype.redirect = function() {
  var href = this.getURL();

  location.href = href;
}

app.main.handle.prototype.refresh = function() {
  location.reload();
}

app.main.handle.prototype.resize = function() {
  if (! this.ctl.height) {
    return; // silent fail
  }

  var height = parseInt(this.ctl.height);
  var view = document.getElementById('view');

  view.height = height;
  view.scrolling = 'no';
}

app.main.handle.prototype.selection = function() {
  this.refresh();
}

app.main.handle.prototype.export = function() {
  if (! this.ctl.data || ! (this.ctl.file && typeof this.ctl.file === 'object')) {
    return app.error('app.main.handle.prototype.export', 'ctl');
  }

  if (! (this.ctl.file.name && typeof this.ctl.file.name === 'string') || ! (this.ctl.file.options && typeof this.ctl.file.options === 'object')) {
    return app.error('app.main.handle.prototype.export', 'file');
  }

  var file = new File(
    [ this.ctl.data ],
    this.ctl.file.name,
    (this.ctl.file.options || {})
  );

  saveAs(file);
}

// generic method for all actions
app.main.handle.prototype.prepare = function() {
  var action = this.setAction();
  var id = this.getID();

  this.setURL(null, action + (id && '=' + id));

  if (this.ctl.history) {
    this.history();
  }

  this.receive();
}

// generic method for prevented actions like delete
app.main.handle.prototype.prevent = function() {
  var action = this.setAction();
  var msg = this.getMsg();

  if (! msg) {
    return app.error('app.main.handle.prototype.' + this.event, 'msg');
  }

  this.setURL(null, action);

  if (! window.confirm(msg)) {
    return;
  }

  this.receive();
}

app.main.handle.prototype.open = app.main.handle.prototype.prepare;

app.main.handle.prototype.add = app.main.handle.prototype.prepare;

app.main.handle.prototype.edit = app.main.handle.prototype.prepare;

app.main.handle.prototype.update = app.main.handle.prototype.prepare;

app.main.handle.prototype.delete = app.main.handle.prototype.prevent;

app.main.handle.prototype.close = app.main.handle.prototype.prevent;

app.main.handle.prototype.history = function() {
  var title = this.getTitle();
  var url = this.getURL();

  app.controller.history(title, url);
}

app.main.handle.prototype.receive = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.main.handle.prototype.receive');
  }

  var schema = config.schema;

  if (typeof schema !== 'object') {
    return app.error('app.main.handle.prototype.receive', 'schema');
  }

  var _app_name = app._runtime.name.toString();

  // no submit, reload
  if (! (this.ctl.submit && this.ctl.data)) {
    app.main.control(this.loc);

    return; // silent fail
  }

  var action = this.getAction();

  try {
    var self = this;
    var data = JSON.parse(this.ctl.data);

    app.controller.store(function() {
      var loc = app.controller.spoof();

      loc.action = null;
      loc.index = null;

      // action update needs reload
      if (action === 'update') {
        self.refresh();
      } else {
        app.main.control(loc);
      }
    }, _app_name, schema, data);
  } catch (err) {
    return app.error('app.main.handle.prototype.receive', err);
  }
}


/**
 * app.main.action
 *
 * Actions "main", returns object constructor
 *
 * avalaible methods:
 *  - menu ()
 *
 * @global <Object> appe__config
 * @global <Object> appe__main
 * @param <Array> events
 * @param <String> event
 * @param <NodeElement> element
 * @return
 */
app.main.action = function(events, event, element) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.main.action');
  }

  var main = window.appe__main;

  var self = app.main.action.prototype;

  if ((events && (events instanceof Array === false)) || ! event || ! element) {
    return app.error('app.main.action', arguments);
  }

  this._initialized = false;


  return self;
}

app.main.action.prototype.isInitialized = function(funcName) {
  if (this._initialized) { return; }

  return app.error('app.main.action.prototype.isInitialized', funcName);
}

app.main.action.prototype.begin = function() {
  this._initialized = true;
}

app.main.action.prototype.end = function() {
  this.isInitialized('end');

  this._initialized = false;
}

app.main.action.prototype.menu = function(element) {
  this.isInitialized('menu');

  if ('jQuery' in window && 'collapse' in jQuery.fn) {
    return;
  }

  if (! element) {
    return app.error('app.main.action.prototype.menu', arguments);
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
 * app.main.setup
 *
 * Setup "main" data
 *
 * @global <Object> appe__main
 */
app.main.setup = function() {
  var main = window.appe__main;

  /**
   * main.setup hook
   *
   * @param <Object> data
   */
  if (main && 'setup' in main && typeof main.setup === 'function') {
    main.setup(app.data());
  }

  app.main.control();
}


/**
 * app.main.load
 *
 * Default "main" load function
 *
 * @global <Object> appe__config
 * @return
 */
app.main.load = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.main.load');
  }


  app.checkConfig(config);


  app.session(config, true);


  app.resume(config, true);


  var routine = (config.auxs && typeof config.auxs === 'object') ? config.auxs : {};
  routine.push({ file: '', fn: config.app, schema: config.schema });

  app.controller.retrieve(app.main.setup, routine);

  app.controller.setTitle(config.name);


  var navbar_brand = document.getElementById('brand');
  brand.innerHTML = app.controller.getTitle();


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


  app.utils.addEvent('message', window, app.main.handle);
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
/**
 * app.view
 *
 * "view" functions
 */
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
 * app.view.control
 *
 * Control "view" function, returns object constructor
 *
 * avalaible methods:
 *  - uninitialized (funcName <String>)
 *  - begin ()
 *  - end ()
 *  - setID (id <Number>)
 *  - getID ()
 *  - getLastID ()
 *  - setEvent (event <String>)
 *  - getEvent ()
 *  - setTitle (section_title <String>, view_title <String>, id <String>)
 *  - setActionHandler (label <String>, id <String>)
 *  - denySubmit ()
 *  - fillTable (table <NodeElement>, data <Object>, order <Array>)
 *  - fillForm (form <NodeElement>, data <Object>)
 *  - fillSelection (data <Object>, id <Number>)
 *  - fillCTA (id <Number>)
 *
 * @global <Object> appe__config
 * @global <Object> appe__control
 * @param <Array> events
 * @param <Object> data
 * @param <NodeElement> form
 * @return <Object> __construct
 */
app.view.control = function(events, data, form) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.view.control');
  }

  var control = window.appe__control;

  if (! control) {
    return app.error('app.view.control', 'control');
  }

  var self = app.view.control.prototype;

  if ((events && events instanceof Array === false) || (data && typeof data !== 'object')) {
    return app.error('app.view.control', arguments);
  }

  self._initialized = false;

  self.events = events || null;
  self.data = data || {};
  self.form = form || null;
  
  self.ctl = {};


  return self;
}

app.view.control.prototype.isInitialized = function(funcName) {
  if (this._initialized) { return; }

  return app.error('app.view.control.prototype.isInitialized', funcName);
}

app.view.control.prototype.begin = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.view.control.prototype.begin');
  }

  if (! (config.routes && typeof config.routes === 'object') || ! (config.events && typeof config.events === 'object')) {
    return app.error('app.view.control.prototype.begin', 'config');
  }

  var cursor = app.controller.cursor();

  var view = null;
  var event = null;
  var id = 0;

  if (cursor && 'view' in cursor) {
    view = cursor.view;
  }

  var _routes = config.routes;
  var _events = config.events;

  var actions = {};

  Array.prototype.forEach.call(Object.keys(_events), function(event) {
    actions[_events[event]] = event;
  });

  var loc = app.view.spoof();

  var default_event = config.defaultEvent.toString();  
  var step = true;

  if (loc && typeof loc === 'object') {
    if (loc.action) {
      if (!! _routes[view][loc.action]) {
        event = actions[loc.action];
      } else {
        step = false;
      }

      //TODO <Number> | <String>
      if (loc.index) {
        id = loc.index;
      }
    } else {
      event = default_event;
    }
  } else {
    step = false;
  }

  if ((this.events && this.events.indexOf(event) === -1) || ! step) {
    return app.error('app.view.control.prototype.begin', 'event');
  }

  control.temp = {};

  this._initialized = true;

  if (event) {
    event = this.setEvent(event);

    if (event === 'add') {
      id = this.getLastID();
    }
  }

  id = this.setID(id);

  return id;
}

app.view.control.prototype.end = function() {
  this.isInitialized('end');

  app.view.resize(true);

  if (this.form) {
    control.temp.form = true;
    control.temp.form_submit = false;
    control.temp.form_elements = this.form.elements;
    control.temp.form_changes = null;

    // check for edit changes
    try {
      var _changes = app.view.getFormData(this.form.elements);
      control.temp.form_changes = _changes && JSON.stringify(_changes);
    } catch (err) {
      return app.error('app.view.control.prototype.end', err);
    }
  }

  _initialized = false;
}

app.view.control.prototype.setID = function(id) {
  this.isInitialized('setID');

  control.temp.id = parseInt(id);

  return control.temp.id;
}

app.view.control.prototype.getID = function() {
  this.isInitialized('getID');

  if (control.temp.id) {
    return control.temp.id;
  }

  return parseInt(control.temp.id);
}

app.view.control.prototype.getLastID = function() {
  this.isInitialized('getLastID');

  var last_id = Object.keys(this.data).pop();

  return last_id ? (parseInt(last_id) + 1) : 1;
}

app.view.control.prototype.setEvent = function(event) {
  this.isInitialized('setEvent');

  if ((this.events && this.events.indexOf(event) === -1)) {
    return app.error('app.view.control.prototype.setEvent', arguments);
  }

  control.temp.event = event;

  return control.temp.event;
}

app.view.control.prototype.getEvent = function() {
  this.isInitialized('getEvent');

  return control.temp.event;
}

app.view.control.prototype.setTitle = function(section_title, view_title, id) {
  this.isInitialized('setTitle');

  var event = this.getEvent();

  var _view_title = document.getElementById('view-title');
  var _section_title = document.getElementById('section-title');

  id = parseInt(id) || app.view.control.prototype.getID();

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

app.view.control.prototype.setActionHandler = function(label, id) {
  this.isInitialized('setActionHandler');

  var event = this.getEvent();

  id = parseInt(id) || this.getID();

  var action_handler = document.getElementById('submit');
  var action_index = document.getElementById('index');

  if (action_index) {
    action_index.setAttribute('value', id);
  } else {
    return app.error('app.view.control.prototype.setActionHandler', null, 'action_index');
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

app.view.control.prototype.denySubmit = function() {
  this.isInitialized('denySubmit');

  var action_handler = document.getElementById('submit');

  if (action_handler) {
    action_handler.removeAttribute('onclick');
    action_handler.setAttribute('disabled', '');
  }

  if (this.form) {
    this.form.setAttribute('action', '');
  }
}

app.view.control.prototype.fillTable = function(table, data, order) {
  this.isInitialized('fillTable');

  if (! table) {
    return app.error('app.view.control.prototype.fillTable', arguments);
  }

  var _data = data;

  if (! (data && typeof data === 'object')) {
    _data = this.data;
  }

  order = (order && order instanceof Array) ? order : Object.keys(_data);

  var _args = Object.values(arguments).slice(3);

  var tbody = table.querySelector('tbody');
  var trow_tpl = tbody.querySelector('tr.tpl').cloneNode(true);
  trow_tpl.classList.remove('tpl');

  var rows = '';

  /**
   * control.renderRow hook
   *
   * @param <NodeElement> trow_tpl
   * @param <Number> id
   * @param <Object> _data[id]
   * @param <Object> _args
   */
  if ('renderRow' in control && typeof control.renderRow === 'function') {
    Array.prototype.forEach.call(order, function(id) {
      var row = control.renderRow(trow_tpl, id, _data[id], _args);

      rows += row.outerHTML;
    });

    tbody.innerHTML = rows;
  }

  return { rows: rows, tpl: trow_tpl, data: _data, args: _args };
}

app.view.control.prototype.fillForm = function(form, data) {
  this.isInitialized('fillForm');

  if (! this.form) {
    return app.error('app.view.control.prototype.fillForm', arguments);
  }

  var _data = data;

  if (! (data && typeof data === 'object')) {
    _data = this.data;
  }

  var _args = Object.values(arguments).slice(2);

  /**
   * control.fillForm hook
   *
   * @param <Object> _data
   * @param <Object> _args
   */
  if ('fillForm' in control && typeof control.fillForm === 'function') {
    control.fillForm(_data, _args);
  }

  return { data: _data, args: _args };
}

app.view.control.prototype.fillSelection = function(data, id) {
  this.isInitialized('fillSelection');

  if (! (data && typeof data === 'object')) {
    return app.error('app.view.control.prototype.fillSelection', arguments);
  }

  var selection = document.getElementById('selection');

  id = id || null;

  if (id) {
    selection.innerHTML = app.layout.renderSelectOptions(selection, data, id);
    selection.value = id;
  } else {

    selection.parentNode.classList.add('hidden');
  }
} 

app.view.control.prototype.fillCTA = function(id) {
  this.isInitialized('fillCTA');

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
 *  - prepare (data <Object>, submit <Boolean>)
 *  - prevent (data <Object>, submit <Boolean>, title <String>, name)
 *  - open (data <Object>, submit <Boolean>) <=> prepare ()
 *  - add (data <Object>, submit <Boolean>) <=> prepare ()
 *  - edit (data <Object>, submit <Boolean>) <=> prepare ()
 *  - update (data <Object>, submit <Boolean>)<=> prepare ()
 *  - delete (data <Object>, submit <Boolean>, title <String>, name) <=> prevent ()
 *  - close (data <Object>, submit <Boolean>, title <String>, name) <=> prevent ()
 *  - selection
 *  - print ()
 *
 * @global <Object> appe__config
 * @global <Object> appe__control
 * @param <Array> events
 * @param <String> event
 * @param <NodeElement> element
 * @param <NodeElement> form
 * @return <Object> __construct
 */
app.view.action = function(events, event, element, form) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.view.action');
  }

  var control = window.appe__control;

  if (! control) {
    return app.error('app.view.action', 'control');
  }

  var self = app.view.action.prototype;

  if ((events && (events instanceof Array === false)) || ! event || ! element) {
    return app.error('app.view.action', arguments);
  }

  self._initialized = false;


  self.events = events;
  self.event = event.toString();
  self.element = element;
  self.form = form || null;

  self.ctl = {};


  return self;
}

app.view.action.prototype.isInitialized = function(funcName) {
  if (this._initialized) { return; }

  return app.error('app.view.action.prototype.isInitialized', funcName);
}

app.view.action.prototype.begin = function() {
  if ((this.events && this.events.indexOf(this.event) === -1)) {
    return app.error('app.view.action.prototype.begin', 'event');
  }

  this._initialized = true;
}

app.view.action.prototype.end = function() {
  this.isInitialized('end');

  this._initialized = false;
}

app.view.action.prototype.getID = function() {
  this.isInitialized('getID');

  var id = 0;

  try {
    var trow = this.element.parentNode.parentNode;

    id = trow.getAttribute('data-index');
  } catch (err) {}

  if (! id && control.temp.id) {
    id = control.temp.id;
  }

  return parseInt(id);
}

app.view.action.prototype.validateForm = function() {
  this.isInitialized('validateForm');

  if (! this.form) {
    return app.error('app.view.action.prototype.validateForm', 'form');
  }

  var action_submit = document.getElementById('real-submit');

  if (! action_submit) {
    return app.error('app.view.action.prototype.validateForm', 'action_submit');
  }

  // not valid form
  if (this.form.checkValidity()) {
    return false;
  }

  Array.prototype.forEach.call(this.form.elements, function(field) {
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

app.view.action.prototype.prepare = function(data, submit) {
  this.isInitialized(this.event);

  if (data && typeof data !== 'object') {
    return app.error('app.view.action.prototype.' + this.event, arguments);
  }

  var id = this.getID();

  try {
    this.ctl.action = this.event;

    if (id) {
      this.ctl.index = parseInt(id);

      // event update no needs history
      if (this.event != 'update') {
        this.ctl.history = true;
      }
    }

    if (submit === true) {
      this.ctl.submit = true;
      this.ctl.data = JSON.stringify(data);

      // check for edit changes
      if (control.temp.form) {
        control.temp.form_submit = true;

        var _changes = app.view.getFormData(this.form.elements);
        control.temp.form_changes = _changes && JSON.stringify(_changes);
      }
    }

    return this.ctl;
  } catch (err) {
    return app.error('app.view.action.prototype.' + this.event, err);
  }
}

app.view.action.prototype.prevent = function(data, submit, title, name) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.view.action.prototype.prevent');
  }

  this.isInitialized(this.event);

  if (! (config.events && typeof config.events === 'object')) {
    return app.error('app.view.control.prototype.begin', 'config');
  }

  var _events = config.events;

  if (data && typeof data !== 'object') {
    return app.error('app.view.action.prototype.' + this.event, arguments);
  }

  if (typeof title !== 'string') {
    return app.error('app.view.action.prototype.' + this.event, arguments);
  }

  var event_label = _events ? _events[this.event].toString() : this.event;

  if (title && (typeof name === 'number' || typeof name === 'string')) {
    this.ctl.msg  = 'Are you sure to ' + event_label + ' ' + title + ' ';
    this.ctl.msg += (typeof name === 'number' ? '#' + name : '"' + name + '"');
    this.ctl.msg +=' ?';
  } else {
    this.ctl.msg = title;
  }

  return this.prepare(data, submit);
}

app.view.action.prototype.open = app.view.action.prototype.prepare;

app.view.action.prototype.add = app.view.action.prototype.prepare;

app.view.action.prototype.edit = app.view.action.prototype.prepare;

app.view.action.prototype.update = app.view.action.prototype.prepare;

app.view.action.prototype.delete = app.view.action.prototype.prevent;

app.view.action.prototype.close = app.view.action.prototype.prevent;

app.view.action.prototype.selection = function() {
  this.isInitialized('selection');

  var selected = this.element.value.toString();

  if (! selected) {
    return app.error('app.view.action().selection', 'selected');
  }

  var data = { 'id': selected };

  return this.prepare(data, true);
}

app.view.action.prototype.print = function() {
  this.isInitialized('print');

  window.print();
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
 * @global <Object> appe__config
 * @param <String> method
 * @param <NodeElement> element
 * @param <NodeElement> table
 * @return <Function>
 */
app.view.sub = function(method, element, table) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.view.sub');
  }

  var self = app.view.sub.prototype;

  if (! method || ! element) {
    return app.error('app.view.sub', arguments);
  }

  return self[method](element, table);
}

app.view.sub.prototype.csv = function(element, table) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.view.sub.prototype.csv');
  }

  if (! element || ! table) {
    return app.error('app.view.sub.prototype.csv', arguments);
  }

  var source = '';
  var table_csv = app.view.convertTableCSV(table);

  // perform line break replacements for csv
  Array.prototype.forEach.call(table_csv, function(line) {
    source += line.join(';') + '\r\n';
  });

  var filename_prefix = 'csv_export';
  var filename_separator = '_';
  var filename_date_format = 'Y-m-d_H-M-S';

  if (config.csv && typeof config.csv === 'object') {
    filename_prefix = config.csv.filename_prefix.toString();
    filename_separator = config.csv.filename_separator.toString();
    filename_date_format = config.csv.filename_date_format.toString();
  }

  var filename = filename_prefix;
  var filename_date = app.utils.dateFormat(true, filename_date_format);

  filename += filename_separator + filename_date;

  var file = { 'name': filename + '.csv', 'options': { 'type': 'text/csv;charset=utf-8' } };

  var ctl = { action: 'export', file: file, data: source };

  return app.view.send(ctl);
}

app.view.sub.prototype.clipboard = function(element, table) {
  if (! element || ! table) {
    return app.error('app.view.sub.prototype.clipboard', arguments);
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

app.view.sub.prototype.toggler = function(element) {
  if ('jQuery' in window && 'dropdown' in jQuery.fn) {
    return;
  }

  if (! element) {
    return app.error('app.view.sub.prototype.clipboard', arguments);
  }

  var dropdown = element.parentNode.parentNode.parentNode;

  app.layout.dropdown('toggle', element, dropdown)();
  app.utils.addEvent('click', document.body, app.layout.dropdown('close', element, dropdown));
}


/**
 * app.view.handle
 *
 * Fires when "view" document is loaded
 *
 * @global <Object> appe__config
 * @global <Object> appe__control
 * @return
 */
app.view.handle = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.view.handle');
  }

  var control = window.appe__control;

  if (! control) {
    return app.error('app.view.handle', 'control');
  }

  /**
   * control.openView hook
   *
   * @param <Object> data
   */
  if ('handle' in control && typeof control.handle === 'function') {
    control.handle(app.data());
  }

  app.utils.addEvent('resize', window, app.view.resize);
  app.utils.addEvent('orientationchange', window, app.view.resize);
}


/**
 * app.view.resize
 *
 * Fires when "view" frame is resized
 *
 * @global <Object> appe__control
 * @return
 */
app.view.resize = function(check_time) {
  var control = window.appe__control;

  if (! (control && control.temp)) {
    return; // silent fail
  }

  if (check_time) {
    if ((new Date().getTime() - control.temp.last_resize) < 1000) {
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
 * @global <Object> appe__config
 * @global <Object> appe__control
 * @param <Object> ctl
 * @return
 */
app.view.send = function(ctl) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.view.action');
  }

  var control = window.appe__control;

  if (! control) {
    return app.error('app.view.action', 'control');
  }

  if (! ctl) {
    return; //silent fail
  }

  if (typeof ctl !== 'object') {
    return app.error('app.view.send', arguments);
  }

  if ('view' in ctl === false) {
    var cursor = app.controller.cursor();

    if (cursor && 'view' in cursor) {
      ctl.view = cursor.view;
    }
  }

  if ('action' in ctl === false) {
    return;
  }

  try {
    if (!! app._runtime.debug) {
      console.info('app.view.send', ctl);
    }

    ctl = JSON.stringify(ctl);

    // send control submission to parent "main" window
    window.parent.postMessage(ctl, '*');
  } catch (err) {
    return app.error('app.view.send', err);
  }
}


/**
 * app.view.getFormData
 *
 * Helper to get form data with transformation and sanitization
 *
 * @param <HTMLCollection> elements
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
 * app.view.convertTableCSV
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

      var input = node.querySelector('.form-control');

      if (input) {
        csv[csv_cursor].push(input.value);
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
 * @global <Object> appe__config
 * @return
 */
app.view.load = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.view.load');
  }


  app.session(config, false);


  app.resume(config, false);


  var routine = config.auxs || {};
  routine.push({ fn: config.app, schema: config.schema });

  app.controller.retrieve(app.view.handle, routine);
}


/**
 * app.view.unload
 *
 * Default "view" unload function
 *
 * @global <Object> appe__control
 * @return <Boolean>
 */
app.view.unload = function() {
  var control = window.appe__control;

  if (! control) {
    return app.error('app.view.unload', 'control');
  }

  if (control.temp.form && ! control.temp.form_submit) {
    try {
      var _changes = app.view.getFormData(control.temp.form_elements);
      _changes = _changes && JSON.stringify(_changes);
    } catch (err) {
      return app.error('app.view.unload', err);
    }

    if (control.temp.form_changes !== _changes) {
      return true;
    }
  }

  return;
}
/**
 * app.layout
 *
 * Handles layout functions
 */
app.layout = {};

/**
 * app.layout.renderElement
 *
 * Renders an Element
 *
 * @param <String> node
 * @param <String> content
 * @param <Object> attributes
 * @return <String>
 */
app.layout.renderElement = function(node, content, attributes) {
  if (typeof node !== 'string' || (content && typeof content !== 'string') || (attributes && typeof attributes !== 'object')) {
    return app.error('app.layout.renderElement', arguments);
  }

  var _node = node.toLowerCase();
  var _element = '<' + _node;

  if (attributes) {
    var _names = Object.keys(attributes);
    var _length = _names.length;

    for (var i = 0; i < _length; i++) {
      if (attributes[_names[i]] === null) {
        continue;
      }

      if (_length != i) {
        _element += ' ';
      }

      _element += attributes[_names[i]] ? (_names[i] + '="' + attributes[_names[i]].toString() + '"') : _names[i];
    }
  }

  _element += content ? '>' + content + '</' + _node + '>' : '>';

  return _element;
}

/**
 * app.layout.renderSelect
 *
 * Renders a SELECT
 *
 * @param <String> select_id
 * @param <Object> data
 * @param <Object> attributes
 * @return <String>
 */
app.layout.renderSelect = function(select_id, data, selected, attributes) {
  if (! select_id || typeof data !== 'object') {
    return app.error('app.layout.renderSelectOptions', arguments);
  }

  var select_attrs = app.utils.extendObject({ id: select_id }, attributes);
  var select_opts = '';

  if (data) {
    select_opts = app.layout.renderSelectOptions(select_id, data, selected);
  }

  return app.layout.renderElement('select', select_opts, select_attrs);
}


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

  return app.layout.renderElement('option', name, { value: value, selected: (selected ? '' : null) });
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

  return app.layout.renderElement('optgroup', options, { label: label });
}


/**
 * app.layout.renderSelectOptions
 *
 * Renders SELECT elements
 *
 * example:
 *
 *   [ {"optgroup_label": [ {"option_name": "option_value"}, ... ]} ]
 *   [ {"option_name": "option_value"}, ... ]
 *   [ "option_value", ... ]
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
  if (! event || ! table) {
    return app.error('app.view.draggable', arguments);
  }

  var self = app.layout.draggable.prototype;

  if (! table._draggable) {
    table._draggable = { current: null, prev_index: null, next_index: null };
  }


  var _proxy = (function(e) {
    return self[event].apply(this, [ table, e, field ]);
  });

  return _proxy;
}

app.layout.draggable.prototype.start = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.start', e, table._draggable);
  }

  table._draggable.current = this;
  table._draggable.next_index = this.getAttribute('data-index');

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);

  this.classList.add('move');
}

app.layout.draggable.prototype.over = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.over', e, table._draggable);
  }

  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = 'move';

  return false;
}

app.layout.draggable.prototype.enter = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.enter', e, table._draggable);
  }

  this.classList.add('over');
}

app.layout.draggable.prototype.leave = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.leave', e, table._draggable);
  }

  this.classList.remove('over');
}

app.layout.draggable.prototype.end = function(table, e, field) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.end', e, table._draggable);
  }

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

app.layout.draggable.prototype.drop = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.drop', e, table._draggable);
  }

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

  var self = app.layout.dropdown.prototype;

  self.event = event;
  self.element = element;
  self.dropdown = dropdown;


  return self[event].bind(self);
}

app.layout.dropdown.prototype.open = function(e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.open', (e && e.target), e);
  }

  if (this.element.getAttribute('aria-expanded') === 'true') {
    return;
  }
  if (e && e.target && (e.target === this.element || e.target.offsetParent === this.element)) {
    return;
  }

  this.element.parentNode.classList.add('open');
  this.element.setAttribute('aria-expanded', true);

  this.dropdown.classList.add('open');
  this.dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', true);
}

app.layout.dropdown.prototype.close = function(e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.open', (e && e.target), e);
  }

  if (this.element.getAttribute('aria-expanded') === 'false') {
    return;
  }
  if (e && e.target && (e.target === this.element || e.target.offsetParent === this.element)) {
    return;
  }

  this.element.parentNode.classList.remove('open');
  this.element.setAttribute('aria-expanded', false);

  this.dropdown.classList.remove('open');
  this.dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', false);
}

app.layout.dropdown.prototype.toggle = function() {
  if (!! app._runtime.debug) {
    console.info('app.layout.dropdown.prototype.toggle');
  }

  if (this.element.getAttribute('aria-expanded') === 'false') {
    this.open();
  } else {
    this.close();
  }
}


/**
 * app.layout.collapse
 *
 * Helper for collapsible, returns requested object method
 *
 * available methods:
 *  - open (e <Object>)
 *  - close (e <Object>)
 *  - toggle (e <Object>)
 *
 * @param <String> event
 * @param <ElementNode> element
 * @param <ElementNode> collapsible
 * @return <Function>
 */
app.layout.collapse = function(event, element, collapsible) {
  if (! event || ! element || ! collapsible) {
    return app.error('app.layout.collapse', arguments);
  }

  var self = app.layout.collapse.prototype;

  self.event = event;
  self.element = element;
  self.collapsible = collapsible;


  return self[event].bind(self);
}

app.layout.collapse.prototype.open = function(e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.open', (e && e.target), e);
  }

  if (this.element.getAttribute('aria-expanded') === 'true') {
    return;
  }
  if (e && e.target && (e.target === this.element || e.target.offsetParent === this.element)) {
    return;
  }

  this.collapsible.classList.add('collapse');
  this.collapsible.classList.add('in');
  this.collapsible.setAttribute('aria-expanded', true);

  this.element.setAttribute('aria-expanded', true);
  this.element.classList.remove('collapsed');
}

app.layout.collapse.prototype.close = function(e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.open', (e && e.target), e);
  }

  if (this.element.getAttribute('aria-expanded') === 'false') {
    return;
  }
  if (e && e.target && (e.target === this.element || e.target.offsetParent === this.element)) {
    return;
  }

  this.collapsible.classList.remove('collapse');
  this.collapsible.classList.remove('in');
  this.collapsible.setAttribute('aria-expanded', false);

  this.element.setAttribute('aria-expanded', false);
  this.element.classList.add('collapsed');
}

app.layout.collapse.prototype.toggle = function() {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.toggle');
  }

  if (this.element.getAttribute('aria-expanded') === 'false') {
    this.open();
  } else {
    this.close();
  }
}
/**
 * app.utils
 *
 * Utils functions
 */
app.utils = {};


/**
 * app.utils.isPlainObject
 *
 * Checks if object is a plain object
 *
 *  ($.jQuery.fn.isPlainObject)
 *  jQuery JavaScript Library
 *
 * @link https://jquery.com/
 * @copyright Copyright JS Foundation and other contributors
 * @license MIT license <https://jquery.org/license>
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


/**
 * app.utils.extendObject
 *
 * Extend and merge objects
 *
 *  ($.jQuery.fn.extend)
 *  jQuery JavaScript Library
 *
 * @link https://jquery.com/
 * @copyright Copyright JS Foundation and other contributors
 * @license MIT license <https://jquery.org/license>
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


/**
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


/**
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


/**
 * app.utils.removeEvent
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


/**
 * app.utils.transform
 *
 * Transforms type of passed value
 *
 * @param <String> purpose
 * @param value
 * @return value
 */
app.utils.transform = function(purpose, value) {
  if (! purpose) {
    return app.error('app.utils.transform', arguments);
  }

  switch (purpose) {
    case 'lowercase': return value.toLowerCase();
    case 'uppercase': return value.toUpperCase();
    case 'numeric': return parseFloat(value);
    case 'integer': return parseInt(value);
    case 'json':
      try {
        value = decodeURIComponent(value);
        return JSON.parse(value);
      } catch (err) {}
    break;
  }
}


/**
 * app.utils.sanitize
 *
 * Sanitizes passed value
 *
 * @param <String> purpose
 * @param value
 * @return value
 */
app.utils.sanitize = function(purpose, value) {
  if (! purpose) {
    return app.error('app.utils.sanitize', arguments);
  }

  switch (purpose) {
    case 'whitespace': return value.replace(/\\s/g, '');
    case 'breakline': return value.replace(/\\r\\n/g, '');
    case 'date':
      try {
        return new Date(value).toISOString().split('T')[0];
      } catch (err) {}
    break;
    case 'datetime':
      try {
        return new Date(value).toISOString();
      } catch (err) {}
    break;
    case 'datetime-local':
      try {
        return new Date(value).toISOString().split('.')[0];
      } catch (err) {}
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


/**
 * app.utils.storage
 *
 * Storage utility, it memorizes persistent and non-persistent data using localStorage and sessionStorage
 *
 * available methods:
 *  - set (key <String>, value)
 *  - get (key <String>)
 *  - has (key <String>, value)
 *  - del (key <String>)
 *  - reset ()
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

  var self = app.utils.storage.prototype;

  var _storage = app._runtime.storage.toString();

  self._prefix = 'appe.';
  self._fn = fn ? 'sessionStorage' : _storage;

  if (self._fn in window === false) {
    return app.error('app.utils.storage', self._fn);
  }

  return self[method].apply(self, [ key, value ]);
}

app.utils.storage.prototype.set = function(key, value) {
  if (key === undefined  || typeof key !== 'string' || value === undefined) {
    return app.error('app.utils.storage.prototype.set', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);

  if (typeof value == 'object') {
    try {
      value = JSON.stringify(value);
    } catch (err) {
      return app.error('app.utils.storage.prototype.set', err);
    }
  }

  value = value.toString();

  window[this._fn].setItem(_key, value);

  return true;
}

app.utils.storage.prototype.get = function(key) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.storage.prototype.get', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);

  try {
    var value = window[this._fn].getItem(_key);
  } catch (err) {
    return app.error('app.utils.storage.prototype.get', err);
  }

  try {
    var _value = value;
    value = JSON.parse(_value);
  } catch (err) {
    value = _value;
  }

  return value;
}

app.utils.storage.prototype.has = function(key, value) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.storage.prototype.has', arguments);
  }

  if (value != undefined) {
    if (typeof value == 'object') {
      try {
        value = JSON.stringify(value);
      } catch (err) {
        return app.error('app.utils.storage.prototype.has', err);
      }
    }

    value = value.toString();

    return (this.get(key) === value) ? true : false;
  }

  return this.get(key) ? true : false;
}

app.utils.storage.prototype.del = function(key) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.storage.prototype.del', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);

  window[this._fn].removeItem(_key);

  return true;
}

app.utils.storage.prototype.reset = function() {
  window[this._fn].clear();

  return true;
}


/**
 * app.utils.cookie
 *
 * Helper to handle cookie
 *
 * available methods:
 *  - set (key <String>, value, expire_time <Date>)
 *  - get (key <String>)
 *  - has (key <String>, value)
 *  - del (key <String>)
 *  - reset ()
 *
 * @param <String> method
 * @param <String> key
 * @param value
 * @param <Date> expire_time
 * @return
 */
app.utils.cookie = function(method, key, value, expire_time) {
  if (method === undefined) {
    return app.error('app.utils.cookie', arguments);
  }

  var self = app.utils.cookie.prototype;

  self._prefix = 'appe.';

  return self[method].apply(self, [ key, value, expire_time ]);
}

app.utils.cookie.prototype.set = function(key, value, expire_time) {
  if (key === undefined || typeof key !== 'string' || value === undefined) {
    return app.error('app.utils.cookie.prototype.set', arguments);
  }

  var _time = 'Fri, 31 Dec 9999 23:59:59 GMT';

  if (expire_time && expire_time instanceof Date) {
    _time = expire_time.toUTCString(); 
  }

  var _key = app.utils.btoa(this._prefix + key);
  _key = encodeURIComponent(_key);

  if (typeof value == 'object') {
    try {
      value = JSON.stringify(value);
    } catch (err) {
      return app.error('app.utils.cookie().set', err);
    }
  }

  value = value.toString();
  value = encodeURIComponent(value);

  document.cookie = _key + '=' + value + '; expires=' + _time;

  return true;
}

app.utils.cookie.prototype.get = function(key) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.cookie.prototype.get', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);
  _key = encodeURIComponent(_key);

  var value = null;

  if (document.cookie.indexOf(_key) != -1) {
    var _key_regex = new RegExp('/(?:(?:^|.*;\s*)' + _key + '\s*\=\s*([^;]*).*$)|^.*$/');
    value = document.cookie.replace(_key_regex, '$1');
  }

  if (! value) {
    return null;
  }

  try {
    var _value = value;
    value = JSON.parse(_value);
  } catch (err) {
    value = _value;
  }

  value = decodeURIComponent(value);

  return value;
}

app.utils.cookie.prototype.has = function(key, value) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.cookie.prototype.has', arguments);
  }

  if (value != undefined) {
    if (typeof value == 'object') {
      try {
        value = JSON.stringify(value);
      } catch (err) {
        return app.error('app.utils.cookie.prototype.has', err);
      }
    }

    value = value.toString();
    value = encodeURIComponent(value);

    return (this.get(key) === value) ? true : false;
  }

  return this.get(key) ? true : false;
}

app.utils.cookie.prototype.del = function(key) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.cookie.prototype.del', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);
  _key = encodeURIComponent(_key);

  document.cookie = _key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  return true;
}

app.utils.cookie.prototype.reset = function() {
  document.cookie = '';

  return true;
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
 * app.utils.btoa
 *
 * Alias to btoa (base64) browser implementation with URI encoding
 *
 * @global <Function> atob
 * @param to_encode
 * @return
 */
app.utils.btoa = function(to_encode) {
  var _btoa = window.btoa;

  if (typeof to_encode !== 'string') {
    return app.error('app.utils.btoa', arguments);
  }

  to_encode = encodeURIComponent(to_encode);
  to_encode = _btoa(to_encode);

  return to_encode;
}


/**
 * app.utils.atob
 *
 * Alias to atob (base64) browser implementation with URI encoding
 *
 * @global <Function> atob
 * @param to_decode
 * @return
 */
app.utils.atob = function(to_decode) {
  var _atob = window.atob;

  if (typeof to_decode !== 'string') {
    return app.error('app.utils.atob', arguments);
  }

  to_decode = _atob(to_decode);
  to_decode = decodeURIComponent(to_decode);

  return to_decode;
}
