/**
 * app.os
 *
 * Handles filesystem functions
 */
app.os = {};


/**
 * app.os.fileOpen
 *
 * Opens a file through FileReader api, stores it, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> pako
 * @global <Object> CryptoJS
 * @param <Function> callback
 * @return
 */
app.os.fileOpen = function(callback) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.os.fileOpen');
  }

  var step = true;

  if (config.file && typeof config.file != 'object') {
    step = app.error('app.os.fileOpen', 'config');
  }

  if (! FileReader) {
    step = app.error('app.os.fileOpen', 'FileReader');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    step = app.error('app.os.fileOpen', 'pako');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    step = app.error('app.os.fileSave', 'CryptoJS');
  }

  if (! (callback && typeof callback === 'function')) {
    step = app.error('app.os.fileOpen', arguments);
  }

  if (! step || ! this.files.length) {
    return callback(false); // silent fail
  }

  var _app_name = app._runtime.name.toString();

  var file = this.files[0];


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_extension = 'js';
  var file_mime = 'application/x-javascript';

  if (_binary) {
    file_extension = 'appe';
    file_mime = '';
  }

  if (!! app._runtime.debug) {
    console.info('app.os.fileOpen', 'file', file, config.file);
  }

  //:WORKAROUND temp ios
  if (app._runtime.system.platform != 'ios') {
    if (file.name.indexOf(file_extension) === -1) {
      app.error('app.os.fileOpen', 'This file format cannot be open.', 'mime');

      return callback(false);
    }
  }

  var schema = config.schema;


  var _binary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.binary;
  var _compress = config.file && config.file.compress ? !! config.file.compress : !! app._runtime.compression;
  var _crypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;

  if (_binary && ! (_compress || _crypt)) {
    app.error('app.os.fileOpen', 'binary');

    return callback(false);
  }


  var _secret = null;

  if (_crypt) {
    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in document) {
      _secret = document[app._runtime.secret];
    } else {
      app.error('app.os.fileOpen', 'runtime');

      return callback(false);
    }
  }


  var reader = new FileReader();

  reader.onload = (function() {
    var source = this.result;

    // try to restore file source
    try {
      // source JavaScript JSON file
      if (! _binary) {
        // base is much human readable
        if (source.indexOf('\r\n') != -1)  {
          source = source.replace(/[\r\n]([\s]+){2}/g, '');
        }

        source = source.replace(new RegExp(file_heads + '\=(?![^"\{\}]+)'), '')
          .replace(/(^"|"$)/g, '');
      }

      // source compression
      if (_compress) {
        source = pako.inflate(source, { level: 9, to: 'string' });

        if (! source) {
          throw 'compression';
        }
      }
      
      // source encrypted
      if (_crypt && !! _secret) {
        source = CryptoJS.AES.decrypt(source, _secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });

        if (! _binary) {
          source = source.toString(CryptoJS.enc.Utf8);
        }

        if (! source) {
          throw 'encryption';
        }
      }

      source = JSON.parse(source);
    } catch (err) {
      app.error('app.os.fileOpen', err);

      return callback(false);
    }

    // check file source before store
    if (! app.checkFile(source)) {
      return callback(false);
    }

    for (var i in schema) {
      if (schema[i] in source === false) {
        app.error('app.os.fileOpen', 'schema');

        return callback(false);
      }

      app.store.set(_app_name + '_' + schema[i], source[schema[i]]);
    }

    callback(file.name);
  });

  reader.onerror = (function(err) {
    app.error('app.os.fileOpen', err);

    callback(false);
  });

  reader.readAsText(file);
}


/**
 * app.os.fileSave
 *
 * Sends a file to the browser, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> pako
 * @global <Object> CryptoJS
 * @param <Function> callback
 * @param <Object> source
 * @param <Date> timestamp
 * @return
 */
