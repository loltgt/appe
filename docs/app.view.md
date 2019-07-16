

## app.view


### "view" functions


```js
<Object>
```



 


## app.view.spoof


#### Captures the current position inside "view" using location.href


```js
<Function>
```

returns: 
```js
<Object> loc   { action, index }
```

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [16](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L16)


 


## app.view.control


#### Control "view" function, returns self prototype


```js
<Function> prototype   constructor
```

avalaible prototype methods:
```js
 - isInitialized (funcName)
 - begin ()
 - end ()
 - setID (id)
 - getID ()
 - getLastID ()
 - setEvent (event)
 - getEvent ()
 - setTitle (section_title, view_title, id)
 - setActionHandler (label, id)
 - denySubmit ()
 - fillTable (table, data, order)
 - fillForm (form, data)
 - fillSelection (data, id)
 - fillCTA (id)
 - paginate (element, pages, current_page)
 - localize (element)
```

globals: 
```js
<Object> appe__config
<Object> appe__control
<Object> appe__locale
```

arguments: 
```js
<Array> events
<Object> data
<ElementNode> form
```

returns: 
```js
<Function> prototype
```

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [75](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L75)


 


## app.view.action


#### Actions "view", returns self prototype


```js
<Function> prototype   constructor
```

avalaible prototype methods:
```js
 - isInitialized (funcName)
 - begin ()
 - end ()
 - getID ()
 - validateForm () 
 - prepare (data, submit)
 - prevent (data, submit, title, name)
 - open (data, submit) <=> prepare ()
 - add (data, submit) <=> prepare ()
 - edit (data, submit) <=> prepare ()
 - update (data, submit)<=> prepare ()
 - delete (data, submit, title, name) <=> prevent ()
 - close (data, submit, title, name) <=> prevent ()
 - selection ()
 - print ()
```

globals: 
```js
<Object> appe__config
<Object> appe__control
<Object> appe__locale
```

arguments: 
```js
<Array> events
<String> event
<ElementNode> element
<ElementNode> form
```

returns: 
```js
<Function> prototype
```

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [639](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L639)


 


## app.view.sub


#### Sub-actions "view", returns requested prototype method


```js
<Function> prototype   constructor
```

avalaible prototype methods:
```js
 - csv (element, table)
 - clipboard (element, table)
 - toggler (element, dropdown)
```

globals: 
```js
<Object> appe__config
```

arguments: 
```js
<String> method
<ElementNode> element
<ElementNode> table
```

returns: 
```js
<Function>
```

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [976](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L976)


 


## app.view.handle


#### Fires when "view" is loaded


```js
<Function>
```

globals: 
```js
<Object> appe__config
<Object> appe__control
```

returns.

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [1136](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L1136)


 


## app.view.send


#### Sends control messages to "main"


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
<Object> ctl
```

returns.

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [1173](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L1173)


 


## app.view.resize


#### Fires when "view" is resized


```js
<Function>
```

globals: 
```js
<Object> appe__control
```

returns.

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [1229](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L1229)


 


## app.view.getFormData


#### Helper to get form data with transformation and sanitization


```js
<Function>
```

arguments: 
```js
<HTMLCollection> elements
```

returns: 
```js
<Object>
```

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [1259](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L1259)


 


## app.view.convertTableCSV


#### Helper to convert object data to csv text format


```js
<Function>
```

arguments: 
```js
<ElementNode> table
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [1321](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L1321)


 


## app.view.copyToClipboard


#### Helper to copy into system clipboard

links: [https://gist.github.com/rproenca/64781c6a1329b48a455b645d361a9aa3](https://gist.github.com/rproenca/64781c6a1329b48a455b645d361a9aa3)

```js
<Function>
```

arguments: 
```js
<String> source
```

returns.

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [1374](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L1374)


 


## app.view.load


#### Default "view" load function


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
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [1415](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L1415)


 


## app.view.beforeunload


#### Default "view" before unload function


```js
<Function>
```

globals: 
```js
<Object> appe__control
```

returns: 
```js
<Boolean>
```

position: 
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [1499](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L1499)


 


## app.view.loadComplete


#### Fires on "view" load complete


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
- [src/appe/src/js/view.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js)   line: [1532](https://github.com/loltgt/appe/blob/master/src/appe/src/js/view.js#L1532)


 


