

# Customize: rent cars to dinosaurs


## 1. Modify the configuration

This is an example of customization starting from the sample event _"_events.custom"_ in the demo file _"[sample.html](https://github.com/loltgt/appe/blob/master/demo/app/views/sample.html)"_.

First you need to edit the file _"[config.js](https://github.com/loltgt/appe/blob/master/app/config.js)"_, add a new event and a new route, then create the page to serve with the new view.

```js
appe__config = {

  "events": {
    "selection": "selection",
    "update": "update",
    "open": "open",
    "close": "close",
    "add": "add",
    "edit": "edit",
    "delete": "delete",
    "list": "list",

      "rent": "rent"  /* <== */

  },

  "sample": {
    "add": "sample-edit",
    "edit": "sample-edit",
    "delete": "sample",

      "rent": "sample-rent"  /* <== */

  },

}
```

 

## 2. Add the custom event to "index.html"

To create an event with a route to be served, it must be declared in the index file _"[index.html](https://github.com/loltgt/appe/blob/master/demo/app/index.html)"_.

Therefore add an alias "rent" to the function _"[[app.main.handle.prototype.prepare|app.main#appmainhandle]]"_, that is a generic method performing all necessary actions to set action, route and update data.

```js
main.handle = function(handler, event, ctl) {
  if (! handler || ! event || ! ctl) {
    return app.error('main.handle', arguments);
  }

  var _events = app.utils.extendObject({}, handler);


  _events.selection = function() {
    try {
      var _data = JSON.parse(ctl.data);

      app.memory.set('archive_id', parseInt(_data.id));
    } catch {
      return;
    }

    return handler.selection();
  }



  _events.rent = _events.prepare; // alias to "prepare" aka "app.main.handle.prototype.prepare"



  _events[event]();
}
```

 

## 3. Create the view "sample-rent.html"

Once the configuration has been modified, create the file with the view, it can be used as model _"[sample-edit.html](https://github.com/loltgt/appe/blob/master/demo/app/views/sample-edit.html)"_ which is closer to the needs.

I used a _"rent"_ object grafted into the parent item _"items"_, which pre-existed in the scheme, for convenience.

The structure of the view is almost identical to the reference model _"edit"_, also in this case the _"rent"_ event is declared as an alias of the function _"[[app.view.action.prototype.prepare|app.view#appviewaction]]"_.


