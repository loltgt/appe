/**
 * app.os
 *
 * Handles filesystem functions
 */
app.os = {};


/**
 * app.os.fileSessionOpen
 *
 * Opens a session file through FileReader api, stores it, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> CryptoJS
 * @global <Function> pako
 * @param <Function> callback
 * @return
 */
app.os.fileSessionOpen = function(callback) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.os.fileSessionOpen');
  }

  var step = true;

  if (config.file && typeof config.file != 'object') {
    step = app.error('app.os.fileSessionOpen', 'config');
  }

  if (! FileReader) {
    step = app.error('app.os.fileSessionOpen', 'FileReader');
  }

  if (! (CryptoJS && CryptoJS.MD5)) {
    step = app.error('app.os.fileSessionOpen', 'CryptoJS');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    step = app.error('app.os.fileSessionOpen', 'CryptoJS');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    step = app.error('app.os.fileSessionOpen', 'pako');
  }

  if (! (callback && typeof callback === 'function')) {
    step = app.error('app.os.fileSessionOpen', [callback]);
  }

  if (! step || ! this.files.length) {
    return callback(false); // silent fail
  }

  var _app_name = app._runtime.name.toString();

  var schema = config.schema;

  if (typeof schema != 'object') {
    app.error('app.os.fileSessionOpen', 'schema');

    return callback(false);
  }


  var fbinary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.binary;
  var fcompress = config.file && config.file.compress ? !! config.file.compress : !! app._runtime.compression;
  var fcrypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;

  if (fbinary && ! (fcompress && fcrypt)) {
    app.error('app.os.fileSessionOpen', 'binary');

    return callback(false);
  }


  var file = this.files[0];
  var source = null;


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_extension = 'js';
  var file_mime = 'application/x-javascript';
  var file_type = null;
  var file_json_checksum = null;

  if (fbinary) {
    file_extension = 'appe';
    file_mime = 'application/octet-stream';
    file_type = file_mime;
  } else {
    file_type = file_mime + ';charset=utf-8';
  }

  file_extension = config.file && config.file.extension ? config.file.extension.toString() : file_extension;


  if (!! app._runtime.debug) {
    console.info('app.os.fileSessionOpen', 'file', file, config.file);
  }

  //:WORKAROUND temp ios
  if (app._runtime.system.platform != 'ios') {
    if (file.name.indexOf(file_extension) === -1) {
      app.error('app.os.fileSessionOpen', app.i18n('This file format cannot be open.'), 'file');

      return callback(false);
    }
  }


  var _prepare = function(source, cb) {
    if (! source) {
      return cb(false);
    }

    // source binary file

    if (fbinary) {
      return cb(false, source);
    }

    // source JavaScript JSON file

    // base is much human readable
    if (source.indexOf('\r\n') != -1)  {
      source = source.replace(/[\r\n]([\s]+){2}/g, '');
    }

    var _file_heads_regex = new RegExp(file_heads + '\=(?![^"\{\}]+)');
    source = source.replace(_file_heads_regex, '').replace(/(^"|"$)/g, '');
  }

  var _decompress = function(source, cb) {
    try {
      source = pako.inflate(source, { raw: true, to: 'string' });

      if (! source) { throw 'decompression'; }

      cb(false, source);
    } catch (err) {
      cb(err);
    }
  }

  var _decrypt = function(source, cb) {
    var secret = null;

    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in app._root.document) {
      secret = app._root.document[app._runtime.secret];
    } else {
      return cb('runtime');
    }

    try {
      source = CryptoJS.AES.decrypt(source, secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
      source = source.toString(CryptoJS.enc.Utf8);

      if (! source) { throw 'decryption'; }

      cb(false, source);
    } catch (err) {
      cb(err);
    }
  }

  var _complete = function(source, cb) {
    try {
      source = JSON.parse(source);
    } catch (err) {
      return cb(err);
    }

    // check file source before store
    if (! app.checkFile(source, file_json_checksum)) {
      return cb('check');
    }

    for (var i in schema) {
      if (schema[i] in source === false) {
        return cb('schema');
      }

      app.store.set(_app_name + '_' + schema[i], source[schema[i]]);
    }

    cb(false, file.name);
  }

  var _init = function(blob) {
    try {
      if (fcompress && fcrypt) {
        _prepare(blob, function(err, source) {
          if (err) { throw err; }

          _decompress(source, function(err, source) {
            if (err) { throw err; }

            _decrypt(source, function(err, source) {
              if (err) { throw err; }

              app.os.generateJsonChecksum(function(checksum) {
                if (! checksum) { throw null; }

                file_json_checksum = checksum;

                _complete(source, function(err, filename) {
                  if (err) { throw err; }

                  callback(filename);
                });
              }, source);
            });
          });
        });
      } else if (fcrypt) {
        _prepare(blob, function(err, source) {
          if (err) { throw err; }

          _decrypt(source, function(err, source) {
            if (err) { throw err; }

            app.os.generateJsonChecksum(function(checksum) {
              if (! checksum) { throw null; }

              file_json_checksum = checksum;

              _complete(source, function(err, filename) {
                if (err) { throw err; }

                callback(filename);
              });
            }, source);
          });
        });
      } else {
        _prepare(blob, function(err, source) {
          if (err) { throw err; }

          app.os.generateJsonChecksum(function(checksum) {
            if (! checksum) { throw null; }

            file_json_checksum = checksum;

            _complete(source, function(err, filename) {
              if (err) { throw err; }

              callback(filename);
            });
          }, source);
        });
      }
    } catch (err) {
      app.error('app.os.fileSessionOpen', err);

      return callback(false);
    }
  }


  var reader = new FileReader();

  reader.onloadend = (function() {
    _init(this.result);
  });

  reader.onerror = (function(err) {
    app.error('app.os.fileSessionOpen', err);

    callback(false);
  });

  if (fbinary) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}


