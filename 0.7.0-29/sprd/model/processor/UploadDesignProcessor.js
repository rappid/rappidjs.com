define(["js/data/DataSource"],function(e){return e.Processor.inherit("sprd.model.processor.UploadDesignProcessor",{_getCompositionValue:function(e,t,n,r){return typeof File!="undefined"&&e instanceof File?e:this.callBase()}})});