define(["js/core/Bindable"],function(e){var t={ERROR:"error",LOADING:"loading",LOADED:"loaded",NONE:"none"},n=e.inherit("sprd.type.UploadDesign",{defaults:{design:null,image:null,uploadProgress:0,state:t.NONE}});return n.State=t,n});