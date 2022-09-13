define(["js/core/Component"],function(e){return e.inherit("sprd.util.LocaleService",{defaults:{fallbackLanguage:"en",fallbackCountry:"EU",supportedLanguages:null,supportedCountries:null},$languageMap:{de:"de",fr:"fr","co.uk":"en",be:"nl",dk:"dk",es:"es",ie:"en",it:"it",nl:"nl",no:"no",pl:"pl",fi:"fi",se:"se",at:"de",net:null,com:null},$countryMap:{de:"DE",fr:"FR","co.uk":"GB",be:"BE",dk:"DK",es:"ES",ie:"IE",it:"IT",nl:"NL",no:"NO",pl:"PL",fi:"FI",se:"SE",at:"AT",net:"EU",com:"US"},getLanguage:function(){var e=(navigator.language||navigator.browserLanguage||navigator.systemLanguage||navigator.userLanguage).split("-")[0];return this.determinateLanguage(this.getHost(),e,this.$.supportedLanguages,this.$.fallbackLanguage)},getCountry:function(){return this.determinateCountry(this.getHost(),this.$.supportedCountries,this.$.fallbackCountry)},getHost:function(){return this.runsInBrowser()?this.$stage.$window.location.host:null},getLocale:function(){return this.getLanguage()+"_"+this.getCountry()},determinateLanguage:function(e,t,n,r){r=r||"en",n&&!(n instanceof Array)&&(n=(n||"").split(";"));var i;if(e){var s=/\.([a-z]{2,4})$/.exec(e);s&&(i=this.$languageMap[s[1]]),i=i||t}i=i||t;for(var o in this.$languageMap)if(this.$languageMap.hasOwnProperty(o)&&o&&o===this.$languageMap[o]&&(!n||n[o]))return i;return r},determinateCountry:function(e,t,n){n=n||"EU",t&&!(t instanceof Array)&&(t=(t||"").split(";"));var r;if(e){var i=/\.([a-z]{2,4})$/.exec(e);i&&(r=this.$countryMap[i[1]])}for(var s in this.$countryMap)if(this.$countryMap.hasOwnProperty(s)&&s&&s===this.$countryMap[s]&&(!t||t[s]))return r;return n}})});