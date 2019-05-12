/*!
 * {appe}
 *
 * @version 1.0.0-beta
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

  var _current_timestamp = app.utils.dateFormat(true, 'Q');
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
    app.memory.set('last_session', _current_timestamp_enc);

    app.memory.set('last_stored', _current_timestamp);
    app.memory.set('last_time', _current_timestamp);


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

  var _current_time = new Date();


  Array.prototype.forEach.call(schema, function(key) {
    source[key] = store[_app_name][key];
  });  

  source.file = app.os.generateJsonHead(source, _current_time);


  app.os.fileSessionSave(function(filename) {
    if (!! app._runtime.debug) {
      console.info('save', '\t', filename);
    }
  }, source, _current_time);
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

  var _current_timestamp = app.utils.dateFormat(true, 'Q');
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


    app.memory.del('file_saves');
    app.memory.del('last_opened_file');

    app.memory.set('last_session', _current_timestamp_enc);

    app.memory.set('last_stored', _current_timestamp);
    app.memory.set('last_time', _current_timestamp);


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



/**
 * app.os
 *
 * Handles filesystem functions
 */
app.os = {};


/**
 * app.os.fileSessionOpen
 *
 * Opens a session file through FileReader api, stores it, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> CryptoJS
 * @global <Function> pako
 * @param <Function> callback
 * @return
 */
app.os.fileSessionOpen = function(callback) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.os.fileSessionOpen');
  }

  var step = true;

  if (config.file && typeof config.file != 'object') {
    step = app.error('app.os.fileSessionOpen', 'config');
  }

  if (! FileReader) {
    step = app.error('app.os.fileSessionOpen', 'FileReader');
  }

  if (! (CryptoJS && CryptoJS.MD5)) {
    step = app.error('app.os.fileSessionOpen', 'CryptoJS');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    step = app.error('app.os.fileSessionOpen', 'CryptoJS');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    step = app.error('app.os.fileSessionOpen', 'pako');
  }

  if (! (callback && typeof callback === 'function')) {
    step = app.error('app.os.fileSessionOpen', [callback]);
  }

  if (! step || ! this.files.length) {
    return callback(false); // silent fail
  }

  var _app_name = app._runtime.name.toString();

  var schema = config.schema;

  if (typeof schema != 'object') {
    app.error('app.os.fileSessionOpen', 'schema');

    return callback(false);
  }


  var fbinary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.binary;
  var fcompress = config.file && config.file.compress ? !! config.file.compress : !! app._runtime.compression;
  var fcrypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;

  if (fbinary && ! (fcompress && fcrypt)) {
    app.error('app.os.fileSessionOpen', 'binary');

    return callback(false);
  }


  var file = this.files[0];
  var source = null;


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_extension = 'js';
  var file_mime = 'application/x-javascript';
  var file_type = null;
  var file_json_checksum = null;

  if (fbinary) {
    file_extension = 'appe';
    file_mime = 'application/octet-stream';
    file_type = file_mime;
  } else {
    file_type = file_mime + ';charset=utf-8';
  }

  file_extension = config.file && config.file.extension ? config.file.extension.toString() : file_extension;


  if (!! app._runtime.debug) {
    console.info('app.os.fileSessionOpen', '\t', 'file', '\t', file, '\t', config.file);
  }

  if (app._runtime.system.platform != 'ios') {
    if (file.name.indexOf(file_extension) === -1) {
      app.error('app.os.fileSessionOpen', app.i18n('This file format cannot be opened.'), 'file');

      return callback(false);
    }
  }


  var _prepare = function(source, cb) {
    if (! source) {
      return cb(false);
    }

    // source binary file

    if (fbinary) {
      return cb(false, source);
    }

    // source JavaScript JSON file

    // base is much human readable
    if (source.indexOf('\r\n') != -1)  {
      source = source.replace(/[\r\n]([\s]+){2}/g, '');
    }

    var _file_heads_regex = new RegExp(file_heads + '\=(?![^"\{\}]+)');
    source = source.replace(_file_heads_regex, '').replace(/(^"|"$)/g, '');
  }

  var _decompress = function(source, cb) {
    try {
      source = pako.inflate(source, { raw: true, to: 'string' });

      if (! source) { throw 'decompression'; }

      cb(false, source);
    } catch (err) {
      cb(err);
    }
  }

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

  var _complete = function(source, cb) {
    try {
      source = JSON.parse(source);
    } catch (err) {
      return cb(err);
    }

    // check file source before store
    if (! app.checkFile(source, file_json_checksum)) {
      return cb('check');
    }

    for (var i in schema) {
      if (schema[i] in source === false) {
        return cb('schema');
      }

      app.store.set(_app_name + '_' + schema[i], source[schema[i]]);
    }

    cb(false, file.name);
  }

  var _init = function(blob) {
    try {
      if (fcompress && fcrypt) {
        _prepare(blob, function(err, source) {
          if (err) { throw err; }

          _decompress(source, function(err, source) {
            if (err) { throw err; }

            _decrypt(source, function(err, source) {
              if (err) { throw err; }

              app.os.generateJsonChecksum(function(checksum) {
                if (! checksum) { throw null; }

                file_json_checksum = checksum;

                _complete(source, function(err, filename) {
                  if (err) { throw err; }

                  callback(filename);
                });
              }, source);
            });
          });
        });
      } else if (fcrypt) {
        _prepare(blob, function(err, source) {
          if (err) { throw err; }

          _decrypt(source, function(err, source) {
            if (err) { throw err; }

            app.os.generateJsonChecksum(function(checksum) {
              if (! checksum) { throw null; }

              file_json_checksum = checksum;

              _complete(source, function(err, filename) {
                if (err) { throw err; }

                callback(filename);
              });
            }, source);
          });
        });
      } else {
        _prepare(blob, function(err, source) {
          if (err) { throw err; }

          app.os.generateJsonChecksum(function(checksum) {
            if (! checksum) { throw null; }

            file_json_checksum = checksum;

            _complete(source, function(err, filename) {
              if (err) { throw err; }

              callback(filename);
            });
          }, source);
        });
      }
    } catch (err) {
      app.error('app.os.fileSessionOpen', err);

      return callback(false);
    }
  }


  var reader = new FileReader();

  reader.onloadend = (function() {
    _init(this.result);
  });

  reader.onerror = (function(err) {
    app.error('app.os.fileSessionOpen', err);

    callback(false);
  });

  if (fbinary) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}


/**
 * app.os.fileSessionSave
 *
 * Sends a file to the browser, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> CryptoJS
 * @global <Function> pako
 * @param <Function> callback
 * @param <Object> source
 * @param <Date> timestamp
 * @return
 */
app.os.fileSessionSave = function(callback, source, timestamp) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.os.fileSessionSave');
  }

  var step = true;

  if (config.file && typeof config.file != 'object') {
    step = app.error('app.os.fileSessionSave', 'config');
  }

  if (! Blob) {
    step = app.error('app.os.fileSessionSave', 'Blob');
  }

  if (! FileReader) {
    step = app.error('app.os.fileSessionSave', 'FileReader');
  }

  if (! (CryptoJS && CryptoJS.MD5)) {
    step = app.error('app.os.fileSessionOpen', 'CryptoJS');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    step = app.error('app.os.fileSessionSave', 'CryptoJS');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    step = app.error('app.os.fileSessionSave', 'pako');
  }

  if (! (callback && typeof callback === 'function') || ! (timestamp && timestamp instanceof Date)) {
    step = app.error('app.os.fileSessionSave', [callback, source, timestamp]);
  }

  if (! step || ! (source && typeof source === 'object')) {
    return callback(false);
  }

  var _app_name = app._runtime.name.toString();


  var fbinary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.binary;
  var fcompress = config.file && config.file.compress ? !! config.file.compress : !! app._runtime.compression;
  var fcrypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;

  if (fbinary && ! (fcompress && fcrypt)) {
    app.error('app.os.fileSessionSave', 'binary');

    return callback(false);
  }


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_extension = 'js';
  var file_mime = 'application/x-javascript';
  var file_type = null;
  var file_json_checksum = null;

  if (fbinary) {
    file_extension = 'appe';
    file_mime = 'application/octet-stream';
    file_type = file_mime;
  } else {
    file_type = file_mime + ';charset=utf-8';
  }

  file_extension = config.file && config.file.extension ? config.file.extension.toString() : file_extension;


  var _prepare = function(source, cb) {
    source.file.checksum = '';

    var p = 32;

    while (p--) {
      source.file.checksum += ' ';
    }

    try {
      var source = JSON.stringify(source);

      app.os.generateJsonChecksum(function(checksum) {
        if (! checksum) { throw null; }

        file_json_checksum = checksum;

        source = source.replace(/"file":{"checksum":"[\s]{32}"/, '"file":{"checksum":"' + checksum + '"');

        cb(false, source);
      }, source);
    } catch (err) {
      cb(err);
    }
  }

  var _crypt = function(source, cb) {
    var secret = null;

    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in app._root.document) {
      secret = app._root.document[app._runtime.secret];
    } else {
      return cb('runtime');
    }

    try {
      source = CryptoJS.AES.encrypt(source, secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
      source = source.toString();

      if (! source) { throw 'encryption'; }

      cb(false, source);
    } catch (err) {
      cb(err);
    }
  }

  var _compress = function(source, cb) {
    try {
      source = pako.deflate(source, { raw: true, level: 9 });

      if (! source) { throw 'compression'; }

      cb(false, source);
    } catch (err) {
      cb(err);
    }
  }

  var _complete = function(source, cb) {
    if (! source) {
      return cb('source');
    }

    // source to JavaScript JSON file format
    if (! fbinary) {
      // should wrap source in double quotes
      if (fcrypt) {
        source = '"' + source + '"';
      }

      source = file_heads + '=' + source;
    }

    cb(false, source);
  }

  var _save = function(source, cb) {
    var file_saves = app.memory.has('file_saves') ? parseInt(app.memory.get('file_saves')) : 0;

    file_saves++;

    var file_name_prefix = config.file && config.file.filename_prefix ? config.file.filename_prefix.toString() : _app_name + '_save';
    var file_name_separator = config.file && config.file.filename_separator ? config.file.filename_separator.toString() : '_';
    var file_name_date_format = config.file && config.file.filename_date_format ? config.file.filename_date_format.toString() : 'Y-m-d_H-M-S';

    var file_name = file_name_prefix;
    var file_name_date = app.utils.dateFormat(timestamp, file_name_date_format);

    file_name += file_name_separator + file_name_date;
    file_name += file_name_separator + file_saves;

    var _file = file_name + '.' + file_extension;

    if (!! app._runtime.debug) {
      console.info('app.os.fileSessionSave', '\t', 'file', '\t', _file, '\t', file_type, '\t', config.file);
    }

    try {
      app.memory.set('file_saves', file_saves);

      app.os.fileDownload(source, _file, file_type);

      cb(false, _file);
    } catch (err) {
      cb(err);
    }
  }

  var _init = function(source) {
    try {
      if (fcompress && fcrypt) {
        _prepare(source, function(err, source) {
          if (err) { throw err; }

          _crypt(source, function(err, source) {
            if (err) { throw err; }

            _compress(source, function(err, source) {
              if (err) { throw err; }

              _complete(source, function(err, blob) {
                if (err) { throw err; }

                _save(blob, function(err, filename) {
                  if (err) { throw err; }

                  callback(filename);
                });
              });
            });
          });
        });
      } else if (fcrypt) {
        _prepare(source, function(err, source) {
          if (err) { throw err; }

          _crypt(source, function(err, source) {
            if (err) { throw err; }

            _complete(source, function(err, blob) {
              if (err) { throw err; }

              _save(blob, function(err, filename) {
                if (err) { throw err; }

                callback(filename);
              });
            });
          });
        });
      } else {
        _prepare(source, function(err, source) {
          if (err) { throw err; }

          _complete(source, function(err, blob) {
            if (err) { throw err; }

            _save(blob, function(err, filename) {
              if (err) { throw err; }

              callback(filename);
            });
          });
        });
      }
    } catch (err) {
      app.error('app.os.fileSessionSave', err);

      callback(false);
    }
  }


  _init(source);
}



/**
 * app.os.fileDownload
 *
 * Prepares attachment data file and sends it to browser
 *
 * @link https://github.com/eligrey/FileSaver.js/
 *
 * @param source
 * @param <String> filename
 * @param <String> mime_type
 * @return
 */
