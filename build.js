var requirejs = require('requirejs');

var Rewrite = function (from, to) {
    this.$from = from;
    this.$to = to;
};

var config = {
    baseUrl:'./public',
    modules:[
        {
            name:'xaml!app/Index',
            include:[
                'js/lib/require.js', // require js
                'js/lib/rAppid', // rappid js
                "xaml","json","raw", // plugins
                "app/IndexClass", // important for parent xaml class, TODO: should not be needed
                "xaml!app/module/Home",
                "xaml!example/todo/App",
                "xaml!example/contact/App",
                "xaml!example/basic/App"
            ],
			exclude: ['JSON']
        }
    ],
    out:'public/package/rappidjs.min.js',
    optimize:'uglify',
    nodeRequire:require,
    findNestedDependencies:false,
    optimizeAllPluginResources:true,
	preserveLicenseComments: true,
    //If using UglifyJS for script optimization, these config options can be
    //used to pass configuration values to UglifyJS.
    //See https://github.com/mishoo/UglifyJS for the possible values.
    uglify:{
        toplevel:true,
        ascii_only:true,
        beautify:false		
    },
    "paths": {
	        "xaml": "js/plugins/xaml",
	        "json": "js/plugins/json",
	        "raw": "js/plugins/raw",
	        "flow": "js/lib/flow",
	        "inherit": "js/lib/inherit",
	        "underscore": "js/lib/underscore",
	        "JSON": "js/lib/json2"
	},
	onBuildWrite: function(moduleName, path, contents){
		if(moduleName == "inherit") {
			contents += "define('inherit', function () { return inherit; });"
		} else if(moduleName == "underscore") {
			contents += "define('underscore', function () { return _; });"
		} else if(moduleName == "flow") {
			contents += "define('flow', function () { return flow; });"
        } else if(moduleName == "js/lib/parser") {
			contents += "define('js/lib/parser', function () { return exports.parser; });"
		} else if(moduleName == "JSON") {
			contents += "define('JSON', function () { return JSON; });"
		} else if(moduleName == "app/lib/highlight/highlight"){
            contents += "define('app/lib/highlight/highlight', function() { return hljs; });"
        }
		return contents;
	},
    namespaceMap:{
        "http://www.w3.org/1999/xhtml":"js.html"
    },
    rewriteMap:[
        new Rewrite(/^js\/html\/(a)$/, "js/html/a"),
		            new Rewrite(/^js\/html\/(input)$/, "js/html/Input"),
		            new Rewrite(/^js\/html\/(select)$/, "js/html/Select"),
		            new Rewrite(/^js\/html\/(textarea)$/, "js/html/TextArea"),
		            new Rewrite(/^js\/html\/(option)$/, "js/html/Option"),
		            new Rewrite(/^js\/html\/(.+)$/, "js/html/HtmlElement")
    ],
    xamlClasses: ["app/Index","example/basic/App", "example/contact/App", "example/contact/view/Card", "example/todo/App", "js/ui/ButtonGroup", "js/ui/Link", "js/ui/MenuButton", "js/ui/ScrollView", "js/ui/SplitButton", "js/ui/TabView"]
};

global.libxml = require("libxml");

requirejs.optimize(config, function (results) {
    console.log(results);
});