```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<link rel="stylesheet" type="text/css" href="../assets/css/lib/bootstrap/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="../assets/css/app.min.css">
</head>

<body class="view view_edit">
<h1 id="view-title" class="page-header">Items</h1>
<h2 id="section-title" class="sub-header"></h2>


<div id="section-actions-top" class="section-actions section-actions-top">
  <div>
    <a class="btn btn-sm btn-gray-lighter" href="../index.html?sample" target="_parent">&laquo; Return Back</a>
  </div>
</div>

<form id="form-data" class="form form-data" autocomplete="off" validate>
<fieldset>
<div class="row">
<div class="form-group col-6 col-lg-4">
  <label for="sample_rent_dino">Dinosaur</label>
  <select id="sample_rent_dino" name="rent[dino]" class="form-control" required></select>
</div>
</fieldset>


<fieldset>
<legend>Rent</legend>

<div class="row">
<div class="form-group col-12 col-lg-3">
  <label for="sample_rent_period">Period</label>
  <select id="sample_rent_period" name="rent[period]" class="form-control">
    <option value="1">1 month</option>
    <option value="2">2 months</option>
    <option value="3">3 months</option>
    <option value="4">4 months</option>
  </select>
</div>

<div class="clearfix visible-lg-block"></div>

<div class="form-group col-12 col-lg-2">
  <label for="sample_rent_amount">Amount</label>
  <div class="input-group">
    <input type="text" id="sample_rent_amount" name="rent[amount]" class="form-control" value="0.00" data-transform="numeric" required>
    <div class="input-group-addon">
      <span class="input-group-text">coin &times; month</span>
    </div>
  </div>
</div>
</div>
</fieldset>


<fieldset class="form-submit">
  <input type="hidden" id="index" name="id" value="{id}" data-transform="integer">
  <input type="submit" id="real-submit" class="hide" hidden>
  <button type="button" id="submit" class="btn btn-primary btn-lg" onclick="control.action(this, 'edit')">Rent Vehicle</button>
</fieldset>
</form>


<script type="text/javascript" src="../assets/js/app.min.js"></script>

<script type="text/javascript" src="../config.js"></script>


<script type="text/javascript">
var control = appe__control = {};



control.handle = function(data) {
  var data_sample = data['sample'];
  var data_items = data['items'];

  var form = document.getElementById('form-data');

  if (! data_sample || ! data_items) {
    return app.error('control.handle', 'data*');
  }


  var _control = app.view.control([ 'rent' ], data_sample, form);

  _control.begin();

  
  var event = _control.getEvent();
  var id = _control.getID();


  var _events = {};


  _events.rent = function() {
    _control.setTitle('Rent Vehicle');

    _control.setActionHandler();

    control.fillForm(data_sample[id]);
  }



  var dino_selection = [ { "0": "&ndash; select &ndash;" } ];

  Array.prototype.forEach.call(Object.keys(data_items), function(id) {
    var obj = {};
    obj[id] = data_items[id].name;
    dino_selection.push(obj);
  });

  var dino_selected = data_sample[id].rent ? data_sample[id].rent[dino] : 0;

  var select_dino = document.getElementById('sample_rent_dino');
  select_dino.innerHTML = app.layout.renderSelectOptions('sample_rent_dino', dino_selection, dino_selected);
  select_dino.value = dino_selected;



  _events[event]();


  _control.end();
}



control.fillForm = function(data_field) {
  if (! data_field) {
    return app.error('control.fillForm', arguments);
  }

  data_field.rent = data_field.rent || { dino: 0, period: 1, amount: '0.00' };  // to prevent is not defined error, fill with empty data

  document.querySelector('#sample_rent_dino > option[value="' + data_field.rent.dino + '"]').setAttribute('selected', '');
  document.getElementById('sample_rent_period').setAttribute('value', data_field.rent.period);
  document.getElementById('sample_rent_amount').setAttribute('value', data_field.rent.amount);
}



control.action = function(element, event, extra) {
  var form = document.getElementById('form-data');

  if (! element || typeof event !== 'string') {
    return app.error('control.action', arguments);
  }


  var _action = app.view.action([ 'rent' ], event, element, form);

  _action.begin();

  _action.rent = _action.prepare;  // alias to "prepare" aka "app.view.action.prototype.prepare"


  if (_action.validateForm()) {
    return;
  }


  var id = _action.getID();


  var _data_updated = {};


  var _events = {};


  _events._prepare = function() {
    var _ext_data = app.utils.extendObject(true, _data_updated['sample'][id], app.view.getFormData(form.elements));

    _data_updated['sample'][id] = _ext_data;
  }


  _events.rent = function() {
    var data_sample = app.data('sample');

    if (! data_sample) {
      return app.error('control.action().rent', 'data*');
    }

    _data_updated['sample'] = data_sample;

    _events._prepare();

    return _action.rent(_data_updated, true);
  }


  var ctl = _events[event](extra);

  app.view.send(ctl);

  _action.end();
}


app.load(app.view.load);
app.beforeunload(app.view.beforeunload);
</script>
</body>
</html>
```

 

## 4. Modify the view "sample.html"

Finally all changes introduced in the new view _"sample-rent.html"_ will be integrated into the existing view _"[sample.html](https://github.com/loltgt/appe/blob/master/demo/app/views/sample.html)"_.

Rename the _"example"_ event with _"rent"_, in the links and in all the control functions.

