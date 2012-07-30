var requirejs = require('requirejs');

var Rewrite = function (from, to) {
    this.$from = from;
    this.$to = to;
};

var config = {
    baseUrl: './public',
    modules: [
        {
            name: 'app/Index',
            create: true,
            include: [
                'rAppid',
                'inherit',
                'flow',
                'underscore',
                'js/lib/parser',
                'js/plugins/json',
                'js/core/Bus',
                'js/core/Stage',
                'js/core/WindowManager',
                'js/core/HeadManager',
                'js/core/Injection',
                'xaml!app/Index'
            ]
        },
        {
            name: 'app/module/Home',
            create: true,
            include: [
                'xaml!app/module/Home'
            ],
            exclude: [
                'app/Index'
            ]
        }
        ,{
            name: 'app/module/Documentation',
            create: true,
            include: [
                'xaml!app/module/Documentation',
                'js/data/RestDataSource',
                'js/data/FilterDataView',
                'js/data/Model'
            ],
            exclude: [
                'app/Index'
            ]
        },
        {
            name: 'app/module/Ui',
            create: true,
            include: [
                'xaml!app/module/Ui'
            ],
            exclude: [
                'app/Index'
            ]
        },
        {
            name: 'app/module/License',
            create: true,
            include: [
                'xaml!app/module/License'
            ],
            exclude: [
                'app/Index'
            ]
        },
        {
            name: 'app/module/Disclaimer',
            create: true,
            include: [
                'xaml!app/module/Disclaimer'
            ],
            exclude: [
                'app/Index'
            ]
        },
        {
            name: 'app/module/Wiki',
            create: true,
            include: [
                'xaml!app/module/Wiki'
            ],
            exclude: [
                'app/Index'
            ]
        }
    ],
    dir: 'public-build',
    optimize: 'none',
    nodeRequire: require,
    findNestedDependencies: false,
    optimizeAllPluginResources: true,
    preserveLicenseComments: false,
    //If using UglifyJS for script optimization, these config options can be
    //used to pass configuration values to UglifyJS.
    //See https://github.com/mishoo/UglifyJS for the possible values.
    uglify: {
        toplevel: true,
        ascii_only: true,
        beautify: true
    },
    "paths": {
        "rAppid" : "js/lib/rAppid",
        "text" : 'js/plugins/text',
        "xaml": "js/plugins/xaml",
        "json": "js/plugins/json",
        "raw": "js/plugins/raw",
        "flow": "js/lib/flow",
        "inherit": "js/lib/inherit",
        "underscore": "js/lib/underscore",
        "JSON": "js/lib/JSON"
    },
    onBuildRead: function (moduleName, path, contents) {

        if(moduleName == "rAppid"){
            // remove defines, because we don't want dep tracing
            contents = contents.replace(/define/g,'EMPTYDEFINE');
        }
        return contents;
    },
    onBuildWrite: function (moduleName, path, contents) {
        if (moduleName == "inherit") {
            contents = "define('inherit', function () { "+ contents + "; return inherit; });"
        } else if (moduleName == "underscore") {
            contents = "define('underscore', function () { " + contents + "; return _; });"
        } else if (moduleName == "flow") {
            contents = "define('flow', function () { " + contents + "; return flow; });"
        } else if (moduleName == "js/lib/parser") {
            contents = "define('js/lib/parser', function () { "+ contents + "; return this.parser; });"
        } else if (moduleName == "app/lib/highlight/highlight") {
            contents = "define('app/lib/highlight/highlight', function() { " + contents + "; return hljs; });"
        } else if(moduleName == "rAppid"){
            // rollback content changes
            contents = contents.replace(/EMPTYDEFINE/g, 'define');
            contents += "define('rAppid', function() { return rAppid; });"
        }
        return contents;
    },
    skipModuleInsertion: false,
    namespaceMap: {
        "http://www.w3.org/1999/xhtml": "js.html"
    },
    rewriteMap: [
        new Rewrite(/^js\/html\/(a)$/, "js/html/a"),
        new Rewrite(/^js\/html\/(input)$/, "js/html/Input"),
        new Rewrite(/^js\/html\/(select)$/, "js/html/Select"),
        new Rewrite(/^js\/html\/(textarea)$/, "js/html/TextArea"),
        new Rewrite(/^js\/html\/(option)$/, "js/html/Option"),
        new Rewrite(/^js\/html\/(.+)$/, "js/html/HtmlElement")
    ],
    xamlClasses: [
        "example/basic/App",
        "example/contact/App",
        "example/contact/view/Card",
        "example/todo/App",
        "js/ui/ButtonGroup",
        "js/ui/Checkbox",
        "js/ui/Radio",
        'js/ui/Field',
        "js/ui/Link",
        "js/ui/MenuButton",
        "js/ui/ScrollView",
        "js/ui/SplitButton",
        "js/ui/TabView"],

    logLevel: 0
};

global.libxml = require("libxml");

requirejs.optimize(config, function (results) {
    console.log(results);
});
