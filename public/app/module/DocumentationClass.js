define(['js/core/Module', "json!doc/index.json", "js/core/List", "documentation/model/Class", "documentation/model/Package", "underscore", "js/core/Bindable", "js/ui/tree/TreeNode", "flow"], function (Module, docIndex, List, Class, Package, _, Bindable, TreeNode, flow) {

    var packageTreeCache = {};

    return Module.inherit("app.module.DocumentationClass", {

        defaults: {
            classes: List,
            packages: List,
            packageTree: null,
            doc: null,
            searchString: "",

            externalDocumentationSrc: null,
            currentView: null,

            /***
             * the module to show documentation about
             */
            module: null,

            /***
             * @codeBehind
             */
            moduleView: null,

            /***
             * @codeBehind
             */
            documentationView: null,

            /***
             * @codeBehind
             */
            externalDocumentationView: null,

            selectedNode: null
        },

        _isCurrentView: function (view) {
            return this.$.currentView === view;
        }.onChange("currentView"),

        showTypes: function (showPublic, showProtected) {

            var type = (showPublic ? 2 : 0) + (showProtected ? 1 : 0);

            return ['', 'protected', 'public', 'all'][type];
        },

        _insertInPackageTree: function (parts, node, element) {
            if (parts.length > 0) {
                var packageName = parts[0];

                if (/^[a-z]/.test(packageName)) {
                    var tree = node[packageName];
                    if (!tree) {
                        tree = {};
                        node[packageName] = tree;
                    }

                    parts.shift();

                    this._insertInPackageTree(parts, tree, element);
                } else {
                    if (!node.children) {
                        node.children = [];
                    }
                    node.children.push({
                        element: element,
                        name: parts.join(".")
                    });
                }

            }
        },

        _buildTree: function (hash, tree) {
            var pack;
            for (var key in hash) {
                if (hash.hasOwnProperty(key) && key != "children") {
                    pack = new TreeNode({
                        data: new Bindable({
                            id: key
                        })
                    });
                    tree.addChild(
                        pack
                    );

                    this._buildTree(hash[key], pack);
                }
            }
            if (hash.children) {
                var cls;
                for (var i = 0; i < hash.children.length; i++) {

                    tree.addChild(new TreeNode({
                        isLeaf: true,
                        data: hash.children[i].element
                    }));
                }
            }


        },

        _initializationComplete: function () {

            if (!this.runsInBrowser()) {
                var checked = {
                    checked: true
                };

                this.$.showPublic.set(checked);
                this.$.showProtected.set(checked);

                this.$.showPublicStatic.set(checked);
                this.$.showProtectedStatic.set(checked);

                this.$.publicAttributesCheckbox.set(checked);
                this.$.protectedAttributesCheckbox.set(checked);

            }

            this.callBase();
        },

        initialize: function () {
            this.set('filterDocs', function (doc, index, filterList) {
                return !filterList.$.searchString || doc.$.id.toLowerCase().indexOf(filterList.$.searchString.toLowerCase()) > -1;
            });
        },

        hasCurrentDocumentation: function () {
            return !!this.$.doc;
        }.onChange('doc'),

        hasSection: function (what) {

            var doc = this.$.doc;

            if (what && doc && doc.$.hasOwnProperty(what)) {
                var value = doc.$[what];

                if (value instanceof List) {
                    return value.size() > 0;
                } else if (_.isObject(value)) {
                    return _.keys(value) > 0;
                } else if (_.isArray(value)) {
                    return value.length > 0;
                }
            }

            return false;

        }.onChange('doc'),

        labelForNode: function (node) {
            if (node.$.isLeaf) {
                return node.get("data").className();
            } else {
                return node.get('data.id');
            }
        },

        hrefForNode: function (node) {
            if (node.$.isLeaf) {
                return "api/" + node.get("data").$context.$contextModel.$.id + "/" + node.get('data.id');
            } else {
                return null;
            }
        },

        iconClassForNode: function (node, expanded) {
            if (node.$.isLeaf) {
                return "file";
            } else {
                if (expanded) {
                    return "folder-open";
                } else {
                    return "folder-close";
                }
            }
        },

        title: function (className) {
            return (className ? className + " - " : "") + 'API Reference - rAppid.js';
        },

        loadedInIFrame: function (e) {
            clearTimeout(this.$iFrameTimeout);
        },

        defaultRoute: function (routeContext) {
            this.showClass(routeContext);
        }.async(),

        _showExternalDocumentation: function (externalDocumentation) {

            var url;

            if (_.isString(externalDocumentation)) {
                url = externalDocumentation;
            } else {
                url = externalDocumentation.url;
            }

            this.set({
                externalDocumentationSrc: url,
                currentView: this.$.externalDocumentationView
            });

            if (this.runsInBrowser()) {
                this.$iFrameTimeout = setTimeout(function () {
                    window.location = url;
                }, 3000);
            }

        },

        showClass: function (routeContext, module, fqClassName) {

            var self = this;
            docIndex.externalDocumentation = docIndex.externalDocumentation || {};

            if (!module && docIndex.externalDocumentation.hasOwnProperty(fqClassName)) {
                // external documentation
                this._showExternalDocumentation(docIndex.externalDocumentation[fqClassName]);
                routeContext.callback();
            } else {

                if (!module && !/\./.test(fqClassName)) {
                    module = fqClassName;
                    fqClassName = null;
                }

                var moduleId = module = module || "rappid";
                module = docIndex.packages[module];

                if (!module) {
                    var message = "Module not found";
                    console.log(message);
                    routeContext.callback(message);
                    return;
                }

                var modules = [];

                flow()
                    .seq("module", function (cb) {
                        var m = self.$.api.createEntity(Package, moduleId);
                        _.defaults(m.$, module);

                        modules.push(m);

                        m.fetch(null, cb);
                    })
                    .seq(function (done) {
                        flow()
                            .seqEach(this.vars.module.$.dependencies,function (module, cb) {
                                var m = self.$.api.createEntity(Package, module);
                                _.defaults(m.$, module);

                                modules.push(m);

                                m.fetch(null, cb);
                            }).
                            exec(done);
                    })
                    .seq(function () {
                        var path,
                            hashTree = {},
                            tree;

                        for (var i = 0; i < modules.length; i++) {
                            var module = modules[i];
                            if (!packageTreeCache[module.$.id]) {
                                module.$.classes.each(function (cls) {
                                    path = cls.$.id.split(".");
                                    self._insertInPackageTree(path, hashTree, cls);
                                });
                                // build tree
                                tree = new TreeNode({
                                    isRoot: true,
                                    expanded: true
                                });
                                self._buildTree(hashTree, tree);
                                packageTreeCache[module.$.id] = tree;
                            } else {
                                tree = packageTreeCache[module.$.id];
                            }
                        }

                        self.set('packageTree', tree);
                    })
                    .seq("doc", function (cb) {
                        if (fqClassName) {
                            this.vars.module.$.classes.createItem(fqClassName).fetch(null, cb);
                        } else {
                            cb();
                        }
                    })
                    .exec(function (err, results) {

                        if (!err) {
                            if (results.doc) {
                                var currentNode = self.$.packageTree,
                                    packages = results.doc.$.package.split("."),
                                    currentPackage;

                                while (packages.length) {
                                    currentPackage = packages.shift();
                                    currentNode.$.childNodes.each(function (child) {
                                        if (child.$.data.$.id === currentPackage) {
                                            currentNode = child;
                                            this["break"]();
                                        }
                                    });
                                }

                                if (currentNode) {
                                    currentNode.$.childNodes.each(function (child) {
                                        if (child.$.data === results.doc) {
                                            currentNode = child;
                                            this["break"]();
                                        }
                                    })
                                }

                                self.set({
                                    selectedNode: currentNode,
                                    doc: results.doc,
                                    currentView: self.$.documentationView
                                });
                            } else {

                                self.set({
                                    doc: null,
                                    module: results.module,
                                    currentView: self.$.moduleView
                                });
                            }
                        }

                        if (self.runsInBrowser()) {
                            window.scrollTo(window.scrollX, 0);
                        } else {
                            console.error(err);
                        }

                        routeContext.callback(err);
                    });

            }

        }.async(),

        getDocumentationLink: function(fqClassName) {

            if (!fqClassName) {
                return null;
            }

            var rootPackage = fqClassName.split(".").shift();

            // search root package in doc Index
            var packages = docIndex.packages;
            for (var packageName in packages) {
                if (packages.hasOwnProperty(packageName)) {
                    if (_.indexOf(packages[packageName].exports || [], rootPackage) !== -1) {
                        break;
                    }
                }
            }

            if (packageName) {
                if (packageName === "rappid") {
                    return "api/" + fqClassName;
                } else {
                    return "api/" + packageName + "/" + fqClassName;
                }
            }

            if (this.isNodeModule(path)) {
                return "http://nodejs.org/api/" + path + ".html";
            } else {
                return "api/" + fqClassName;
            }

        },

        isMethodVisible: function (method, type, showInherit) {
            if (method.$.name === 'ctor') {
                return false;
            }

            if ((type === 'all' || type === method.$.visibility)) {
                if (showInherit || (!showInherit && !method.$.hasOwnProperty('definedBy'))) {
                    return true;
                }
            }

            return false;

        }
    });
});