app.os.fileDownload = function(source, filename, mime_type) {
  if (! FileReader) {
    return app.error('app.os.fileDownload', 'FileReader');
  }

  if (! Blob) {
    return app.error('app.os.fileDownload', 'Blob');
  }

  if ((typeof source != 'object' && typeof source != 'string') || typeof filename != 'string' || typeof mime_type != 'string') {
    return app.error('app.os.fileDownload', [source, filename, mime_type]);
  }


  var URL = app._root.window.URL || app._root.window.webkitURL;

  var _linkAttachment = function(data, is_object_link, force_new) {
    var open, check, triggered = false;

    var link = app._root.document.createElement('A');

    link.href = data.toString();
    link.download = filename;
    link.rel = 'noopener';
    link.target = !! force_new ? '_blank' : '_self';
    link.onclick = (function() {
      triggered = true;

      link.remove();

      if (is_object_link) {
        URL.revokeObjectURL(data);
      }

      open && clearTimeout(open);
      check && clearTimeout(check);
    });

    open = setTimeout(function() {
      var e;

      try {
        e = new MouseEvent('click');

        link.dispatchEvent(e);
      } catch (err) {
        e = document.createEvent('MouseEvents');
        e.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);

        link.dispatchEvent(e);
      }

      clearTimeout(open);
    }, 0);

    check = setTimeout(function() {
      if (! triggered) {
        link.target = '_blank';
        link.click();
      }

      clearTimeout(check);
    }, 10);
  }

  var _sendAttachment = function(data, is_object_link, as_link, force_new) {
    if (!! as_link) {
      _linkAttachment(data, is_object_link, force_new);
    } else {
      var wn = app._root.window.open('', !! force_new ? '_blank' : '_self');

      if (wn && wn.location) {
        wn.location.href = data;
        wn = null;
      } else {
        app._root.window.open(data, !! force_new ? '_blank' : '_self');
      }
    }
  }

  var _blobAttachment = function(file, as_link, force_new) {
    var reader = new FileReader();

    reader.onloadend = (function() {
      if (! reader.result) { throw 'data'; }

      var data = reader.result;

      _sendAttachment(data, false, as_link, force_new);
    });

    reader.onerror = (function(err) {
      return app.error('app.os.fileDownload() > _blob', err);
    });

    reader.readAsDataURL(file);
  }

  var _objectLinkAttachment = function(file, as_link, force_new) {
    try {
      data = URL.createObjectURL(file);

      _sendAttachment(data, true, as_link, force_new);
    } catch (err) {
      return app.error('app.os.fileDownload() > _objectURL', err);
    }
  }

  var _downloadAttachment = function(as_link, as_object_link, force_attachment, force_new) {
    var file_type = !! force_attachment ? 'attachment/file' : 'application/octet-stream';
    var file;

    try {
      file = new File([ blob ], filename, { type: file_type });
    } catch (err) {
      app.error('app.os.fileDownload() > _downloadAttachment', 'File', null, true);

      file = new Blob([ blob ], { type: file_type });
    }

    if (as_object_link) {
      _objectLinkAttachment(file, as_link, force_new);
    } else {
      _blobAttachment(file, as_link, force_new);
    }
  }


  try {
    var blob = new Blob([ source ], { type: mime_type });

    if (! blob) { throw 'blob'; }
  } catch (err) {
    return app.error('app.os.fileDownload', err);
  }


  var as_object_link = app._root.window.location.protocol != 'file:' ? true : false;

  // target browsers with download anchor attribute
  if ('download' in app._root.window.HTMLAnchorElement.prototype) {
    // default: 1 0 0 0

    _downloadAttachment(true);

    if (!! app._runtime.debug) {
      console.info('app.os.fileDownload', '\t', [1, 0, 0, 0], '\t', mime_type, '\t', filename);
    }
  // target ie
  } else if ('msSaveOrOpenBlob' in app._root.window.navigator) {
    // ie: 1 ? 0 0

    navigator.msSaveOrOpenBlob(file, filename) || _downloadAttachment(true, as_object_link, false, false);

    if (!! app._runtime.debug) {
      console.info('app.os.fileDownload', '\t', [1, as_object_link, 0, 1], '\t', mime_type, '\t', filename);
    }

  // target other browsers with open support
  } else if ('open' in app._root.window) {
    var as_link = app._runtime.system.name == 'chrome' ? true : false;
        as_object_link = app._runtime.system.name != 'chrome' ? as_object_link : false;
    var force_attachment = app._runtime.system.name == 'safari' ? true : false;
    var force_new = app._runtime.system.name == 'safari' ? true : false;

    // safari: 0 ? 1 1
    // crios: 1 0 0 0
    // default: 0 ? 0 1

    _downloadAttachment(as_link, as_object_link, force_attachment, force_new);

    if (!! app._runtime.debug) {
      console.info('app.os.fileDownload', '\t', [as_link, as_object_link, force_attachment, force_new], '\t', mime_type, '\t', filename);
    }
  // fallback
  } else {
    // default: 1 ? 1 1

    _downloadAttachment(true, as_object_link, true, true);

    if (!! app._runtime.debug) {
      console.info('app.os.fileDownload', '\t', [1, as_object_link, 1, 1], '\t', mime_type, '\t', filename);
    }
  }
}


/**
 * app.os.fileFindRoot
 *
 * Finds the root base of file
 *
 * @global <Object> appe__config
 * @global <Object> appe__control
 * @param <String> filename
 * @param <Boolean> inherit
 * @return <String>
 */
app.os.fileFindRoot = function(filename, inherit) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.os.fileFindRoot');
  }

  if (typeof filename != 'string') {
    return app.error('app.os.fileFindRoot', [filename]);
  }

  var _is_view = ! (app._root.window.appe__control === undefined);

  var cl = app._root.window.location.href;
  var bp = config.base_path.toString();
  var rp = config.runtime_path.toString();

  var base = '';
  var abs = !! inherit ? false : !! _is_view;

  if (cl.indexOf(rp + '/') != -1) {
    base += abs ? '../../' : '../';
  } else {
    var bpos;

    bpos = cl.substr(cl.indexOf(bp + '/')).split('/').slice(1, -1);
    bpos = bpos.length;

    while (bpos--) {
      base += '../';
    }
  }

  return base + filename.toString();
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
 * @return
 */
app.os.scriptOpen = function(callback, file, fn, max_attempts) {
  if (typeof callback != 'function' || typeof file != 'string' || (fn && typeof fn != 'string')) {
    app.error('app.os.scriptOpen', [callback, file, fn, max_attempts]);

    return callback(false);
  }

  fn = fn.toString();


  var _load = function(file) {
    var script = app._root.document.createElement('script');
    script.src = file;
    script.async = true;
    script.defer = true;

    app._root.document.head.appendChild(script);
  }

  var _check = function(fn, cb) {
    var max = parseInt(max_attempts) || 50;
    var attempts = 0;

    var interr = setInterval(function() {
      attempts++;

      if (fn in app._root.window === true || max === attempts) {
        clearInterval(interr);

        cb(true);
      }
    }, 10);
  }


  if (!! app._root.window.native) {
    return callback(true);
  }

  _load(file);

  if (fn in app._root.window === false) {
    _check(fn, callback);
  } else {
    callback(true);
  }
}


/**
 * app.os.generateFileHead
 *
 * Generates a JSON head
 *
 * @global <Object> appe__config
 * @param <Object> source
 * @param <Date> timestamp
 * @return <Object>
 */
app.os.generateJsonHead = function(source, timestamp) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.os.generateJsonHead');
  }

  if (! (source && typeof source === 'object') && ! (timestamp && timestamp instanceof Date)) {
    return app.error('app.os.generateJsonHead', [source, timestamp]);
  }

  var checksum = '';
  var timestamp = app.utils.dateFormat(timestamp, 'Q');

  return {
    'checksum': checksum,
    'date': timestamp,
    'version': app._runtime.version.toString(),
    'release': app._runtime.release.toString()
  };
}


/**
 * app.os.generateJsonChecksum
 *
 * Generates a JSON checksum, returns to callback
 *
 * @param <Function> callback
 * @param <String> source
 * @return
 */
app.os.generateJsonChecksum = function(callback, source) {
  if (typeof callback != 'function' && typeof source != 'string') {
    app.error('app.os.generateJsonChecksum', [callback, source]);

    return callback(false);
  }

  if (! (CryptoJS && CryptoJS.MD5)) {
    step = app.error('app.os.generateJsonChecksum', 'CryptoJS');
  }

  try {
    var checksum = CryptoJS.MD5(source.length.toString());
    checksum = checksum.toString();

    callback(checksum);
  } catch (err) {
    app.error('app.os.generateJsonChecksum', err);

    callback(false);
  }
}


/**
 * app.os.getLastFileName
 *
 * Gets the file name of last opened file
 *
 * @global <Object> appe__config
 * @return <String>
 */
app.os.getLastFileName = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

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


  filename = filename ? app.utils.base64('decode', filename) : null;

  return filename;
}


/**
 * app.os.getLastFileVersion
 *
 * Gets the runtime version of last opened file 
 *
 * @global <Object> appe__store
 * @return <String>
 */
