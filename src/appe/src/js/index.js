/*!
 * {appe}
 *
 * @version 1.0.0~beta
 * @copyright Copyright (C) 2018-2019 Leonardo Laureti
 * @license MIT License
 *
 * contains:
 * - (jQuery.fn.isPlainObject) from jQuery JavaScript Library <https://jquery.com/>, Copyright JS Foundation and other contributors, MIT license <https://jquery.org/license>
 * - (jQuery.fn.extend) from jQuery JavaScript Library <https://jquery.com/>, Copyright JS Foundation and other contributors, MIT license <https://jquery.org/license>
 */

var app = app = { '_root': {}, '_runtime': {} };

app._root.server = this;
app._root.document = !! this.Document && document || { native: false, documentElement: null };
app._root.window = !! this.Window && window || { native: false, document: app._root.document, navigator: null };
app._root.process = !! this.Window && ! this.Process && { native: false } || process;

app._runtime = {
  version: '1.0',
  release: '1.0 beta',
  system: null,
  exec: true,
  session: false,
  title: '',
  name: '',
  locale: 'en',
  locale_dir: 'ltr',
  storage: true,
  binary: false,
  compression: false,
  encryption: false,
  debug: false,
  hangs: 0
};



/**
 * app.load
 *
 * Helper app load function DOM
 *
 * @param <Function> func
 * @param <Boolean> 
 * @return
 */
app.load = function(func) {
  if (typeof func != 'function') {
    return app.stop('app.load', 'func');
  }

  var loaded = false;

  var _func = function() {
    if (! loaded) {
      func();

      loaded = true;
    }
  }

  if (app._root.window.native == undefined) {
    if (document.readyState == 'complete') {
      _func();
    } else {
      document.addEventListener('DOMContentLoaded', _func);
    }

    app.utils.addEvent('load', app._root.window, _func);
  } else {
    app._root.server.load = func;
  }
}


/**
 * app.unload
 *
 * Helper app unload function DOM
 *
 * @param <Function> func
 * @return
 */
app.unload = function(func) {
  if (typeof func != 'function') {
    return app.stop('app.unload', 'func');
  }

  if (app._root.window.native == undefined) {
    app.utils.addEvent('unload', app._root.window, func);
  } else {
    app._root.server.onunload = func;
  }
}


/**
 * app.beforeunload
 *
 * Helper app before unload function DOM
 *
 * @param <Function> func
 * @return
 */
app.beforeunload = function(func) {
  if (typeof func != 'function') {
    return app.stop('app.beforeunload', 'func');
  }

  if (app._root.window.native == undefined) {
    app._root.window.onbeforeunload = func;
  } else {
    app._root.server.onbeforeunload = func;
  }
}


/**
 * app.position
 *
 * Returns JSON serialized app position
 *
 * @return <String> position
 */