/**
 * app.os.fileSessionSave
 *
 * Sends a file to the browser, returns to callback
 *
 * @global <Object> appe__config
 * @global <Object> CryptoJS
 * @global <Function> pako
 * @param <Function> callback
 * @param <Object> source
 * @param <Date> timestamp
 * @return
 */
app.os.fileSessionSave = function(callback, source, timestamp) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.os.fileSessionSave');
  }

  var step = true;

  if (config.file && typeof config.file != 'object') {
    step = app.error('app.os.fileSessionSave', 'config');
  }

  if (! Blob) {
    step = app.error('app.os.fileSessionSave', 'Blob');
  }

  if (! FileReader) {
    step = app.error('app.os.fileSessionSave', 'FileReader');
  }

  if (! (CryptoJS && CryptoJS.MD5)) {
    step = app.error('app.os.fileSessionOpen', 'CryptoJS');
  }

  if (!! app._runtime.encryption && ! (CryptoJS && CryptoJS.SHA512 && CryptoJS.AES)) {
    step = app.error('app.os.fileSessionSave', 'CryptoJS');
  }

  if (!! app._runtime.compression && ! (pako && pako.inflate && pako.deflate)) {
    step = app.error('app.os.fileSessionSave', 'pako');
  }

  if (! (callback && typeof callback === 'function') || ! (timestamp && timestamp instanceof Date)) {
    step = app.error('app.os.fileSessionSave', [callback, source, timestamp]);
  }

  if (! step || ! (source && typeof source === 'object')) {
    return callback(false);
  }

  var _app_name = app._runtime.name.toString();


  var fbinary = config.file && config.file.binary ? !! config.file.binary : !! app._runtime.binary;
  var fcompress = config.file && config.file.compress ? !! config.file.compress : !! app._runtime.compression;
  var fcrypt = config.file && config.file.crypt ? !! config.file.crypt : !! app._runtime.encryption;

  if (fbinary && ! (fcompress && fcrypt)) {
    app.error('app.os.fileSessionSave', 'binary');

    return callback(false);
  }


  var file_heads = config.file && config.file.heads ? config.file.heads.toString() : _app_name;
  var file_extension = 'js';
  var file_mime = 'application/x-javascript';
  var file_type = null;
  var file_json_checksum = null;

  if (fbinary) {
    file_extension = 'appe';
    file_mime = 'application/octet-stream';
    file_type = file_mime;
  } else {
    file_type = file_mime + ';charset=utf-8';
  }

  file_extension = config.file && config.file.extension ? config.file.extension.toString() : file_extension;


  var _prepare = function(source, cb) {
    source.file.checksum = '';

    var p = 32;

    while (p--) {
      source.file.checksum += ' ';
    }

    try {
      var source = JSON.stringify(source);

      app.os.generateJsonChecksum(function(checksum) {
        if (! checksum) { throw null; }

        file_json_checksum = checksum;

        source = source.replace(/"file":{"checksum":"[\s]{32}"/, '"file":{"checksum":"' + checksum + '"');

        cb(false, source);
      }, source);
    } catch (err) {
      cb(err);
    }
  }

  var _crypt = function(source, cb) {
    var secret = null;

    if (app._runtime.secret && typeof app._runtime.secret === 'string' && app._runtime.secret in app._root.document) {
      secret = app._root.document[app._runtime.secret];
    } else {
      return cb('runtime');
    }

    try {
      source = CryptoJS.AES.encrypt(source, secret, { mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding });
      source = source.toString();

      if (! source) { throw 'encryption'; }

      cb(false, source);
    } catch (err) {
      cb(err);
    }
  }

  var _compress = function(source, cb) {
    try {
      source = pako.deflate(source, { raw: true, level: 9 });

      if (! source) { throw 'compression'; }

      cb(false, source);
    } catch (err) {
      cb(err);
    }
  }

  var _complete = function(source, cb) {
    if (! source) {
      return cb('source');
    }

    // source to JavaScript JSON file format
    if (! fbinary) {
      // should wrap source in double quotes
      if (fcrypt) {
        source = '"' + source + '"';
      }

      source = file_heads + '=' + source;
    }

    cb(false, source);
  }

  var _save = function(source, cb) {
    var file_saves = app.memory.has('file_saves') ? parseInt(app.memory.get('file_saves')) : 0;

    file_saves++;

    var file_name_prefix = config.file && config.file.filename_prefix ? config.file.filename_prefix.toString() : _app_name + '_save';
    var file_name_separator = config.file && config.file.filename_separator ? config.file.filename_separator.toString() : '_';
    var file_name_date_format = config.file && config.file.filename_date_format ? config.file.filename_date_format.toString() : 'Y-m-d_H-M-S';

    var file_name = file_name_prefix;
    var file_name_date = app.utils.dateFormat(timestamp, file_name_date_format);

    file_name += file_name_separator + file_name_date;
    file_name += file_name_separator + file_saves;

    var _file = file_name + '.' + file_extension;

    if (!! app._runtime.debug) {
      console.info('app.os.fileSessionSave', 'file', _file, file_type, config.file);
    }

    try {
      app.memory.set('file_saves', file_saves);

      app.os.fileDownload(source, _file, file_type);

      cb(false, _file);
    } catch (err) {
      cb(err);
    }
  }

  var _init = function(source) {
    try {
      if (fcompress && fcrypt) {
        _prepare(source, function(err, source) {
          if (err) { throw err; }

          _crypt(source, function(err, source) {
            if (err) { throw err; }

            _compress(source, function(err, source) {
              if (err) { throw err; }

              _complete(source, function(err, blob) {
                if (err) { throw err; }

                _save(blob, function(err, filename) {
                  if (err) { throw err; }

                  callback(filename);
                });
              });
            });
          });
        });
      } else if (fcrypt) {
        _prepare(source, function(err, source) {
          if (err) { throw err; }

          _crypt(source, function(err, source) {
            if (err) { throw err; }

            _complete(source, function(err, blob) {
              if (err) { throw err; }

              _save(blob, function(err, filename) {
                if (err) { throw err; }

                callback(filename);
              });
            });
          });
        });
      } else {
        _prepare(source, function(err, source) {
          if (err) { throw err; }

          _complete(source, function(err, blob) {
            if (err) { throw err; }

            _save(blob, function(err, filename) {
              if (err) { throw err; }

              callback(filename);
            });
          });
        });
      }
    } catch (err) {
      app.error('app.os.fileSessionSave', err);

      callback(false);
    }
  }


  _init(source);
}