```html
  <table id="table-data" class="table table-data">
    <thead>
      <tr>
        <th class="hidden-print">Actions</th>
        <th>ID</th>
        <th class="text-nowrap">Vehicle Name</th>
        <th class="text-nowrap">Vehicle Type</th>
        <th class="text-nowrap">Manufactured</th>
        <th class="text-nowrap">Value Price</th>


        <th>Rent Dino</th>
        <th>Rent Period</th>
        <th>Rent Amount</th>


        <th class="hidden-print">Rent</th>
      </tr>
    </thead>
    <tbody>
      <tr class="tpl">
        <td class="hidden-print">
          <a class="action btn btn-secondary" href="../index.html?sample&edit={id}" onclick="control.action(this, 'edit'); return false;" target="_parent">Edit</a>
          <a class="action btn btn-danger" href="../index.html?sample&delete={id}" onclick="control.action(this, 'delete'); return false;" target="_parent">Delete</a>
        </td>
        <td>{id}</td>
        <td>{title}</td>
        <td>{type}</td>
        <td class="text-nowrap">{date}</td>
        <td class="text-nowrap">{amount}</td>


        <td>{rent_dino}</td>
        <td>{rent_period}</td>
        <td>{rent_amount}</td>


        <td class="hidden-print">


          <a class="action btn btn-link btn-sm" href="../index.html?sample&rent={id}" onclick="control.action(this, 'rent'); return false;" target="_parent">RENT</a>


        </td>
      </tr>
    </tbody>
  </table>
```

```js
control.action = function(element, event, extra) {
  var data = app.data();

  var data_sample = data['sample'];

  var table = document.getElementById('table-data');

  if (! data_sample) {
    return app.error('control.action', arguments);
  }

  if (! element || typeof event !== 'string') {
    return app.error('control.action', arguments);
  }


  var _action = app.view.action([ 'edit', 'delete', 'export', 'print', /* ==> */ 'rent' /* <== */ ], event, element, data_sample);

  _action.begin();


  var id = _action.getID();

  var _data_updated = {};


  var _events = {};
```

The _"items"_ data source must also be added in order to return the name of the dinosaur, because only the ID will be stored in the _"rent"_ object.

```js
control.handle = function(data) {
  var data_sample = data['sample'];
  var data_items = data['items'];  /* <== */

  var table = document.getElementById('table-data');

  if (! data_sample || ! data_items) {  /* <== */
    return app.error('control.handle', 'data*');
  }

  var _control = app.view.control(null, data_sample);

  _control.begin();


  _control.fillTable(table, null, null, data_items);  /* <== */  // passing down "data_items" to extra argument


  _control.end();
}
```

All new datas must be integrated in order to render them in the table recognized by the _"table-data"_ identifier.

```js
control.renderRow = function(tpl_row, id_row, data_row, extra) {
  if (! tpl_row || ! data_row) {
    return app.error('control.renderRow', arguments);
  }


  var items_extra = extra[0];  /* <== */


  var row = tpl_row.cloneNode(true);

  row.setAttribute('data-index', id_row);


  data_row.rent = data_row.rent || { dino: 0, period: 1, amount: 0 };  /* <== */  // to prevent is not defined error, fill with empty data


  row.innerHTML = row.innerHTML
    .replace(/\{id\}/g, data_row.id)
    .replace('{title}', data_row.title)
    .replace('{type}', data_row.type)
    .replace('{date}', app.utils.dateFormat(data_row.date, 'd/m/Y'))
    .replace('{amount}', app.utils.numberFormat(data_row.amount, 2, ',', '.') + ' coin')
    .replace('{status}', data_row.status)

    .replace('{rent_dino}', data_row.rent.dino ? items_extra[data_row.rent.dino].name : '&ndash;')  /* <== */
    .replace('{rent_period}',data_row.rent.period + ' month')  /* <== */
    .replace('{rent_amount}', app.utils.numberFormat(data_row.rent.amount, 2, ',', '.') + ' coin &times; month');  /* <== */

  return row;
}
```

Then the action _"_event.example"_ must be replaced to change route when the user clicks the RENT button.

```js
  // Custom action example
  _events.rent = function() {
    _action.rent = _action.prepare;  // alias to "prepare" aka "app.view.action.prototype.prepare"

    return _action.rent();
  }
```

 
 

The files in this example are contained in the folder "[docs/recipes/customize](https://github.com/loltgt/appe/blob/master/docs/recipes/customize)".

