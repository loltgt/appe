

## app.main


### "main" functions


```js
<Object>
```



 


## app.main.control


#### Init "main" function that fires when "main" is ready


```js
<Function>
```

globals: 
```js
<Object> appe__config
```

arguments: 
```js
<Object> loc
```

returns.

position: 
- [src/appe/src/js/main.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js)   line: [18](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js#L18)


 


## app.main.handle


#### Control "main" function handling requests, could return self prototype


```js
<Function> prototype   constructor
```

avalaible prototype methods:
```js
 - getID ()
 - setAction ()
 - getAction ()
 - setTitle (title)
 - getTitle ()
 - setMsg (msg)
 - getMsg ()
 - setURL (path, qs)
 - redirect ()
 - refresh ()
 - resize ()
 - selection ()
 - export ()
 - prepare ()
 - prevent ()
 - open () <=> prepare ()
 - add () <=> prepare ()
 - edit () <=> prepare ()
 - update () <=> prepare ()
 - delete () <=> prevent ()
 - close () <=> prevent ()
 - history (reset)
 - receiver ()
```

globals: 
```js
<Object> appe__config
<Object> appe__main
```

arguments: 
```js
<Event> e
```

returns.

position: 
- [src/appe/src/js/main.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js)   line: [149](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js#L149)


 


## app.main.action


#### Actions "main", returns self prototype


```js
<Function> prototype   constructor
```

avalaible prototype methods:
```js
 - isInitialized (funcName)
 - begin ()
 - end ()
 - menu (element)
```

globals: 
```js
<Object> appe__config
<Object> appe__main
```

arguments: 
```js
<Array> events
<String> event
<ElementNode> element
```

returns: 
```js
<Function> prototype
```

position: 
- [src/appe/src/js/main.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js)   line: [563](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js#L563)


 


## app.main.load


#### Default "main" load function


```js
<Function>
```

globals: 
```js
<Object> appe__config
<Object> appe__locale
```

returns.

position: 
- [src/appe/src/js/main.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js)   line: [671](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js#L671)


 


## app.main.beforeunload


#### Default "main" before unload function


```js
<Function>
```

returns: 
```js
<Boolean>
```

position: 
- [src/appe/src/js/main.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js)   line: [790](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js#L790)


 


## app.main.loadComplete


#### Fires on "main" load complete


```js
<Function>
```

globals: 
```js
<Object> appe__config
```

arguments: 
```js
<Object> routine
```

returns.

position: 
- [src/appe/src/js/main.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js)   line: [810](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js#L810)


 


## app.main.setup


#### Setup "main" data


```js
<Function>
```

globals: 
```js
<Object> appe__main
```

position: 
- [src/appe/src/js/main.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js)   line: [834](https://github.com/loltgt/appe/blob/master/src/appe/src/js/main.js#L834)


 


