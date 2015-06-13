'use strict';

var prefixoid = require('../index.js');
var $ = (function(){
    var $ = require('jquery');
    var jsdom = require('jsdom');
    var document = jsdom.jsdom('');
    var window = document.defaultView;
    return $(window);
})();


var get_incorrect_a = function(url) {
  return '<a class="incorrect-a">some text</a>'
};

var get_incorrect_link = function(url) {
  return '<link rel="shortcut_icon">'
};

var get_a = function(url) {
  return '<a href="' + url + '">ololo</a>';
};

var get_span = function(url) {
  return '<span href="' + url + '">ololo</span>';
};

var get_script = function(url) {
  return '<script src="' + url + '"></script>';
};

var get_link = function(url) {
  return '<link rel="shortcut_icon" type="image/gif" href="' + url + '">'
};

var get_data = function(file, url, get_contents) {
  var files = {};
  get_contents = get_contents || get_a;
  files[file] = {contents: get_contents(url)};
  return files;
};


var emptfn = function(){};

exports.test_relative_non_current = function(test) {
  var files = get_data('a', 'a/b');
  var pref = prefixoid({
    prefix: '/pref',
    span_currents: true
  });
  pref(files, null, emptfn);
  test.ok(files.a.contents == get_a('a/b'), 'Link must not be changed');
  test.done();
};

