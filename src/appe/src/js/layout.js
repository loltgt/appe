/**
 * app.layout
 *
 * Handles layout functions
 */
app.layout = {};


/**
 * app.layout.renderElement
 *
 * Renders an Element
 *
 * @param <String> node
 * @param <String> content
 * @param <Object> attributes
 * @return <String>
 */
app.layout.renderElement = function(node, content, attributes) {
  if (typeof node !== 'string' || (content && typeof content !== 'string') || (attributes && typeof attributes !== 'object')) {
    return app.error('app.layout.renderElement', arguments);
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
 * Renders a SELECT
 *
 * @param <String> select_id
 * @param <Object> data
 * @param <Object> attributes
 * @return <String>
 */
app.layout.renderSelect = function(select_id, data, selected, attributes) {
  if (! select_id || typeof data !== 'object') {
    return app.error('app.layout.renderSelectOptions', arguments);
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
    return app.error('app.layout.renderSelectOption', arguments);
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
    return app.error('app.layout.renderSelectOptionGroup', arguments);
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
 *   [ {"optgroup_label": [ {"option_name": "option_value"}, ... ]} ]
 *   [ {"option_name": "option_value"}, ... ]
 *   [ "option_value", ... ]
 *
 * @param <String> select_id
 * @param <Object> data
 * @return <String>
 */
app.layout.renderSelectOptions = function(select_id, data, selected) {
  if (! select_id || typeof data !== 'object') {
    return app.error('app.layout.renderSelectOptions', arguments);
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
 * app.layout.draggable
 *
 * Helper for draggable table, returns requested object method
 *
 * //TODO fix droid
 *
 * available methods:
 *  - start (e <Object>)
 *  - over (e <Object>)
 *  - enter (e <Object>)
 *  - leave (e <Object>)
 *  - end (e <Object>)
 *  - drop (e <Object>)
 *
 * @param <String> event
 * @param <ElementNode> table
 * @param <ElementNode> field
 * @return <Function>
 */
app.layout.draggable = function(event, table, field) {
  if (! event || ! table) {
    return app.error('app.view.draggable', arguments);
  }

  var self = app.layout.draggable.prototype;

  if (! table._draggable) {
    table._draggable = { current: null, prev_index: null, next_index: null };
  }


  var _proxy = (function(e) {
    return self[event].apply(this, [ table, e, field ]);
  });

  return _proxy;
}

app.layout.draggable.prototype.start = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.start', e, table._draggable);
  }

  table._draggable.current = this;
  table._draggable.next_index = this.getAttribute('data-index');

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);

  this.classList.add('move');
}

app.layout.draggable.prototype.over = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.over', e, table._draggable);
  }

  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = 'move';

  return false;
}

app.layout.draggable.prototype.enter = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.enter', e, table._draggable);
  }

  this.classList.add('over');
}

app.layout.draggable.prototype.leave = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.leave', e, table._draggable);
  }

  this.classList.remove('over');
}

app.layout.draggable.prototype.end = function(table, e, field) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.end', e, table._draggable);
  }

  var tbody = table.querySelector('tbody');
  var trows = tbody.querySelectorAll('tr.draggable');

  var items = [];

  Array.prototype.forEach.call(trows, function (trow) {
    items.push(trow.getAttribute('data-index'));

    trow.classList.remove('move');
    trow.classList.remove('over');
  });

  // prepare items
  try {
    items = JSON.stringify(items);
    items = encodeURIComponent(items);

    // set items
    if (field) {
      field.setAttribute('value', items);
    }
  } catch (err) {
    return app.error('app.view.draggable.end', err);
  }
}

app.layout.draggable.prototype.drop = function(table, e) {
  if (!! app._runtime.debug) {
    console.info('app.layout.draggable.prototype.drop', e, table._draggable);
  }

  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (table._draggable.current != this) {
    table._draggable.prev_index = this.getAttribute('data-index');

    table._draggable.current.innerHTML = this.innerHTML;
    table._draggable.current.setAttribute('data-index', table._draggable.prev_index);

    this.setAttribute('data-index', table._draggable.next_index);
    this.innerHTML = e.dataTransfer.getData('text/html');
    this.querySelector('meta').remove();
  } else {
    table._draggable.next_index = null;
  }

  return false;
}


/**
 * app.layout.dropdown
 *
 * Helper for dropdown, returns requested object method
 *
 * available methods:
 *  - open (e <Object>)
 *  - close (e <Object>)
 *  - toggle (e <Object>)
 *
 * @param <String> event
 * @param <ElementNode> element
 * @param <ElementNode> dropdown
 * @return <Function>
 */
app.layout.dropdown = function(event, element, dropdown) {
  if (! event || ! element || ! dropdown) {
    return app.error('app.view.dropdown', arguments);
  }

  var self = app.layout.dropdown.prototype;

  self.event = event;
  self.element = element;
  self.dropdown = dropdown;


  return self[event].bind(self);
}

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
 * Helper for collapsible, returns requested object method
 *
 * available methods:
 *  - open (e <Object>)
 *  - close (e <Object>)
 *  - toggle (e <Object>)
 *
 * @param <String> event
 * @param <ElementNode> element
 * @param <ElementNode> collapsible
 * @return <Function>
 */
app.layout.collapse = function(event, element, collapsible) {
  if (! event || ! element || ! collapsible) {
    return app.error('app.layout.collapse', arguments);
  }

  var self = app.layout.collapse.prototype;

  self.event = event;
  self.element = element;
  self.collapsible = collapsible;


  return self[event].bind(self);
}

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
