define(["js/ui/View"],function(e){var t="auto",n="DOMMouseScroll",r="mousewheel",i,s,o,u=0,a=-1,f=1,l=2,c=4;return e.inherit("js.ui.ScrollViewClass",{$defaultContentName:"content",defaults:{verticalScroll:!0,horizontalScroll:!0,lockScrollDirection:!0,enableScroll:t,enablePointer:t,scrollTop:0,scrollLeft:0,restrictScrollToContainer:!1,syncToScrollPosition:!1,scrollContainerHeight:1116},ctor:function(){this.callBase(),this._initializeCapabilities(this.$stage.$window)},_initializeCapabilities:function(e){var t=this.runsInBrowser();this.has3d=t&&"WebKitCSSMatrix"in e&&"m11"in new WebKitCSSMatrix,this.hasTouch=t&&"ontouchstart"in e,this.$translateOpen="translate"+(this.has3d?"3d(":"("),this.$translateClose=this.has3d?",0)":")"},_commitChangedAttributes:function(e){if(e.hasOwnProperty("enableScroll")||e.hasOwnProperty("enablePointer"))this.$enableScroll=this.$.enableScroll===t&&!this.hasTouch||this.$.enableScroll,this.$enablePointer=this.$.enablePointer===t&&this.hasTouch||this.$.enablePointer||!this.$enableScroll,this.$enablePointer&&(i=this.hasTouch?"touchstart":"mousedown",s=this.hasTouch?"touchmove":"mousemove",o=this.hasTouch?"touchend":"mouseup"),this._registerEvents()},_initializeRenderer:function(e){this.$transformProperty=this._getTransformProperty(e);var t=/^(-[^-]+-)?/.exec(this.$transformProperty)[0];this.$translateDurationProperty=t+"transition-duration",this.$transitionTimingFunction=t+"transition-timing-function"},_getTransformProperty:function(e){var t=["-webkit-transform","-ms-transform","MozTransform","-o-transform"],n;while(n=t.shift())if(typeof e.style[n]!="undefined")return n},_stopScrolling:function(){var e=this.$stage.$window.getComputedStyle(this.$.container.$el)[this.$transformProperty],t=/^matrix\((.*)\)$/.exec(e),n;t?(n=t[1].split(","),this._setPosition(n[4],n[5])):this._setPosition(0,0)},_setPosition:function(e,t,n){return t=Math.min(0,Math.max(-this.$.scrollContainerHeight+this.$.height,t)),t===this.$y&&e===this.$x?!1:(this.$x=e,this.$y=t,this.$transformProperty&&this.$.container&&(n=n||0,this.$.container.$el.style[this.$translateDurationProperty]=n,this.$.container.$el.style[this.$transitionTimingFunction]="ease-out",this.$.container.$el.style[this.$transformProperty]=this.$translateOpen+e+"px,"+t+"px"+this.$translateClose),!0)},_commitScrollTop:function(e){this._setPosition(this.$x,e)},_commitScrollLeft:function(e){this._setPosition(e,this.$y)},_render:function(){this.callBase(),this._setPosition(0,0)},_renderAttribute:function(){this.callBase()},_isDOMNodeAttribute:function(e){return e!="scrollTop"&&e!="scrollLeft"&&this.callBase()},handleEvent:function(e){switch(e.type){case r:case n:this.$enableScroll&&this._onWheel(e);break;case i:this._down(e);break;case s:this._move(e);break;case o:this._end(e)}},_down:function(e){if(!this.$enablePointer)return;e.preventDefault(),e.stopPropagation(),this._stopScrolling(),this.$pointerStartX=this.$pointerX=this.hasTouch?e.changedTouches[0].pageX:e.pageX,this.$pointerStartY=this.$pointerY=this.hasTouch?e.changedTouches[0].pageY:e.pageY,this.$downX=this.$x,this.$downY=this.$y,this._setPosition(this.$x,this.$y),this.$moveDirection=a,this.$pointerTime=e.timeStamp},_move:function(e){if(!this.$enablePointer||!this.$moveDirection)return;this.$pointerX=this.hasTouch?e.changedTouches[0].pageX:e.pageX,this.$pointerY=this.hasTouch?e.changedTouches[0].pageY:e.pageY;var t=this.$pointerX-this.$pointerStartX,n=this.$pointerY-this.$pointerStartY,r=this.$.verticalScroll===!0,i=this.$.horizontalScroll===!0;this.$.lockScrollDirection&&r&&i&&(Math.abs(t)>Math.abs(n)?r=!1:i=!1);var s=this.$downX,o=this.$downY;r&&(o+=Math.floor(n)),i&&(s+=Math.floor(t)),this._setPosition(s,o),e.stopPropagation()},_end:function(e){if(!this.$enablePointer||!this.$moveDirection)return!1;var t=-1.1,n=(e.timeStamp-this.$pointerTime)/1e3,r=this.$pointerStartY-this.$pointerY,i=r<0?1:-1;r=Math.abs(r);var s=r/n,o=Math.abs(s/t),a=t/2*o*o/1e3;o/=2,a=Math.abs(a)*i,console.log(s,a,o),this._setPosition(this.$x,this.$y+a,Math.round(o)+"ms"),this.$moveDirection=u},_bindDomEvents:function(){this.callBase(),this._registerEvents()},_registerEvents:function(){var e=this.$el;if(!e||!this.runsInBrowser())return;if(this.$enableScroll){if(this.$scrollBound)return;this.$stage.$document.attachEvent||"onmousewheel"in e?this.bindDomEvent(r,this):this.bindDomEvent(n,this),this.$scrollBound=!0}else{if(!this.$pointerBound)return;this.$stage.$document.attachEvent||"onmousewheel"in e?this.unbindDomEvent(r,this):this.unbindDomEvent(n,this),this.$scrollBound=!1}if(this.$enablePointer){if(this.$pointerBound)return;this.bindDomEvent(i,this),this.bindDomEvent(s,this),this.dom(this.$stage.$window).bindDomEvent(o,this),this.$pointerBound=!0}else{if(!this.$pointerBound)return;this.unbindDomEvent(i,this),this.unbindDomEvent(s,this),this.unbindDomEvent(o,this),this.$pointerBound=!1}},_onWheel:function(e){e=e||window.event;var t=0,n=0;if(e.wheelDeltaX||e.wheelDeltaY)e.wheelDeltaX&&(t=e.wheelDeltaX),e.wheelDeltaY&&(n=e.wheelDeltaY);else{var r=e.detail?e.detail*-3:e.wheelDelta;e.axis&&e.axis==1?t=r:n=r}var i=this.$.verticalScroll===!0,s=this.$.horizontalScroll===!0;this.$.lockScrollDirection&&i&&s&&(Math.abs(t)>Math.abs(n)?i=!1:s=!1);var o=!1;if(i){var u=this.$y,a=u+Math.floor(n);o=this._setPosition(this.$x,a)}(o||this.$.restrictScrollToContainer)&&e.preventDefault()}})});