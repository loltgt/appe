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

  var _data = data;

  if (! (data && typeof data === 'object')) {
    _data = this.data;
  }

  order = (order && order instanceof Array) ? order : Object.keys(_data);

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
  if ('renderRow' in control && typeof control.renderRow === 'function') {
    Array.prototype.forEach.call(order, function(id) {
      var row = control.renderRow(trow_tpl, id, _data[id], args);

      rows += row.outerHTML;
    });

    tbody.innerHTML = rows;

    this._is_localized && this.localize(table);
  }

  return { rows: rows, tpl: trow_tpl, data: _data, args: args };
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

  var _data = data;

  if (! (data && typeof data === 'object')) {
    _data = this.data;
  }

  var args = Object.values(arguments).slice(2);

  /**
   * control.fillForm hook
   *
   * @param <Object> _data
   * @param <Object> _args
   */
  if ('fillForm' in control && typeof control.fillForm === 'function') {
    control.fillForm(_data, args);

    this._is_localized && this.localize(form);
  }

  return { data: _data, args: args };
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
 * @return
 */
app.view.sub.prototype.clipboard = function(element, table) {
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

  var dropdown = element.parentNode.parentNode.parentNode;
  var dropdown_btn = dropdown.querySelector('.dropdown-toggle');
  dropdown_btn.classList.add('btn-gray-lighter');

  var rem = setTimeout(function() {
    dropdown_btn.classList.remove('btn-gray-lighter');

    clearTimeout(rem);
  }, 1000);
}

/**
 * app.view.sub.prototype.toggler
 *
 * @param <ElementNode> element
 * @param <ElementNode> dropdown
 * @return
 */
app.view.sub.prototype.toggler = function(element, dropdown) {
  if ('jQuery' in app._root.window && 'dropdown' in jQuery.fn) {
    return;
  }

  if (! element) {
    return app.error('app.view.sub.prototype.clipboard', [element]);
  }

  dropdown = dropdown || element.parentNode.parentNode.parentNode;

  if (! element.getAttribute('data-is-visible')) {
    element.setAttribute('data-is-visible', true);

    var _close_event = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';

    app.utils.addEvent(_close_event, app._root.document.documentElement, app.layout.dropdown('close', element, dropdown));
  }

  app.layout.dropdown('toggle', element, dropdown)();
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
  if ('handle' in control && typeof control.handle === 'function') {
    control.handle(app.data());
  }

  app.utils.addEvent('resize', app._root.window, app.view.resize);
  app.utils.addEvent('orientationchange', app._root.window, app.view.resize);
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
      console.info('app.view.send', ctl);
    }

    ctl = JSON.stringify(ctl);

    // sends control submission to parent "main"
    app._root.window.parent.postMessage(ctl, '*');
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
 * Helper to copy to the system clipboard
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

  if (! config) {
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

  var _session = function() {
    app.resume(config, false);


    var routine = (config.aux && typeof config.aux === 'object') ? config.aux : [];
    routine.push({ fn: app._runtime.name, schema: config.schema });

    app.controller.retrieve(app.view.handle, routine);


    if (app._root.document.native == undefined) {
      _layout();
    }
  }


  app.session(_session, config, false);
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
  var control = app._root.server.appe__control;

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
