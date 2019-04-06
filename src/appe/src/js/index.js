/*!
 * {appe}
 *
 * @version 1.0.0~beta
 * @copyright Copyright (C) 2018-2019 Leonardo Laureti
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
  binary: false,
  compression: false,
  encryption: false,
  debug: false,
  hangs: 0
};


/**
 * app.load
 *
 * Helper document load event
 *
 * @param <Function> func
 * @return
 */
app.load = function(func) {
  if (typeof func != 'function') {
    return app.stop('app.load');
  }

  var loaded = false;

  var _func = function() {
    loaded = true;

    if (! loaded) {
      func();
    }
  }

  if (document.readyState == 'complete') {
    _func();
  } else {
    document.addEventListener('DOMContentLoaded', _func);
  }

  if (! loaded) {
    app.utils.addEvent('load', window, func);
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
  if (typeof func != 'function') {
    return app.stop('app.unload');
  }

  app.utils.addEvent('beforeunload', window, func);
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

  var base = config.base_path.toString();
  var filename = 'index';

  if (window.location.href.indexOf(base + '/') != -1) {
    base = '..';
    filename = config.launcher_name.toString();
  }

  window.location.href = base + '/' + filename + '.html';
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
 * @global <Object> pako
 * @global <Object> CryptoJS
 * @param <Object> config
 * @param <String> target
 * @return
 */
app.session = function(config, target) {
  if (! config) {
    return app.stop('app.session');
  }

  window.appe__store = {};

  app._runtime.name = config.app_ns.toString();
  app._runtime.debug = !! config.debug ? true : false;
  app._runtime.encryption = !! config.encryption || (config.file.crypt && config.file.crypt) ? true : false;
  app._runtime.compression = !! config.compression || !! (config.file && config.file.compress) ? true : false;
  app._runtime.binary = !! config.binary || !! (config.file && config.file.binary) ? app._runtime.binary : false;

  if (app._runtime.binary && ! (app._runtime.compression || app._runtime.encryption)) {
    app.error('app.session', 'binary');
  }


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
  var max_attempts = parseInt(config.open_attempts);


  var _loadAttempt = function(callback, fn) {
    var max = max_attempts || 5;
    var attempts = 0;

    var interr = setInterval(function() {
      attempts++;

      if (!! window[fn] || max === attempts) {
        clearInterval(interr);

        callback();
      }
    }, 1000);
  }

  var _compress = function() {
    if (! (pako && pako.inflate && pako.deflate)) {
      return app.error('app.session', 'pako');
    }
  }

  var _doCompress = function() {
    if ('pako' in window === false) {
      loaded = false;

      _loadAttempt(_compress, 'pako');
    } else {
      _compress();
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

  app._runtime.encryption && _doCrypto();
  app._runtime.compression && _doCompress();
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


    if (! app._runtime.binary) {
      if (app.utils.cookie('has', 'last_opened_file')) {
        session_resume = app.utils.cookie('get', 'last_opened_file');
      }
      if (! session_resume) {
        session_resume = app.memory.get('last_opened_file');
      }
    }


    if (app.utils.cookie('has', 'last_session')) {
      session_last = app.utils.cookie('get', 'last_session');
    }
    if (! session_last) {
      session_last = app.memory.get('last_session');
    }


    if (target === undefined && !! (! session_resume || session_last)) {
      // there's nothing to do
    } else if (!! app._runtime.debug && target !== undefined) {
      return (! session_last) && app.newSession();
    } else if (! session_last) {
      return app.redirect();
    }

    //TODO location.protocol
    if (!! session_resume) {
      session_resume = app.utils.base64('decode', session_resume);
    }

    return session_resume;
  }


  app._runtime.system = app.utils.system();
  
  if ('localStorage' in window === false) {
    app._runtime.storage = 'sessionStorage';
  } else if ('sessionStorage' in window === false) {
    app._runtime.storage = 'localStorage';
  } else if (app._runtime.system.navigator == 'safari') {
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

  var error = false;

  var _required_keys = [ 'app_ns', 'launcher_name', 'app_name', 'schema', 'events', 'routes', 'default_route', 'default_event', 'base_path', 'save_path' ];
  var key = null, i = 0;

  while ((key = _required_keys[i++])) {
    if (key in config === false) {
      error = true;
    } else if ((key == 'schema' || key == 'events' || key == 'routes') && typeof config[key] != 'object') {
      error = true;
    } else if (typeof config[key] != 'object' && typeof config[key] != 'string' && typeof config[key] != 'number' && typeof config[key] != 'boolean') {
      error = true;
    }
  }

  if (
    (config.encryption && ! (config.secret_passphrase && typeof config.secret_passphrase == 'string')) ||
    (config.alt && typeof config.alt != 'object') ||
    (config.file && typeof config.file != 'object') ||
    (config.csv && typeof config.csv != 'object')
  ) {
    error = true;
  }

  return !! error && app.stop('app.checkConfig');
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

  if (!! config.verify_file_checksum) {
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

  var _current_timestamp_enc = app.utils.base64('encode', _current_timestamp);


  var schema = config.schema;

  if (typeof schema != 'object') {
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


    for (var i in schema) {
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

  if (typeof schema != 'object') {
    return app.error('app.openSession', 'schema');
  }

  var _current_timestamp = new Date();
  _current_timestamp = app.utils.dateFormat(_current_timestamp, 'Q');

  var _current_timestamp_enc = app.utils.base64('encode', _current_timestamp);


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


    var _filename = app.utils.base64('encode', filename);


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

  if (typeof schema != 'object') {
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
 * //TODO test avoid too much recursions
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
    msg = 'There was an error while executing.';

    if (! app._runtime.exec) {
      msg += '\n\nPlease reload the application.';
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
  _blind.setAttribute('style', 'position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 9999; background: rgba(0,0,0,0.3);');

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
        'app_name': config.app_name.toString(),
        'language': config.language.toString(),
        'schema': typeof config.schema === 'object' ? config.schema : [],
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
  return app.getInfo('config', 'app_name');
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

