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
 * app.start.loadComplete
 *
 * Fires on "start" load complete
 *
 * @global <Object> appe__config
 * @param <String> session_resume
 * @return
 */
app.start.loadComplete = function(session_resume) {
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

  app.start.progress(1);

  if (! session_resume) {
    return;
  }


  session_resume = config.save_path.toString() + '/' + session_resume; 


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;


  app.start.attemptLoad(function(loaded) {
    if (loaded) {
      app.start.redirect(true);
    } else {
      app.start.progress(1);
    }
  }, file_heads, session_resume, schema, true);
}


/**
 * app.start.attemptLoad
 *
 * Attemps to load files and scripts, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> CryptoJS
 * @param <Function> callback
 * @param <String> fn
 * @param <String> file
 * @param <Object> schema
 * @param <Boolean> memoize
 * @return
 */
app.start.attemptLoad = function(callback, fn, file, schema, memoize) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.start.attemptLoad');
  }

  var step = true;

  if (config.file && typeof config.file != 'object') {
    step = app.error('app.start.attemptLoad', 'config');
  }

  if (! (CryptoJS && CryptoJS.MD5)) {
    step = app.error('app.start.attemptLoad', 'CryptoJS');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    step = app.error('app.start.attemptLoad', 'CryptoJS');
  }

  if (typeof callback != 'function' || ! fn || typeof fn != 'string' || ! file || typeof file != 'string' || typeof schema != 'object') {
    step = app.stop('app.start.attemptLoad', [callback, fn, file, schema, memoize]);
  }

  if (! step) {
    return callback(false);
  }

  var _app_name = app._runtime.name.toString();

  fn = fn.toString();


  var fbinary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.binary;
  var fcompress = config.file && config.file.compress ? !! config.file.compress : !! app._runtime.compression;
  var fcrypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;


  if (fcompress) {
    app.error('app.start.attemptLoad', 'Misleading settings.', 'compression', true);

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
      app.error('app.start.attemptLoad() > _attempt', 'source');

      return callback(false);
    }

    try {
      var source = app._root.window[fn];

      if (fcrypt) {
        _decrypt(source, function(err, source) {
          if (err) { throw err; }

          if (! memoize) {
            return callback(false);
          }

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
        callback(false);
      }
    } catch (err) {
      app.error('app.start.attemptLoad() > _attempt', err);

      callback(loaded);
    }
  }


  var loaded = false;
  var max_attempts = parseInt(config.open_attempts);

  app.os.scriptOpen(_attempt, file, fn, max_attempts);
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
    app.start.progress(0);

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


  var _asyncAttemptLoadAux = function(cb) {
    var routine = (_config.aux && typeof _config.aux === 'object') ? _config.aux : [];

    if (routine.length) {
      var i = routine.length;

      while (i--) {
        app.start.attemptLoad(function(aux_loaded) {
          if (! aux_loaded) {
            return cb('aux');
          }

          if (! i) {
            return cb(false, true)
          }
        }, routine[i].fn, routine[i].file, routine[i].schema, routine[i].memoize);
      }
    } else {
      cb(false, true);
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

  var _session = function() {
    if ('secret_passphrase' in _config) {
      delete _config.secret_passphrase;
    }

    if (! exec) {
      /**
       * start.alternative hook
       */
      if (!! _config.alt && start && 'alternative' in start && typeof start.alternative === 'function') {
        start.alternative();
      } else if (!! _config.alt) {
        app.start.alternative();
      } else {
        app.blind();
      }

      return;
    }

    app.controller.setTitle(_config.app_name);

    if (app._root.document.native == undefined) {
      _layout();
    }

    // try to resume previous session and file
    var session_resume = app.resume(_config);

    // try to load extensions
    _asyncAttemptLoadAux(function(err, loaded) {
      if (err) {
        return app.stop('app.start.load', 'aux');
      }

      app.start.loadComplete(session_resume);
    })
  }


  app.session(_session, _config);
}
