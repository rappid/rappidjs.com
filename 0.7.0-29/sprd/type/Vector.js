define(["js/core/Base"],function(e){var t=e.inherit("sprd.type.Vector",{ctor:function(e){this.components=e||[0,0,0]},distance:function(){return t.distance(this)},multiply:function(e){return e instanceof t?t.scalarProduct(this,e):t.multiply(this,e)},vectorProduct:function(e){return t.vectorProduct(this,e)},subtract:function(e){return t.subtract(this,e)}},{distance:function(e){e=t.getComponents(e);var n=0;for(var r=0;r<e.length;r++)n+=(e[r]||0)*(e[r]||0);return Math.sqrt(n)},subtract:function(e,n){e=t.getComponents(e),n=t.getComponents(n);var r=Math.max(e.length,n.length),i=[];for(var s=0;s<r;s++)i.push((e[s]||0)-(n[s]||0));return new t(i)},multiply:function(e,n){var r=t.clone(e),i=t.getComponents(e);for(var s=0;s<i.length;s++)i[s]=i[s]*n;return r},clone:function(e){return e instanceof t?new t(e.components.slice()):e.components.slice()},scalarProduct:function(e,n){return e=t.getComponents(e),n=t.getComponents(n),e[0]*n[0]+e[1]*n[1]+(e[2]||0)*(e[2]||0)},vectorProduct:function(e,n){return e=t.getComponents(e),n=t.getComponents(n),new t([e[1]*n[2]-e[2]*n[1],e[2]*n[0]-e[0]*n[2],e[0]*n[1]-e[1]*n[0]])},getComponents:function(e){return e instanceof t?e.components:e}});return t});