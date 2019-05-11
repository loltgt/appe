

## app.layout


### Handles layout functions


```js
<Object>
```



 


## app.layout.renderElement


#### Renders a document element


```js
<Function>
```

arguments: 
```js
<String> node
<String> content
<Object> attributes
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/layout.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js)   line: [19](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js#L19)


 


## app.layout.renderSelect


#### Renders a SELECT element


```js
<Function>
```

arguments: 
```js
<String> select_id
<Object> data
<Object> attributes
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/layout.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js)   line: [58](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js#L58)


 


## app.layout.renderSelectOption


#### Renders the SELECT element OPTION


```js
<Function>
```

arguments: 
```js
<String> value
<String> name
<Boolean> selected
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/layout.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js)   line: [84](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js#L84)


 


## app.layout.renderSelectOptionGroup


#### Renders the SELECT element OPTGROUP


```js
<Function>
```

arguments: 
```js
<String> label
<String> options
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/layout.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js)   line: [102](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js#L102)


 


## app.layout.renderSelectOptions


#### Renders SELECT elements


```js
<Function>
```

example:
```js
[ { "optgroup_label": [ { "option_name": "option_value" }, ... ] } ]
[ { "option_name": "option_value" }, ... ]
[ "option_value", ... ]
```

arguments: 
```js
<String> select_id
<Object> data
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/layout.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js)   line: [126](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js#L126)


 


## app.layout.dropdown


#### Helper for dropdown, returns requested prototype method


```js
<Function> prototype   constructor
```

available prototype methods:
```js
 - open (e)
 - close (e)
 - toggle (e)
```

arguments: 
```js
<String> event
<ElementNode> toggler
<ElementNode> dropdown
<Function> callback (e, dropdown)
```

returns: 
```js
<Function>
```

position: 
- [src/appe/src/js/layout.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js)   line: [177](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js#L177)


 


## app.layout.collapse


#### Helper for collapsible, returns requested prototype method


```js
<Function> prototype   constructor
```

available prototype methods:
```js
 - open (e)
 - close (e)
 - toggle (e)
```

arguments: 
```js
<String> event
<ElementNode> element
<ElementNode> collapsible
<Function> callback   (e, collapsible)
```

returns: 
```js
<Function>
```

position: 
- [src/appe/src/js/layout.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js)   line: [318](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js#L318)


 


## app.layout.draggable


#### Helper for draggable, returns requested prototype method

###### TODO: *FIX droid*


```js
<Function> prototype   constructor
```

available prototype methods:
```js
 - start (e, row, callback)
 - over (e, row, callback)
 - enter (e, row, callback)
 - leave (e, row, callback)
 - end (e, row, callback)
 - drop (e, row, callback)
```

arguments: 
```js
<String> event
<ElementNode> row
<String> row_selector - .draggable
<Function> callback (e, row)
```

returns: 
```js
<Function>
```

position: 
- [src/appe/src/js/layout.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js)   line: [459](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js#L459)


 


## app.layout.localize


#### Helper to localize layout


```js
<Function>
```

globals: 
```js
<Object> appe__locale
```

arguments: 
```js
<ElementNode> element
```

returns.

position: 
- [src/appe/src/js/layout.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js)   line: [654](https://github.com/loltgt/appe/blob/master/src/appe/src/js/layout.js#L654)


 