app.os.getLastFileVersion = function() {
  var store = app._root.server.appe__store;

  if (! store) {
    return app.stop('app.os.getLastFileVersion', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var data_file = store[_app_name]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileVersion', 'data');
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
 * Gets the JSON checksum of last opened file 
 *
 * @global <Object> appe__store
 * @return <String>
 */
app.os.getLastFileChecksum = function() {
  var store = app._root.server.appe__store;

  if (! store) {
    return app.stop('app.os.getLastFileChecksum', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var data_file = store[_app_name]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileChecksum', 'data');
  }

  var file_json_checksum = null;

  if (data_file.checksum) {
    file_json_checksum = data_file.checksum;
  }

  return file_json_checksum;
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


  var _current_timestamp = app.utils.dateFormat(true, 'Q');


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
    if (typeof fn != 'string' || (schema && typeof schema != 'object')) {
      return app.stop('app.controller.retrieve() > _retrieve', [fn, schema]);
    }

    if (store[fn] && (typeof store[fn] === 'object' || typeof store[fn] === 'function')) {
      return store[fn];
    }

    var _data = {};

    for (var i in schema) {
      var key = schema[i].toString();
      var obj = app.store.get(fn + '_' + key);

      if (! obj) {
        return app.stop('app.controller.retrieve() > _retrieve', 'schema');
      }

      _data[key] = obj;
    }

    return _data;
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



/**
 * app.memory
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
app.memory = {};


/**
 * app.memory.set
 *
 * Sets storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.memory.set = function(key, value) {
  return app.utils.storage(false, 'set', key, value);
}


/**
 * app.memory.get
 *
 * Gets storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.memory.get = function(key) {
  return app.utils.storage(false, 'get', key);
}


/**
 * app.memory.has
 *
 * Checks existence for storage entry by key and match value
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.memory.has = function(key, value) {
  return app.utils.storage(false, 'has', key, value);
}


/**
 * app.memory.del
 *
 * Removes storage entry by key
 *
 * @param <String> key
 * @return
 */
app.memory.del = function(key) {
  return app.utils.storage(false, 'del', key);
}


/**
 * app.memory.reset
 *
 * Resets storage
 *
 * @return
 */
app.memory.reset = function() {
  return app.utils.storage(false, 'reset');
}


/**
 * app.store
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
app.store = {};


/**
 * app.store.set
 *
 * Sets persistent storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.store.set = function(key, value) {
  return app.utils.storage(true, 'set', key, value);
}


/**
 * app.store.get
 *
 * Gets persistent storage entry by key
 *
 * @param <String> key
 * @return
 */
app.store.get = function(key) {
  return app.utils.storage(true, 'get', key);
}


/**
 * app.store.has
 *
 * Checks existence for persistent storage entry by key and match value
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.store.has = function(key, value) {
  return app.utils.storage(true, 'has', key, value);
}


/**
 * app.store.del
 *
 * Removes persistent storage entry by key
 *
 * @param <String> key
 * @return
 */
app.store.del = function(key) {
  return app.utils.storage(true, 'del', key);
}


/**
 * app.store.reset
 *
 * Resets persistent storage
 *
 * @return
 */
app.store.reset = function() {
  return app.utils.storage(true, 'reset');
}


/**
 * app.start
 *
 * Launcher functions
 */
app.start = {};


/**
 * app.start.redirect
 *
 * Tries to redirect after a delay
 *
 * @param <Boolean> loaded
 */
app.start.redirect = function(loaded) {
  app.start.progress(0);

  var _wait = function() {
    app.redirect();

    clearTimeout(waiter);
  }

  var waiter = setTimeout(_wait, 1000);
}


/**
 * app.start.alternative
 *
 * Displays message with info and alternatives to help to execute app 
 *
 * @global <Object> appe__config
 * @return
 */
app.start.alternative = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.start.alternative');
  }

  if (typeof config.alt != 'object' || ! config.alt.exec_folder || ! config.alt.exec_platform) {
    return app.error('app.start.alternative', 'config');
  }


  var system = app.utils.system();

  var navigators = {
    'chrome': 'Chrome',
    'safari': 'Safari',
    'firefox': 'Firefox',
    'edge': 'Edge',
    'ie': 'Explorer',
    'iemobile': 'Explorer'
  };

  var browser = navigators[system.name];
  var exec_platform = system.platform in config.alt.exec_platform ? system.platform : null;


  var alt = '';

  alt = app.i18n('This application cannot be run due to restrictions into the software {{browser}}.', null, browser);

  if (exec_platform && config.alt.exec_folder && config.alt.exec_folder) {
    var alt_exec_folder = config.alt.exec_folder.toString();
    var alt_exec_platform = exec_platform in config.alt.exec_platform ? config.alt.exec_platform[exec_platform].toString() : '';

    alt += app.i18n('GO TO FOLDER "{{alt_exec_folder}}" AND OPEN "{{alt_exec_platform}}."', null, { 'alt_exec_folder': alt_exec_folder, 'alt_exec_platform': alt_exec_platform });
  }

  alt = alt.replace('{browser}', browser);


  app.start.progress(1);


  app.error(alt);

  app.blind();
}


/**
 * app.start.load
 *
 * Default "start" load function
 *
 * @global <Object> appe__config
 * @global <Object> appe__locale
 * @return
 */
app.start.load = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (typeof config == 'object') {
    var _config = !! Object.assign ? Object.assign({}, config) : app.utils.extendObject({}, config);

    if ('secret_passphrase' in config) {
      delete config.secret_passphrase;
    }
  } else {
    return app.stop('app.start.load');
  }

  app.checkConfig(_config);


  var exec = true;

  if (app._root.window.native == undefined) {
    if (
      ('sessionStorage' in window == false && 'localStorage' in window == false) ||
      'FileReader' in window == false ||
      'Blob' in window == false ||
      'history' in window == false ||
      'atob' in window == false ||
      'btoa' in window == false
    ) {
      exec = false;
    } else if (
      sessionStorage === undefined ||
      'replaceState' in history === false ||
      'checkValidity' in document.createElement('form') === false
    ) {
      exec = false;
    }
  }


  var _localize = function() {
    var localize_elements = app._root.document.querySelectorAll('[data-localize]');

    if (localize_elements.length) {
      Array.prototype.forEach.call(localize_elements, function(element) {
        app.layout.localize(element);
      });
    }
  }

  var _layout = function() {
    var _is_localized = ! (app._root.server.appe__locale === undefined);


    var open_action = document.getElementById('start-action-open');
    var new_action = document.getElementById('start-action-new');

    app.utils.addEvent('click', open_action, app.openSession);
    app.utils.addEvent('click', new_action, app.newSession);

    if (_is_localized) {
      _localize();
    }
  }

  var _complete = function(routine) {
    /**
     * start.loadComplete hook
     *
     * @param <Object> routine
     */
    if (start && typeof start == 'object' && 'loadComplete' in start && typeof start.loadComplete === 'function') {
      start.loadComplete(routine);
    } else {
      app.start.loadComplete(routine);
    }
  }

  var _session = function() {
    if ('secret_passphrase' in _config) {
      delete _config.secret_passphrase;
    }

    if (! exec) {
      /**
       * start.alternative hook
       */
      if (!! _config.alt && start && typeof start == 'object' && 'alternative' in start && typeof start.alternative === 'function') {
        start.alternative();
      } else if (!! _config.alt) {
        app.start.alternative();
      } else {
        app.blind();
      }

      return;
    }

    app.controller.setTitle(config.app_name);

    // load extensions
    var routine = (_config.aux && typeof _config.aux === 'object') ? _config.aux : [];
    var tasks = routine.length || 1;

    app.asyncLoadAux(function(loaded) {
      if (! loaded) {
        return app.stop('app.start.load', 'aux');
      }

      tasks--;

      if (! tasks) {
        _complete(routine);
      }
    }, routine, true);

    if (app._root.document.native == undefined) {
      _layout();
    }
  }


  app.session(_session, _config);
}


/**
 * app.start.progress
 *
 * Displays the current loader status
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
 * app.start.loadComplete
 *
 * Fires on "start" load complete
 *
 * @global <Object> appe__config
 * @param <Object> routine
 * @return
 */
app.start.loadComplete = function(routine) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.start.loadComplete');
  }

  if (config.file && typeof config.file != 'object') {
    return app.error('app.start.loadComplete', 'config');
  }

  var _app_name = app._runtime.name.toString();

  var schema = config.schema;

  if (typeof schema != 'object') {
    return app.error('app.start.loadComplete', 'schema');
  }


  // try to resume previous session and file
  var session_resume = app.resume(config);


  app.start.progress(1);

  if (! session_resume) {
    return;
  }


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;


  app.asyncAttemptLoad(function(loaded) {
    console.log(loaded);

    if (loaded) {
      app.start.redirect(true);
    } else {
      app.start.progress(1);
    }
  }, true, file_heads, session_resume, schema, true);
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
 * Init "main" function that fires when "main" is ready
 *
 * @global <Object> appe__config
 * @param <Object> loc
 * @return
 */
app.main.control = function(loc) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.main.control');
  }

  if (! (config.routes && typeof config.routes === 'object') || ! (config.events && typeof config.events === 'object')) {
    return app.error('app.main.control', 'config');
  }

  var cfg_routes = config.routes;
  var cfg_events = config.events;
  var cfg_events_keys = Object.keys(cfg_events);

  var event = null, i = 0, actions = {};

  while ((event = cfg_events_keys[i++])) {
    actions[cfg_events[event]] = event;
  }

  if (! loc) {
    loc = app.controller.spoof();
  }

  var cfg_default_route = config.default_route.toString();
  var route = cfg_default_route + '.html';

  var step = true;

  if (loc && typeof loc === 'object') {
    if (loc.view) {
      if (!! cfg_routes[loc.view]) {
        route = encodeURIComponent(loc.view) + '.html';
      } else {
        step = false;
      }

      if (loc.action) {
        if (!! cfg_routes[loc.view][loc.action]) {
          route = cfg_routes[loc.view][loc.action].toString() + '.html';
          route += '?' + encodeURIComponent(loc.action);
        } else {
          step = false;
        }

        if (loc.index) {
          route += '&id=' + encodeURIComponent(loc.index);
        }
      }
    } else {
      loc = { 'view': cfg_default_route };
    }
  } else {
    step = false;
  }

  if (step && typeof route === 'string') {
    app.controller.cursor(loc);

    if (!! app._root.document.native) {
      return;
    }

    // set view
    var view_src = 'views/' + route;

    var view = app._root.document.getElementById('view');

    view.removeAttribute('height');
    view.setAttribute('src', view_src);

    // view layout (list|wide)
    if (actions[loc.action] == 'list') {
      app._root.document.body.classList.add('full-width');
    } else {
      app._root.document.body.classList.remove('full-width');
    }

    // main navigation
    var nav = app._root.document.getElementById('master-navigation');
    var nav_selector_active = nav.querySelector('li.active');
    var nav_selector_current = nav.querySelector('a[data-view="' + loc.view + '"]');

    if (nav_selector_active) {
      nav_selector_active.classList.remove('active');
    }
    if (nav_selector_current) {
      nav_selector_current.parentNode.classList.add('active');
    }
  } else {
    return app.stop('app.main.control', [loc]);
  }
}


/**
 * app.main.handle
 *
 * Control "main" function handling requests, could return self prototype
 *
 * avalaible prototype methods:
 *  - getID ()
 *  - setAction ()
 *  - getAction ()
 *  - setTitle (title)
 *  - getTitle ()
 *  - setMsg (msg)
 *  - getMsg ()
 *  - setURL (path, qs)
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
 *  - receiver ()
 *
 * @global <Object> appe__config
 * @global <Object> appe__main
 * @param <Event> e
 * @return
 */
app.main.handle = function(e) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.main.handle');
  }

  if (! (config.events && typeof config.events === 'object')) {
    return app.error('app.main.handle', 'config');
  }

  var main = app._root.server.appe__main;

  var self = app.main.handle.prototype;

  if (! e.data) {
    return app.error('app.main.handle', [e]);
  }

  try {
    self.ctl = JSON.parse(e.data);
  } catch (err) {
    return app.error('app.main.handle', err);
  }


  // standard events
  var _s_events = { 'resize': 'resize', 'refresh': 'refresh', 'export': 'export' };

  var cfg_events = config.events;

  self.events = app.utils.extendObject(cfg_events, _s_events);

  self.event = null;

  // check is allowed action
  if (self.ctl.action && self.ctl.action in self.events) {
    self.event = self.ctl.action;
  } else {
    return app.error('app.main.handle', self.ctl);
  }

  self._initialized = true;

  self.loc = !! Object.assign ? Object.assign({}, self.ctl) : app.utils.extendObject({}, self.ctl);

  self._href = '';
  self._title = '';
  self._msg = '';


  /**
   * main.handle hook
   *
   * @param <Function> prototype
   * @param <String> event
   * @param <Object> ctl
   */
  if (main && typeof main == 'object' && 'handle' in main && typeof main.handle === 'function') {
    return main.handle(self, self.event, self.ctl);
  } else {
    return self[self.event].apply(self);
  }
}

/**
 * app.main.handle.prototype.getID
 *
 * @return <Number> id
 */
app.main.handle.prototype.getID = function() {
  var id = parseInt(this.ctl.index);

  return id;
}

/**
 * app.main.handle.prototype.setAction
 *
 * @return <String>
 */
app.main.handle.prototype.setAction = function() {
  if (this.ctl.action in this.events === false) {
    return app.error('app.main.prototype.setAction', 'ctl');
  }

  this.loc.action = this.events[this.loc.action].toString();

  return this.loc.action;
}

/**
 * app.main.handle.prototype.getAction
 *
 * @return <String>
 */
app.main.handle.prototype.getAction = function() {
  if (! this.loc.action) {
    return app.error('app.main.prototype.setAction', 'loc');
  }

  return this.loc.action;
}

/**
 * app.main.handle.prototype.setTitle
 *
 * @param <String> title
 * @return <String>
 */
app.main.handle.prototype.setTitle = function(title) {
  if (! (title && typeof title === 'string')) {
    return app.error('app.main.handle.prototype.setTitle', 'title');
  }

  this._title = title;

  return this._title;
}

/**
 * app.main.handle.prototype.getTitle
 *
 * @param <String>
 * @return <String>
 */
app.main.handle.prototype.getTitle = function() {
  return this._title ? this._title : ((this.ctl.title && typeof this.ctl.title === 'string') && this.ctl.title);
}

/**
 * app.main.handle.prototype.setMsg
 *
 * @param <String> msg
 * @return <String>
 */
app.main.handle.prototype.setMsg = function(msg) {
  if (! (msg && typeof msg === 'string')) {
    return app.error('app.main.handle.prototype.setMsg', 'msg');
  }

  this._msg = msg;

  return this._msg;
}

/**
 * app.main.handle.prototype.getMsg
 *
 * @return <String>
 */
app.main.handle.prototype.getMsg = function() {
  return this._msg ? this._msg : ((this.ctl.msg && typeof this.ctl.msg === 'string') && this.ctl.msg);
}

/**
 * app.main.handle.prototype.setURL
 *
 * @param <String> path
 * @param <String> qs
 * @return <String>
 */
app.main.handle.prototype.setURL = function(path, qs) {
  var href = 'index.html';

  href += (path || this.ctl.view) && '?' + ((path && typeof path === 'string') ? path : this.ctl.view);
  href += qs && '&' + ((qs && typeof qs === 'string') && qs);

  this._href = href;

  return this._href;
}

/**
 * app.main.handle.prototype.getURL
 *
 * @return <String>
 */
app.main.handle.prototype.getURL = function() {
  return this._href;
}

/**
 * app.main.handle.prototype.redirect
 */
app.main.handle.prototype.redirect = function() {
  var href = this.getURL();

  app._root.window.location.href = href;
}

/**
 * app.main.handle.prototype.refresh
 */
app.main.handle.prototype.refresh = function() {
  app._root.window.location.reload();
}

/**
 * app.main.handle.prototype.resize
 */
app.main.handle.prototype.resize = function() {
  if (! this.ctl.height) {
    return; // silent fail
  }

  var height = parseInt(this.ctl.height);
  var view = app._root.document.getElementById('view');

  view.height = height;
  view.scrolling = 'no';
}

/**
 * app.main.handle.prototype.selection
 */
app.main.handle.prototype.selection = function() {
  this.refresh();
}

/**
 * app.main.handle.prototype.export
 *
 * @return
 */
app.main.handle.prototype.export = function() {
  if (! Blob) {
    return app.error('app.main.handle.prototype.export', 'Blob');
  }

  if (! FileReader) {
    return app.error('app.main.handle.prototype.export', 'FileReader');
  }

  if (! this.ctl.data || ! (this.ctl.file && typeof this.ctl.file === 'object')) {
    return app.error('app.main.handle.prototype.export', 'ctl');
  }

  if (! (this.ctl.file.name && typeof this.ctl.file.name === 'string') || ! (this.ctl.file.type && typeof this.ctl.file.type === 'string')) {
    return app.error('app.main.handle.prototype.export', 'file');
  }

  try {
    app.os.fileDownload(this.ctl.data, this.ctl.file.name, this.ctl.file.type);
  } catch (err) {
    return app.error('app.main.handle.prototype.export', err);
  }
}

/**
 * app.main.handle.prototype.prepare
 *
 * Generic method for all actions
 */
app.main.handle.prototype.prepare = function() {
  var action = this.setAction();
  var id = this.getID();

  this.setURL(null, action + (id && '=' + id));

  if (this.ctl.history) {
    this.history();
  }

  this.receiver();
}

