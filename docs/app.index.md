

## app.load


#### Helper app load function DOM


```js
<Function>
```

arguments: 
```js
<Function> func
<Boolean>
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [49](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L49)


 


## app.unload


#### Helper app unload function DOM


```js
<Function>
```

arguments: 
```js
<Function> func
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [90](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L90)


 


## app.beforeunload


#### Helper app before unload function DOM


```js
<Function>
```

arguments: 
```js
<Function> func
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [113](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L113)


 


## app.position


#### Returns JSON serialized app position


```js
<Function>
```

returns: 
```js
<String> position
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [135](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L135)


 


## app.session


#### Initializes the session, returns to callback


```js
<Function>   // asyncronous
```

globals: 
```js
<Object> appe__store
<Object> appe__locale
<Object> CryptoJS
<Object> pako
```

arguments: 
```js
<Function> callback
<Object> config
<String> target
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [170](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L170)


 


## app.resume


#### Resumes session, returns last opened file


```js
<Function>
```

arguments: 
```js
<Object> config
<Boolean> target
```

returns: 
```js
<String> session_resume
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [459](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L459)


 


## app.redirect


#### Performs app redirect


```js
<Function>
```

globals: 
```js
<Object> appe__config
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [558](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L558)


 


## app.data


#### Gets data store


```js
<Function>
```

globals: 
```js
<Object> appe__store
```

arguments: 
```js
<String> key
```

returns: 
```js
<Object>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [588](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L588)


 


## app.checkConfig


#### Verifies config file


```js
<Function>
```

arguments: 
```js
<Object> config
```

returns: 
```js
<Boolean>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [621](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L621)


 


## app.checkFile


#### Verifies opened file


```js
<Function>
```

globals: 
```js
<Object> appe__config
```

arguments: 
```js
<Object> source
<Object> checksum
```

returns: 
```js
<Boolean>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [664](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L664)


 


## app.openSessionFile


#### Opens session from an app session file


```js
<Function>
```

globals: 
```js
<Object> appe__config
<Object> appe__start
<Object> CryptoJS
<Function> pako
```

arguments: 
```js
<Object> source
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [724](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L724)


 


## app.saveSessionFile


#### Saves session to app session file


```js
<Function>
```

globals: 
```js
<Object> appe__config
<Object> appe__store
<Object> appe__start
<Object> CryptoJS
<Function> pako
```

arguments: 
```js
<Object> source
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [843](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L843)


 


## app.newSession


#### Creates a new empty session


```js
<Function>
```

globals: 
```js
<Object> appe__config
<Object> appe__start
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [905](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L905)


 


## app.openSession


#### Opens session, alias of app.openSessionFile


```js
<Function>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [972](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L972)


 


## app.saveSession


#### Saves session, alias of app.saveSessionFile


```js
<Function>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [980](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L980)


 


## app.asyncAttemptLoad


#### Attemps to load files and scripts, returns to callback


```js
<Function>   // asyncronous
```

globals: 
```js
<Object> appe__config
<Object> CryptoJS
```

arguments: 
```js
<Function> callback
<Boolean> resume_session
<String> fn
<String> file
<Object> schema
<Boolean> memoize
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [998](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L998)


 


## app.asyncLoadAux


#### Load extension scripts asyncronously, returns to callback


```js
<Function>   // asyncronous
```

globals: 
```js
<Object> appe__config
```

arguments: 
```js
<Function> callback
<Object> routine
<Boolean> resume_session
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1169](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1169)


 


## app.i18n


#### App localization

###### TODO: *implement nest replacement*


```js
<Function>
```

globals: 
```js
<Object> appe__locale
```

arguments: 
```js
<String> to_translate
<String> context
to_replace
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1222](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1222)


 


## app.debug


#### Utility debug


```js
<Function>
```

arguments: 
```js
<Object> source
```

returns: 
```js
<Boolean>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1349](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1349)


 


## app.stop


#### Stops the app execution


```js
<Function>
```

globals: 
```js
<Object> appe__main
```

arguments: 
```js
<String> arg0   ( msg | fn )
arg1   ( log | msg )
arg2   ( log | msg )
<Boolean> soft
```

returns: 
```js
<Boolean>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1366](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1366)


 


## app.error


#### Helper to debug and display error messages


```js
<Function>
```

globals: 
```js
<Object> appe__control
```

arguments: 
```js
<String> arg0   fn
arg1   ( log | msg )
arg2   ( log | msg )
<Boolean> soft
```

returns: 
```js
<undefined>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1401](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1401)


 


## app.blind


#### Helper to freeze "main" screen


```js
<Function>
```

globals: 
```js
<Object> appe__main
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1467](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1467)


 


## app.getInfo


#### Utility to get app info(s)


```js
<Function>
```

globals: 
```js
<Object> appe__config
```

arguments: 
```js
<String> from   ( config | runtime )
<String> info   { config { app_name | schema | license } } | runtime { { debug | locale | version | release } }
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1491](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1491)


 


## app.getName


#### Gets app name


```js
<Function>
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1539](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1539)


 


## app.getVersion


#### Gets app version


```js
<Function>
```

arguments: 
```js
<String> info
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1552](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1552)


 


## app.getLicense


#### Gets app license


```js
<Function>
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1575](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1575)


 


## app.getLocale


#### Gets app locale language


```js
<Function>
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1587](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1587)


 