app.position = function() {
  var loc = app.controller.cursor();

  if (loc && typeof loc != 'object') {
    return app.error('app.position', 'loc');
  } else {
    return null;
  }

  var position = null;

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
 * Initializes the session, returns to callback
 *
 * @global <Object> appe__store
 * @global <Object> appe__locale
 * @global <Object> CryptoJS
 * @global <Object> pako
 * @param <Function> callback
 * @param <Object> config
 * @param <String> target
 * @return
 */
app.session = function(callback, config, target) {
  if (typeof callback != 'function' || ! config) {
    return app.stop('app.session', [callback, 'config', target]);
  }

  var _secret_passphrase = null;

  if ('secret_passphrase' in config) {
    _secret_passphrase = config.secret_passphrase.toString();

    delete config.secret_passphrase;
  }


  app._root.server.appe__store = {};


  app._runtime.name = config.app_ns.toString();
  app._runtime.debug = !! config.debug ? true : false;
  app._runtime.encryption = !! config.encryption || (config.file && config.file.crypt) ? true : false;
  app._runtime.compression = !! config.compression || !! (config.file && config.file.compress) ? true : false;
  app._runtime.binary = !! config.binary || !! (config.file && config.file.binary) ? true : false;

  if (app._runtime.binary && ! (app._runtime.compression && app._runtime.encryption)) {
    app.error('app.session', 'binary');
  }

  app._runtime.system = app.utils.system();

  if (app._root.process == undefined) {
    app._runtime.storage = 'storage';
  } else if ('localStorage' in app._root.window == false || 'sessionStorage' in app._root.window == false) {
    if ('localStorage' in app._root.window === false) {
      app._runtime.storage = 'sessionStorage';
    } else if ('sessionStorage' in app._root.window === false) {
      app._runtime.storage = 'localStorage';
    } else {
      app._runtime.storage = false;
    }
  } else if (app._root.window.location.protocol != 'file:') {
    app._runtime.storage = true;
  } else if (app._runtime.system.name == 'chrome') {
    app._runtime.storage = 'localStorage';
  } else if (app._runtime.system.name == 'safari') {
    app._runtime.storage = 'sessionStorage';
  }


  app._runtime.session = true;


  var _is_localized = ! (app._root.server.appe__locale === undefined);


  // auto-select language locale
  if (_is_localized && config.language === null) {
    var locale = app._root.window.appe__locale;

    if (typeof locale != 'object') {
      return app.error('app.session', 'locale');
    }

    if (app._root.window.navigator && navigator.languages && typeof navigator.languages === 'object') {
      var found_locale = false, lang = navigator.language;

      if (lang) {
        if (lang in locale) {
          app._runtime.locale = lang.toString();

          found_locale = true;
        } else {
          lang = lang.split('-')[0];

          if (lang in locale) {
            app._runtime.locale = lang;

            found_locale = true;
          }
        }
      }

      if (! found_locale) {
        for (lang in navigator.languages) {
          if (! found_locale && navigator.languages[lang] in locale) {
            app._runtime.locale = navigator.languages[lang].toString();

            found_locale = true;
          }
        }
      }

      if (! found_locale && navigator.languages.length) {
        lang = navigator.languages[lang].split('-')[0];

        app._runtime.locale = lang in locale ? lang : app._runtime.locale;
      }
    }
  }

  app._runtime.locale = !! config.language ? config.language.toString() : app._runtime.locale;
  app._runtime.locale_dir = !! config.language_direction ? config.language_direction.toString() : app._runtime.locale_dir;


  if (app._root.document.native == undefined) {
    document.documentElement.setAttribute('lang', app._runtime.locale);
    document.documentElement.setAttribute('class', app.utils.classify(app._runtime.system, 'system--'));

    if (app._runtime.locale_dir === 'rtl') {
      document.documentElement.setAttribute('dir', app._runtime.locale_dir);
    }
  }


  var _asyncLoadCheck = function(fn, cb) {
    var max = parseInt(config.open_attempts) || 50;
    var attempts = 0;

    var interr = setInterval(function() {
      attempts++;

      if (fn in app._root.window === true || max === attempts) {
        clearInterval(interr);

        cb(true);
      }
    }, 10);
  }

  var _compress = function(cb) {
    if (! (pako && pako.inflate && pako.deflate)) {
      return cb('pako');
    }

    cb(false, true);
  }

  var _doCompress = function(cb) {
    if ('pako' in app._root.window === false) {
      _asyncLoadCheck('pako', _crypto.bind(null, cb));
    } else {
      _compress(cb);
    }
  }

  var _crypto = function(cb) {
    if (! (CryptoJS && CryptoJS.MD5 && CryptoJS.SHA512 && CryptoJS.AES)) {
      return cb('CryptoJS');
    }

    try {
      var _secret = CryptoJS.SHA512(Math.random().toString(), { outputLength: 384 });

      app._runtime.secret = _secret.toString(CryptoJS.enc.Hex);

      app._root.document[app._runtime.secret] = _secret_passphrase;

      cb(false, true);
    } catch (err) {
      cb(err);
    }
  }

  var _doCrypto = function(cb) {
    if (! (_secret_passphrase && typeof _secret_passphrase === 'string')) {
      return cb('config');
    }

    if ('CryptoJS' in app._root.window === false) {
      _asyncLoadCheck('CryptoJS', _crypto.bind(null, cb));
    } else {
      _crypto(cb);
    }
  }

  var _doDefault = function(cb) {
    if ('CryptoJS' in app._root.window === false) {
      _asyncLoadCheck('CryptoJS', _crypto.bind(null, cb));
    } else {
      _crypto(cb);
    }
  }

  var _resolver = function(err) {
    if (err) {
      return app.error('app.session', err);
    }

    tasks--;

    if (! tasks) {
      _callback();
    }
  }

  var _callback = function() {

    /**
     * start.session hook
     *
     * @param <Function> callback
     */
    if (target === undefined && start && typeof start == 'object' && 'session' in start && typeof start.session === 'function') {
      start.session(callback);

    /**
     * main.session hook
     *
     * @param <Function> callback
     */
    } else if (target === true && main && typeof main == 'object' && 'session' in main && typeof main.session === 'function') {
      main.session(callback);

    /**
     * control.session hook
     *
     * @param <Function> callback
     */
    } else if (target === false && control && typeof control == 'object' && 'session' in control && typeof control.session === 'function') {
      control.session(callback);

    } else {
      callback();
    }

  }


  var tasks = 1;

  // only start and main
  if (target !== false) {

    if (app._runtime.encryption) {
      tasks++;

      _doCrypto(_resolver);
    }

    if (app._runtime.compression) {
      tasks++;

      _doCompress(_resolver);
    }

    _doDefault(_resolver);

  // only view
  } else {
    _callback();
  }

}


/**
 * app.resume
 *
 * Resumes session, returns last opened file
 *
 * //TODO FIX
 *
 * @param <Object> config
 * @param <Boolean> target
 * @return <String> session_resume
 */
app.resume = function(config, target) {
  if (! config) {
    return app.stop('app.resume', ['config', target]);
  }

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
    //TODO FIX loop redirect / demo mode
    return (! session_last) && app.newSession();
  } else if (! session_last) {
    return app.redirect();
  }

  if (!! session_resume) {
    session_resume = app.utils.base64('decode', session_resume);
    session_resume = app.os.fileFindRoot(config.save_path.toString() + '/' + session_resume);
  }


  return session_resume;
}


