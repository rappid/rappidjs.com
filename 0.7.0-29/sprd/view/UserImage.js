define(["xaml!sprd/view/Image","sprd/data/ImageService"],function(e,t){return e.inherit("sprd.view.UserImage",{defaults:{user:null},inject:{imageService:t},_commitChangedAttributes:function(e){this.callBase(),e.hasOwnProperty("user")&&this.set("loaded",!1)},imageUrl:function(){var e=null,t=this.$.imageService;if(this.$.user){var n=this.$.user;return e=t.$.endPoint+"/users/"+n.$.id,e=this.extendUrlWithSizes(e),e}return e}.onChange("user")})});