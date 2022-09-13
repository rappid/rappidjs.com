define(["sprd/manager/IDesignConfigurationManager","sprd/util/UnitUtil","sprd/model/Design","flow"],function(e,t,n,r){return e.inherit("sprd.manager.DesignConfigurationManager",{initializeConfiguration:function(e,i){var s=e.$$||{},o=s.design,u=s.svg,a=e.$.printType,f,l;if(u){var c;o&&o.href&&(c=o.href.split("/").pop()),c=c||u.image.designId,l=e.$context.$contextModel.$context.createEntity(n,c)}else l=e.$.design;r().par(function(e){l.fetch(null,e)},function(e){a.fetch(null,e)}).seq(function(){s.printArea?f=e.$context.$contextModel.$.productType.getPrintAreaById(s.printArea.$.id):f=e.$.printArea}).seq(function(){e.set({design:l,printArea:f})}).seq(function(){var t=e.$.printType,n=[],r=[],i=e.$.designColorRGBs,s=e.$.designColorIds,o=l.$.colors,a,f,c=!1,h;if(u){var p,d;u.image.hasOwnProperty("printColorIds")?(p="printColorIds",d="getPrintColorById"):(p="printColorRGBs",d="getClosestPrintColor");if(u.image[p]){a=u.image[p].split(" ");for(f=0;f<a.length;f++)n.push(t[d](a[f]));c=!0}}else if(s&&s.length){c=!0;for(f=0;f<s.length;f++){h=t.getPrintColorById(s[f]),n.push(h);if(!h){c=!1;break}}}else if(i&&i.length){c=!0;for(f=0;f<i.length;f++){h=t.getClosestPrintColor(i[f]),n.push(h);if(!h){c=!1;break}}}!c&&o&&(n=[],o.each(function(e){var i=t.getClosestPrintColor(e.$["default"]);n.push(i),r.push(i)}),e.$defaultPrintColors=r),e.$.printColors.reset(n)}).seq(function(){if(u){var n=t.convertSizeToMm(l.$.size,e.$.printType.$.dpi),r,i,s,o={scale:{x:u.image.width/n.$.width,y:u.image.height/n.$.height}},a=/^(\w+)\(([^(]+)\)/ig;while(r=a.exec(u.image.transform)){i=r[1],s=r[2].split(",");if(i==="rotate")o.rotation=parseFloat(s.shift());else if(i==="scale"){var f=s;o.scale.x*=f[0]<0?-1:1,o.scale.x*=f[1]<0?-1:1}}e.set(o)}}).exec(i)}})});