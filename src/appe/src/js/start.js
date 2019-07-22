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
 * Displays message with info and alternatives to help to execute the app 
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

  // no resume, skip last opened file load 
  if (! session_resume) {
    return;
  // resume but could have same-origin restrictions
  } else if (session_resume === true) {
    app.start.redirect(true);
  }


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;


  app.asyncAttemptLoad(function(loaded) {
    if (loaded) {
      app.start.redirect(true);
    } else {
      app.start.progress(1);
    }
  }, true, file_heads, session_resume, schema, true);
}
