define(['js/core/Module', "json!doc/index.json", "js/core/List", "documentation/model/Class", "underscore", "js/core/Bindable"], function (Module, classIndex, List, Class, _, Bindable) {

    return Module.inherit("app.module.DocumentationClass", {

        defaults: {
            classes: List,
            packages: List,
            doc: null,
            searchString: ""
        },

        showTypes: function (showPublic, showProtected) {

            var type = (showPublic ? 2 : 0) + (showProtected ? 1 : 0);

            return ['', 'protected', 'public', 'all'][type];
        },

        _insertInPackageTree: function (parts, node, id) {
            if (parts.length > 0) {
                var packageName = parts[0];

                if (/^[a-z]/.test(packageName)) {
                    var tree = node[packageName];
                    if (!tree) {
                        tree = {};
                        node[packageName] = tree;
                    }

                    parts.shift();

                    this._insertInPackageTree(parts, tree, id);
                } else {
                    if (!node.children) {
                        node.children = [];
                    }
                    node.children.push({
                        id: id,
                        name: parts.join(".")
                    });
                }

            }
        },

        _buildTree: function (hash, list) {
            if (hash.children) {
                var child;
                for (var i = 0; i < hash.children.length; i++) {
                    child = this.$.api.createEntity(Class, hash.children[i].id);
                    child.set('name', hash.children[i].name);
                    list.add(child);
                }
            } else {
                var pack;
                for (var key in hash) {
                    if (hash.hasOwnProperty(key)) {
                        pack = new Bindable({
                            label: key,
                            children: new List()
                        });
                        list.add(
                            pack
                        );

                        this._buildTree(hash[key], pack.$.children);
                    }
                }
            }

        },

        _initializationComplete: function () {
            var path,
                className,
                hashTree = {};

            for (var i = 0; i < classIndex.length; i++) {
                path = classIndex[i].split(".");

                this._insertInPackageTree(path, hashTree, classIndex[i]);
            }

            this._buildTree(hashTree, this.$.packages);

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

        title: function (className) {
            return (className ? className + " - " : "") + 'API Reference - rAppid.js';
        },

        showClass: function (routeContext, fqClassName) {

            var self = this;
            this.set('doc', null);
            this.$.api.createEntity(Class, fqClassName).fetch(null, function (err, classDoc) {

                self.set('doc', err ? null : classDoc);
                routeContext.callback(err);

                if (self.runsInBrowser()) {
                    window.scrollTo(window.scrollX, 0);
                }
            })

        }.async(),

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