/**
 * app.main.handle.prototype.prevent
 *
 * Generic method for prevented actions like delete
 *
 * @return
 */
app.main.handle.prototype.prevent = function() {
  var action = this.setAction();
  var msg = this.getMsg();

  if (! msg) {
    return app.error('app.main.handle.prototype.' + this.event, 'msg');
  }

  this.setURL(null, action);

  if (! confirm(msg)) {
    return;
  }

  this.receiver();
}

/**
 * app.main.handle.prototype.open
 *
 * alias: app.main.handle.prototype.prepare
 */
app.main.handle.prototype.open = app.main.handle.prototype.prepare;

/**
 * app.main.handle.prototype.add
 *
 * alias: app.main.handle.prototype.prepare
 */
app.main.handle.prototype.add = app.main.handle.prototype.prepare;

/**
 * app.main.handle.prototype.edit
 *
 * alias: app.main.handle.prototype.prepare
 */
app.main.handle.prototype.edit = app.main.handle.prototype.prepare;

/**
 * app.main.handle.prototype.update
 *
 * alias: app.main.handle.prototype.prepare
 */
app.main.handle.prototype.update = app.main.handle.prototype.prepare;

/**
 * app.main.handle.prototype.delete
 *
 * alias: app.main.handle.prototype.prevent
 */
app.main.handle.prototype.delete = app.main.handle.prototype.prevent;

/**
 * app.main.handle.prototype.close
 *
 * alias: app.main.handle.prototype.prevent
 */
app.main.handle.prototype.close = app.main.handle.prototype.prevent;

/**
 * app.main.handle.prototype.history
 */
app.main.handle.prototype.history = function() {
  var title = this.getTitle();
  var url = this.getURL();

  app.controller.history(title, url);
}

/**
 * app.main.handle.prototype.receiver
 *
 * @return 
 */
app.main.handle.prototype.receiver = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.main.handle.prototype.receiver');
  }

  var schema = config.schema;

  if (typeof schema != 'object') {
    return app.error('app.main.handle.prototype.receiver', 'schema');
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
    return app.error('app.main.handle.prototype.receiver', err);
  }
}


/**
 * app.main.action
 *
 * Actions "main", returns self prototype
 *
 * avalaible prototype methods:
 *  - isInitialized (funcName)
 *  - begin ()
 *  - end ()
 *  - menu (element)
 *
 * @global <Object> appe__config
 * @global <Object> appe__main
 * @param <Array> events
 * @param <String> event
 * @param <ElementNode> element
 * @return <Function> prototype
 */
app.main.action = function(events, event, element) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.main.action');
  }

  var main = app._root.server.appe__main;

  var self = app.main.action.prototype;

  if ((events && (events instanceof Array === false)) || ! event || ! element) {
    return app.error('app.main.action', [events, event, element]);
  }

  this._initialized = false;


  return self;
}

/**
 * app.main.action.prototype.isInitialized
 *
 * @param <String> funcName
 * @return 
 */
app.main.action.prototype.isInitialized = function(funcName) {
  if (this._initialized) { return; }

  return app.error('app.main.action.prototype.isInitialized', funcName);
}

/**
 * app.main.action.prototype.begin
 */
app.main.action.prototype.begin = function() {
  this._initialized = true;
}

/**
 * app.main.action.prototype.end
 */
app.main.action.prototype.end = function() {
  this.isInitialized('end');

  this._initialized = false;
}

/**
 * app.main.action.prototype.menu
 *
 * @param <ElementNode> element
 * @param <String> event
 * @param <ElementNode> menu
 * @param <ElementNode> toggler
 * @return
 */
app.main.action.prototype.menu = function(element, event, menu, toggler) {
  this.isInitialized('menu');

  if ('jQuery' in app._root.window && 'collapse' in jQuery.fn) {
    return;
  }

  if (element === undefined) {
    return app.error('app.main.action.prototype.menu', [element, event, menu, toggler]);
  }

  var _close = function(e) {
    if (e.target.parentNode.parentNode.parentNode && e.target.parentNode.parentNode.parentNode == menu) {
      return;
    }
    
    menu.collapse.close(e);
  }

  menu = menu || app._root.document.querySelector(element.getAttribute('data-target'));
  toggler = toggler || element;

  if (! menu.getAttribute('data-is-visible')) {
    menu.setAttribute('data-is-visible', 'true');

    menu.setAttribute('aria-expanded', 'false');
    toggler.setAttribute('aria-expanded', 'false');

    var _close_event = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';

    menu.collapse = new app.layout.collapse(null, toggler, menu);

    app.utils.addEvent(_close_event, app._root.document.documentElement, _close);
  }

  app._root.window.scrollTo(0, 0);

  menu.collapse.toggle(null);
}


/**
 * app.main.load
 *
 * Default "main" load function
 *
 * @global <Object> appe__config
 * @global <Object> appe__locale
 * @return
 */
app.main.load = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (typeof config == 'object') {
    var _config = !! Object.assign ? Object.assign({}, config) : app.utils.extendObject({}, config);

    if ('secret_passphrase' in config) {
      delete config.secret_passphrase;
    }
  } else {
    return app.stop('app.main.load');
  }

  app.checkConfig(_config);


  var _localize = function() {
    var localize_elements = app._root.document.querySelectorAll('[data-localize]');

    if (localize_elements.length) {
      Array.prototype.forEach.call(localize_elements, function(element) {
        app.layout.localize(element);
      });
    }
  }

  var _layout = function() {
    var _is_localized = ! (app._root.server.appe__locale === undefined);


    var navbar_brand = app._root.document.getElementById('brand');
    brand.innerHTML = app.controller.getTitle();

    var open_actions = app._root.document.querySelectorAll('.main-action-open');
    var new_actions = app._root.document.querySelectorAll('.main-action-new');
    var save_actions = app._root.document.querySelectorAll('.main-action-save');

    var localize_elements = app._root.document.querySelectorAll('[data-localize]');

    if (open_actions.length) {
      Array.prototype.forEach.call(open_actions, function(element) {
        app.utils.addEvent('click', element, app.openSession);
      });
    }

    if (new_actions.length) {
      Array.prototype.forEach.call(new_actions, function(element) {
        app.utils.addEvent('click', element, app.newSession);
      });
    }

    if (save_actions.length) {
      Array.prototype.forEach.call(save_actions, function(element) {
        app.utils.addEvent('click', element, app.saveSession);
      });
    }

    if (_is_localized) {
      _localize();
    }
  }

  var _complete = function(routine) {
    /*
     * main.loadComplete hook
     *
     * @param <Object> routine
     */
    if (main && 'loadComplete' in main && typeof main.loadComplete === 'function') {
      main.loadComplete(routine);
    } else {
      app.main.loadComplete(routine);
    }
  }

  var _session = function() {
    if ('secret_passphrase' in _config) {
      delete _config.secret_passphrase;
    }

    app.controller.setTitle(config.app_name);

    // load extensions
    var routine = (_config.aux && typeof _config.aux === 'object') ? _config.aux : [];
    var tasks = routine.length || 1;

    app.asyncLoadAux(function(loaded) {
      if (! loaded) {
        return app.stop('app.main.load', 'aux');
      }

      tasks--;

      if (! tasks) {
        _complete(routine);
      }
    }, routine, false);

    if (app._root.document.native == undefined) {
      _layout();
    }

    // ready to receive message from "view"
    app.utils.addEvent('message', app._root.window, app.main.handle);
  }


  app.session(_session, _config, true);

}


/**
 * app.main.beforeunload
 *
 * Default "main" before unload function
 *
 * @return <Boolean>
 */
app.main.beforeunload = function() {
  if (app.memory.has('save_reminded') || app.memory.get('last_time') === app.memory.get('last_stored')) {
    return;
  }

  app.memory.set('save_reminded', true);

  return true;
}


/**
 * app.main.loadComplete
 *
 * Fires on "main" load complete
 *
 * @global <Object> appe__config
 * @param <Object> routine
 * @return
 */
app.main.loadComplete = function(routine) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.main.loadComplete');
  }

  // try to resume previous session
  app.resume(config, true);

  routine.push({ fn: app._runtime.name, schema: config.schema });

  // retrieve previous session store and load extensions objects
  app.controller.retrieve(app.main.setup, routine);
}


/**
 * app.main.setup
 *
 * Setup "main" data
 *
 * @global <Object> appe__main
 */
app.main.setup = function() {
  var main = app._root.server.appe__main;

  /**
   * main.setup hook
   *
   * @param <Object> data
   */
  if (main && typeof main == 'object' && 'setup' in main && typeof main.setup === 'function') {
    main.setup(app.data());
  }

  app.main.control();
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
 * Captures the current position inside "view" using location.href
 *
 * @return <Object> loc  { action, index }
 */
app.view.spoof = function() {
  var loc = { action: null, index: null };

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
      loc = { action: ref[0], index: parseInt(sub[1]) };
    } else {
      loc = { action: ref[1] };
    }
  }

  return loc;
}


/**
 * app.view.control
 *
 * Control "view" function, returns self prototype
 *
 * avalaible prototype methods:
 *  - isInitialized (funcName)
 *  - begin ()
 *  - end ()
 *  - setID (id)
 *  - getID ()
 *  - getLastID ()
 *  - setEvent (event)
 *  - getEvent ()
 *  - setTitle (section_title, view_title, id)
 *  - setActionHandler (label, id)
 *  - denySubmit ()
 *  - fillTable (table, data, order)
 *  - fillForm (form, data)
 *  - fillSelection (data, id)
 *  - fillCTA (id)
 *  - localize (element)
 *
 * @global <Object> appe__config
 * @global <Object> appe__control
 * @global <Object> appe__locale
 * @param <Array> events
 * @param <Object> data
 * @param <ElementNode> form
 * @return <Function> prototype
 */
app.view.control = function(events, data, form) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.view.control');
  }

  var control = app._root.server.appe__control;

  if (! control) {
    return app.error('app.view.control', 'control');
  }

  var _is_localized = ! (app._root.server.appe__locale === undefined);

  var self = app.view.control.prototype;

  if ((events && events instanceof Array === false) || (data && typeof data != 'object')) {
    return app.error('app.view.control', [events, data, form]);
  }

  self._initialized = false;
  self._is_localized = _is_localized;

  self.events = events || null;
  self.data = data || {};
  self.form = form || null;
  
  self.ctl = {};


  return self;
}

/**
 * app.view.control.prototype.isInitialized
 *
 * @param <String> funcName
 * @return
 */
app.view.control.prototype.isInitialized = function(funcName) {
  if (this._initialized) { return; }

  return app.error('app.view.control.prototype.isInitialized', funcName);
}

/**
 * app.view.control.prototype.begin
 *
 * @return <Number> id
 */
