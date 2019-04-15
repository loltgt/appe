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
 * @param <ElementNode> element
 * @param <ElementNode> dropdown
 * @return <Function>
 */
app.layout.dropdown = function(event, element, dropdown) {
  if (! event || ! element || ! dropdown) {
    return app.error('app.view.dropdown', [event, element, dropdown]);
  }

  var self = app.layout.dropdown.prototype;

  self.event = event;
  self.element = element;
  self.dropdown = dropdown;


  return self[event].bind(self);
}

/**
 * app.layout.dropdown.prototype.open
 *
 * @param <Event> e
 */
app.layout.dropdown.prototype.open = function(e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.open', (e && e.target), e);
  }

  if (this.element.getAttribute('aria-expanded') === 'true') {
    return;
  }
  if (e && e.target && (e.target === this.element || e.target.offsetParent === this.element)) {
    return;
  }

  this.element.parentNode.classList.add('open');
  this.element.setAttribute('aria-expanded', true);

  this.dropdown.classList.add('open');
  this.dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', true);
}

/**
 * app.layout.dropdown.prototype.close
 *
 * @param <Event> e
 */
app.layout.dropdown.prototype.close = function(e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.open', (e && e.target), e);
  }

  if (this.element.getAttribute('aria-expanded') === 'false') {
    return;
  }
  if (e && e.target && (e.target === this.element || e.target.offsetParent === this.element)) {
    return;
  }

  this.element.parentNode.classList.remove('open');
  this.element.setAttribute('aria-expanded', false);

  this.dropdown.classList.remove('open');
  this.dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', false);
}

/**
 * app.layout.dropdown.prototype.toggle
 */
app.layout.dropdown.prototype.toggle = function() {
  if (!! app._runtime.debug) {
    console.info('app.layout.dropdown.prototype.toggle');
  }

  if (this.element.getAttribute('aria-expanded') === 'false') {
    this.open();
  } else {
    this.close();
  }
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
 * @return <Function>
 */
app.layout.collapse = function(event, element, collapsible) {
  if (! event || ! element || ! collapsible) {
    return app.error('app.layout.collapse', [event, element, collapsible]);
  }

  var self = app.layout.collapse.prototype;

  self.event = event;
  self.element = element;
  self.collapsible = collapsible;


  return self[event].bind(self);
}

/**
 * app.layout.collapse.prototype.open
 *
 * @param <Event> e
 */
app.layout.collapse.prototype.open = function(e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.open', (e && e.target), e);
  }

  if (this.element.getAttribute('aria-expanded') === 'true') {
    return;
  }
  if (e && e.target && (e.target === this.element || e.target.offsetParent === this.element)) {
    return;
  }

  this.collapsible.classList.add('collapse');
  this.collapsible.classList.add('in');
  this.collapsible.setAttribute('aria-expanded', true);

  this.element.setAttribute('aria-expanded', true);
  this.element.classList.remove('collapsed');
}

/**
 * app.layout.collapse.prototype.close
 *
 * @param <Event> e
 */
app.layout.collapse.prototype.close = function(e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.open', (e && e.target), e);
  }

  if (this.element.getAttribute('aria-expanded') === 'false') {
    return;
  }
  if (e && e.target && (e.target === this.element || e.target.offsetParent === this.element)) {
    return;
  }

  this.collapsible.classList.remove('collapse');
  this.collapsible.classList.remove('in');
  this.collapsible.setAttribute('aria-expanded', false);

  this.element.setAttribute('aria-expanded', false);
  this.element.classList.add('collapsed');
}

/**
 * app.layout.collapse.prototype.toggle
 */
app.layout.collapse.prototype.toggle = function() {
  if (!! app._runtime.debug) {
    console.info('app.layout.collapse.prototype.toggle');
  }

  if (this.element.getAttribute('aria-expanded') === 'false') {
    this.open();
  } else {
    this.close();
  }
}


/**
 * app.layout.draggable
 *
 * Helper for draggable, returns requested prototype method
 *
 * //TODO fix droid
 *
 * available prototype methods:
 *  - start (e, element, callback)
 *  - over (e, element, callback)
 *  - enter (e, element, callback)
 *  - leave (e, element, callback)
 *  - end (e, element, callback)
 *  - drop (e, element, callback)
 *
 * @param <String> event
 * @param <ElementNode> element
 * @param <String> row_selector - .draggable
 * @param <Function> callback  ( event, current, e, element )
 * @return <Function>
 */
