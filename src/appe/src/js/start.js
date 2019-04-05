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
 * @global <Object> pako
 * @global <Object> CryptoJS
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

  //TODO implement binary = no session resume
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
      //source = app.utils.base64('decode', source);
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
 * @global <Object> pako
 * @global <Object> CryptoJS
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
 * Display messages with info and alternatives to help to execute app 
 *
 * //TODO hook
 * //TODO translate
 * //TODO test hta
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
    'This application cannot be run due to restrictions into the software {browser}.',
    'GO TO FOLDER "{alt_exec_folder}" AND OPEN "{alt_exec_platform}".'
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
 * //TODO hook?
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
      app.stop('app.start.load');

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


  var loaded = true;

  // try to load extensions
  var routine = (config.auxs && typeof config.auxs === 'object') ? config.auxs : {};

  if (routine.length) {
    for (var i = 0; i < routine.length; i++) {
      app.start.loadAttempt(function(aux_loaded) {
        if (! aux_loaded) {
          loaded = false;
        }
      }, routine[i].fn, routine[i].file, routine[i].schema, routine[i].memoize);
    }
  }

  if (loaded) {
    app.start.loadComplete(session_resume);
  } else {
    return app.error('app.start.alternative', 'auxs');
  }
}
