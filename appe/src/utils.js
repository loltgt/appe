/**
 * app.utils
 *
 * Utils functions
 */
app.utils = {};


/**
 * app.utils.isPlainObject
 *
 * Checks if object is a plain object
 *
 *  ($.jQuery.fn.isPlainObject)
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
 * Extend and merge objects
 *
 *  ($.jQuery.fn.extend)
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

  // Extend jQuery itself if only one argument is passed
  if ( i === length ) {
    target = this;
    i--;
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


/**
 * app.utils.system
 *
 * Detects browser and system environments
 *
 * @return <Object> system
 */
app.utils.system = function() {
  var system = { 'platform': null, 'architecture': null, 'navigator': null, 'release': null };

  var _platform = window.navigator.userAgent.match(/(iPad|iPhone|iPod|android|windows phone)/i);
  var _navigator = window.navigator.userAgent.match(/(Chrome|CriOS|Safari|Firefox|Edge|IEMobile|MSIE|Trident)\/([\d]+)/i);
  var _release = null;

  if (_platform) {
    _platform = _platform[0].toLowerCase();

    if (_platform === 'android') {
      system.platform = 'android';
    } else if (_platform === 'windows phone') {
      system.platform = 'wm';
    } else if (_platform === 'ipad') {
      system.platform = 'ios';
      system.model = 'ipad';
    } else {
      system.platform = 'ios';
      system.model = 'iphone';
    }
  } else {
    _platform = window.navigator.userAgent.match(/(Win|Mac|Linux)/i)

    if (_platform) {
      _platform = _platform[0].substring(0, 3).toLowerCase();

      if (_platform === 'win') {
        if (window.navigator.userAgent.indexOf('WOW64') != -1 || window.navigator.userAgent.indexOf('Win64') != -1) {
          system.architecture = 64;
        } else {
          system.architecture = 32;
        }
      }

      if (_platform === 'lin') {
        _platform = 'nxl';
      }

      system.platform = _platform;
    }
  }

  if (_navigator) {
    _release = _navigator[2] || null;
    _navigator = _navigator[1] || _navigator[0];
    _navigator = _navigator.toLowerCase();

    if (_navigator) {
      if (_navigator === 'crios') {
        _navigator = 'chrome';
      }

      if (_navigator.indexOf('ie') != -1 || _navigator == 'trident') {
        if (_navigator === 'trident') {
          _release = window.navigator.userAgent.match(/rv:([\d]+)/i);

          if (_release) {
            _navigator = 'ie';
            _release = _release[1];
          } else {
            _navigator = null;
            _release = null;
          }
        } else {
          _navigator = 'ie';
        }
      }

      system.navigator = _navigator;

      if (_release) {
        system.release = parseFloat(_release);
      }
    }
  }

  return system;
}


/**
 * app.utils.addEvent
 *
 * Helper to add element event listener
 *
 * @param <String> event
 * @param <NodeElement> element
 * @param <Function> func
 * @return
 */
