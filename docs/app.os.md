

## app.os


### Handles filesystem functions


```js
<Object>
```



 


## app.os.fileSessionOpen


#### Opens a session file through FileReader api, stores it, returns to callback


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [20](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L20)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [295](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L295)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [558](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L558)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [756](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L756)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [804](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L804)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [863](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L863)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [895](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L895)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [927](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L927)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [961](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L961)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [994](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L994)


 


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
- [src/appe/src/js/os.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js)   line: [1026](https://github.com/leolweb/appe/blob/master/src/appe/src/js/os.js#L1026)


 


