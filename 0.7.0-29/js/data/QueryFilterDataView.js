define(["js/data/FilterView","js/data/Query"],function(e,t){return e.inherit("js.data.QueryDataView",{defaults:{query:null},_filterItem:function(e,n){var r=this.$.query;return r?t.ArrayExecutor._filterItem(e,r.where)==1:!0}})});