app.view.control.prototype.begin = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

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

  var default_event = config.default_event.toString();  

  var step = true;

  if (loc && typeof loc === 'object') {
    if (loc.action) {
      if (!! _routes[view][loc.action]) {
        event = actions[loc.action];
      } else {
        step = false;
      }

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

/**
 * app.view.control.prototype.end
 *
 * @return
 */
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

/**
 * app.view.control.prototype.setID
 *
 * @param <String> id
 * @return <Number>
 */
app.view.control.prototype.setID = function(id) {
  this.isInitialized('setID');

  control.temp.id = parseInt(id);

  return control.temp.id;
}

/**
 * app.view.control.prototype.getID
 *
 * @return <Number>
 */
app.view.control.prototype.getID = function() {
  this.isInitialized('getID');

  if (! control.temp.id) {
    app.error('app.view.control.prototype.getID', 'id');

    return 0;
  }

  return parseInt(control.temp.id);
}

/**
 * app.view.control.prototype.getLastID
 *
 * @return <Number>
 */
app.view.control.prototype.getLastID = function() {
  this.isInitialized('getLastID');

  var last_id = Object.keys(this.data).pop();

  return last_id ? (parseInt(last_id) + 1) : 1;
}

/**
 * app.view.control.prototype.setEvent
 *
 * @param <String> event
 * @return <String>
 */
app.view.control.prototype.setEvent = function(event) {
  this.isInitialized('setEvent');

  if ((this.events && this.events.indexOf(event) === -1)) {
    return app.error('app.view.control.prototype.setEvent', 'event');
  }

  control.temp.event = event.toString();

  return control.temp.event;
}

/**
 * app.view.control.prototype.getEvent
 *
 * @return <String>
 */
app.view.control.prototype.getEvent = function() {
  this.isInitialized('getEvent');

  return control.temp.event.toString();
}

/**
 * app.view.control.prototype.getLastID
 *
 * @param <String> section_title
 * @param <String> view_title
 * @param <Number> id
 */
app.view.control.prototype.setTitle = function(section_title, view_title, id) {
  this.isInitialized('setTitle');

  var event = this.getEvent();

  id = (id != false) ? parseInt(id) : app.view.control.prototype.getID();

  if (event === 'edit' && !! id) {
    if (app._runtime.locale_dir == 'rtl') {
      section_title = '# ' + id + ' ' + section_title;
    } else {
      section_title += ' # ' + id;
    }
  }

  var _view_title = app._root.document.getElementById('view-title');
  var _section_title = app._root.document.getElementById('section-title');

  if (view_title != undefined) {
    _view_title.innerHTML = view_title;
  }
  if (section_title != undefined) {
    _section_title.innerHTML = section_title;
  }
}

/**
 * app.view.control.prototype.setActionHandler
 *
 * @param <String> label
 * @param <String> id
 * @return
 */
app.view.control.prototype.setActionHandler = function(label, id) {
  this.isInitialized('setActionHandler');

  var event = this.getEvent();

  id = parseInt(id) || this.getID();

  var action_handler = app._root.document.getElementById('submit');
  var action_index = app._root.document.getElementById('index');

  if (action_index) {
    action_index.setAttribute('value', id);
  } else {
    return app.error('app.view.control.prototype.setActionHandler', 'action_index');
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

/**
 * app.view.control.prototype.denySubmit
 */
app.view.control.prototype.denySubmit = function() {
  this.isInitialized('denySubmit');

  var action_handler = app._root.document.getElementById('submit');

  if (action_handler) {
    action_handler.removeAttribute('onclick');
    action_handler.setAttribute('disabled', '');
  }

  if (this.form) {
    this.form.setAttribute('action', '');
  }
}

/**
 * app.view.control.prototype.fillTable
 *
 * @param <ElementNode> table
 * @param <Object> data
 * @param <Array> order
 * @return <Object>  { rows <String>, tpl <ElementNode>, data <Object>, args <Array> }
 */
app.view.control.prototype.fillTable = function(table, data, order) {
  this.isInitialized('fillTable');

  if (! table) {
    return app.error('app.view.control.prototype.fillTable', [table, data, order]);
  }

  if (! (data && typeof data === 'object')) {
    data = this.data;
  }

  order = (order && order instanceof Array) ? order : Object.keys(data);

  var args = Object.values(arguments).slice(3);

  var tbody = table.querySelector('tbody');
  var trow_tpl = tbody.querySelector('tr.tpl').cloneNode(true);
  trow_tpl.classList.remove('tpl');

  var rows = '';

  /**
   * control.renderRow hook
   *
   * @param <ElementNode> trow_tpl
   * @param <Number> id
   * @param <Object> data[id]
   * @param <Object> args
   */
  if (control && typeof control == 'object' && 'renderRow' in control && typeof control.renderRow === 'function') {
    Array.prototype.forEach.call(order, function(id) {
      var row = control.renderRow(trow_tpl, id, data[id], args);

      rows += row.outerHTML;
    });

    tbody.innerHTML = rows;

    this._is_localized && this.localize(table);
  }

  return { rows: rows, tpl: trow_tpl, data: data, args: args };
}

/**
 * app.view.control.prototype.fillForm
 *
 * @param <ElementNode> form
 * @param <Object> data
 * @return <Object>  { data <Object>, args <Array> }
 */
app.view.control.prototype.fillForm = function(form, data) {
  this.isInitialized('fillForm');

  if (! this.form) {
    return app.error('app.view.control.prototype.fillForm', [form, data]);
  }

  if (! (data && typeof data === 'object')) {
    data = this.data;
  }

  var args = Object.values(arguments).slice(2);

  /**
   * control.fillForm hook
   *
   * @param <Object> data
   * @param <Object> args
   */
  if (control && typeof control == 'object' && 'fillForm' in control && typeof control.fillForm === 'function') {
    control.fillForm(data, args);

    this._is_localized && this.localize(form);
  }

  return { data: data, args: args };
}

/**
 * app.view.control.prototype.fillSelection
 *
 * @param <Object> data
 * @param id
 * @return
 */
app.view.control.prototype.fillSelection = function(data, id) {
  this.isInitialized('fillSelection');

  if (! (data && typeof data === 'object')) {
    return app.error('app.view.control.prototype.fillSelection', [data, id]);
  }

  var selection = app._root.document.getElementById('selection');

  id = id || null;

  if (id) {
    selection.innerHTML = app.layout.renderSelectOptions(selection, data, id);
    selection.value = id;
  } else {

    selection.parentNode.classList.add('hidden');
  }
}

/**
 * app.view.control.prototype.fillCTA
 *
 * @param <Number> id
 * @return
 */
app.view.control.prototype.fillCTA = function(id) {
  this.isInitialized('fillCTA');

  id = parseInt(id);

  var section_actions_top = app._root.document.getElementById('section-actions-top');
  var section_actions_bottom = app._root.document.getElementById('section-actions-bottom');

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
 * app.view.control.prototype.fillCTA
 *
 * @param <NodeList> elements
 * @return
 */
app.view.control.prototype.localize = function(elements) {
  this.isInitialized('localize');

  if (! elements) {
    return app.error('app.view.control.prototype.localize', [elements]);
  }

  var localize_elements = elements.querySelectorAll('[data-localize]');

  if (localize_elements.length) {
    Array.prototype.forEach.call(localize_elements, function(element) {
      app.layout.localize(element);
    });
  }
}


/**
 * app.view.action
 *
 * Actions "view", returns self prototype
 *
 * avalaible prototype methods:
 *  - isInitialized (funcName)
 *  - begin ()
 *  - end ()
 *  - getID ()
 *  - validateForm () 
 *  - prepare (data, submit)
 *  - prevent (data, submit, title, name)
 *  - open (data, submit) <=> prepare ()
 *  - add (data, submit) <=> prepare ()
 *  - edit (data, submit) <=> prepare ()
 *  - update (data, submit)<=> prepare ()
 *  - delete (data, submit, title, name) <=> prevent ()
 *  - close (data, submit, title, name) <=> prevent ()
 *  - selection ()
 *  - print ()
 *
 * @global <Object> appe__config
 * @global <Object> appe__control
 * @global <Object> appe__locale
 * @param <Array> events
 * @param <String> event
 * @param <ElementNode> element
 * @param <ElementNode> form
 * @return <Function> prototype
 */
app.view.action = function(events, event, element, form) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.view.action');
  }

  var control = app._root.server.appe__control;

  if (! control) {
    return app.error('app.view.action', 'control');
  }

  var _is_localized = ! (app._root.server.appe__locale === undefined);

  var self = app.view.action.prototype;

  if ((events && (events instanceof Array === false)) || ! event || ! element) {
    return app.error('app.view.action', [events, event, element, form]);
  }

  self._initialized = false;
  self._is_localized = _is_localized;

  if (! (config.events && typeof config.events === 'object')) {
    return app.error('app.view.action', 'config');
  }

  self.cfg_events = config.events;
  self.events = events;
  self.event = event.toString();
  self.element = element;
  self.form = form || null;

  self.ctl = {};


  return self;
}

/**
 * app.view.action.prototype.isInitialized
 *
 * @param <String> funcName
 * @return
 */
app.view.action.prototype.isInitialized = function(funcName) {
  if (this._initialized) { return; }

  return app.error('app.view.action.prototype.isInitialized', funcName);
}

/**
 * app.view.action.prototype.begin
 *
 * @return
 */
app.view.action.prototype.begin = function() {
  if ((this.events && this.events.indexOf(this.event) === -1)) {
    return app.error('app.view.action.prototype.begin', 'event');
  }

  this._initialized = true;
}

/**
 * app.view.action.prototype.end
 *
 * @return
 */
app.view.action.prototype.end = function() {
  this.isInitialized('end');

  this._initialized = false;
}

/**
 * app.view.action.prototype.getID
 *
 * @return <Number> id
 */
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

/**
 * app.view.action.prototype.validateForm
 *
 * @return <Boolean>
 */
app.view.action.prototype.validateForm = function() {
  this.isInitialized('validateForm');

  if (! this.form) {
    return app.error('app.view.action.prototype.validateForm', 'form');
  }

  var action_submit = app._root.document.getElementById('real-submit');

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

/**
 * app.view.action.prototype.prepare
 *
 * Generic method for all actions
 *
 * @param <Object> data
 * @param <Boolean> submit
 * @return <Boolean>
 */
app.view.action.prototype.prepare = function(data, submit) {
  this.isInitialized(this.event);

  if (data && typeof data != 'object') {
    return app.error('app.view.action.prototype.' + this.event, [data, submit]);
  }

  var id = this.getID();
  var label = self.cfg_events ? self.cfg_events[this.event].toString() : this.event;

  try {
    this.ctl.action = this.event;

    if (id) {
      this.ctl.index = parseInt(id);

      // event update no needs history
      if (this.event != 'update') {
        this.ctl.history = true;

        this.ctl.title = (this.ctl.title && typeof this.ctl.title === 'string') ? '"' + this.ctl.index + '"' : '# ' + this.ctl.index;

        if (label) {
          label = label[0].toUpperCase() + label.slice(1);

          if (this._is_localized) {
            label = app.i18n(label, 'action') || label;
          }

          this.ctl.title = app._runtime.locale_dir == 'rtl' ? this.ctl.title + ' ' + label : label + ' ' + this.ctl.title;
        }
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

/**
 * app.view.action.prototype.prepare
 *
 * Generic method for prevented actions like delete
 *
 * @param <Object> data
 * @param <Boolean> submit
 * @param <String> title
 * @param <String> | <Number> name
 * @return
 */
app.view.action.prototype.prevent = function(data, submit, title, name) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.view.action.prototype.prevent');
  }

  this.isInitialized(this.event);

  if (typeof title != 'string' || (data && typeof data != 'object')) {
    return app.error('app.view.action.prototype.' + this.event, [data, submit, title, name]);
  }

  var label = self.cfg_events ? self.cfg_events[this.event].toString() : this.event;

  if (this._is_localized) {
    label = app.i18n(label, 'event') || label;
  }

  if (title && (typeof name == 'number' || typeof name == 'string')) {
    name = app._runtime.locale_dir == 'rtl' ? (typeof name == 'number' ? parseInt(name) + ' #' : '"' + name + '"') : (typeof name == 'number' ? '# ' + parseInt(name) : '"' + name + '"');

    this.ctl.msg = app.i18n('Are you sure to {{placeholder}} {{name}} {{title}}?', 'action', {
      'placeholder': label,
      'name': name,
      'title': title
    });
  } else {
    this.ctl.msg = title;
  }

  return this.prepare(data, submit);
}

/**
 * app.view.action.prototype.open
 *
 * alias: app.view.action.prototype.prepare
 */
app.view.action.prototype.open = app.view.action.prototype.prepare;

/**
 * app.view.action.prototype.add
 *
 * alias: app.view.action.prototype.prepare
 */
app.view.action.prototype.add = app.view.action.prototype.prepare;

/**
 * app.view.action.prototype.edit
 *
 * alias: app.view.action.prototype.prepare
 */
app.view.action.prototype.edit = app.view.action.prototype.prepare;

/**
 * app.view.action.prototype.update
 *
 * alias: app.view.action.prototype.prepare
 */
app.view.action.prototype.update = app.view.action.prototype.prepare;

/**
 * app.view.action.prototype.delete
 *
 * alias: app.view.action.prototype.prevent
 */
app.view.action.prototype.delete = app.view.action.prototype.prevent;

/**
 * app.view.action.prototype.close
 *
 * alias: app.view.action.prototype.prevent
 */
app.view.action.prototype.close = app.view.action.prototype.prevent;

/**
 * app.view.action.prototype.selection
 *
 * @return
 */
app.view.action.prototype.selection = function() {
  this.isInitialized('selection');

  var selected = this.element.value ? this.element.value.toString() : '';
  var data = { 'id': selected };

  return this.prepare(data, true);
}

/**
 * app.view.action.prototype.print
 */
app.view.action.prototype.print = function() {
  this.isInitialized('print');

  print();
}


/**
 * app.view.sub
 *
 * Sub-actions "view", returns requested prototype method
 *
 * avalaible prototype methods:
 *  - csv (element, table)
 *  - clipboard (element, table)
 *  - toggler (element, dropdown)
 *
 * @global <Object> appe__config
 * @param <String> method
 * @param <ElementNode> element
 * @param <ElementNode> table
 * @return <Function>
 */
app.view.sub = function(method, element, table) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.view.sub');
  }

  var self = app.view.sub.prototype;

  if (! method || ! element) {
    return app.error('app.view.sub', [method, element, table]);
  }

  return self[method](element, table);
}

/**
 * app.view.sub.prototype.csv
 *
 * @param <ElementNode> element
 * @param <ElementNode> table
 * @return
 */
app.view.sub.prototype.csv = function(element, table) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.view.sub.prototype.csv');
  }

  if (! element || ! table) {
    return app.error('app.view.sub.prototype.csv', [element, table]);
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

  var file = { 'name': filename + '.csv', 'type': 'text/csv;charset=utf-8' };

  var ctl = { action: 'export', file: file, data: source };

  return app.view.send(ctl);
}

/**
 * app.view.sub.prototype.clipboard
 *
 * @param <ElementNode> element
 * @param <ElementNode> table
 * @param <ElementNode> dropdown
 * @param <ElementNode> toggler
 * @return
 */
app.view.sub.prototype.clipboard = function(element, table, dropdown, toggler) {
  if (! element || ! table) {
    return app.error('app.view.sub.prototype.clipboard', [element, table]);
  }

  var source = '';
  var table_csv = app.view.convertTableCSV(table);

  // perform line break replacements for clipboard
  Array.prototype.forEach.call(table_csv, function(line) {
    source += line.join('\t') + '\r\n';
  });

  app.view.copyToClipboard(source);

  var closest_node = element.parentNode.parentNode.parentNode;

  dropdown = dropdown || closest_node.querySelector('.dropdown-menu');
  toggler = toggler || closest_node.querySelector('.dropdown-toggle');

  toggler.classList.add('btn-gray-lighter');

  var fx_rm = setTimeout(function() {
    toggler.classList.remove('btn-gray-lighter');

    clearTimeout(fx_rm);
  }, 1000);
}

/**
 * app.view.sub.prototype.toggler
 *
 * @param <ElementNode> element
 * @param <ElementNode> table
 * @param <ElementNode> dropdown
 * @param <ElementNode> toggler
 * @return
 */
app.view.sub.prototype.toggler = function(element, table, dropdown, toggler) {
  if ('jQuery' in app._root.window && 'dropdown' in jQuery.fn) {
    return;
  }

  if (element === undefined) {
    return app.error('app.view.sub.prototype.toggler', [element]);
  }

  var closest_node = element.parentNode.parentNode;

  dropdown = dropdown || closest_node.querySelector('.dropdown-menu');
  toggler = toggler || element;

  if (! dropdown.getAttribute('data-is-visible')) {
    dropdown.setAttribute('data-is-visible', 'true');

    var _close_event = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';

    dropdown.dropdown = new app.layout.dropdown(null, toggler, dropdown);

    app.utils.addEvent(_close_event, app._root.document.documentElement, dropdown.dropdown.close);
  }

  dropdown.dropdown.toggle(null);
}


/**
 * app.view.handle
 *
 * Fires when "view" is loaded
 *
 * @global <Object> appe__config
 * @global <Object> appe__control
 * @return
 */
app.view.handle = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.view.handle');
  }

  var control = app._root.server.appe__control;

  if (! control) {
    return app.error('app.view.handle', 'control');
  }

  /**
   * control.openView hook
   *
   * @param <Object> data
   */
  if (control && typeof control == 'object' && 'handle' in control && typeof control.handle === 'function') {
    control.handle(app.data());
  }

  app.utils.addEvent('resize', app._root.window, app.view.resize);
  app.utils.addEvent('orientationchange', app._root.window, app.view.resize);
}


/**
 * app.view.send
 *
 * Sends control messages to "main"
 *
 * @global <Object> appe__config
 * @global <Object> appe__control
 * @param <Object> ctl
 * @return
 */
app.view.send = function(ctl) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.view.action');
  }

  var control = app._root.server.appe__control;

  if (! control) {
    return app.error('app.view.action', 'control');
  }

  if (! ctl) {
    return; //silent fail
  }

  if (typeof ctl != 'object') {
    return app.error('app.view.send', [ctl]);
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
      console.info('app.view.send', '\t', ctl);
    }

    ctl = JSON.stringify(ctl);

    // sends control submission to parent "main"
    app._root.window.parent.postMessage(ctl, '*');
  } catch (err) {
    return app.error('app.view.send', err);
  }
}


