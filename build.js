var fs = require("fs"),
    path = require('path'),
    requirejs = require('requirejs');

    fs.existsSync || (fs.existsSync = path.existsSync);

// Thanks to [liangzan's gist](https://gist.github.com/807712)
function rmdirSyncForce(path) {
    var files, file, fileStats, i, filesLength;
    if (path[path.length - 1] !== '/') {
        path = path + '/';
    }

    files = fs.readdirSync(path);
    filesLength = files.length;

    if (filesLength) {
        for (i = 0; i < filesLength; i += 1) {
            file = files[i];

            fileStats = fs.statSync(path + file);
            if (fileStats.isFile()) {
                fs.unlinkSync(path + file);
            }
            if (fileStats.isDirectory()) {
                rmdirSyncForce(path + file);
            }
        }
    }
    fs.rmdirSync(path);
}


var copyDirectory = function (srcDir, targetDir) {
    var subDirs = [];
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }
    var source, dest;
    fs.readdirSync(srcDir).forEach(function (name) {

        source = path.join(srcDir, name);
        dest = path.join(targetDir, name);
        var stat = fs.statSync(source);
        if (name.indexOf(".") !== 0) {
            if (stat.isDirectory()) {
                subDirs.push(name);
            } else if (stat.isFile() || stat.isSymbolicLink()) {
                var inStr = fs.createReadStream(source);
                var outStr = fs.createWriteStream(dest);

                inStr.pipe(outStr);
            }
        }
    });

    subDirs.forEach(function (dirName) {
        source = path.join(srcDir, dirName);
        dest = path.join(targetDir, dirName);

        copyDirectory(source, dest);
    });

};

var copySymLinkDirs = function(dir, targetDir){
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    var symDirs = [], file;
    fs.readdirSync(dir).forEach(function (name) {

        file = path.join(dir, name);
        var stat = fs.statSync(file);
        if (name.indexOf(".") !== 0) {
            if (stat.isDirectory() && stat.isSymbolicLink()) {
                symDirs.push(name);
            }
        }
    });

    symDirs.forEach(function(dirName){
        copyDirectory(path.join(dir,dirName),path.join(targetDir,dirName));
    });
};

var buildDir = 'public-build';
var buildDirPath = path.join(process.cwd(), buildDir);

// remove the build dir
if (path.existsSync(buildDirPath)) {
    rmdirSyncForce(buildDirPath);
}

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
                'js/plugins/json',
                'js/lib/parser',
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
                'xaml!app/module/Documentation'
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
    dir: buildDir,
    optimize: 'uglify',
    optimizeCss: "standard",
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
        beautify: false
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
        }
        return contents;
    },
    skipModuleInsertion: true,
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
    "xamlClasses": ["app/Index", "app/module/Disclaimer", "app/module/Documentation", "app/module/Home", "app/module/License", "app/module/Ui", "app/module/Wiki", "example/basic/App", "example/contact/App", "example/contact/view/Card", "example/todo/App", "example/window/CustomDialog", "js/ui/ButtonGroup", "js/ui/Checkbox", "js/ui/DataGrid", "js/ui/DataGridColumn", "js/ui/DataGridItemsView", "js/ui/Dialog", "js/ui/field/Password", "js/ui/field/RadioGroup", "js/ui/field/Text", "js/ui/Field", "js/ui/GalleryList", "js/ui/Link", "js/ui/MenuButton", "js/ui/Radio", "js/ui/Scrollable", "js/ui/ScrollView", "js/ui/SplitButton", "js/ui/TabView", "js/ui/TileList", "sprd/data/SprdApiDataSource", "sprd/view/ColorSelector", "sprd/view/DropDownSizeSelector", "sprd/view/Image", "sprd/view/ImageUpload", "sprd/view/ProductTypeViewSelector", "sprd/view/ProductViewSelector", "sprd/view/SimpleProductViewSelector", "sprd/view/SizeSelector"],

    logLevel: 0
};

global.libxml = require("libxml");

// start optimizing
requirejs.optimize(config, function (results) {
    console.log(results);
});