app.utils.addEvent = function(event, element, func) {
  if (typeof event !== 'string' || ! element || typeof func !== 'function') {
    return app.error('app.utils.addEvent', arguments);
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
 * @param <NodeElement> element
 * @param <Function> func
 * @return
 */
app.utils.removeEvent = function(event, element, func) {
  if (! event || ! element || typeof func !== 'function') {
    return app.error('app.utils.removeEvent', arguments);
  }

  if (element.addEventListener) {
    element.removeEventListener(event, func, false); 
  } else if (element.attachEvent) {
    element.detachEvent('on' + event, func);
  }
}


/**
 * app.utils.transform
 *
 * Transforms type of passed value
 *
 * @param <String> purpose
 * @param value
 * @return value
 */
app.utils.transform = function(purpose, value) {
  if (! purpose) {
    return app.error('app.utils.transform', arguments);
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
      } catch (err) {
        return app.error('app.utils.transform', 'JSON');
      }
    break;
  }
}


/**
 * app.utils.sanitize
 *
 * Sanitizes passed value
 *
 * @param <String> purpose
 * @param value
 * @return value
 */
app.utils.sanitize = function(purpose, value) {
  if (! purpose) {
    return app.error('app.utils.sanitize', arguments);
  }

  switch (purpose) {
    case 'whitespace': return value.replace(/\\s/g, '');
    case 'breakline': return value.replace(/\\r\\n/g, '');
    case 'date':
      try {
        return new Date(value).toISOString().split('T')[0];
      } catch (err) {
        return app.error('app.utils.sanitize', 'Date');
      }
    break;
    case 'datetime':
      try {
        return new Date(value).toISOString();
      } catch (err) {
        return app.error('app.utils.sanitize', 'Date');
      }
    break;
    case 'datetime-local':
      try {
        return new Date(value).toISOString().split('.')[0];
      } catch (err) {
        return app.error('app.utils.sanitize', 'Date');
      }
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
 * app.utils.storage
 *
 * Storage utility, it memorizes persistent and non-persistent data using localStorage and sessionStorage
 *
 * available methods:
 *  - set (key <String>, value)
 *  - get (key <String>)
 *  - has (key <String>, value)
 *  - del (key <String>)
 *  - reset ()
 *
 * @param <String> fn
 * @param <String> method
 * @param <String> key
 * @param value
 * @return
 */
app.utils.storage = function(fn, method, key, value) {
  if (fn === undefined || method === undefined) {
    return app.error('app.utils.storage', arguments);
  }

  var self = app.utils.storage.prototype;

  var _storage = app._runtime.storage.toString();

  self._prefix = 'appe.';
  self._fn = fn ? 'sessionStorage' : _storage;

  if (self._fn in window === false) {
    return app.error('app.utils.storage', self._fn);
  }

  return self[method].apply(self, [ key, value ]);
}

app.utils.storage.prototype.set = function(key, value) {
  if (key === undefined  || typeof key !== 'string' || value === undefined) {
    return app.error('app.utils.storage.prototype.set', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);

  if (typeof value == 'object') {
    try {
      value = JSON.stringify(value);
    } catch (err) {
      return app.error('app.utils.storage.prototype.set', err);
    }
  }

  value = value.toString();

  window[this._fn].setItem(_key, value);

  return true;
}

app.utils.storage.prototype.get = function(key) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.storage.prototype.get', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);

  try {
    var value = window[this._fn].getItem(_key);
  } catch (err) {
    return app.error('app.utils.storage.prototype.get', err);
  }

  try {
    var _value = value;
    value = JSON.parse(_value);
  } catch (err) {
    value = _value;
  }

  return value;
}

app.utils.storage.prototype.has = function(key, value) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.storage.prototype.has', arguments);
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

    return (this.get(key) === value) ? true : false;
  }

  return this.get(key) ? true : false;
}

app.utils.storage.prototype.del = function(key) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.storage.prototype.del', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);

  window[this._fn].removeItem(_key);

  return true;
}

app.utils.storage.prototype.reset = function() {
  window[this._fn].clear();

  return true;
}


