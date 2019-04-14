const fs = require('fs');
const UglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');

const contents = {
  js: ['index', 'os', 'controller', 'memory', 'store', 'start', 'main', 'view', 'layout', 'utils', 'lockdown'],
  css: ['app']
};

const options = {
  /**
   * @see https://www.npmjs.com/package/uglify-js
   * @link https://skalman.github.io/UglifyJS-online/
   */
  js: {
    parse: {
      bare_returns     : false,
      //ecma             : 8,
      expression       : false,
      filename         : null,
      html5_comments   : true,
      shebang          : true,
      strict           : false,
      toplevel         : null
    },
    compress: {
      //arrows           : true,
      booleans         : true,
      collapse_vars    : true,
      comparisons      : true,
      //computed_props   : true,
      conditionals     : true,
      dead_code        : true,
      drop_console     : false,
      drop_debugger    : true,
      //ecma             : 5,
      evaluate         : true,
      expression       : false,
      global_defs      : {},
      hoist_funs       : false,
      hoist_props      : true,
      hoist_vars       : false,
      ie8              : false,
      if_return        : true,
      inline           : true,
      join_vars        : true,
      //keep_classnames  : false,
      keep_fargs       : true,
      keep_fnames      : false,
      keep_infinity    : false,
      loops            : true,
      negate_iife      : true,
      passes           : 1,
      properties       : true,
      pure_getters     : "strict",
      pure_funcs       : null,
      reduce_funcs     : true,
      reduce_vars      : true,
      sequences        : true,
      side_effects     : true,
      switches         : true,
      top_retain       : null,
      toplevel         : false,
      typeofs          : true,
      unsafe           : false,
      //unsafe_arrows    : false,
      unsafe_comps     : false,
      unsafe_Function  : false,
      unsafe_math      : false,
      //unsafe_methods   : false,
      unsafe_proto     : false,
      unsafe_regexp    : false,
      unsafe_undefined : false,
      unused           : true,
      warnings         : false
    },
    mangle: {
      eval             : false,
      ie8              : false,
      //keep_classnames  : false,
      keep_fnames      : false,
      properties       : false,
      reserved         : [],
      //safari10         : false,
      toplevel         : false
    },
    output: {
      ascii_only       : false,
      beautify         : false,
      //bracketize       : false,
      comments         : /@preserve|^!/,
      //ecma             : 5,
      ie8              : false,
      indent_level     : 4,
      indent_start     : 0,
      inline_script    : true,
      keep_quoted_props: false,
      max_line_len     : false,
      preamble         : null,
      preserve_line    : false,
      quote_keys       : false,
      quote_style      : 0,
      //safari10         : false,
      semicolons       : true,
      shebang          : true,
      source_map       : null,
      webkit           : false,
      width            : 80,
      wrap_iife        : false
    },
    wrap: false
  },
  /**
   * @see https://www.npmjs.com/package/clean-css
   */
  css: {
    compatibility: 'ie9,-properties.colors,-properties.merging'
  }
};



let indexes = { js: {}, css: {} };
let blob = { js: [], css: [] };


build = (fn, type) => {
  fn = fn.toString();

  if (fn in build.prototype == false) {
    throw 'Uncaught Function "' + fn + '"';
  }

  if (type) {
    return build.prototype[fn](type);
  }

  build.prototype[fn]('css');
  build.prototype[fn]('js');

  console.log('\r\n');
}

build.prototype = { constructor: build };

build.prototype.log = (blob) => {
  let log = '\r\n\r\n';

  if (typeof blob === 'object') {
    if (blob instanceof Array) {
      log = '\t';

      blob.forEach((key) => {
        log += key.padEnd(20) + '\t';
      });

      log += '\r\n';
    } else {
      Object.keys(blob).forEach((key) => {
        log += '\t\t' + key.padEnd(10) + '\t' + blob[key] + '\r\n';
      });
    }
  } else {
    log = '\t' + blob + '\r\n';
  }

  return log;
}