/**
 * app.view.resize
 *
 * Fires when "view" is resized
 *
 * @global <Object> appe__control
 * @return
 */
app.view.resize = function(check_time) {
  var control = app._root.server.appe__control;

  if (! (control && control.temp)) {
    return; // silent fail
  }

  if (check_time) {
    if ((new Date().getTime() - control.temp.last_resize) < 1000) {
      return;
    }

    control.temp.last_resize = new Date().getTime();
  }


  var ctl = { action: 'resize', height: app._root.document.documentElement.scrollHeight };

  return app.view.send(ctl);
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
    return app.error('app.view.getFormData', [elements]);
  }

  var data = {};

  var element = {}, i = 0;

  while ((element = elements[i++])) {
    if (element.nodeName == 'FIELDSET') {
      continue;
    }

    var name = element.name;
    var value = element.value.trim();
    var transform = element.getAttribute('data-transform') || false;
    var sanitize = element.getAttribute('data-sanitize') || false;

    if (element.type) {
      if (element.type == 'checkbox' || element.type == 'radio') {
        value = element.checked ? true : false;
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
 * @param <ElementNode> table
 * @return <String>
 */
app.view.convertTableCSV = function(table) {
  if (! table) {
    return app.error('app.view.convertTableCSV', [table]);
  }

  var thead_th = table.querySelectorAll('thead tr:not(.hidden-csv) th');
  var tbody_trow = table.querySelectorAll('tbody tr:not(.hidden-csv)');

  var csv = [[]];

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
 * Helper to copy into system clipboard
 *
 * @link https://gist.github.com/rproenca/64781c6a1329b48a455b645d361a9aa3
 *
 * @param <String> source
 * @return
 */
app.view.copyToClipboard = function(source) {
  if (! source) {
    return app.error('app.view.copyToClipboard', [source]);
  }

  var _clipboard = app._root.document.createElement('TEXTAREA');

  _clipboard.style = 'position: absolute; top: 0; right: 0; width: 0; height: 0; z-index: -1; overflow: hidden;';
  _clipboard.value = source;

  app._root.document.body.appendChild(_clipboard);

  if (app._runtime.system.platform != 'ios') {
    _clipboard.focus();
    _clipboard.select();
  } else {
    var _range = app._root.document.createRange();
    _range.selectNodeContents(_clipboard);

    var _selection = getSelection();
    _selection.removeAllRanges();
    _selection.addRange(_range);

    _clipboard.setSelectionRange(0, 999999);
  }

  app._root.document.execCommand('copy');

  app._root.document.body.removeChild(_clipboard);
}


/**
 * app.view.load
 *
 * Default "view" load function
 *
 * @global <Object> appe__config
 * @global <Object> appe__locale
 * @return
 */
app.view.load = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (typeof config == 'object') {
    var _config = !! Object.assign ? Object.assign({}, config) : app.utils.extendObject({}, config);

    if ('secret_passphrase' in config) {
      delete config.secret_passphrase;
    }
  } else {
    return app.stop('app.view.load');
  }


  var _localize = function() {
    var localize_elements = app._root.document.querySelectorAll('[data-localize]');

    if (localize_elements.length) {
      Array.prototype.forEach.call(localize_elements, function(element) {
        app.layout.localize(element);
      });
    }
  }

  var _layout = function() {
    var _is_localized = ! (app._root.server.appe__locale === undefined);

    if (_is_localized) {
      _localize();
    }
  }

  var _complete = function(routine) {
    /**
     * control.loadComplete hook
     *
     * @param <Object> routine
     */
    if (control && typeof control == 'object' && 'loadComplete' in control && typeof control.loadComplete === 'function') {
      control.loadComplete(routine);
    } else {
      app.view.loadComplete(routine);
    }
  }

  var _session = function() {
    if ('secret_passphrase' in _config) {
      delete _config.secret_passphrase;
    }

    // load extensions
    var routine = (_config.aux && typeof _config.aux === 'object') ? _config.aux : [];
    var tasks = routine.length || 1;

    app.asyncLoadAux(function(loaded) {
      if (! loaded) {
        return app.stop('app.view.load', 'aux');
      }

      tasks--;

      if (! tasks) {
        _complete(routine);
      }
    }, routine, false);

    if (app._root.document.native == undefined) {
      _layout();
    }
  }


  app.session(_session, _config, false);
}


/**
 * app.view.beforeunload
 *
 * Default "view" before unload function
 *
 * @global <Object> appe__control
 * @return <Boolean>
 */
app.view.beforeunload = function() {
  var control = app._root.server.appe__control;

  if (! control) {
    return app.error('app.view.beforeunload', 'control');
  }

  if (control.temp.form && ! control.temp.form_submit) {
    try {
      var _changes = app.view.getFormData(control.temp.form_elements);
      _changes = _changes && JSON.stringify(_changes);
    } catch (err) {
      return app.error('app.view.beforeunload', err);
    }

    if (control.temp.form_changes !== _changes) {
      return true;
    }
  }

  return;
}


/**
 * app.view.loadComplete
 *
 * Fires on "view" load complete
 *
 * @global <Object> appe__config
 * @param <Object> routine
 * @return
 */
app.view.loadComplete = function(routine) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.view.loadComplete');
  }

  // try to resume previous session
  app.resume(config, false);

  routine.push({ fn: app._runtime.name, schema: config.schema });

  // retrieve previous session store and load extensions objects
  app.controller.retrieve(app.view.handle, routine);
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
 * Renders a document element
 *
 * @param <String> node
 * @param <String> content
 * @param <Object> attributes
 * @return <String>
 */
app.layout.renderElement = function(node, content, attributes) {
  if (typeof node !== 'string' || (content && typeof content !== 'string') || (attributes && typeof attributes !== 'object')) {
    return app.error('app.layout.renderElement', [node, content, attributes]);
  }

  var _node = node.toLowerCase();
  var _element = '<' + _node;

  if (attributes) {
    var attrs = Object.keys(attributes);

    for (var i in attrs) {
      if (attributes[attrs[i]] === null) {
        continue;
      }

      if (i != attrs.length) {
        _element += ' ';
      }

      _element += attributes[attrs[i]] ? (attrs[i] + '="' + attributes[attrs[i]].toString() + '"') : attrs[i];
    }
  }

  _element += content ? '>' + content + '</' + _node + '>' : '>';

  return _element;
}

/**
 * app.layout.renderSelect
 *
 * Renders a SELECT element
 *
 * @param <String> select_id
 * @param <Object> data
 * @param <Object> attributes
 * @return <String>
 */
app.layout.renderSelect = function(select_id, data, selected, attributes) {
  if (! select_id || typeof data !== 'object') {
    return app.error('app.layout.renderSelectOptions', [select_id, data, selected, attributes]);
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
    return app.error('app.layout.renderSelectOption', [value, name, selected]);
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
    return app.error('app.layout.renderSelectOptionGroup', [label, options]);
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
 *   [ { "optgroup_label": [ { "option_name": "option_value" }, ... ] } ]
 *   [ { "option_name": "option_value" }, ... ]
 *   [ "option_value", ... ]
 *
 * @param <String> select_id
 * @param <Object> data
 * @return <String>
 */
app.layout.renderSelectOptions = function(select_id, data, selected) {
  if (! select_id || typeof data !== 'object') {
    return app.error('app.layout.renderSelectOptions', [select_id, data, selected]);
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
 * app.layout.dropdown
 *
 * Helper for dropdown, returns requested prototype method
 *
 * available prototype methods:
 *  - open (e)
 *  - close (e)
 *  - toggle (e)
 *
 * @param <String> event
 * @param <ElementNode> toggler
 * @param <ElementNode> dropdown
 * @param <Function> callback (e, dropdown)
 * @return <Function>
 */
app.layout.dropdown = function(event, toggler, dropdown, callback) {
  if (event === undefined || ! toggler || ! dropdown) {
    return app.error('app.view.dropdown', [event, toggler, dropdown, callback]);
  }

  var self = app.layout.dropdown.prototype;

  self.dropdown = dropdown;
  self.toggler = toggler;
  self.callback = typeof callback === 'function' ? callback : null;

  if (! self.dropdown._dropdown) {
    self.dropdown._dropdown = { toggler: toggler };
  }

  if (event) {
    return app.utils.proxy(false, self[event], self.dropdown, self.callback);
  } else {
    return app.utils.proxy(true, self, self.dropdown, self.callback);
  }
}

/**
 * app.layout.dropdown.prototype.open
 *
 * @param <Event> e
 * @param <ElementNode> dropdown
 * @param <Function> callback
 * @return
 */
app.layout.dropdown.prototype.open = function(e, dropdown, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.dropdown.prototype.open', '\t', (e && e.target), '\t', e);
  }

  (!! e && e.preventDefault) && e.preventDefault();

  if (dropdown.getAttribute('aria-expanded') === 'true') {
    return;
  }
  if (e && e.target && (e.target === dropdown.toggler || e.target.offsetParent === dropdown.toggler)) {
    return;
  }

  dropdown._dropdown.toggler.parentNode.classList.add('open');
  dropdown._dropdown.toggler.setAttribute('aria-expanded', 'true');

  dropdown.classList.add('open');
  dropdown.setAttribute('aria-expanded', 'true');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, dropdown ]);
  }

  if (e && ! e.preventDefault) { return false; }
}

/**
 * app.layout.dropdown.prototype.close
 *
 * @param <Event> e
 * @param <ElementNode> dropdown
 * @param <Function> callback
 * @return
 */
app.layout.dropdown.prototype.close = function(e, dropdown, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.dropdown.prototype.close', '\t', (e && e.target), '\t', e);
  }

  (!! e && e.preventDefault) && e.preventDefault();

  if (dropdown.getAttribute('aria-expanded') === 'false') {
    return;
  }
  if (e && e.target && (e.target === dropdown._dropdown.toggler || e.target.offsetParent === dropdown._dropdown.toggler)) {
    return;
  }

  dropdown._dropdown.toggler.parentNode.classList.remove('open');
  dropdown._dropdown.toggler.setAttribute('aria-expanded', 'false');

  dropdown.classList.remove('open');
  dropdown.setAttribute('aria-expanded', 'false');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, dropdown ]);
  }

  if (e && ! e.preventDefault) { return false; }
}

