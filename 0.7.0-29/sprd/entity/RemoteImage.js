define(["sprd/entity/Image","underscore"],function(e,t){return e.inherit("sprd.entity.RemoteImage",{schema:{src:Object},_commitSrc:function(e){if(e&&!this.$.name){var t=/\/(.+?)$/.exec(e);t&&this.set("name",t[1])}}})});