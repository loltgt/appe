

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
<Object> loc   { view, action, index }
```

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [16](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L16)


 


## app.controller.history


#### Handles history navigation through the browser History API


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
#### it contains the current position in the app


```js
<Function>
```

arguments: 
```js
<Object> loc
```

returns: 
```js
<Object> loc   { view, action, index }
```

position: 
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [99](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L99)


 


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
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [124](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L124)


 


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
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [140](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L140)


 


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
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [157](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L157)


 


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
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [228](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L228)


 


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
- [src/appe/src/js/controller.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js)   line: [306](https://github.com/loltgt/appe/blob/master/src/appe/src/js/controller.js#L306)


 