build.prototype.complete = (type, end) => {
  type = type.toString();

  if (end < contents[type].length - 1) return;

  fs.writeFile('./appe/dist/' + type + '/app.' + type, build.prototype.concat(type), (err) => {
    if (err) throw err;
  });
  fs.writeFile('./appe/dist/' + type + '/app.min.' + type, build.prototype.uglify(type), (err) => {
    if (err) throw err;

    build.prototype.copy(type);
  });
}

build.prototype.concat = (type) => {
  type = type.toString();

  console.log('concat (' + type + ')', build.prototype.log(indexes[type]), '\r\n');

  return blob[type].join('\r\n\r\n');
}

build.prototype.uglify_js = () => {
  console.log('uglify (js)', build.prototype.log('app.js'), '\r\n');

  var result = new UglifyJS.minify(blob.js, options.js);

  if (result.error) {
    console.error('uglify (js)', '\terror\r\n\r\n\r\n', result.error.message, '\r\n\r\n', {
      filename: result.error.filename,
      line: result.error.line,
      col: result.error.col,
      pos: result.error.pos
    }, '\r\n\r\n');
  }

  return result.code;
}

build.prototype.uglify_css = () => {
  console.log('uglify (css)', build.prototype.log('app.css'), '\r\n');

  var result = new CleanCSS(options.css).minify(blob.css.join(''));

  if (result.errors && result.errors.length) {
    console.error('uglify (css)', '\terror\r\n\r\n\r\n', JSON.stringify(result.errors), '\r\n\r\n');
  }

  return result.styles;
}

build.prototype.uglify = (type) => {
  type = type.toString();

  if (type && 'uglify_' + type in build.prototype) {
    return build.prototype['uglify_' + type].call();
  } else {
    throw 'Uncaught Function "' + fn + '"';
  }

  build.prototype.js_uglify();
  build.prototype.css_uglify();
}

build.prototype.copy = (type) => {
  type = type.toString();

  const count = 2; 
  let end = 0; 

  fs.copyFile('./appe/dist/' + type + '/app.' + type, '../app/assets/' + type + '/app.' + type, (err) => {
    if (err) throw err;

    console.log('copy (' + type + ')', build.prototype.log(['dist/' + type + '/app.' + type, 'app/assets/' + type + '/app.' + type]));

    if (end++ === count - 1) console.log('\r\n');
  });
  fs.copyFile('./appe/dist/' + type + '/app.min.' + type, '../app/assets/' + type + '/app.min.' + type, (err) => {
    if (err) throw err;

    console.log('copy (' + type + ')', build.prototype.log(['dist/' + type + '/app.min.' + type, 'app/assets/' + type + '/app.min.' + type]));

    if (end++ === count - 1) console.log('\r\n');
  });
}

build.prototype.watch = (type) => {
  type = type.toString();

  console.log('watch (' + type + ')', build.prototype.log('ready...'));

  fs.watch('./appe/src/' + type, { encoding: 'buffer' }, (eventType, file) => {
    if (eventType != 'change') {
      return;
    }

    fs.readFile('./appe/src/' + type + '/' + file, (err, data) => {
      blob[type][indexes[type][file]] = data;

      console.log('update (' + type + ')', build.prototype.log(file.toString()), '\r\n');

      build.prototype.complete(type, 100);
    });
  });
}

build.prototype.init = (type) => {
  type = type.toString();

  let end = 0;

  contents[type].forEach((filename, i) => {
    let file = filename + '.' + type;

    fs.readFile('./appe/src/' + type + '/' + file, (err, data) => {
      if (err) throw err;

      blob[type][i] = data.toString();
      indexes[type][file] = i;

      build.prototype.complete(type, end++);
    });
  });
}



(process.argv[2] == 'js' || process.argv[3] == 'js') && build('init', 'js');
(process.argv[2] == 'css' || process.argv[3] == 'css') && build('init', 'css');
(! process.argv[2] || process.argv[2] == 'watch' && ! process.argv[3]) && build('init');

(process.argv[2] == 'watch' && process.argv[3] == 'js') && build('watch', 'js');
(process.argv[2] == 'watch' && process.argv[3] == 'css') && build('watch', 'css');
(process.argv[2] == 'watch' && ! process.argv[3]) && build('watch');
