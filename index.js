'use strict';

var $ = (function(){
    var $ = require('jquery');
    var jsdom = require('jsdom');
    var document = jsdom.jsdom('');
    var window = document.defaultView;
    return $(window);
})();

var curry = function(fun, _) {
    var slice = Array.prototype.slice;
    var args1 = slice.call(arguments, 1);
    return function() {
        var args2 = args1.concat(slice.call(arguments, 0));
        return fun.apply(this, args2);
    };
};

var namespace = function(namespace, context) {
    var prevIndex = 0;
    var nextIndex = namespace.indexOf('.', 0);
    var parent = context || window;

    do
    {
        nextIndex = namespace.indexOf('.', prevIndex);
        var key = nextIndex >= 0 ? namespace.substring(prevIndex, nextIndex) : namespace.substring(prevIndex);
        parent[key] = parent[key] || {};
        parent = parent[key];
        prevIndex = nextIndex + 1;
    }
    while(nextIndex >= 0);

    return parent;
}



/**
 * "Makes a copy of some HTML element but changes tag name.
 *  Example:
 *   (clone-with-tag
 *    <span class='a'>foo<b>bar</b></span>
 *    \"<div/>\")
 *   returns:
 *   <div class='a'>foo<b>bar</b></div>"
 */
var clone_with_tag = function(elem, tag) {
    var clone$ = $(tag);
    var clone = clone$[0];
    var attrs = elem.attributes;
    var attrs_len = attrs.length;

    clone$.html($(elem).html());

    for (var i = 0; i < attrs_len; ++i) {
        clone.setAttribute(attrs[i].nodeName, attrs[i].nodeValue);
    }

    clone.style.cssText = elem.style.cssText;
    return clone;
};

/**
 * Transform all links in html text.
 * For example, function transform may add prefixes to inner urls.
 * Then it replace all <a>-links by <span>-elements if that was a link
 * to current-url"
 *
 * @param  {string}   html        [description]
 * @param  {function} is_current  [description]
 * @param  {function} transform   [description]
 * @param  {function} add_classes [varname] [description]
 * @return {string}               [description]
 */
var prepare_links = function(html, is_current, transform, add_classes, span_currents) {
    var div$ = $('<div/>');
    var links = div$.html(html).find('a');
    links.replaceWith(function(i){
        var link = this;
        var link$ = $(link);
        var url = link$.attr('href');
        var t_url = transform(url);
        link$.attr('href', t_url);
        if (span_currents && is_current(t_url)) {
            var span = clone_with_tag(link, '<span/>');
            add_classes(span)
            return span;
        } else {
            add_classes(link)
            return link;
        }
    });
    return div$.html();
};

var default_is_current = function(current_url, url) {
    return url == current_url
        || url == current_url + '/'
        || url == current_url + '/index.html';
};

/**
 * Returns the same url if its relative url or url with protocol and domain:
 *   * some/relative/path.html
 *   * ../../anothre/relative.html
 *   * http://example.com/path/
 *   * anyprotocol://example.com/path
 *
 * If it's an absolute path without protocol it adds the prefix
 *   * /some/absolute/path -> <prefix>/some/absolute/path
 *   
 */
var default_transform = function(prefix, url) {
    if (url.match(/^(?:(?:\w+:\/\/)|(?:\/\/)|[^\/])/)) {
        return url;
    } else {
        return prefix + url;
    }
}

var add_classes = function(links_class, spans_class, all_class, elem) {
    var elem$ = $(elem);
    if(all_class) {
        elem$.addClass(all_class);
    }

    if (elem.tagName == 'SPAN' && spans_class) {
        elem$.addClass(spans_class);
    } else if (elem.tagName == 'A' && links_class) {
        elem$.addClass (links_class);
    }
}

/**
 * ## Config params: 
 * `meta: 'site.url'` - (optional) will take prefix from metadata.site.url
 * `prefix: '/base/url'` - (optional) take prefix from config:
 * `span_currents: true` - (optional) will replace links to current page with <span> elements.
 * `is_current: function(current_url, url)` - (optional) will recognize if link is current
 * `transform: function` - (optional) transforms url
 * `links_class: 'a-link'` - css class of <a> links.
 * `spans_class: 'span-link'` - css class of spans which were links.
 * `all_links_class: 'all-link'` - css class of every link processed with plugin
 */

module.exports = function(config) {
  return function hideshow(files, metalsmith, done) {
    var prefix = config.prefix
              || config.meta && namespace(config.meta, metalsmith.metadata)
              || '';
    var transform = config.transform || curry(default_transform, prefix);
    var add_classes1 = curry(add_classes,
                             config.links_class,
                             config.spans_class,
                             config.all_links_class);

    for (var file in files) {
        var current_url = transform('/' + (files[file].path || file));
        var is_current = curry(config.is_current || default_is_current, current_url);
        files[file].contents = prepare_links(files[file].contents.toString(),
                                             is_current, transform, add_classes1,
                                             config.span_currents)
    }

    done();
  };
};