/**
 * app.layout.dropdown.prototype.toggle
 *
 * @param <Event> e
 * @param <ElementNode> dropdown
 * @param <Function> callback
 * @return
 */
app.layout.dropdown.prototype.toggle = function(e, dropdown, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.dropdown.prototype.toggle', '\t', (e && e.target), '\t', e);
  }

  (!! e && e.preventDefault) && e.preventDefault();

  if (e && e.target && (e.target === dropdown._dropdown.toggler || e.target.offsetParent === dropdown._dropdown.toggler)) {
    return;
  }

  if (dropdown._dropdown.toggler.getAttribute('aria-expanded') === 'false') {
    app.layout.dropdown.prototype.open.call(null, dropdown);
  } else {
    app.layout.dropdown.prototype.close.call(null, dropdown);
  }

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, dropdown ]);
  }

  if (e && ! e.preventDefault) { return false; }
}


/**
 * app.layout.collapse
 *
 * Helper for collapsible, returns requested prototype method
 *
 * available prototype methods:
 *  - open (e)
 *  - close (e)
 *  - toggle (e)
 *
 * @param <String> event
 * @param <ElementNode> element
 * @param <ElementNode> collapsible
 * @param <Function> callback  (e, collapsible)
 * @return <Function>
 */
app.layout.collapse = function(event, toggler, collapsible, callback) {
  if (event === undefined || ! toggler || ! collapsible) {
    return app.error('app.layout.collapse', [event, toggler, collapsible, callback]);
  }

  var self = app.layout.collapse.prototype;

  self.collapsible = collapsible;
  self.toggler = toggler;
  self.callback = typeof callback === 'function' ? callback : null;

  if (! self.collapsible._collapsible) {
    self.collapsible._collapsible = { toggler: toggler };
  }

  if (event) {
    return app.utils.proxy(false, self[event], self.collapsible, self.callback);
  } else {
    return app.utils.proxy(true, self, self.collapsible, self.callback);
  }
}

/**
 * app.layout.collapse.prototype.open
 *
 * @param <Event> e
 * @param <ElementNode> collapsible
 * @param <Function> callback
 */
app.layout.collapse.prototype.open = function(e, collapsible, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.open', '\t', (e && e.target), '\t', e);
  }

  (!! e && e.preventDefault) && e.preventDefault();

  if (collapsible.getAttribute('aria-expanded') === 'true') {
    return;
  }
  if (e && e.target && (e.target === collapsible._collapsible.toggler || e.target.offsetParent === collapsible._collapsible.toggler)) {
    return;
  }

  collapsible.classList.add('collapse');
  collapsible.classList.add('in');
  collapsible.setAttribute('aria-expanded', 'true');

  collapsible._collapsible.toggler.setAttribute('aria-expanded', 'true');
  collapsible._collapsible.toggler.classList.remove('collapsed');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, collapsible ]);
  }

  if (e && ! e.preventDefault) { return false; }
}

/**
 * app.layout.collapse.prototype.close
 *
 * @param <Event> e
 * @param <ElementNode> collapsible
 * @param <Function> callback
 */
app.layout.collapse.prototype.close = function(e, collapsible, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.close', '\t', (e && e.target), '\t', e);
  }

  (!! e && e.preventDefault) && e.preventDefault();

  if (collapsible.getAttribute('aria-expanded') === 'false') {
    return;
  }
  if (e && e.target && (e.target === collapsible._collapsible.toggler || e.target.offsetParent === collapsible._collapsible.toggler)) {
    return;
  }

  collapsible.classList.remove('collapse');
  collapsible.classList.remove('in');
  collapsible.setAttribute('aria-expanded', 'false');

  collapsible._collapsible.toggler.setAttribute('aria-expanded', 'false');
  collapsible._collapsible.toggler.classList.add('collapsed');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, collapsible ]);
  }

  if (e && ! e.preventDefault) { return false; }
}

/**
 * app.layout.collapse.prototype.toggle
 *
 * @param <Event> e
 * @param <ElementNode> collapsible
 * @param <Function> callback
 */
app.layout.collapse.prototype.toggle = function(e, collapsible, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.toggle', '\t', (e && e.target), '\t', e);
  }

  (!! e && e.preventDefault) && e.preventDefault();

  if (collapsible.getAttribute('aria-expanded') === 'false') {
    app.layout.collapse.prototype.open.call(null, collapsible);
  } else {
    app.layout.collapse.prototype.close.call(null, collapsible);
  }

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, collapsible ]);
  }

  if (e && ! e.preventDefault) { return false; }
}


/**
 * app.layout.draggable
 *
 * Helper for draggable, returns requested prototype method
 *
 * //TODO FIX droid
 *
 * available prototype methods:
 *  - start (e, row, callback)
 *  - over (e, row, callback)
 *  - enter (e, row, callback)
 *  - leave (e, row, callback)
 *  - end (e, row, callback)
 *  - drop (e, row, callback)
 *
 * @param <String> event
 * @param <ElementNode> row
 * @param <String> row_selector - .draggable
 * @param <Function> callback (e, row)
 * @return <Function>
 */
app.layout.draggable = function(event, row, row_selector, callback) {
  if (event === undefined || ! row) {
    return app.error('app.view.draggable', [event, row, row_selector, callback]);
  }

  var self = app.layout.draggable.prototype;

  self.row = row;
  self.row_selector = row_selector || '.draggable';
  self.callback = typeof callback === 'function' ? callback : null;

  if (! self.row._draggable) {
    self.row._draggable = { selector: row_selector, current: null, prev_index: null, next_index: null };
  }

  if (event) {
    return app.utils.proxy(false, self[event], self.row, self.callback);
  } else {
    return app.utils.proxy(true, self, self.row, self.callback);
  }
}

/**
 * app.layout.draggable.prototype.start
 *
 * @global <DragEvent> e
 * @param <ElementNode> row
 * @param <Function> callback
 * @return
 */
app.layout.draggable.prototype.start = function(e, row, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.start', '\t', e, '\t', row._draggable);
  }

  (!! e && e.stopPropagation) && e.stopPropagation();

  row._draggable.current = this;
  row._draggable.next_index = this.getAttribute('data-index');

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);

  this.classList.add('move');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, row ]);
  }

  if (e && ! e.stopPropagation) { return false; }
}

/**
 * app.layout.draggable.prototype.over
 *
 * @global <DragEvent> e
 * @param <ElementNode> row
 * @param <Function> callback
 * @return
 */
app.layout.draggable.prototype.over = function(e, row, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.over', '\t', e, '\t', row._draggable);
  }

  (!! e && e.preventDefault) && e.preventDefault();

  e.dataTransfer.dropEffect = 'move';

  if (callback && typeof callback == 'function') {
    (typeof callback == 'function') && callback.apply(this, [ e, row ]);
  }

  if (e && ! e.preventDefault) { return false; }
}

/**
 * app.layout.draggable.prototype.enter
 *
 * @global <DragEvent> e
 * @param <ElementNode> row
 * @param <Function> callback
 */
app.layout.draggable.prototype.enter = function(e, row, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.enter', '\t', e, '\t', row._draggable);
  }

  (!! e && e.preventDefault) && e.preventDefault();

  this.classList.add('over');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, row ]);
  }

  if (e && ! e.preventDefault) { return false; }
}

/**
 * app.layout.draggable.prototype.leave
 *
 * @global <DragEvent> e
 * @param <ElementNode> row
 * @param <Function> callback
 */
app.layout.draggable.prototype.leave = function(e, row, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.leave', '\t', e, '\t', row._draggable);
  }

  (!! e && e.preventDefault) && e.preventDefault();

  this.classList.remove('over');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, row ]);
  }

  if (e && ! e.preventDefault) { return false; }
}

/**
 * app.layout.draggable.prototype.end
 *
 * @global <DragEvent> e
 * @param <ElementNode> row
 * @param <Function> callback
 */
app.layout.draggable.prototype.end = function(e, row, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.end', '\t', e, '\t', row._draggable);
  }

  (!! e && e.stopPropagation) && e.stopPropagation();

  var rows = document.querySelectorAll(row._draggable.selector);

  Array.prototype.forEach.call(rows, function(_row) {
    _row.classList.remove('move');
    _row.classList.remove('over');
  });

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, row ]);
  }

  if (e && ! e.stopPropagation) { return false; }
}

/**
 * app.layout.draggable.prototype.drop
 *
 * @global <DragEvent> e
 * @param <ElementNode> row
 * @param <Function> callback
 * @return
 */
app.layout.draggable.prototype.drop = function(e, row, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.drop', '\t', e, '\t', row._draggable);
  }

  (!! e && e.stopPropagation) && e.stopPropagation();

  if (row._draggable.current != this) {
    row._draggable.prev_index = this.getAttribute('data-index');

    row._draggable.current.innerHTML = this.innerHTML;
    row._draggable.current.setAttribute('data-index', row._draggable.prev_index);

    this.setAttribute('data-index', row._draggable.next_index);
    this.innerHTML = e.dataTransfer.getData('text/html');
    this.querySelector('meta').remove();
  } else {
    row._draggable.next_index = null;
  }

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, row ]);
  }

  if (e && ! e.stopPropagation) { return false; }
}


/**
 * app.layout.localize
 *
 * Helper to localize layout
 *
 * @global <Object> appe__locale
 * @param <ElementNode> element
 * @return
 */
app.layout.localize = function(element) {
  var locale = app._root.window.appe__locale;

  if (! locale) {
    return; // silent fail
  }

  if (! element) {
    return app.error('app.layout.localize', [element]);
  }

  if (element.localized) {
    return; // silent fail
  }

  var to_translate = element.innerHTML.toString();
  var to_replace = element.getAttribute('data-localize-replacement');
  var context = element.getAttribute('data-localize');

  element.innerHTML = app.i18n(to_translate, context, to_replace);

  element.localized = true;
}


/**
 * app.utils
 *
 * Utils functions
 */
app.utils = {};


/**
 * app.utils.system
 *
 * Detects system environment
 *
 * @param <String> purpose  ( name | platform | architecture | release )
 * @return
 */
app.utils.system = function(purpose) {
  var system = { 'name': null, 'platform': null, 'architecture': null, 'release': null };


  var _ssn = function() {
    var name = app._root.process.title.toString();
    var platform = app._root.process.platform.toString();
    var architecture = parseInt(app._root.process.arch.replace(/\D+/, ''));
    var release = parseFloat(app._root.process.versions.node);

    return { 'name': name, 'platform': platform, 'architecture': architecture, 'release': release };
  }

  var _csn = function() {
    var name = navigator.userAgent.match(/(Chrome|CriOS|Safari|Firefox|Edge|IEMobile|MSIE|Trident)\/([\d]+)/i);
    var platform = navigator.userAgent.match(/(iPad|iPhone|iPod|android|windows phone)/i);
    var release = null;

    if (!! name) {
      release = name[2] || null;
      name = name[1] || name[0];
      name = name.toLowerCase();

      if (name) {
        if (name === 'crios') {
          name = 'chrome';
        }

        if (name.indexOf('ie') != -1 || name == 'trident') {
          if (name === 'trident') {
            release = navigator.userAgent.match(/rv:([\d]+)/i);

            if (release) {
              name = 'ie';
              release = release[1];
            } else {
              name = null;
              release = null;
            }
          } else {
            name = 'ie';
          }
        }

        system.name = name;

        if (release) {
          system.release = parseFloat(release);
        }
      }
    }

    if (!! platform) {
      platform = platform[0].toLowerCase();

      if (platform === 'android') {
        system.platform = 'android';
      } else if (platform === 'windows phone') {
        system.platform = 'wm';
      } else if (platform === 'ipad') {
        system.platform = 'ios';
        system.model = 'ipad';
      } else {
        system.platform = 'ios';
        system.model = 'iphone';
      }
    } else {
      platform = navigator.userAgent.match(/(Win|Mac|Linux)/i)

      if (platform) {
        platform = platform[0].substring(0, 3).toLowerCase();

        if (platform === 'win') {
          if (navigator.userAgent.indexOf('WOW64') != -1 || navigator.userAgent.indexOf('Win64') != -1) {
            system.architecture = 64;
          } else {
            system.architecture = 32;
          }
        }

        if (platform === 'lin') {
          platform = 'nxl';
        }

        system.platform = platform;
      }
    }

    return system;
  }


  // clientside
  if (app._root.window.native == undefined) {
    system = _csn();
  // serverside
  } else if (app._root.process.native == undefined && app._root.process.title === 'node') {
    system = _ssn();
  // maybe unsupported serverside
  } else {
    system = _ssn();

    return app.error('app.utils.system', 'This system is not supported.', system);
  }


  if (purpose && typeof purpose === 'string' && purpose in system) {
    return system[purpose];
  }

  return system;
}


