define(["xaml!js/ui/DataGridColumn","moment"],function(e,t){return e.inherit("js.ui.DataGridDateColumn",{defaults:{dateFormat:"MM-DD-YYYY",parseFormat:"YYYY-MM-DDTHH:mm:ssZ"},getFormatFnc:function(){if(!this.$formatFnc){var e=this;this.$formatFnc=function(n){return n?t(n).format(e.$.dateFormat):null}}return this.$formatFnc}})});