/**
 * app.redirect
 *
 * Performs app redirect
 *
 * @global <Object> appe__config
 * @return
 */
app.redirect = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.redirect');
  }

  var rp = config.runtime_path.toString();
  var filename = 'index';

  if (app._root.window.location.href.indexOf(rp + '/') != -1) {
    filename = config.launcher_name.toString();
  }

  filename += '.html';

  app._root.window.location.href = app.os.fileFindRoot(rp + '/' + filename);
}


/**
 * app.data
 *
 * Gets data store
 *
 * @global <Object> appe__store
 * @param <String> key
 * @return <Object>
 */
app.data = function(key) {
  var store = app._root.server.appe__store;

  if (! store) {
    return app.stop('app.data', 'store');
  }

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

  var _required_keys = ['app_ns', 'launcher_name', 'app_name', 'schema', 'events', 'routes', 'default_route', 'default_event', 'runtime_path', 'save_path'];
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

  return !! error && app.stop('app.checkConfig', 'config');
}


/**
 * app.checkFile
 *
 * Verifies opened file
 *
 * @global <Object> appe__config
 * @param <Object> source
 * @param <Object> checksum
 * @return <Boolean>
 */
app.checkFile = function(source, checksum) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.checkFile');
  }

  if (! (source && typeof source === 'object')) {
    return app.error('app.checkFile', ['source', 'checksum']);
  }

  var _app_version = app._runtime.version.toString();

  if (_app_version !== source.file.version) {
    return app.error('app.checkFile', app.i18n('This file is incompatible with running version: {{_app_version}}.', null, _app_version), source.file);
  }

  if (!! config.verify_checksum && !! checksum) {
    try {
      var json_checksum = source.file.checksum;

      if (json_checksum !== checksum) {
        throw 'checksum';
      }
    } catch (err) {
      return app.error('app.checkFile', err);
    }

  }

  return true;
}


/**
 * app.openSessionFile
 *
 * Opens session from an app session file
 *
 * @global <Object> appe__config
 * @global <Object> appe__start
 * @global <Object> CryptoJS
 * @global <Function> pako
 * @param <Object> source
 * @return
 */