app.layout.draggable = function(event, element, row_selector, callback) {
  if (! event || ! element) {
    return app.error('app.view.draggable', [event, element, field]);
  }

  var self = app.layout.draggable.prototype;

  row_selector = row_selector || '.draggable';
  callback = typeof callback === 'function' ? callback : null;

  if (! element._draggable) {
    element._draggable = { row: row_selector, current: null, prev_index: null, next_index: null };
  }


  var _proxy = (function(e) {
    return self[event].apply(this, [ e, element, callback ]);
  });

  return _proxy;
}

/**
 * app.layout.draggable.prototype.start
 *
 * @global <Event> e
 * @param <ElementNode> element
 * @param <Function> callback
 * @return
 */
app.layout.draggable.prototype.start = function(e, element, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.start', e, element._draggable);
  }

  if (e.stopPropagation) {
    e.stopPropagation();
  }

  element._draggable.current = this;
  element._draggable.next_index = this.getAttribute('data-index');

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);

  this.classList.add('move');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, element ]);
  }

  if (! e.stopPropagation) {
    return false;
  }
}

/**
 * app.layout.draggable.prototype.over
 *
 * @global <Event> e
 * @param <ElementNode> element
 * @param <Function> callback
 * @return
 */
app.layout.draggable.prototype.over = function(e, element, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.over', e, element._draggable);
  }

  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = 'move';

  if (callback && typeof callback == 'function') {
    (typeof callback == 'function') && callback.apply(this, [ e, element ]);
  }

  if (! e.preventDefault) {
    return false;
  }
}

/**
 * app.layout.draggable.prototype.enter
 *
 * @global <Event> e
 * @param <ElementNode> element
 * @param <Function> callback
 */
app.layout.draggable.prototype.enter = function(e, element, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.enter', e, element._draggable);
  }

  if (e.preventDefault) {
    e.preventDefault();
  }

  this.classList.add('over');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, element ]);
  }

  if (! e.preventDefault) {
    return false;
  }
}

/**
 * app.layout.draggable.prototype.leave
 *
 * @global <Event> e
 * @param <ElementNode> element
 * @param <Function> callback
 */
app.layout.draggable.prototype.leave = function(e, element, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.leave', e, element._draggable);
  }

  if (e.preventDefault) {
    e.preventDefault();
  }

  this.classList.remove('over');

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, element ]);
  }

  if (! e.preventDefault) {
    return false;
  }
}

/**
 * app.layout.draggable.prototype.end
 *
 * @global <Event> e
 * @param <ElementNode> element
 * @param <Function> callback
 */
app.layout.draggable.prototype.end = function(e, element, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.end', e, element._draggable);
  }

  if (e.preventDefault) {
    e.preventDefault();
  }

  var rows = document.querySelectorAll(element._draggable.row);

  Array.prototype.forEach.call(rows, function(el) {
    el.classList.remove('move');
    el.classList.remove('over');
  });

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, element ]);
  }

  if (! e.preventDefault) {
    return false;
  }
}

/**
 * app.layout.draggable.prototype.drop
 *
 * @global <Event> e
 * @param <ElementNode> element
 * @param <Function> callback
 * @return
 */
app.layout.draggable.prototype.drop = function(e, element, callback) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.drop', e, element._draggable);
  }

  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (element._draggable.current != this) {
    element._draggable.prev_index = this.getAttribute('data-index');

    element._draggable.current.innerHTML = this.innerHTML;
    element._draggable.current.setAttribute('data-index', element._draggable.prev_index);

    this.setAttribute('data-index', element._draggable.next_index);
    this.innerHTML = e.dataTransfer.getData('text/html');
    this.querySelector('meta').remove();
  } else {
    element._draggable.next_index = null;
  }

  if (callback) {
    (typeof callback == 'function') && callback.apply(this, [ e, element ]);
  }

  if (! e.stopPropagation) {
    return false;
  }
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
