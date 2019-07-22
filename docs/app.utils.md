

## app.utils


### Utils functions


```js
<Object>
```



 


## app.utils.system


#### Detects system environment


```js
<Function>
```

arguments: 
```js
<String> purpose   ( name | platform | architecture | release )
```

returns.

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [17](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L17)


 


## app.utils.addEvent


#### Helper to add element event listener


```js
<Function>
```

arguments: 
```js
<String> event
<ElementNode> element
<Function> func
```

returns.

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [141](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L141)


 


## app.utils.removeEvent


#### Helper to remove element event listener


```js
<Function>
```

arguments: 
```js
<String> event
<ElementNode> element
<Function> func
```

returns.

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [164](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L164)


 


## app.utils.proxy


#### Proxy function with passed arguments


```js
<Function>
```

arguments: 
```js
<Boolean> deep
<Object> | <Function> obj
```

returns: 
```js
<Object> |
```

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [186](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L186)


 


## app.utils.storage


#### Storage utility, it stores persistent (across the session) and non-persistent data


```js
<Function> prototype   constructor
```

available prototype methods:
```js
 - set (key, value)
 - get (key)
 - has (key, value)
 - del (key)
 - reset ()
 - fake ()
```

arguments: 
```js
<String> persists
<String> method
<String> key
value
```

returns.

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [232](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L232)


 


## app.utils.cookie


#### Helper to handle cookie


```js
<Function> prototype   constructor
```

available prototype methods:
```js
 - set (key, value, expire_time)
 - get (key)
 - has (key, value)
 - del (key)
 - reset ()
```

arguments: 
```js
<String> method
<String> key
value
<Date> expire_time
```

returns.

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [414](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L414)


 


## app.utils.base64


#### Base64 encoder and decoder


```js
<Function> prototype   constructor
```

available prototype methods:
```js
 - encode (to_encode)
 - decode (to_decode)
```

arguments: 
```js
to_encode
```

returns.

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [568](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L568)


 


## app.utils.transform


#### Transforms type of passed value


```js
<Function>
```

arguments: 
```js
<String> purpose   ( lowercase | uppercase | numeric | integer | json )
value
```

returns.

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [630](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L630)


 


## app.utils.sanitize


#### Sanitizes passed value


```js
<Function>
```

arguments: 
```js
<String> purpose   ( whitespace | breakline | date | datetime | datetime-local | array )
value
```

returns.

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [659](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L659)


 


## app.utils.classify


#### Transforms object to classnames


```js
<Function>
```

arguments: 
```js
<Object> | <Array> data
<String> prefix
<Boolean> to_array
```

returns: 
```js
classes
```

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [711](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L711)


 


## app.utils.numberFormat


#### Formats number float within decimal and thousand groups


```js
<Function>
```

arguments: 
```js
<Number> number
<Number> decimals
<String> decimals_separator
<String> thousands_separator
```

returns: 
```js
<String>
```

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [750](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L750)


 


## app.utils.dateFormat


#### Formats date, supported format specifiers are like used in strftime() C library function,
#### it accepts Date time format or boolean true for 'now', default: "Y-m-d H:M"


```js
<Function>
```

format specifiers:
```js
 - d  // Day of the month, digits preceded by zero (01-31)
 - J  // Day of the month (1-31)
 - w  // Day of the week (1 Mon - 7 Sun)
 - m  // Month, digits preceded by zero (01-12)
 - n  // Month (1-12)
 - N  // Month, start from zero (0-11)
 - Y  // Year, four digits (1970)
 - y  // Year, two digits (70)
 - H  // Hours, digits preceded by zero (00-23)
 - G  // Hours (0-23)
 - M  // Minutes, digits preceded by zero (00-59)
 - I  // Minutes (0-59)
 - S  // Seconds, digits preceded by zero (00-59)
 - K  // Seconds (0-59)
 - v  // Milliseconds, three digits
 - a  // Abbreviated day of the week name (Thu)
 - b  // Abbreviated month name (Jan)
 - x  // Date representation (1970/01/01)
 - X  // Time representation (01:00:00)
 - s  // Seconds since the Unix Epoch
 - V  // Milliseconds since the Unix Epoch
 - O  // Difference to Greenwich time GMT in hours (+0100)
 - z  // Time zone offset (+0100 (CEST))
 - C  // Date and time representation (Thu, 01 Jan 1970 00:00:00 GMT)
 - Q  // ISO 8601 date representation (1970-01-01T00:00:00.000Z)
```

arguments: 
```js
<Date> | <Boolean> time
```

returns: 
```js
formatted_date
```

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [804](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L804)


 


## app.utils.numberLendingZero


#### Pads number from left with zero


```js
<Function>
```

arguments: 
```js
number
```

returns.

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [866](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L866)


 


## app.utils.isPlainObject


#### Checks if object is a plain object
##### (jQuery.fn.isPlainObject)
##### jQuery JavaScript Library

links: [https://jquery.com/](https://jquery.com/)
license: MIT license <https://jquery.org/license>
copyright: Copyright JS Foundation and other contributors

```js
<Function>
```

arguments: 
```js
<Object> obj
```

returns: 
```js
<Boolean>
```

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [886](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L886)


 


## app.utils.extendObject


#### Deep extend and merge objects
##### (jQuery.fn.extend)
##### jQuery JavaScript Library

links: [https://jquery.com/](https://jquery.com/)
license: MIT license <https://jquery.org/license>
copyright: Copyright JS Foundation and other contributors

```js
<Function>
```

returns: 
```js
<Object> target
```

position: 
- [src/appe/src/js/utils.js](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js)   line: [923](https://github.com/loltgt/appe/blob/master/src/appe/src/js/utils.js#L923)


 


