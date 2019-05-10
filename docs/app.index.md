

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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [49](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L49)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [86](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L86)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [107](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L107)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [127](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L127)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [162](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L162)


 


## app.resume


#### Resumes session, returns last opened file

###### TODO: *FIX*


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [427](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L427)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [481](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L481)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [510](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L510)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [543](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L543)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [586](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L586)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [632](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L632)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [753](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L753)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [815](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L815)


 


## app.openSession


#### Opens session, alias of app.openSessionFile


```js
<Function>
```

position: 
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [880](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L880)


 


## app.saveSession


#### Saves session, alias of app.saveSessionFile


```js
<Function>
```

position: 
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [888](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L888)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [906](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L906)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1077](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1077)


 


## app.i18n


#### App localization

###### TODO: *implement*


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1130](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1130)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1257](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1257)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1274](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1274)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1307](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1307)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1372](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1372)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1396](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1396)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1444](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1444)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1457](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1457)


 


## app.getLicense


#### Gets app license


```js
<Function>
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1480](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1480)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1492](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1492)


 


