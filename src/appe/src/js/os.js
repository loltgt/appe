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
 * @global <Object> FileReader
 * @param <Function> callback
 * @return
 */
app.os.fileOpen = function(callback) {
  var config = window.appe__config;

  if (! config) {
    return app.stop('app.os.fileOpen');
  }

  if (config.file && typeof config.file !== 'object') {
    return app.error('app.os.fileOpen', 'config');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    return app.error('app.os.fileOpen', 'pako');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    return app.error('app.os.fileSave', 'CryptoJS');
  }

  if (! FileReader) {
    return app.error('app.os.fileOpen', 'FileReader');
  }

  if (! (callback && typeof callback === 'function')) {
    return app.error('app.os.fileOpen', arguments);
  }

  if (! this.files.length) {
    return; // silent fail
  }

  var _app_name = app._runtime.name.toString();

  var file = this.files[0];

  if (file.type.indexOf('javascript') === -1) {
    return app.error('app.os.fileOpen', 'The file format is not correct.', arguments);
  }

  var schema = config.schema;

  var file_binary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.compression;
  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_crypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;


  var _secret = null;

  if (file_crypt) {
    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in document) {
      _secret = document[app._runtime.secret];
    } else {
      return app.error('app.os.fileOpen', 'runtime');
    }
  }


  var reader = new FileReader();

  reader.onload = (function() {
    var source = this.result;

    // try to restore file source
    try {
      source = source.replace(new RegExp(file_heads + '\=(?![^"]+)'), '')
        .replace(/(^"|"$)/g, '');

      if (file_binary) {
        source = source.replace(/\"/g, '"'); //TODO test
        //source = app.utils.base64('decode', source);
        source = pako.inflate(source, { level: 9, to: 'string' });

        if (! source) {
          throw 'binary';
        }
      }

      //source = source.replace(/[\r\n]([\s]+){2}/g, '');

      if (file_crypt && !! _secret) {
        source = CryptoJS.AES.decrypt(source, _secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
        source = source.toString(CryptoJS.enc.Utf8);

        if (! source) {
          throw 'crypt';
        }
      }

      source = JSON.parse(source);
    } catch (err) {
      return app.error('app.os.fileOpen', err);
    }

    // check file source before store
    app.checkFile(source);

    for (var i = 0; i < schema.length; i++) {
      if (schema[i] in source === false) {
        return app.error('app.os.fileOpen', 'schema[i]');
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

  if (config.file && typeof config.file !== 'object') {
    return app.error('app.os.fileSave', 'config');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    return app.error('app.os.fileSave', 'pako');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    return app.error('app.os.fileSave', 'CryptoJS');
  }

  if (! (callback && typeof callback === 'function') || ! (timestamp && timestamp instanceof Date)) {
    return app.error('app.os.fileSave', arguments);
  }

  if (! (source && typeof source === 'object')) {
    return callback(false);
  }

  var _app_name = app._runtime.name.toString();

  var file_binary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.compression;
  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_crypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;


  var _binary = null;

  if (file_binary) {
    _binary = true;
  }

  var _secret = null;

  if (file_crypt) {
    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in document) {
      _secret = document[app._runtime.secret];
    } else {
      return app.error('app.session', 'runtime');
    }
  }


  var wrapped = !! ((file_crypt && _secret) || (file_binary && _binary));

  // prepare file source
  try {
    source = JSON.stringify(source);
    source = source.replace(/\"/g, '"');

    if (file_crypt && !! _secret) {
      source = CryptoJS.AES.encrypt(source, _secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
      source = source.toString();

      if (! source) {
        throw 'crypt';
      }
    }
    if (file_binary) {
      source = pako.deflate(source, { level: 9, to: 'string' });
      //source = app.utils.base64('encode', source);
      source = source.replace(/"/g, '\"'); //TODO test

      if (! source) {
        throw 'binary';
      }
    }

    if (wrapped) {
      source = '"' + source + '"';
    }

    source = file_heads + '=' + source;
  } catch (err) {
    return app.error('app.os.fileSave', err);
  }


  var file_saves = app.memory.has('file_saves') ? parseInt(app.memory.get('file_saves')) : 0;

  file_saves++;

  var filename_prefix = config.file && config.file.filename_prefix ? config.file.filename_prefix.toString() : _app_name + '_save';
  var filename_separator = config.file && config.file.filename_separator ? config.file.filename_separator.toString() : '_';
  var filename_date_format = config.file && config.file.filename_date_format ? config.file.filename_date_format.toString() : 'Y-m-d_H-M-S';

  var filename = filename_prefix;
  var filename_date = app.utils.dateFormat(timestamp, filename_date_format);

  filename += filename_separator + filename_date;
  filename += filename_separator + file_saves;


  var file = new File(
    [ source ],
    filename + '.js', //TODO custom file type
    { type: 'application/x-javascript;charset=utf-8' } //TODO custom mime type
  );

  try {
    saveAs(file);

    app.memory.set('file_saves', file_saves);

    callback(filename);
  } catch (err) {
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
  if (typeof callback !== 'function' || typeof file !== 'string' || (fn && typeof fn !== 'string')) {
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


  filename = filename ? app.utils.base64('decode', filename) + '.js' : null;

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
