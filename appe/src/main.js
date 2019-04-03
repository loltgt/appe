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
