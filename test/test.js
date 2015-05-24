'use strict';

var prefixoid = require('../index.js');
var $ = (function(){
    var $ = require('jquery');
    var jsdom = require('jsdom');
    var document = jsdom.jsdom('');
    var window = document.defaultView;
    return $(window);
})();



var get_link = function(url) {
  return '<a href="' + url + '">ololo</a>';
};

var get_span = function(url) {
  return '<span href="' + url + '">ololo</span>';
};

var get_data = function(file, url) {
  var files = {};
  files[file] = {contents: get_link(url)};
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
  test.ok(files.a.contents == get_link('a/b'), 'Link must not be changed');
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
  test.ok(elem$.attr('href') == '/pref/a/b', 'Span must have transformed href attr');
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





