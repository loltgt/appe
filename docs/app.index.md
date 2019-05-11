

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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [86](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L86)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [107](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L107)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [127](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L127)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [162](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L162)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [427](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L427)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [481](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L481)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [510](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L510)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [543](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L543)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [586](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L586)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [632](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L632)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [751](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L751)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [813](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L813)


 


## app.openSession


#### Opens session, alias of app.openSessionFile


```js
<Function>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [877](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L877)


 


## app.saveSession


#### Saves session, alias of app.saveSessionFile


```js
<Function>
```

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [885](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L885)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [903](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L903)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1074](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1074)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1127](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1127)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1254](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1254)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1271](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1271)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1304](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1304)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1369](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1369)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1393](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1393)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1441](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1441)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1454](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1454)


 


## app.getLicense


#### Gets app license


```js
<Function>
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1477](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1477)


 


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
- [src/appe/src/js/index.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js)   line: [1489](https://github.com/loltgt/appe/blob/master/src/appe/src/js/index.js#L1489)


 


