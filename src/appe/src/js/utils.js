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

        system.navigator = name;

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
 * Storage utility, it stores persistent and non-persistent data
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

  if (! app._runtime.storage) {
    return app.stop('app.utils.storage', 'runtime');
  }

  var self = app.utils.storage.prototype;

  var _storage = app._runtime.storage.toString();

  self._prefix = 'appe.';
  self._fn = persists ? _storage : 'sessionStorage';
  self._persist = persists;

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
 * @global <Function> btoa
 * @global <Function> atob
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
