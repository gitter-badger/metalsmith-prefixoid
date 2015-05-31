'use strict';

var get_$ = function(text){
    var jquery = require('jquery');
    var jsdom = require('jsdom');
    var document = jsdom.jsdom(text || '');
    var window = document.defaultView;
    var $ = jquery(window);
    $.get_doctype_string = function() {
        // got it here: http://stackoverflow.com/a/10162353/1549127
        var node = document.doctype;
        return node && "<!DOCTYPE "
                 + node.name
                 + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                 + (!node.publicId && node.systemId ? ' SYSTEM' : '') 
                 + (node.systemId ? ' "' + node.systemId + '"' : '')
                 + '>' || '';
    };
    return $;
};

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

var is_html = function(text) {
    var endTag = '</html>';
    text = text.trim();
    return text.length > endTag.length
        && endTag == text.substring(text.length - endTag.length).toLowerCase();
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
var clone_with_tag = function(elem, tag, $) {
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
var prepare_links = function($, is_current, transform, add_classes, span_currents, selector, attr) {
    var links = $(selector);
    links.replaceWith(function(i){
        var link = this;
        var link$ = $(link);
        var url = link$.attr(attr);
        if(!url) {
            return link;
        }

        
        var t_url = transform(url);
        link$.attr(attr, t_url);
        if (span_currents && is_current(t_url)) {
            var span = clone_with_tag(link, '<span/>', $);
            add_classes(span, $)
            return span;
        } else {
            add_classes(link, $)
            return link;
        }
    });
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
};

var add_classes = function(links_class, spans_class, all_class, elem, $) {
    var elem$ = $(elem);
    if(all_class) {
        elem$.addClass(all_class);
    }

    if (elem.tagName == 'SPAN' && spans_class) {
        elem$.addClass(spans_class);
    } else if (elem.tagName == 'A' && links_class) {
        elem$.addClass (links_class);
    }
};

/**
 * ## Config params: 
 * `meta: 'site.url'` - (optional) will take prefix from metadata.site.url
 * `prefix: '/base/url'` - (optional) take prefix from config:
 * `selector: 'script'` - (optional, default: 'a') selector selects affected elements
 * `attr: 'src'` - (optional, default: 'href') attr with URL to modify
 * `span_currents: true` - (optional) will replace links to current page with <span> elements.
 * `is_current: function(current_url, url)` - (optional) will recognize if link is current
 * `transform: function` - (optional) transforms url
 * `links_class: 'a-link'` - css class of <a> links.
 * `spans_class: 'span-link'` - css class of spans which were links.
 * `all_links_class: 'all-link'` - css class of every link processed with plugin
 */
module.exports = function(config) {
    var config_arr = get_$().isArray(config) ? config : [config];

    return function hideshow(files, metalsmith, done) {
        for (var file in files) {
            var html = files[file].contents.toString()
            var $ = get_$(is_html(html) ? html : '<body>' + html + '</body>');

            for (var i = 0; i < config_arr.length; ++i) {
                var config_item = config_arr[i];
                var prefix = config_item.prefix
                          || config_item.meta && namespace(config_item.meta, metalsmith.metadata())
                          || '';
                var transform = config_item.transform || curry(default_transform, prefix);
                var add_classes1 = curry(add_classes,
                                         config_item.links_class,
                                         config_item.spans_class,
                                         config_item.all_links_class);
                var selector = config_item.selector || 'a';
                var attr = config_item.attr || 'href';
                var current_url = transform('/' + (files[file].path || file));
                var is_current = curry(config_item.is_current || default_is_current, current_url);
                prepare_links($, is_current, transform, add_classes1,
                                config_item.span_currents, selector, attr)
            }

            if (is_html(html)) {
                files[file].contents = $.get_doctype_string() + '<html>' + $('html').html() + '</html>\n'
            } else {
                files[file].contents = $('body').html();
            }
        }
        done();
    }
};








// ---- prototype:
//  (defn ^:export clone-with-tag
//   "Makes a copy of some HTML element but changes tag name.
//    Example:
//     (clone-with-tag
//      <span class='a'>foo<b>bar</b></span>
//      \"<div/>\")
//     returns:
//     <div class='a'>foo<b>bar</b></div>"
//   [elem tag]
//   (let [clone$ (jq/pure-$ tag)
//         clone (aget clone$ 0)
//         attrs (aget elem "attributes")
//         attrs-len (aget attrs "length")]

//     (.html clone$ (.html (jq/pure-$ elem)))

//     (doall (for [i (range attrs-len)]
//       (.setAttribute clone
//                      (aget (aget attrs i) "nodeName")
//                      (aget (aget attrs i) "nodeValue"))))

//     (aset (aget clone "style") "cssText" (aget (aget elem "style") "cssText"))
//     clone))



// (defn ^:export prepare-links
//   "Transform all links in html text.
//    For example, function transform may add prefixes to inner urls.
//    Then it replace all <a>-links by <span>-elements if that was a link
//    to current-url"
//   [html current? transform]
//   (let [div (jq/pure-$ "<div/>")
//         links (-> div
//                   (.html html)
//                   (.find "a"))]
//     (.replaceWith links
//       (fn [i] (this-as link
//         (let [link$ (jq/pure-$ link)
//               url (.attr link$ "href")
//               t-url (transform url)]
//           (if-not (current? t-url)
//             (do (.attr link$ "href" t-url)
//                 link)
//             (let [span (clone-with-tag link "<span/>")
//                   span$ (jq/pure-$ span)]
//               (.attr span$ "href" nil)
//               (.addClass span$ "omich-lib-html-util__span-link")
//               span)
//           ))
//       )))
//     (.html div)
//   ))
//   
// (defn ^:export get-current-url-pred [props]
//   (let [base-path (get-base-path props)
//         current-url (str base-path "/" (.-path props))]
//     (fn [url]
//       (or (= url current-url)
//           (= url (str current-url "/"))
//           (= url (str current-url "/index.html")))
//     )))





