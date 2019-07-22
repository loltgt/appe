

## app.os


### Handles filesystem functions


```js
<Object>
```



 


## app.os.fileSessionOpen


#### Opens a session file through the browser FileReader API, stores it, returns to callback


```js
<Function>   // asyncronous
```

globals: 
```js
<Object> appe__config
<Object> CryptoJS
<Function> pako
```

arguments: 
```js
<Function> callback
```

returns.

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [20](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L20)


 


## app.os.fileSessionSave


#### Sends a file to the browser, returns to callback


```js
<Function>   // asyncronous
```

globals: 
```js
<Object> appe__config
<Object> CryptoJS
<Function> pako
```

arguments: 
```js
<Function> callback
<Object> source
<Date> timestamp
```

returns.

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [297](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L297)


 


## app.os.fileDownload


#### Prepares attachment data file and sends it to browser

links: [https://github.com/eligrey/FileSaver.js/](https://github.com/eligrey/FileSaver.js/)

```js
<Function>
```

arguments: 
```js
source
<String> filename
<String> mime_type
```

returns.

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [560](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L560)


 


## app.os.fileFindRoot


#### Finds the root base of file


```js
<Function>
```

globals: 
```js
<Object> appe__config
<Object> appe__control
```

arguments: 
```js
<String> filename
<Boolean> inherit
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [758](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L758)


 


## app.os.scriptOpen


#### Tries to open a script and load asyncronously, returns to callback


```js
<Function>   // asyncronous
```

arguments: 
```js
<Function> callback
<String> file
<String> fn
<Number> max_attempts
```

returns.

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [806](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L806)


 


## app.os.generateFileHead


#### Generates a JSON head


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
<Date> timestamp
```

returns: 
```js
<Object>
```

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [865](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L865)


 


## app.os.generateJsonChecksum


#### Generates a JSON checksum, returns to callback


```js
<Function>   // asyncronous
```

arguments: 
```js
<Function> callback
<String> source
```

returns.

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [897](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L897)


 


## app.os.getLastFileName


#### Gets the file name of last opened file


```js
<Function>
```

globals: 
```js
<Object> appe__config
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [929](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L929)


 


## app.os.getLastFileVersion


#### Gets the runtime version of last opened file


```js
<Function>
```

globals: 
```js
<Object> appe__store
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [957](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L957)


 


## app.os.getLastFileChecksum


#### Gets the JSON checksum of last opened file


```js
<Function>
```

globals: 
```js
<Object> appe__store
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [990](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L990)


 


## app.os.getLastFileHead


#### Gets the last opened file header


```js
<Function>
```

returns: 
```js
<Object>
```

position: 
- [src/appe/src/js/os.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js)   line: [1022](https://github.com/loltgt/appe/blob/master/src/appe/src/js/os.js#L1022)


 


