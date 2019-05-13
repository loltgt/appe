

# Extend: export to PDF


## 1. Write the extension function

To add new functions in **appe** or extend the existing ones create extensions, as an example an extension to extend lists in PDF.

Create a file inside the "[ext](https://github.com/loltgt/appe/blob/master/ext)" extension folder and set up a function with the steps necessary to show the new feature in the views.

The function must be run to make available the new feature in the application.

```js
export_to_pdf = function() {
  var _is_view = ! (window.appe__control === undefined);

  if (_is_view) {
    var dropdown = document.querySelector('#section-actions-top .dropdown-menu');

    var item = document.createElement('li');
    var link = document.createElement('a');

    link.setAttribute('href', 'javascript:');
    link.setAttribute('onclick', 'control.action(this, \'export\', \'pdf\'); return false;');
    link.innerHTML = 'Export PDF';

    item.append(link);
    dropdown.append(item);
  }
}

export_to_pdf();
```


## 2. Modify the configuration

Once the function has been created, edit the file _"[config.js](https://github.com/loltgt/appe/blob/master/app/config.js)"_, add the references to the file and the function just created to the _"aux"_ object, the file will be loaded asynchronously when pages loading.

```js
appe__config = {

  "aux": [
    {
      "file": "demo.min.js",
      "fn": "appe__demo"
    },

    {
      "file": "export-pdf.js",  <==
      "fn": "export_to_pdf"  <==
    }

  ]

}

```

 

## 3. Add the feature

It is time to code, in this case you can use a pre-existing function as model _"[[app.view.sub.prototype.csv|app.view#appviewsub]]"_ that is closest to the needs.

To achieve your goal you can use JavaScript libraries or write, create functions, etc. .

Create a _"export_to_pdf_view_sub_pdf"_ function to reference then within the main _"export_to_pdf"_.

```js
export_to_pdf_view_sub_pdf = function(element, table) {
  if (! jsPDF) {
    return console.warn('aux: export_to_pdf', '\t', 'jsPDF');
  }

  if (! element || ! table) {
    return console.error('aux: export_to_pdf', '\t', [element, table]);
  }

  var source;
  var table_csv = app.view.convertTableCSV(table);


  var doc = new jsPDF();

  var doc_head = table_csv[0];
  var doc_body = table_csv.slice(1);

  doc.autoTable({ head: [doc_head], body: doc_body });
  

  var file;

  var filename_prefix = 'pdf_export';
  var filename_separator = '_';
  var filename_date_format = 'Y-m-d_H-M-S';

  var filename = filename_prefix;
  var filename_date = app.utils.dateFormat(true, filename_date_format);

  filename += filename_separator + filename_date;

  file = filename + '.pdf';


  doc.save(file);
}
```
 

## 4. Finalize

To complete and show the new feature you need to satisfy all dependencies, this example requires the library [jsPDF](https://github.com/MrRio/jsPDF) and the plugin [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable).

A function _"app.view.sub.prototype.pdf"_ must be declared as an alias of the one just created _"export_to_pdf_view_sub_pdf"_, which extends the prototype function _"[[app.view.sub.prototype|app.view#appviewsub]]"_.

```js
export_to_pdf = function() {
  var _is_view = ! (window.appe__control === undefined);

  app.view.sub.prototype.pdf = export_to_pdf_view_sub_pdf;  <==  // alias

  if (_is_view) {
    var dropdown = document.querySelector('#section-actions-top .dropdown-menu');

    var item = document.createElement('li');

    var link = document.createElement('a');
    link.setAttribute('href', 'javascript:');
    link.setAttribute('onclick', 'control.action(this, \'export\', \'pdf\'); return false;');
    link.innerHTML = 'Export PDF';

    item.append(link);
    dropdown.append(item);


    // load required libs

    var head = document.getElementsByTagName('head')[0];
    var script;

    script = document.createElement('script');
    script.setAttribute('src', '../../ext/lib/jspdf/jspdf.min.js');

    head.append(script);

    var _defer = setTimeout(function() {
      script = document.createElement('script');
      script.setAttribute('src', '../../ext/lib/jspdf-autotable/jspdf.plugin.autotable.min.js');

      head.append(script);

      clearTimeout(_defer);
    }, 1000);
  }
}
```

 
 

The files in this example are contained in the folder "[docs/recipes/extend](https://github.com/loltgt/appe/blob/master/docs/recipes/extend)".