app.openSessionFile = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.openSessionFile');
  }

  var _is_start = ! (app._root.server.appe__start === undefined);


  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    return app.error('app.openSessionFile', 'CryptoJS');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    return app.error('app.openSessionFile', 'pako');
  }


  var schema = config.schema;

  if (typeof schema != 'object') {
    return app.error('app.openSessionFile', 'schema');
  }

  var _current_timestamp = new Date();
  _current_timestamp = app.utils.dateFormat(_current_timestamp, 'Q');

  var _current_timestamp_enc = app.utils.base64('encode', _current_timestamp);
  var _app_name = app._runtime.name.toString();


  var fbinary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.binary;
  var fcompress = config.file && config.file.compress ? !! config.file.compress : !! app._runtime.compression;
  var fcrypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;

  if (fbinary && ! (fcompress && fcrypt)) {
    app.error('app.openSessionFile', 'Misleading settings.', 'binary', true);

    return callback(false);
  }

  var file_extension = 'js';

  if (fbinary) {
    file_extension = 'appe';
  }

  file_extension = config.file && config.file.extension ? '.' + config.file.extension.toString() : file_extension;


  var _open = function() {
    app.os.fileSessionOpen.call(this, _complete);
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


    _is_start ? app.start.redirect(true) : app._root.window.location.reload();
  }


  var open_input = null;
  var _se_open_input = this.getAttribute('data-open');

  if (! _se_open_input) {
    this.setAttribute('data-open', '');

    var open_input_ref = this.getAttribute('data-open-input');
    var open_input = this.parentNode.querySelector(open_input_ref);

    if (app._runtime.system.platform != 'ios') {
      open_input.setAttribute('accept', '.' + file_extension);
    }

    app.utils.addEvent('change', open_input, _open);
  }

  if (open_input) {
    _is_start && app.start.progress(2);

    open_input.click();
  }
}


/**
 * app.saveSessionFile
 *
 * Saves session to app session file
 *
 * @global <Object> appe__config
 * @global <Object> appe__store
 * @global <Object> appe__start
 * @global <Object> CryptoJS
 * @global <Function> pako
 * @param <Object> source
 */
app.saveSessionFile = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.saveSessionFile');
  }

  var store = app._root.server.appe__store;

  if (! store) {
    return app.stop('app.saveSessionFile', 'store');
  }

  var _is_start = ! (app._root.server.appe__start === undefined);


  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    return app.error('app.saveSessionFile', 'CryptoJS');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    return app.error('app.saveSessionFile', 'pako');
  }


  var _app_name = app._runtime.name.toString();

  var schema = config.schema;

  if (typeof schema != 'object') {
    return app.error('app.saveSessionFile', 'schema');
  }

  var source = {};

  var _current_timestamp = new Date();


  Array.prototype.forEach.call(schema, function(key) {
    source[key] = store[_app_name][key];
  });  

  source.file = app.os.generateJsonHead(source, _current_timestamp);


  app.os.fileSessionSave(function(filename) {
    if (!! app._runtime.debug) {
      console.info('save', '\t', filename);
    }
  }, source, _current_timestamp);
}


/**
 * app.newSession
 *
 * Creates a new empty session
 *
 * @global <Object> appe__config
 * @global <Object> appe__start
 * @return
 */
app.newSession = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.newSession');
  }

  var _is_start = ! (app._root.server.appe__start === undefined);

  var _app_name = app._runtime.name.toString();

  var _current_timestamp = new Date();
  _current_timestamp = app.utils.dateFormat(_current_timestamp, 'Q');

  var _current_timestamp_enc = app.utils.base64('encode', _current_timestamp);


  var schema = config.schema;

  if (typeof schema != 'object') {
    return app.error('app.newSession', 'schema');
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
    _is_start ? app.start.redirect(false) : app._root.window.location.reload();
  }


  _new();
}


/**
 * app.openSession
 *
 * Opens session, alias of app.openSessionFile
 */
app.openSession = app.openSessionFile;


/**
 * app.saveSession
 *
 * Saves session, alias of app.saveSessionFile
 */
app.saveSession = app.saveSessionFile;


/**
 * app.asyncAttemptLoad
 *
 * Attemps to load files and scripts, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> CryptoJS
 * @param <Function> callback
 * @param <Boolean> resume_session
 * @param <String> fn
 * @param <String> file
 * @param <Object> schema
 * @param <Boolean> memoize
 * @return
 */
