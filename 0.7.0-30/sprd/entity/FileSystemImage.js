define(["sprd/entity/Image","underscore"],function(e,t){return e.inherit("sprd.entity.FileSystemImage",{defaults:{file:null,src:null},schema:{file:Object},ctor:function(e){e=e||{};var n=e.file;n&&t.defaults(e,{name:n.name,lastModifiedDate:n.lastModifiedDate,type:n.type,size:n.size}),this.callBase(e)}})});