/**
 * app.utils.addEvent
 *
 * Helper to add element event listener
 *
 * @param <String> event
 * @param <ElementNode> element
 * @param <Function> func
 * @return
 */
app.utils.addEvent = function(event, element, func) {
  if (typeof event != 'string' || ! element || typeof func != 'function') {
    return app.error('app.utils.addEvent', [event, element, func]);
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
 * @param <ElementNode> element
 * @param <Function> func
 * @return
 */
app.utils.removeEvent = function(event, element, func) {
  if (! event || ! element || typeof func != 'function') {
    return app.error('app.utils.removeEvent', [event, element, func]);
  }

  if (element.addEventListener) {
    element.removeEventListener(event, func, false); 
  } else if (element.attachEvent) {
    element.detachEvent('on' + event, func);
  }
}


/**
 * app.utils.proxy
 *
 * Proxy function with passed arguments
 *
 * @param <Boolean> deep
 * @param <Object> | <Function> obj
 * @return <Object> | <Function>
 */
app.utils.proxy = function(deep, obj) {
  var args = Object.values(arguments);

  if (deep && typeof obj === 'object') {
    args[0] = false;

    for (var method in obj) {
      if (typeof obj[method] != 'function') { continue; }

      args[1] = obj[method];

      obj[method] = app.utils.proxy.apply(null, args);
    }

    return obj;
  }

  args = args.slice(1);

  return (function(e) {
    args[0] = e;

    obj.apply(this, args);
  });
}


/**
 * app.utils.storage
 *
 * Storage utility, it stores persistent (across the session) and non-persistent data
 *
 * available prototype methods:
 *  - set (key, value)
 *  - get (key)
 *  - has (key, value)
 *  - del (key)
 *  - reset ()
 *
 * @param <String> persists
 * @param <String> method
 * @param <String> key
 * @param value
 * @return
 */
app.utils.storage = function(persists, method, key, value) {
  if (persists === undefined || method === undefined) {
    return app.error('app.utils.storage', [persists, method, key, value]);
  }

  var self = app.utils.storage.prototype;
  var _storage;

  if (! app._runtime.storage) {
    return app.stop('app.utils.storage', 'runtime');
  } else if (app._runtime.storage != true) {
    _storage = app._runtime.storage.toString();
  }

  self._prefix = 'appe.';
  self._fn = _storage || (! persists ? 'sessionStorage' : 'localStorage');
  self._persist = !! persists;

  if (self._fn in app._root.window === false) {
    return app.error('app.utils.storage', self._fn);
  }

  return self[method].apply(self, [ key, value ]);
}

/**
 * app.utils.storage.prototype.set
 *
 * @param <String> key
 * @param value
 * @return
 */
app.utils.storage.prototype.set = function(key, value) {
  if (key === undefined  || typeof key != 'string' || value === undefined) {
    return app.error('app.utils.storage.prototype.set', [key, value]);
  }

  var _key = app.utils.base64('encode', this._prefix + key);

  if (typeof value == 'object') {
    try {
      value = JSON.stringify(value);
    } catch (err) {
      return app.error('app.utils.storage.prototype.set', err);
    }
  }

  value = value.toString();

  app._root.window[this._fn].setItem(_key, value);
}

/**
 * app.utils.storage.prototype.get
 *
 * @param <String> key
 * @return value
 */
app.utils.storage.prototype.get = function(key) {
  if (key === undefined || typeof key != 'string') {
    return app.error('app.utils.storage.prototype.get', [key]);
  }

  var _key = app.utils.base64('encode', this._prefix + key);

  var value = app._root.window[this._fn].getItem(_key);

  try {
    var _value = value;
    value = JSON.parse(_value);
  } catch (err) {
    value = _value;
  }

  return value;
}

/**
 * app.utils.storage.prototype.has
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.utils.storage.prototype.has = function(key, value) {
  if (key === undefined || typeof key != 'string') {
    return app.error('app.utils.storage.prototype.has', [key, value]);
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

    return (this.constructor.call(this, this._persist, 'get', key) === value) ? true : false;
  }

  return this.constructor.call(this, this._persist, 'get', key) ? true : false;
}

/**
 * app.utils.storage.prototype.del
 *
 * @param <String> key
 * @return
 */
app.utils.storage.prototype.del = function(key) {
  if (key === undefined || typeof key != 'string') {
    return app.error('app.utils.storage.prototype.del', [key]);
  }

  var _key = app.utils.base64('encode', this._prefix + key);

  app._root.window[this._fn].removeItem(_key);
}

/**
 * app.utils.storage.prototype.reset
 */
app.utils.storage.prototype.reset = function() {
  app._root.window[this._fn].clear();
}


/**
 * app.utils.cookie
 *
 * Helper to handle cookie
 *
 * available prototype methods:
 *  - set (key, value, expire_time)
 *  - get (key)
 *  - has (key, value)
 *  - del (key)
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
    return app.error('app.utils.cookie', [method, key, value, expire_time]);
  }

  var self = app.utils.cookie.prototype;

  self._prefix = 'appe.';

  return self[method].apply(self, [ key, value, expire_time ]);
}

/**
 * app.utils.cookie.prototype.set
 *
 * @param <String> key
 * @param value
 * @param <Date> expire_time
 * @return
 */
app.utils.cookie.prototype.set = function(key, value, expire_time) {
  if (key === undefined || typeof key != 'string' || value === undefined) {
    return app.error('app.utils.cookie.prototype.set', [key, value, expire_time]);
  }

  var _time = 'Fri, 31 Dec 9999 23:59:59 GMT';

  if (expire_time && expire_time instanceof Date) {
    _time = expire_time.toUTCString(); 
  }

  var _key = app.utils.base64('encode', this._prefix + key);
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

  app._root.document.cookie = _key + '=' + value + '; expires=' + _time;
}

/**
 * app.utils.cookie.prototype.get
 *
 * @param <String> key
 * @return value
 */
app.utils.cookie.prototype.get = function(key) {
  if (key === undefined || typeof key != 'string') {
    return app.error('app.utils.cookie.prototype.get', [key]);
  }

  var _key = app.utils.base64('encode', this._prefix + key);
  _key = encodeURIComponent(_key);

  var value = null;

  if (app._root.document.cookie.indexOf(_key) != -1) {
    var _key_regex = new RegExp(_key + '\=([^\;]+)');
    var _value_match = app._root.document.cookie.match(_key_regex);

    value = _value_match.length ? _value_match[1] : null;
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

/**
 * app.utils.cookie.prototype.has
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.utils.cookie.prototype.has = function(key, value) {
  if (key === undefined || typeof key != 'string') {
    return app.error('app.utils.cookie.prototype.has', [key, value]);
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

    return (this.constructor.call(this, 'get', key) === value) ? true : false;
  }

  return this.constructor.call(this, 'get', key) ? true : false;
}

/**
 * app.utils.cookie.prototype.del
 *
 * @param <String> key
 * @return
 */
app.utils.cookie.prototype.del = function(key) {
  if (key === undefined || typeof key != 'string') {
    return app.error('app.utils.cookie.prototype.del', [key]);
  }

  var _key = app.utils.base64('encode', this._prefix + key);
  _key = encodeURIComponent(_key);

  app._root.document.cookie = _key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * app.utils.cookie.prototype.reset
 */
app.utils.cookie.prototype.reset = function() {
  app._root.document.cookie = '';
}


/**
 * app.utils.base64
 *
 * Base64 encoder and decoder
 *
 * available prototype methods:
 *  - encode (to_encode)
 *  - decode (to_decode)
 *
 * @param to_encode
 * @return
 */
app.utils.base64 = function(method, data) {
  var self = app.utils.base64.prototype;

  if ('btoa' in app._root.window == false || 'atob' in app._root.window == false) {
    return app.stop('app.utils.base64');
  }

  if (method === undefined || ! data) {
    return app.error('app.utils.base64', [method, data]);
  }

  return self[method](data);
}

/**
 * app.utils.base64.prototype.encode
 *
 * @param <String> to_encode
 * @return <String>
 */
app.utils.base64.prototype.encode = function(to_encode) {
  var _btoa = app._root.window.btoa;

  if (typeof to_encode !== 'string') {
    return app.error('app.utils.base64.prototype.encode', [to_encode]);
  }

  to_encode = encodeURIComponent(to_encode);
  to_encode = _btoa(to_encode);

  return to_encode;
}

/**
 * app.utils.base64.prototype.decode
 *
 * @param <String> to_decode
 * @return <String>
 */
app.utils.base64.prototype.decode = function(to_decode) {
  var _atob = app._root.window.atob;

  if (typeof to_decode !== 'string') {
    return app.error('app.utils.base64.prototype.decode', [to_decode]);
  }

  to_decode = _atob(to_decode);
  to_decode = decodeURIComponent(to_decode);

  return to_decode;
}


/**
 * app.utils.transform
 *
 * Transforms type of passed value
 *
 * @param <String> purpose  ( lowercase | uppercase | numeric | integer | json )
 * @param value
 * @return
 */
app.utils.transform = function(purpose, value) {
  if (! purpose) {
    return app.error('app.utils.transform', [purpose, value]);
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
 * @param <String> purpose  ( whitespace | breakline | date | datetime | datetime-local | array )
 * @param value
 * @return
 */
app.utils.sanitize = function(purpose, value) {
  if (! purpose) {
    return app.error('app.utils.sanitize', [purpose, value]);
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
 * app.utils.classify
 *
 * Transforms object to classnames
 *
 * @param <Object> | <Array> data
 * @param <String> prefix
 * @param <Boolean> to_array
 * @return classes
 */
app.utils.classify = function(data, prefix, to_array) {
  if (! (data && typeof data === 'object') || (prefix && typeof prefix != 'string')) {
    return app.error('app.utils.classify', [data, prefix, to_array]);
  }

  prefix = prefix || '';

  var classname = data instanceof Array || true;
  var classes = '';

  for (var name in data) {
    if (! data[name]) {
      continue;
    }

    classes += prefix + (classname && name + '-' || '') + data[name].toString().replace(/[^\d\D-_]/i, '-') + ' ';
  }

  classes = classes.trim();

  if (!! to_array) {
    classes = classes.split(' ');
  }

  return classes;
}


/**
 * app.utils.numberFormat
 *
 * Formats number float within decimal and thousand groups
 *
 * @param <Number> number
 * @param <Number> decimals
 * @param <String> decimals_separator
 * @param <String> thousands_separator
 * @return <String>
 */
app.utils.numberFormat = function(number, decimals, decimals_separator, thousands_separator) {
  if (typeof number != 'number') {
    return app.error('app.utils.numberFormat', [number, decimals, decimals_separator, thousands_separator]);
  }

  decimals = decimals != undefined ? parseInt(decimals) : 0;
  decimals_separator = !! decimals_separator ? decimals_separator.toString() : '.';
  thousands_separator = !! thousands_separator ? thousands_separator.toString() : '';

  var _number = parseFloat(number);

  _number = _number.toFixed(decimals).replace('.', decimals_separator)
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousands_separator);

  return _number;
}


/**
 * app.utils.dateFormat
 *
 * Formats date, supported format specifiers are like used in strftime() C library function, 
 * it accepts Date time format or boolean true for 'now', default: "Y-m-d H:M"
 *
 * format specifiers:
 *  - d  // Day of the month, digits preceded by zero (01-31)
 *  - J  // Day of the month (1-31)
 *  - w  // Day of the week (1 Mon - 7 Sun)
 *  - m  // Month, digits preceded by zero (01-12)
 *  - n  // Month (1-12)
 *  - N  // Month, start from zero (0-11)
 *  - Y  // Year, four digits (1970)
 *  - y  // Year, two digits (70)
 *  - H  // Hours, digits preceded by zero (00-23)
 *  - G  // Hours (0-23)
 *  - M  // Minutes, digits preceded by zero (00-59)
 *  - I  // Minutes (0-59)
 *  - S  // Seconds, digits preceded by zero (00-59)
 *  - K  // Seconds (0-59)
 *  - v  // Milliseconds, three digits
 *  - a  // Abbreviated day of the week name (Thu)
 *  - b  // Abbreviated month name (Jan)
 *  - x  // Date representation (1970/01/01)
 *  - X  // Time representation (01:00:00)
 *  - s  // Seconds since the Unix Epoch
 *  - V  // Milliseconds since the Unix Epoch
 *  - O  // Difference to Greenwich time GMT in hours (+0100)
 *  - z  // Time zone offset (+0100 (CEST))
 *  - C  // Date and time representation (Thu, 01 Jan 1970 00:00:00 GMT)
 *  - Q  // ISO 8601 date representation (1970-01-01T00:00:00.000Z)
 *
 * @param <Date> | <Boolean> time
 * @return formatted_date
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
 * app.utils.isPlainObject
 *
 * Checks if object is a plain object
 *
 *  (jQuery.fn.isPlainObject)
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
 * Deep extend and merge objects
 *
 *  (jQuery.fn.extend)
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



Object.freeze(app);
