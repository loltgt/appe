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
 *  - history (reset)
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
  this._title = (title && typeof title === 'string') ? title : '';

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
  href += (qs && typeof qs === 'string') ? '&' + qs : '';

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
 *
 * @param <Boolean> reset
 */
app.main.handle.prototype.history = function(reset) {
  var title = reset ? this.setTitle() : this.getTitle();
  var url = reset ? this.setURL() : this.getURL();

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

  // submit, history reset
  if (this.ctl.submit && this.ctl.data) {
    this.history(true);
  // no submit, need reload
  } else {
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

      // action "update" needs reload
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
    if (e && e.target && (e.target.parentNode.parentNode.parentNode && e.target.parentNode.parentNode.parentNode == menu)) {
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