/**
 * app.utils.cookie
 *
 * Helper to handle cookie
 *
 * available methods:
 *  - set (key <String>, value, expire_time <Date>)
 *  - get (key <String>)
 *  - has (key <String>, value)
 *  - del (key <String>)
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
    return app.error('app.utils.cookie', arguments);
  }

  var self = app.utils.cookie.prototype;

  self._prefix = 'appe.';

  return self[method].apply(self, [ key, value, expire_time ]);
}

app.utils.cookie.prototype.set = function(key, value, expire_time) {
  if (key === undefined || typeof key !== 'string' || value === undefined) {
    return app.error('app.utils.cookie.prototype.set', arguments);
  }

  var _time = 'Fri, 31 Dec 9999 23:59:59 GMT';

  if (expire_time && expire_time instanceof Date) {
    _time = expire_time.toUTCString(); 
  }

  var _key = app.utils.btoa(this._prefix + key);
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

  document.cookie = _key + '=' + value + '; expires=' + _time;

  return true;
}

app.utils.cookie.prototype.get = function(key) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.cookie.prototype.get', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);
  _key = encodeURIComponent(_key);

  var value = null;

  if (document.cookie.indexOf(_key) != -1) {
    var _key_regex = new RegExp('/(?:(?:^|.*;\s*)' + _key + '\s*\=\s*([^;]*).*$)|^.*$/');
    value = document.cookie.replace(_key_regex, '$1');
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

app.utils.cookie.prototype.has = function(key, value) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.cookie.prototype.has', arguments);
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

    return (this.get(key) === value) ? true : false;
  }

  return this.get(key) ? true : false;
}

app.utils.cookie.prototype.del = function(key) {
  if (key === undefined || typeof key !== 'string') {
    return app.error('app.utils.cookie.prototype.del', arguments);
  }

  var _key = app.utils.btoa(this._prefix + key);
  _key = encodeURIComponent(_key);

  document.cookie = _key + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  return true;
}

app.utils.cookie.prototype.reset = function() {
  document.cookie = '';

  return true;
}


/**
 * app.utils.dateFormat
 *
 * Formats date, supported format specifiers are like them used in strftime() C library function, 
 * it accepts Date time format or true for 'now'
 *
 * format specifiers:
 *  - d  <Number> Day of the month, digits preceded by zero (01-31)
 *  - J  <Number> Day of the month (1-31)
 *  - w  <Number> Day of the week (1 Mon - 7 Sun)
 *  - m  <Number> Month, digits preceded by zero (01-12)
 *  - n  <Number> Month (1-12)
 *  - N  <Number> Month, start from zero (0-11)
 *  - Y  <Number> Year, four digits (1970)
 *  - y  <Number> Year, two digits (70)
 *  - H  <Number> Hours, digits preceded by zero (00-23)
 *  - G  <Number> Hours (0-23)
 *  - M  <Number> Minutes, digits preceded by zero (00-59)
 *  - I  <Number> Minutes (0-59)
 *  - S  <Number> Seconds, digits preceded by zero (00-59)
 *  - K  <Number> Seconds (0-59)
 *  - v  <Number> Milliseconds, three digits
 *  - a  <String> Abbreviated day of the week name (Thu)
 *  - b  <String> Abbreviated month name (Jan)
 *  - x  <String> Date representation (1970/01/01)
 *  - X  <String> Time representation (01:00:00)
 *  - s  <Number> Seconds since the Unix Epoch
 *  - V  <Number> Milliseconds since the Unix Epoch
 *  - O  <String> Difference to Greenwich time GMT in hours (+0100)
 *  - z  <String> Time zone offset (+0100 (CEST))
 *  - C  <String> Date and time representation (Thu, 01 Jan 1970 00:00:00 GMT)
 *  - Q  <String> ISO 8601 date representation (1970-01-01T00:00:00.000Z)
 *
 * @param <Date> | <Boolean> time
 * @return <String> formatted_date
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
 * app.utils.btoa
 *
 * Alias to btoa (base64) browser implementation with URI encoding
 *
 * @global <Function> atob
 * @param to_encode
 * @return
 */
app.utils.btoa = function(to_encode) {
  var _btoa = window.btoa;

  if (typeof to_encode !== 'string') {
    return app.error('app.utils.btoa', arguments);
  }

  to_encode = encodeURIComponent(to_encode);
  to_encode = _btoa(to_encode);

  return to_encode;
}


/**
 * app.utils.atob
 *
 * Alias to atob (base64) browser implementation with URI encoding
 *
 * @global <Function> atob
 * @param to_decode
 * @return
 */
app.utils.atob = function(to_decode) {
  var _atob = window.atob;

  if (typeof to_decode !== 'string') {
    return app.error('app.utils.atob', arguments);
  }

  to_decode = _atob(to_decode);
  to_decode = decodeURIComponent(to_decode);

  return to_decode;
}
