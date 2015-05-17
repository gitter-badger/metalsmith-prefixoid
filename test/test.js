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
}

var get_data = function(file, url) {
  var files = {};
  files[file] = {contents: get_link(url)};
  return files;
}

var emptfn = function(){}

exports.test_relative_non_current = function(test) {
  var files = get_data('a', 'a/b');
  var pref = prefixoid({
    prefix: '/pref'
  });
  pref(files, null, emptfn);
  test.ok(files.a.contents == get_link('a/b'), 'Link must not be changed');
  test.done();
};

exports.test_absolute_non_current = function(test) {
  var files = get_data('a', '/a/b');
  var pref = prefixoid({
    prefix: '/pref'
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a'].contents);
  test.ok(elem$[0].tagName == 'A', 'Link must be a <a>-link');
  test.ok(elem$.attr('href') == '/pref/a/b', 'Link must have transformed "href" attr');
  test.done();
}

exports.test_absolute_current = function(test) {
  var files = get_data('a/b', '/a/b');
  var pref = prefixoid({
    prefix: '/pref'
  });
  pref(files, null, emptfn);
  var elem$ = $(files['a/b'].contents);
  test.ok(elem$[0].tagName == 'SPAN', 'Link must be converted to span');
  test.ok(elem$.attr('href') == '/pref/a/b', 'Span must have transformed href attr');
  test.done();
}
// exports.test_hide_name = function(test) {
//   var files = get_data();
//   var hide = hideshow({
//       name: 'A',
//       hide: function(filename) {
//         return filename == 'a';
//       }
//     });
//   hide(files, null, emptfn);
//   test.ok(!files.a, 'File a must be hidden');
//   test.ok(!!files.b, 'File b must not be hidden');
//   test.ok(!!files.c, 'File c must not be hidden');

//   var show = hideshow({
//     name: 'A',
//     show: true
//   });
//   show(files, null, emptfn);
//   test.ok(!!files.a, 'File a must be shown back');
//   test.ok(!!files.b, 'File b must not be hidden');
//   test.ok(!!files.c, 'File c must not be hidden');

//   hideshow.reset();
//   test.done();
// }

// exports.test_hide_default = function(test) {
//   var files = get_data();
//   var hide = hideshow({
//       hide: function(filename) {
//         return filename == 'a';
//       }
//     });
//   hide(files, null, emptfn);
//   test.ok(!files.a, 'File a must be hidden');
//   test.ok(!!files.b, 'File b must not be hidden');
//   test.ok(!!files.c, 'File c must not be hidden');

//   var show = hideshow({
//     show: true
//   });
//   show(files, null, emptfn);
//   test.ok(!!files.a, 'File a must be shown back');
//   test.ok(!!files.b, 'File b must not be hidden');
//   test.ok(!!files.c, 'File c must not be hidden');

//   hideshow.reset();
//   test.done();
// }

// exports.test_hide_different_names = function(test) {
//   var files = get_data();
//   var hide_a = hideshow({
//       name: 'A',
//       hide: function(filename) {
//         return filename == 'a';
//       }
//     });
//   var hide_b = hideshow({
//       name: 'B',
//       hide: function(filename) {
//         return filename == 'b';
//       }
//     });
//   var show_a = hideshow({
//     name: 'A',
//     show: true
//   });
//   var show_b = hideshow({
//     name: 'B',
//     show: true
//   });

//   hide_a(files, null, emptfn);
//   test.ok(!files.a, 'File a must be hidden');
//   test.ok(!!files.b, 'File b must not be hidden');
//   test.ok(!!files.c, 'File c must not be hidden');

//   hide_b(files, null, emptfn);
//   test.ok(!files.a, 'File a must be hidden');
//   test.ok(!files.b, 'File b must be hidden');
//   test.ok(!!files.c, 'File c must not be hidden');

//   show_a(files, null, emptfn);
//   test.ok(!!files.a, 'File a must be shown back');
//   test.ok(!files.b, 'File b must be hidden');
//   test.ok(!!files.c, 'File c must not be hidden');

//   show_b(files, null, emptfn);
//   test.ok(!!files.a, 'File a must not be hidden');
//   test.ok(!!files.b, 'File b must be shown back');
//   test.ok(!!files.c, 'File c must not be hidden');

//   hideshow.reset();
//   test.done();
// }

// exports.test_hide_twice_name = function(test) {
//   var files = get_data();
//   var hide_a = hideshow({
//       name: 'A',
//       hide: function(filename) {
//         return filename == 'a';
//       }
//     });
//   var hide_b = hideshow({
//       name: 'A',
//       hide: function(filename) {
//         return filename == 'b';
//       }
//     });

//   hide_a(files, null, emptfn);
//   test.ok(!files.a, 'File a must be hidden');
//   test.ok(!!files.b, 'File b must not be hidden');
//   test.ok(!!files.c, 'File c must not be hidden');

//   test.throws(function(){hide_b(files, null, emptfn);}, Error, 'Must be thrown Error: "Storage \'A\' is already in use"');

//   hideshow.reset();
//   test.done();
// }

// exports.test_hide_twice_default = function(test) {
//   var files = get_data();
//   var hide_a = hideshow({
//       hide: function(filename) {
//         return filename == 'a';
//       }
//     });
//   var hide_b = hideshow({
//       hide: function(filename) {
//         return filename == 'b';
//       }
//     });

//   hide_a(files, null, emptfn);
//   test.ok(!files.a, 'File a must be hidden');
//   test.ok(!!files.b, 'File b must not be hidden');
//   test.ok(!!files.c, 'File c must not be hidden');

//   test.throws(function(){hide_b(files, null, emptfn);}, Error, 'Must be thrown Error: "Default storage is already in use"');

//   hideshow.reset();
//   test.done();
// }

// exports.test_show_unexisting = function(test) {
//   var files = get_data(); 
//   var show_a = hideshow({
//     name: "A",
//     show: true
//   });
//   var show_default = hideshow({
//     show: true
//   });

//   test.throws(function(){show_a(files, null, emptfn);}, Error, 'Must be thrown: "Storage \'A\' is undefined"');
//   test.throws(function(){show_default(files, null, emptfn);}, Error, 'Must be thrown: "Default storage is undefined"');

//   hideshow.reset();
//   test.done();
// }

// exports.test_show_twice_name = function(test) {
//   var files = get_data();
//   var hide = hideshow({
//       name: 'A',
//       hide: function(filename) {
//         return filename == 'a';
//       }
//     });

//   var show = hideshow({
//     name: 'A',
//     show: true
//   });

//   hide(files, null, emptfn);
//   show(files, null, emptfn);
//   test.throws(function(){show(files, null, emptfn);}, Error, 'Must be thrown: "Storage \'A\' is undefined"')

//   hideshow.reset();
//   test.done();
// }

// exports.test_show_twice_default = function(test) {
//   var files = get_data();
//   var hide = hideshow({
//       hide: function(filename) {
//         return filename == 'a';
//       }
//     });

//   var show = hideshow({
//     show: true
//   });

//   hide(files, null, emptfn);
//   show(files, null, emptfn);
//   test.throws(function(){show(files, null, emptfn);}, Error, 'Must be thrown: "Default storage is undefined"')

//   hideshow.reset();
//   test.done();
// }
