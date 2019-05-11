export_to_pdf = function() {
  var _is_view = ! (window.appe__control === undefined);

  app.view.sub.prototype.pdf = export_to_pdf_view_sub_pdf;  // alias

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

export_to_pdf();