app.os.fileSave = function(callback, source, timestamp) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.os.fileSave');
  }

  var step = true;

  if (config.file && typeof config.file != 'object') {
    step = app.error('app.os.fileSave', 'config');
  }

  if (! Blob || ! saveAs) {
    step = app.error('app.os.fileSave', 'FileSaver');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    step = app.error('app.os.fileSave', 'pako');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    step = app.error('app.os.fileSave', 'CryptoJS');
  }

  if (! (callback && typeof callback === 'function') || ! (timestamp && timestamp instanceof Date)) {
    step = app.error('app.os.fileSave', arguments);
  }

  if (! step || ! (source && typeof source === 'object')) {
    return callback(false);
  }

  var _app_name = app._runtime.name.toString();


  var _binary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.binary;
  var _compress = config.file && config.file.compress ? !! config.file.compress : !! app._runtime.compression;
  var _crypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;

  if (_binary && ! (_compress || _crypt)) {
    app.error('app.os.fileSave', 'binary');

    return callback(false);
  }


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_extension = 'js';
  var file_mime = 'application/x-javascript';
  var file_type = '';

  if (_binary) {
    file_extension = 'appe';
    file_mime = '';
  }

  file_extension = config.file && config.file.extension ? '.' + config.file.extension.toString() : file_extension;
  file_mime = config.file && config.file.mime_type ? config.file.mime_type.toString() : file_mime;
  file_type = file_mime;


  var _secret = null;

  if (_crypt) {
    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in document) {
      _secret = document[app._runtime.secret];
    } else {
      app.error('app.session', 'runtime');

      return callback(false);
    }
  }


  // prepare file source
  try {
    source = JSON.stringify(source);

    // source to encrypted blob
    if (_crypt && !! _secret) {
      source = CryptoJS.AES.encrypt(source, _secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });

      if (! _binary) {
        source = source.toString();
      }

      if (! source) {
        throw 'encryption';
      }
    }

    // source compression
    if (_compress) {
      source = pako.deflate(source, { level: 9, to: 'string' });

      if (! source) {
        throw 'compression';
      }
    }

    // source to JavaScript JSON file format
    if (! _binary) {
      file_type += ';charset=utf-8';

      // should wrap source in double quotes
      if (!! _crypt && _secret) {
        source = '"' + source + '"';
      }

      source = _heads + '=' + source;
    }
  } catch (err) {
    app.error('app.os.fileSave', err);

    return callback(false);
  }


  var file_saves = app.memory.has('file_saves') ? parseInt(app.memory.get('file_saves')) : 0;

  file_saves++;

  var file_name_prefix = config.file && config.file.filename_prefix ? config.file.filename_prefix.toString() : _app_name + '_save';
  var file_name_separator = config.file && config.file.filename_separator ? config.file.filename_separator.toString() : '_';
  var file_name_date_format = config.file && config.file.filename_date_format ? config.file.filename_date_format.toString() : 'Y-m-d_H-M-S';

  var file_name = file_name_prefix;
  var file_name_date = app.utils.dateFormat(timestamp, file_name_date_format);

  file_name += file_name_separator + file_name_date;
  file_name += file_name_separator + file_saves;


  try {
    var blob = new Blob(
      [ source ],
      { type: file_type }
    );

    if (!! app._runtime.debug) {
      console.info('app.os.fileSave', 'file', { name: file_name + file_extension, type: file_type }, config.file);
    }

    saveAs(blob, file_name + file_extension);

    app.memory.set('file_saves', file_saves);

    callback(file_name);
  } catch (err) {
    app.error('app.os.fileSave', err);

    callback(false);
  }
}


/**
 * app.os.scriptOpen
 *
 * Tries to open a script and load asyncronously, returns to callback
 *
 * @param <Function> callback
 * @param <String> file
 * @param <String> fn
 * @param <Number> max_attempts
 */
app.os.scriptOpen = function(callback, file, fn, max_attempts) {
  if (typeof callback != 'function' || typeof file != 'string' || (fn && typeof fn != 'string')) {
    return app.error('app.os.scriptOpen', arguments);
  }

  fn = fn.toString();


  var _load = function(file) {
    var script = document.createElement('script');
    script.src = file;
    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
  }

  var _check = function(callback, fn) {
    var max = parseInt(max_attempts) || 5;
    var attempts = 0;

    var interr = setInterval(function() {
      attempts++;

      if (!! window[fn] || max === attempts) {
        clearInterval(interr);

        callback();        
      }
    }, 1000);
  }

  _load(file);

  if (fn in window === false) {
    _check(callback, fn);
  } else {
    callback();
  }
}


/**
 * app.os.generateFileHead
 *
 * Generates a file header with file ?
 *
 * @global <Object> appe__config
 * @param <Object> source
 * @param <Date> timestamp
 * @return <Object>
 */
app.os.generateFileHead = function(source, timestamp) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.os.generateFileHead');
  }

  if (! (source && typeof source === 'object') && ! (timestamp && timestamp instanceof Date)) {
    return app.error('app.os.generateFileHead', arguments);
  }

  var checksum = ''; //TODO
  var timestamp = app.utils.dateFormat(timestamp, 'Q');

  return {
    'checksum': checksum,
    'date': timestamp,
    'version': app._runtime.version.toString(),
    'release': app._runtime.release.toString()
  };
}


/**
 * app.os.getLastFileName
 *
 * Gets the last opened file name
 *
 * @global <Object> appe__config
 * @return <String>
 */
app.os.getLastFileName = function() {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.os.getLastFileName');
  }

  var filename = '';

  if (app.utils.cookie('has', 'last_opened_file')) {
    filename = app.utils.cookie('get', 'last_opened_file');
  }
  if (! filename) {
    filename = app.memory.get('last_opened_file');
  }
  if (! filename) {
    return false;
  }


  filename = filename ? app.utils.base64('decode', filename) : null;

  return filename;
}


/**
 * app.os.getLastFileVersion
 *
 * Gets the last opened file version
 *
 * @global <Object> appe__store
 * @return <String>
 */
app.os.getLastFileVersion = function() {
  var store = window.appe__store;

  if (! store) {
    return app.stop('app.os.getLastFileVersion', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var data_file = store[_app_name]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileVersion', 'data_file');
  }

  var file_version = null;

  if (data_file.version) {
    file_version = data_file.version;
  }

  return file_version;
}


/**
 * app.os.getLastFileChecksum
 *
 * Gets the last opened file checksum
 *
 * @global <Object> appe__store
 * @return <String>
 */
app.os.getLastFileChecksum = function() {
  var store = window.appe__store;

  if (! store) {
    return app.stop('app.os.getLastFileChecksum', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var data_file = store[_app_name]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileChecksum', 'data_file');
  }

  var file_checksum = null;

  if (data_file.checksum) {
    file_checksum = data_file.checksum;
  }

  return file_checksum;
}


/**
 * app.os.getLastFileHead
 *
 * Gets the last opened file header
 *
 * @return <Object>
 */
app.os.getLastFileHead = function() {
  return {
    'name': app.os.getLastFileName(),
    'version': app.os.getLastFileVersion(),
    'checksum': app.os.getLastFileChecksum()
  };
}
