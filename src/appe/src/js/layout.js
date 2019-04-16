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
 * //TODO fix droid
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
