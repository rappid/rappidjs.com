define(["sprd/view/svg/ConfigurationRenderer"],function(e){return e.inherit("sprd.view.svg.DesignConfigurationRenderer",{defaults:{tagName:"image",href:"{url()}"},url:function(){if(this.$.imageService&&this.$.configuration&&this.$.configuration.$.design&&this.$.configuration.$.printColors){var e=Math.min(this.$._width,600),t={};return this.$.width>=this.$.height?t.width=e:t.height=e,t.printColors=this.$.configuration.getPrintColorsAsRGB(),this.$.imageService.designImage(this.$.configuration.$.design.$.wtfMbsId,t)}return null}.onChange("design","_width","_height").on(["configuration.printColors","reset"])})});