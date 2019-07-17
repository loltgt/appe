

## app.controller


### Controller functions


```js
<Object>
```



 


## app.controller.spoof


#### Captures the app position using location.href


```js
<Function>
```

arguments: 
```js
<Object> loc   { view, action, index }
```

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [16](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L16)


 


## app.controller.history


#### Handles history through the browser api


```js
<Function>
```

arguments: 
```js
<String> title
<String> url
```

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [54](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L54)


 


## app.controller.cursor


#### Get or set the controller cursor,
#### it contains current position in the app


```js
<Function>
```

arguments: 
```js
<Object> loc
```

returns: 
```js
<Object> loc   { view, action, index }
```

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [97](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L97)


 


## app.controller.setTitle


#### Set and store the document title


```js
<Function>
```

arguments: 
```js
<String> title
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [122](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L122)


 


## app.controller.getTitle


#### Gets the document title


```js
<Function>
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [138](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L138)


 


## app.controller.store


#### Stores data from current session, returns to callback


```js
<Function>   // asyncronous
```

globals: 
```js
<Object> appe__store
```

arguments: 
```js
<Function> callback
<String> fn
<Object> schema
<Object> data
```

returns.

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [155](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L155)


 


## app.controller.retrieve


#### Restores data for current session and loads file and scripts, returns to callback


```js
<Function>   // asyncronous
```

globals: 
```js
<Object> appe__store
```

arguments: 
```js
<Function> callback
<Array> routine
```

returns.

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [224](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L224)


 


## app.controller.clear


#### Reset the current session data


```js
<Function>
```

globals: 
```js
<Object> appe__config
<Object> appe__store
```

returns: 
```js
<Boolean>
```

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [299](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L299)


 