app.asyncAttemptLoad = function(callback, resume_session, fn, file, schema, memoize) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.asyncAttemptLoad');
  }

  var step = true;

  if (config.file && typeof config.file != 'object') {
    step = app.error('app.asyncAttemptLoad', 'config');
  }

  if (!! resume_session && ! (CryptoJS && CryptoJS.MD5)) {
    step = app.error('app.asyncAttemptLoad', 'CryptoJS');
  }

  if (!! resume_session && !! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    step = app.error('app.asyncAttemptLoad', 'CryptoJS');
  }

  if (typeof callback != 'function' || ! fn || typeof fn != 'string' || ! file || typeof file != 'string' || (schema && typeof schema != 'object')) {
    step = app.stop('app.asyncAttemptLoad', [callback, fn, file, schema, memoize]);
  }

  if (! step) {
    return callback(false);
  }

  var _app_name = app._runtime.name.toString();

  fn = fn.toString();


  var fbinary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.binary;
  var fcompress = config.file && config.file.compress ? !! config.file.compress : !! app._runtime.compression;
  var fcrypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;


  if (fbinary && ! (fcompress && fcrypt)) {
    app.error('app.asyncAttemptLoad', 'Misleading settings.', 'binary', true);

    return callback(false);
  }

  var file_json_checksum = null;


  var _decrypt = function(source, cb) {
    var secret = null;

    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in app._root.document) {
      secret = app._root.document[app._runtime.secret];
    } else {
      return cb('runtime');
    }

    try {
      source = CryptoJS.AES.decrypt(source, secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
      source = source.toString(CryptoJS.enc.Utf8);

      if (! source) { throw 'decryption'; }

      cb(false, source);
    } catch (err) {
      cb(err);
    }
  }

  var _store = function(source, cb) {
    // check file source before store
    if (! app.checkFile(source, file_json_checksum)) {
      return cb('check');
    }

    for (var i in schema) {
      var key = schema[i].toString();

      if (key in source === false) {
        return cb('schema');
      }

      app.store.set(fn + '_' + key, source[key]);
    }

    cb(false, true);
  }

  var _attempt = function(source, cb) {
    if (fn in app._root.window === false) {
      app.error('app.asyncAttemptLoad() > _attempt', 'source');

      return callback(false);
    }

    try {
      var source = app._root.window[fn];

      if (memoize && fcrypt) {
        _decrypt(source, function(err, source) {
          if (err) { throw err; }

          app.os.generateJsonChecksum(function(checksum) {
            if (! checksum) { throw null; }

            file_json_checksum = checksum;

            source = JSON.parse(source);

            _store(source, function(err, loaded) {
              if (err) { throw err; }

              callback(loaded);
            });
          }, source);
        });
      } else if (memoize) {
        var _source = JSON.stringify(source);

        app.os.generateJsonChecksum(function(checksum) {
          if (! checksum) { throw null; }

          file_json_checksum = checksum;

          _store(source, function(err, loaded) {
            if (err) { throw err; }

            callback(loaded);
          });
        }, _source);
      } else {
        var store = app._root.server.appe__store;

        if (! store) {
          app.stop('app.asyncAttemptLoad', 'store');

          return callback(false);
        }

        if (typeof source === 'function') {
          store[fn] = source;
        }

        callback(true);
      }
    } catch (err) {
      app.error('app.asyncAttemptLoad() > _attempt', err);

      callback(loaded);
    }
  }


  var loaded = false;
  var max_attempts = parseInt(config.open_attempts);

  app.os.scriptOpen(_attempt, file, fn, max_attempts);
}


/**
 * app.asyncLoadAux
 *
 * Load extension scripts asyncronously, returns to callback
 *
 * @global <Object> appe__config
 * @param <Function> callback
 * @param <Object> routine
 * @param <Boolean> resume_session
 * @return
 */
app.asyncLoadAux = function(callback, routine, resume_session) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.asyncLoadAux');
  }

  if (typeof callback != 'function' || typeof routine != 'object') {
    app.error('app.asyncLoadAux', [callback, routine]);

    callback(false);
  }


  if (routine.length) {
    var i = routine.length;

    while (i--) {
      var fn = routine[i].fn.toString();
      var file = app.os.fileFindRoot(config.aux_path.toString() + '/' + routine[i].file);
      var schema = typeof routine[i].schema === 'object' ? routine[i].schema : null;
      var memoize = routine[i].memoize === true;

      app.asyncAttemptLoad(function(aux_loaded) {
        if (! aux_loaded) {
          app.error('app.asyncLoadAux', routine[i]);

          return callback(false);
        }

        if (i <= 0) {
          callback(true);
        }
      }, resume_session, fn, file, schema, memoize);
    }
  } else {
    callback(true);
  }
}


