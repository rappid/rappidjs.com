define(["js/data/validator/Validator","underscore"],function(e,t){return e.inherit("js.data.validator.RegExValidator",{defaults:{errorCode:"regExError",regEx:null},ctor:function(){var e=this.callBase();if(!this.$.regEx)throw new Error("No regular expression defined!");return e},_generateCacheKey:function(e,t){return null},_validate:function(e,n){var r=e.$[this.$.field],i=e.schema[this.$.field],s=i?i.required:!0;if(t.isString(r)&&(s&&r.length||!s)&&!this.$.regEx.test(r))return this._createFieldError()}})});