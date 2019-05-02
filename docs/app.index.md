

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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [106](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L106)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [141](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L141)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [400](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L400)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [454](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L454)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [483](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L483)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [516](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L516)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [559](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L559)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [605](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L605)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [726](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L726)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [788](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L788)


 


## app.openSession


#### Opens session, alias of app.openSessionFile


```js
<Function>
```

position: 
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [853](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L853)


 


## app.saveSession


#### Saves session, alias of app.saveSessionFile


```js
<Function>
```

position: 
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [861](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L861)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [879](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L879)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1050](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1050)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1103](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1103)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1230](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1230)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1247](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1247)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1280](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1280)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1345](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1345)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1369](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1369)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1417](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1417)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1430](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1430)


 


## app.getLicense


#### Gets app license


```js
<Function>
```

returns.

position: 
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1453](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1453)


 


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
- [src/appe/src/js/index.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js)   line: [1465](https://github.com/leolweb/appe/blob/master/src/appe/src/js/index.js#L1465)


 