/**
 * app.os.fileDownload
 *
 * Prepares attachment data file and send to browser
 *
 * @link https://github.com/eligrey/FileSaver.js/
 *
 * @param source
 * @param <String> filename
 * @param <String> mime_type
 * @return
 */
app.os.fileDownload = function(source, filename, mime_type) {
  if (! FileReader) {
    return app.error('app.os.fileDownload', 'FileReader');
  }

  if (! Blob) {
    return app.error('app.os.fileDownload', 'Blob');
  }

  if ((typeof source != 'object' && typeof source != 'string') || typeof filename != 'string' || typeof mime_type != 'string') {
    return app.error('app.os.fileDownload', [source, filename, mime_type]);
  }


  var URL = app._root.window.URL || app._root.window.webkitURL;

  var _linkAttachment = function(data, is_object_link, force_new) {
    var open, check, triggered = false;

    var link = app._root.document.createElement('A');

    link.href = data.toString();
    link.download = filename;
    link.rel = 'noopener';
    link.target = !! force_new ? '_blank' : '_self';
    link.onclick = (function() {
      triggered = true;

      link.remove();

      if (is_object_link) {
        URL.revokeObjectURL(data);
      }

      open && clearTimeout(open);
      check && clearTimeout(check);
    });

    open = setTimeout(function() {
      var e;

      try {
        e = new MouseEvent('click');

        link.dispatchEvent(e);
      } catch (err) {
        e = document.createEvent('MouseEvents');
        e.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);

        link.dispatchEvent(e);
      }

      clearTimeout(open);
    }, 0);

    check = setTimeout(function() {
      if (! triggered) {
        link.target = '_blank';
        link.click();
      }

      clearTimeout(check);
    }, 10);
  }

  var _sendAttachment = function(data, is_object_link, as_link, force_new) {
    if (!! as_link) {
      _linkAttachment(data, is_object_link, force_new);
    } else {
      var wn = app._root.window.open('', !! force_new ? '_blank' : '_self');

      if (wn && wn.location) {
        wn.location.href = data;
        wn = null;
      } else {
        app._root.window.open(data, !! force_new ? '_blank' : '_self');
      }
    }
  }

  var _blobAttachment = function(file, as_link, force_new) {
    var reader = new FileReader();

    reader.onloadend = (function() {
      if (! reader.result) { throw 'data'; }

      var data = reader.result;

      _sendAttachment(data, false, as_link, force_new);
    });

    reader.onerror = (function(err) {
      return app.error('app.os.fileDownload() > _blob', err);
    });

    reader.readAsDataURL(file);
  }

  var _objectLinkAttachment = function(file, as_link, force_new) {
    try {
      data = URL.createObjectURL(file);

      _sendAttachment(data, true, as_link, force_new);
    } catch (err) {
      return app.error('app.os.fileDownload() > _objectURL', err);
    }
  }

  var _downloadAttachment = function(as_link, as_object_link, force_attachment, force_new) {
    var file_type = !! force_attachment ? 'attachment/file' : 'application/octet-stream';
    var file;

    try {
      file = new File([ blob ], filename, { type: file_type });
    } catch (err) {
      app.error('app.os.fileDownload() > _downloadAttachment', 'File', null, true);

      file = new Blob([ blob ], { type: file_type });
    }

    if (as_object_link) {
      _objectLinkAttachment(file, as_link, force_new);
    } else {
      _blobAttachment(file, as_link, force_new);
    }
  }


  try {
    var blob = new Blob([ source ], { type: mime_type });

    if (! blob) { throw 'blob'; }
  } catch (err) {
    return app.error('app.os.fileDownload', err);
  }


  var as_object_link = app._root.window.location.protocol != 'file:' ? true : false;

  // target browsers with download anchor attribute
  if ('download' in app._root.window.HTMLAnchorElement.prototype) {
    // default: 1 0 0 0

    _downloadAttachment(true);

    if (!! app._runtime.debug) {
      console.info('app.os.fileDownload', [1, 0, 0, 0], mime_type, filename);
    }
  // target ie
  } else if ('msSaveOrOpenBlob' in app._root.window.navigator) {
    // ie: 1 ? 0 0

    navigator.msSaveOrOpenBlob(file, filename) || _downloadAttachment(true, as_object_link, false, false);

    if (!! app._runtime.debug) {
      console.info('app.os.fileDownload', [1, as_object_link, 0, 1], mime_type, filename);
    }

  // target other browsers with open support
  } else if ('open' in app._root.window) {
    var as_link = app._runtime.system.name == 'chrome' ? true : false;
        as_object_link = app._runtime.system.name != 'chrome' ? as_object_link : false;
    var force_attachment = app._runtime.system.name == 'safari' ? true : false;
    var force_new = app._runtime.system.name == 'safari' ? true : false;

    // safari: 0 ? 1 1
    // crios: 1 0 0 0
    // default: 0 ? 0 1

    _downloadAttachment(as_link, as_object_link, force_attachment, force_new);

    if (!! app._runtime.debug) {
      console.info('app.os.fileDownload', [as_link, as_object_link, force_attachment, force_new], mime_type, filename);
    }
  // fallback
  } else {
    // default: 1 ? 1 1

    _downloadAttachment(true, as_object_link, true, true);

    if (!! app._runtime.debug) {
      console.info('app.os.fileDownload', [1, as_object_link, 1, 1], mime_type, filename);
    }
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
 * @return
 */
app.os.scriptOpen = function(callback, file, fn, max_attempts) {
  if (typeof callback != 'function' || typeof file != 'string' || (fn && typeof fn != 'string')) {
    app.error('app.os.scriptOpen', [callback, file, fn, max_attempts]);

    return callback(false);
  }

  fn = fn.toString();


  var _load = function(file) {
    var script = app._root.document.createElement('script');
    script.src = file;
    script.async = true;
    script.defer = true;

    app._root.document.head.appendChild(script);
  }

  var _check = function(fn, cb) {
    var max = parseInt(max_attempts) || 50;
    var attempts = 0;

    var interr = setInterval(function() {
      attempts++;

      if (fn in app._root.window === true || max === attempts) {
        clearInterval(interr);

        cb(true);
      }
    }, 10);
  }


  if (!! app._root.window.native) {
    return callback(true);
  }

  _load(file);

  if (fn in app._root.window === false) {
    _check(fn, callback);
  } else {
    callback(true);
  }
}


/**
 * app.os.generateFileHead
 *
 * Generates a JSON head
 *
 * @global <Object> appe__config
 * @param <Object> source
 * @param <Date> timestamp
 * @return <Object>
 */
app.os.generateJsonHead = function(source, timestamp) {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

  if (! config) {
    return app.stop('app.os.generateJsonHead');
  }

  if (! (source && typeof source === 'object') && ! (timestamp && timestamp instanceof Date)) {
    return app.error('app.os.generateJsonHead', [source, timestamp]);
  }

  var checksum = '';
  var timestamp = app.utils.dateFormat(timestamp, 'Q');

  return {
    'checksum': checksum,
    'date': timestamp,
    'version': app._runtime.version.toString(),
    'release': app._runtime.release.toString()
  };
}


/**
 * app.os.generateJsonChecksum
 *
 * Generates a JSON checksum
 *
 * @param <Function> callback
 * @param <String> source
 * @return
 */
app.os.generateJsonChecksum = function(callback, source) {
  if (typeof callback != 'function' && typeof source != 'string') {
    app.error('app.os.generateJsonChecksum', [callback, source]);

    return callback(false);
  }

  if (! (CryptoJS && CryptoJS.MD5)) {
    step = app.error('app.os.generateJsonChecksum', 'CryptoJS');
  }

  try {
    var checksum = CryptoJS.MD5(source.length.toString());
    checksum = checksum.toString();

    callback(checksum);
  } catch (err) {
    app.error('app.os.generateJsonChecksum', err);

    callback(false);
  }
}


/**
 * app.os.getLastFileName
 *
 * Gets the file name of last opened file
 *
 * @global <Object> appe__config
 * @return <String>
 */
app.os.getLastFileName = function() {
  var config = app._root.window.appe__config || app._root.process.env.appe__config;

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
 * Gets the runtime version of last opened file 
 *
 * @global <Object> appe__store
 * @return <String>
 */
app.os.getLastFileVersion = function() {
  var store = app._root.server.appe__store;

  if (! store) {
    return app.stop('app.os.getLastFileVersion', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var data_file = store[_app_name]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileVersion', 'data');
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
 * Gets the JSON checksum of last opened file 
 *
 * @global <Object> appe__store
 * @return <String>
 */
app.os.getLastFileChecksum = function() {
  var store = app._root.server.appe__store;

  if (! store) {
    return app.stop('app.os.getLastFileChecksum', 'store');
  }

  var _app_name = app._runtime.name.toString();

  var data_file = store[_app_name]['file'];

  if (! data_file) {
    return app.error('app.os.getLastFileChecksum', 'data');
  }

  var file_json_checksum = null;

  if (data_file.checksum) {
    file_json_checksum = data_file.checksum;
  }

  return file_json_checksum;
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
