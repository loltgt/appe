

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
- [src/appe/src/js/main.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js)   line: [18](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js#L18)


 


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
 - history ()
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
- [src/appe/src/js/main.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js)   line: [149](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js#L149)


 


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
- [src/appe/src/js/main.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js)   line: [562](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js#L562)


 


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
- [src/appe/src/js/main.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js)   line: [670](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js#L670)


 


## app.main.unload


#### Default "main" unload function


```js
<Function>
```

returns: 
```js
<Boolean>
```

position: 
- [src/appe/src/js/main.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js)   line: [789](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js#L789)


 


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
- [src/appe/src/js/main.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js)   line: [809](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js#L809)


 


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
- [src/appe/src/js/main.js](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js)   line: [833](https://github.com/leolweb/appe/blob/master/src/appe/src/js/main.js#L833)


 