exports.test_absolute_non_current = function(test) {
  var files = get_data('a', '/a/b');
  var pref = prefixoid({
    prefix: '/pref',
    span_currents: true
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a'].contents);
  test.ok(elem$[0].tagName == 'A', 'Link must be a <a>-link');
  test.ok(elem$.attr('href') == '/pref/a/b', 'Link must have transformed "href" attr');
  test.done();
};

exports.test_absolute_current = function(test) {
  var files = get_data('a/b', '/a/b');
  var pref = prefixoid({
    prefix: '/pref',
    span_currents: true
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a/b'].contents);
  test.ok(elem$[0].tagName == 'SPAN', 'Link must be converted to span');
  test.ok(elem$.attr('href') == '/pref/a/b', 'Span must have transformed href attr');
  test.done();
};

exports.test_absolute_current_no_span = function(test) {
  var files = get_data('a/b', '/a/b');
  var pref = prefixoid({
    prefix: '/pref'
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a/b'].contents);
  test.ok(elem$[0].tagName == 'A', 'Link must not be converted to span');
  test.ok(elem$.attr('href') == '/pref/a/b', 'Link must have transformed href attr');
  test.done();
};

exports.test_meta = function(test) {
  var files = get_data('a', '/a/b');
  var pref = prefixoid({
    meta: 'site.base_path'
  });
  pref(files, {metadata: function(){return {site: {base_path: '/pref'}}}}, emptfn);
  var elem$ = $(files['a'].contents);
  test.ok(elem$.attr('href') == '/pref/a/b', 'Link must have transformed "href" attr');
  test.done();
};

exports.test_is_current = function(test) {
  var files = get_data('a/b/c', '/a/b');
  var pref = prefixoid({
    prefix: '/pref',
    is_current: function(current_url, url) {
      return current_url == url + '/c';
    },
    span_currents: true
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a/b/c'].contents);
  test.ok(elem$[0].tagName == 'SPAN', 'Link must be converted to span');
  test.ok(elem$.attr('href') == '/pref/a/b', 'Span must have transformed href attr');
  test.done();
};

exports.test_transform = function(test) {
  var files = get_data('a', '/a/b');
  var pref = prefixoid({
    transform: function(url) {
      return '/pref' + url;
    }
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a'].contents);
  test.ok(elem$.attr('href') == '/pref/a/b', 'Span must have transformed href attr');
  test.done();
};

exports.test_css_link = function(test) {
  var files = get_data('a', '/a/b');
  var pref = prefixoid({
    prefix: '/pref',
    links_class: 'links-class',
    spans_class: 'spans-class',
    all_links_class: 'all-links-class'
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a'].contents);
  test.ok(elem$.hasClass('links-class'), 'Link must have links-class');
  test.ok(elem$.hasClass('all-links-class'), 'Link must have all-links-class');
  test.ok(!elem$.hasClass('spans-class'), 'Link must not have spans-class');
  test.done();
};

exports.test_css_span = function(test) {
  var files = get_data('a/b', '/a/b');
  var pref = prefixoid({
    prefix: '/pref',
    span_currents: true,
    links_class: 'links-class',
    spans_class: 'spans-class',
    all_links_class: 'all-links-class'
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a/b'].contents);
  test.ok(!elem$.hasClass('links-class'), 'Span must not have links-class');
  test.ok(elem$.hasClass('all-links-class'), 'Span must have all-links-class');
  test.ok(elem$.hasClass('spans-class'), 'Span must have spans-class');
  test.done();
}


exports.test_selectors_absolute_non_current = function(test) {
  var files = get_data('a', '/a/b', get_script);
  var pref = prefixoid({
    prefix: '/pref',
    selector: "script",
    attr: "src",
    span_currents: true
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a'].contents);
  test.ok(elem$[0].tagName == 'SCRIPT', 'Link must be a <SCRIPT>-link');
  test.ok(elem$.attr('src') == '/pref/a/b', 'Link must have transformed "src" attr');
  test.done();
};

exports.test_selectors_relative_non_current = function(test) {
  var files = get_data('a', 'a/b', get_link);
  var pref = prefixoid({
    prefix: '/pref',
    selector: "link",
    attr: "href",
    span_currents: true
  });
  pref(files, null, emptfn);
  test.ok(files.a.contents == get_link('a/b'), 'Element must not be changed');
  test.done();
};


exports.test_selectors_absolute_current = function(test) {
  var files = get_data('a/b', '/a/b', get_script);
  var pref = prefixoid({
    prefix: '/pref',
    selector: "script",
    attr: "src",
    span_currents: true
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a/b'].contents);
  test.ok(elem$[0].tagName == 'SPAN', 'Element must be converted to span');
  test.ok(elem$.attr('src') == '/pref/a/b', 'Span must have transformed src attr');
  test.done();
};


exports.test_selectors_absolute_current_no_span = function(test) {
  var files = get_data('a/b', '/a/b', get_script);
  var pref = prefixoid({
    prefix: '/pref',
    selector: "script",
    attr: "src",
    span_currents: false
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a/b'].contents);
  test.ok(elem$[0].tagName == 'SCRIPT', 'Element must not be converted to span');
  test.ok(elem$.attr('src') == '/pref/a/b', 'Element must have transformed href attr');
  test.done();
};

exports.test_incorrect_attr = function(test) {
  var files = get_data('a', '/a/b', get_incorrect_a);
  var pref = prefixoid({
    prefix: '/pref',
    span_currents: true,
    links_class: 'links-class',
    spans_class: 'spans-class',
    all_links_class: 'all-links-class'
  });
  pref(files, null, emptfn);
  test.ok(files.a.contents == get_incorrect_a('/a/b'), 'Link must not be changed');
  test.done();
};

exports.test_selector_incorrect_attr = function(test) {
  var files = get_data('a', '/a/b', get_incorrect_link);
  var pref = prefixoid({
    prefix: '/pref',
    selector: "link",
    attr: "href",
    span_currents: true,
    links_class: 'links-class',
    spans_class: 'spans-class',
    all_links_class: 'all-links-class'
  });
  pref(files, null, emptfn);
  test.ok(files.a.contents == get_incorrect_link('/a/b'), 'Element must not be changed');
  test.done();
};

exports.test_save_html_with_head = function(test) {
  var get_html_with_head = function(url) {
    return '<html><head><link href="' + url + '"></head><body><div>AAA</div></body></html>\n';
  }

  var files = get_data('a', '/a/b', get_html_with_head);
  var pref = prefixoid({
    prefix: '/pref',
    selector: 'link',
    attr: 'href'
  });
  pref(files, null, emptfn);
  test.ok(files.a.contents.substring(0, 50) == get_html_with_head('/pref/a/b').substring(0, 50), 'Text must save correct html structure');
  test.done();
};

exports.test_save_html_with_head_and_doctype = function(test) {
  var get_html_with_head = function(url) {
    return '<!DOCTYPE html><html><head><link href="' + url + '"></head><body><div>AAA</div></body></html>  \n \n  ';
  }

  var files = get_data('a', '/a/b', get_html_with_head);
  var pref = prefixoid({
    prefix: '/pref',
    selector: 'link',
    attr: 'href'
  });
  pref(files, null, emptfn);
  test.ok(files.a.contents.substring(0, 50) == get_html_with_head('/pref/a/b').substring(0, 50), 'Text must save correct html structure');
  test.done();
};


exports.test_save_html_with_attributes_head_and_doctype = function(test) {
  var get_html_with_head = function(url) {
    return '<!DOCTYPE html><html some-attr="hello"><head><link href="' + url + '"></head><body><div>AAA</div></body></html>  \n \n  ';
  }

  var files = get_data('a', '/a/b', get_html_with_head);
  var pref = prefixoid({
    prefix: '/pref',
    selector: 'link',
    attr: 'href'
  });
  pref(files, null, emptfn);
  test.ok(files.a.contents.substring(0, 50) == get_html_with_head('/pref/a/b').substring(0, 50), 'Text must save correct html structure');
  test.done();
};




exports.test_array_settings = function(test) {
  var get_html = function(url, url2) {
    var url2 = url2 || url
    return '<a href="' + url + '" class="first"></a><a href="' + url2 + '" class="second"></a>';
  }

  var files = get_data('a', '/a/b', get_html);
  var pref = prefixoid([{
      prefix: '/first',
      selector: 'a.first',
      attr: 'href'
    },{
      prefix: '/second',
      selector: 'a.second',
      attr: 'href'
    }]);
  pref(files, null, emptfn);
  var elem$ = $(files.a.contents);
  test.ok($(elem$[0]).attr('href') == '/first/a/b', 'URL of first element must have "/first" prefix');
  test.ok($(elem$[1]).attr('href') == '/second/a/b', 'URL of second element must have "/second" prefix');
  test.ok(files.a.contents == get_html('/first/a/b', '/second/a/b'), 'code must be changed correctly');
  test.done();
};