/**
 * app.i18n
 *
 * App localization
 *
 * //TODO implement
 *
 * @global <Object> appe__locale
 * @param <String> to_translate
 * @param <String> context
 * @param to_replace
 */
app.i18n = function(to_translate, context, to_replace) {
  var locale = app._root.window.appe__locale;

  if (! locale) {
    return to_translate;
  } else if (typeof locale != 'object') {
    return app.stop('app.i18n', 'locale');
  }

  var _current_locale = app._runtime.locale.toString();
  var _current_locale_direction = app._runtime.locale_dir.toString();

  if (typeof to_translate != 'string' || (to_replace && (typeof to_replace != 'string' && typeof to_replace != 'object')) || (context && typeof context != 'string')) {
    return app.error('app.i18n', [to_translate, context, to_replace]);
  }

  context = !! context ? context.toString() : '0';


  var lstring = null;

  if (! (locale[_current_locale] && locale[_current_locale][context] && to_translate in locale[_current_locale][context] && locale[_current_locale][context][to_translate])) {

    // no locale but have replacement with placeholder
    if (/\{\{|\|\|/.test(to_translate)) {

      lstring = to_translate;

    // no locale skip
    } else {
      return to_translate;
    }
  } else {
    lstring = locale[_current_locale][context][to_translate].toString();
  }


  // no replacement
  if (! to_replace) {
    return lstring;
  }

  // single string replacement
  if (typeof to_replace == 'string') {

    // replacement with placeholder
    if (to_replace.indexOf('{{') != -1) {

      var lsstring_placeholder = to_replace.indexOf('[[') != -1 ? to_replace.match(/\{\{(.+)(?:\[\[([\w]+)\]\])\}\}/) : to_replace.match(/\{\{(.+)\}\}/);
      var lsstring_replacement = null;

      if (lsstring_placeholder[1].indexOf('%%') != -1) {
        lsstring_replacement = lsstring_placeholder[1].split('%%');

        if (!! lsstring_replacement[0]) {
          lsstring_placeholder = [null, lsstring_replacement[0], lsstring_placeholder[2]];
        } else {
          lstring = '{{placeholder}}';
          lsstring_placeholder = [null, to_translate.toString(), context];
        }

        lsstring_replacement = lsstring_replacement[1];

        if (lsstring_replacement.length) {
          if (! /\D/.test(lsstring_replacement[0])) {
            //TODO nest
            lsstring_replacement = [[lsstring_replacement[0]]];
          } else {
            lsstring_replacement = lsstring_replacement.split(',');
          }
        }
      }

      to_replace = app.i18n(lsstring_placeholder[1], lsstring_placeholder[2], lsstring_replacement);
    }

    lstring = lstring.replace(/\{\{[\w]+\}\}/, to_replace);

  } else if (typeof to_replace == 'object') {

    // singular/plural replacement
    if (to_replace[0] instanceof Array) {
      var quantitative = ['$1', '$2'];

      // "rtl" locale order
      if (_current_locale_direction == 'rtl') {
        quantitative.reverse();
      }

      lstring = lstring.replace(/(.+)\|\|(.+)/, parseInt(to_replace[0][0]) > 1 ? quantitative[1] : quantitative[0]);

      //TODO nest replacement

    // multiple string replacement in locale order
    } else if (to_replace instanceof Array) {

      // "rtl" locale order
      if (_current_locale_direction == 'rtl') {
        to_replace.reverse();
      }

      for (var i in to_replace) {
        lstring = lstring.replace(/\{\{[\w]+\}\}/, to_replace[i].toString());
      }

    // multiple string replacement exact match
    } else {

      for (var tr in to_replace) {
        lstring = lstring.replace(new RegExp('{{' + tr.toString() + '}}'), to_replace[tr]);
      }

    }
  }

  return lstring;
}


/**
 * app.debug
 *
 * Utility debug
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
 * Stops the app execution
 *
 * @global <Object> appe__main
 * @param <String> arg0  ( msg | fn )
 * @param arg1  ( log | msg )
 * @param arg2  ( log | msg )
 * @param <Boolean> soft
 * @return <Boolean>
 */
app.stop = function(arg0, arg1, arg2, soft) {
  if (! app._runtime.exec) {
    return false;
  }

  var _is_main = ! (app._root.server.appe__main === undefined);

  app._runtime.exec = false;

  arg1 = arg1 || null;

  if (_is_main) {
    app.blind();
  }

  app.error.apply(this, [arg0, arg1, arg2, soft]);

  return false;
}


/**
 * app.error
 *
 * Helper to debug and display error messages
 *
 * @global <Object> appe__control
 * @param <String> arg0  fn
 * @param arg1  ( log | msg )
 * @param arg2  ( log | msg )
 * @param <Boolean> soft
 * @return <undefined>
 */
app.error = function(arg0, arg1, arg2, soft) {
  var _is_view = ! (app._root.server.appe__control === undefined);

  var fn = null;
  var msg = null;
  var log = null;

  if (arg2) {
    fn = arg0;
    msg = arg1;
    log = arg2;
  } else if (arg1) {
    fn = arg0;
    log = arg1;
  } else if (arg0) {
    fn = arg0;
  }

  // avoid too much recursions
  if (app._runtime.hangs > 3) {
    return undefined;
  }

  if (! app._root.document.documentElement.lang) {
    document.documentElement.lang = app._runtime.locale.toString();
  }

  if (app._runtime.debug) {
    var position = app.position();

    if (app._runtime.exec) {
      console.error('ERR', '\t', fn, '\t', msg, (position ? '\t' + position : ''));
    } else {
      console.warn('WARN', '\t', fn, '\t', msg, (position ? '\t' + position : ''));
    }

    if (log) {
      console.log(log);
    }
  }

  if (! msg) {
    msg = app.i18n('There was an error while executing.');

    if (! app._runtime.exec) {
      msg += '\n\n' + app.i18n('Please reload the application.');
    }
  }

  if (! _is_view && ! soft && ! app._runtime.hangs++) {
    !! app._root.window.alert && app._root.window.alert(msg);
  }

  return undefined;
}


/**
 * app.blind
 *
 * Helper to freeze "main" screen
 *
 * @global <Object> appe__main
 * @return
 */
app.blind = function() {
  var _is_main = ! (app._root.window.appe__main === undefined);

  if (! _is_main) {
    return;
  }

  var _blind = app._root.document.createElement('div');
  _blind.setAttribute('style', 'position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 9999; background: rgba(0,0,0,0.3);');

  app._root.document == undefined && app._root.document.body.appendChild(_blind);
}


/**
 * app.getInfo
 *
 * Utility to get app info(s)
 *
 * @global <Object> appe__config
 * @param <String> from  ( config | runtime )
 * @param <String> info  { config { app_name | schema | license } } | runtime { { debug | locale | version | release } }
 * @return
 */
app.getInfo = function(from, info) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.getConfig');
  }

  if (typeof from != 'string' && (info && typeof info != 'string')) {
    return app.error('app.getInfo', [from, info]);
  }

  var _available_infos = null;

  switch (from) {
    case 'config':
      _available_infos = {
        'app_name': config.app_name.toString(),
        'schema': typeof config.schema === 'object' ? config.schema : [],
        'license': config.license && (typeof config.license === 'object' ? { 'text': config.license.text.toString(), 'file': app.os.fileFindRoot(config.license.file, true) } : config.license.toString()) || false
      };
    break;
    case 'runtime':
      _available_infos = {
        'debug': !! app._runtime.debug ? true : false,
        'locale': app._runtime.locale.toString(),
        'version': app._runtime.version.toString(),
        'release': app._runtime.release.toString()
      };
    break;
    default:
      return app.error('app.getInfo', 'info');
  }

  if (!! info && info in _available_infos) {
    return _available_infos[info];
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
  if (info && typeof info != 'string') {
    return app.error('app.getVersion', [info]);
  }

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
 * app.getLocale
 *
 * Gets app locale language
 *
 * @return <String>
 */
app.getLocale = function() {
  return app.getInfo('config', 'locale');
}

