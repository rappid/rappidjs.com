define(["js/data/DataView","js/core/List","js/data/Collection","flow","underscore"],function(e,t,n,r,i){return e.inherit("js.data.PagedDataView",{ctor:function(){this.callBase(),this.$execId=0},defaults:{page:0,pageCount:null,baseList:null,pageSize:20},initialize:function(){this.set("list",new t),this.bind("baseList","add",this.hasNextPage.trigger),this.callBase()},_commitChangedAttributes:function(e){this.callBase(e);if(!e)return;if(e.hasOwnProperty("list")&&this.$initialized)throw"list cannot be set. It is readonly.";if(e.hasOwnProperty("baseList")){var r=e.baseList;if(!(!r||r instanceof t||r instanceof n))throw"baseList must be a List or a Collection";this.$.list.clear();var i=e.page||this.$.page;i&&this.showPage(i,null,!0)}e.hasOwnProperty("page")&&e.page&&!this.$loadingPage&&this.showPage(e.page,null,e.page!==this.$previousAttributes.page)},showPage:function(e,t,s){function u(e){t&&t(e),o.$loadingPage=!1}if(this.$loadingPage){t&&t();return}var o=this;if(this.hasPage(e)){this.$loadingPage=!0;var a;e=e||0,s=i.isUndefined(s)?!0:s;if(!this.$.baseList||!s&&e===this.$.page){u();return}var f=this.$.list,l=this.$.baseList;f.clear();var c=this.$.pageSize*e;if(l.$items.length>c)for(a=0;a<this.$.pageSize;a++)f.add(l.at(c+a));if(l instanceof n){var h=this.$.baseList.$.pageSize,p=this._itemIndexToPageIndex(this._pageIndexToItemIndex(e),h),d=this._itemIndexToPageIndex(this._pageIndexToItemIndex(e+1)-1,h),v={};for(a=p;a<=d;a++)v[a]=a;r().seq("execId",function(){return++o.$execId}).parEach(v,function(e,t){l.fetchPage(e,null,t)}).exec(function(t,n){if(!t&&n.execId==o.$execId){var r=[];for(a=p;a<=d;a++)r=r.concat(n[a].$items);var i=o._pageIndexToItemIndex(e,o.$.pageSize);i-=p*h,i<r.length&&(r=r.slice(i,i+o.$.pageSize),o.$.list.reset(r))}o.set("page",e),u(t)})}else o.set("page",e),u()}else u()},hasPreviousPage:function(){return this.$.page>0}.onChange("page"),hasPage:function(e){return this.$.baseList?this.$.baseList instanceof n?i.isUndefined(this.$.baseList.$.$itemsCount)||this.$.baseList.$.$itemsCount>e*this.$.pageSize:this.$.baseList.size()>e*this.$.pageSize:!1},hasNextPage:function(){return this.hasPage(this.$.page+1)}.onChange("page","pageSize","baseList"),previousPageIndex:function(){return Math.max((this.$.page||0)-1,0)}.onChange("page"),nextPageIndex:function(){return(this.$.page||0)+1}.onChange("page"),currentPageIndex:function(){return this.$.page||0}.onChange("page"),previousPage:function(e){this.showPage(this.previousPageIndex(),e)},nextPage:function(e){this.showPage(this.nextPageIndex(),e)},_pageIndexToItemIndex:function(e,t){return t=t||this.$.pageSize,e*t},_itemIndexToPageIndex:function(e,t){return t=t||this.$.pageSize,Math.floor(e/t)},destroy:function(){this.unbind("baseList","add",this.hasNextPage.trigger),this.callBase()}})});