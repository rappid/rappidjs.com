define("app/module/WikiClass",["js/core/Module"],function(e){var t=/\[{2}(.+?)\]{2}/gi,n=/\]\((.+?)\)/gi;return e.inherit("app.module.WikiClass",{defaults:{text:""},defaultRoute:function(e){e.navigate("wiki/Home")}.async(),showPage:function(e,r){var i=decodeURIComponent("/wiki/"+r+".md"),s=this;i=i.replace("%20","-"),this.$stage.$applicationContext.ajax(i,null,function(i,o){if(!!i||o.status!==200&&o.status!==304)r!=="Home"?e.navigate("wiki/Home",!1):e.callback(i);else{var u=o.responses.text;u=u.replace(t,"[$1](#/wiki/$1)"),u=u.replace(n,function(e){return e.replace(/\s/g,"-")}),s.set("text",u),e.callback()}})}.async()})}),define("md/lib/marked",function(){return function(){function n(e,n){return e[0][0]!=="!"?'<a href="'+f(n.href)+'"'+(n.title?' title="'+f(n.title)+'"':"")+">"+t.lexer(e[1])+"</a>":'<img src="'+f(n.href)+'" alt="'+f(e[1])+'"'+(n.title?' title="'+f(n.title)+'"':"")+">"}function s(){return i=r.pop()}function o(){switch(i.type){case"space":return"";case"hr":return"<hr>\n";case"heading":return"<h"+i.depth+">"+t.lexer(i.text)+"</h"+i.depth+">\n";case"code":return v.highlight&&(i.code=v.highlight(i.text,i.lang),i.code!=null&&i.code!==i.text&&(i.escaped=!0,i.text=i.code)),i.escaped||(i.text=f(i.text,!0)),"<pre><code"+(i.lang?' class="lang-'+i.lang+'"':"")+">"+i.text+"</code></pre>\n";case"blockquote_start":var e="";while(s().type!=="blockquote_end")e+=o();return"<blockquote>\n"+e+"</blockquote>\n";case"list_start":var n=i.ordered?"ol":"ul",e="";while(s().type!=="list_end")e+=o();return"<"+n+">\n"+e+"</"+n+">\n";case"list_item_start":var e="";while(s().type!=="list_item_end")e+=i.type==="text"?u():o();return"<li>"+e+"</li>\n";case"loose_item_start":var e="";while(s().type!=="list_item_end")e+=o();return"<li>"+e+"</li>\n";case"html":return v.sanitize?t.lexer(i.text):!i.pre&&!v.pedantic?t.lexer(i.text):i.text;case"paragraph":return"<p>"+t.lexer(i.text)+"</p>\n";case"text":return"<p>"+u()+"</p>\n"}}function u(){var e=i.text,n;while((n=r[r.length-1])&&n.type==="text")e+="\n"+s().text;return t.lexer(e)}function a(e){r=e.reverse();var t="";while(s())t+=o();return r=null,i=null,t}function f(e,t){return e.replace(t?/&/g:/&(?!#?\w+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function l(e){var t="",n=e.length,r=0,i;for(;r<n;r++)i=e.charCodeAt(r),Math.random()>.5&&(i="x"+i.toString(16)),t+="&#"+i+";";return t}function c(){var e="(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b";return e}function h(e,t){return e=e.source,t=t||"",function n(r,i){return r?(e=e.replace(r,i.source||i),n):new RegExp(e,t)}}function p(){}function d(t,n){return g(n),a(e.lexer(t))}function g(n){n||(n=m);if(v===n)return;v=n,v.gfm?(e.fences=e.gfm.fences,e.paragraph=e.gfm.paragraph,t.text=t.gfm.text,t.url=t.gfm.url):(e.fences=e.normal.fences,e.paragraph=e.normal.paragraph,t.text=t.normal.text,t.url=t.normal.url),v.pedantic?(t.em=t.pedantic.em,t.strong=t.pedantic.strong):(t.em=t.normal.em,t.strong=t.normal.strong)}var e={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:p,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,lheading:/^([^\n]+)\n *(=|-){3,} *\n*/,blockquote:/^( *>[^\n]+(\n[^\n]+)*\n*)+/,list:/^( *)(bull) [^\0]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,def:/^ *\[([^\]]+)\]: *([^\s]+)(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,paragraph:/^([^\n]+\n?(?!body))+\n*/,text:/^[^\n]+/};e.bullet=/(?:[*+-]|\d+\.)/,e.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,e.item=h(e.item,"gm")(/bull/g,e.bullet)(),e.list=h(e.list)(/bull/g,e.bullet)("hr",/\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)(),e.html=h(e.html)("comment",/<!--[^\0]*?-->/)("closed",/<(tag)[^\0]+?<\/\1>/)("closing",/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g,c())(),e.paragraph=function(){var t=e.paragraph.source,n=[];return function r(t){return t=e[t]?e[t].source:t,n.push(t.replace(/(^|[^\[])\^/g,"$1")),r}("hr")("heading")("lheading")("blockquote")("<"+c())("def"),new RegExp(t.replace("body",n.join("|")))}(),e.normal={fences:e.fences,paragraph:e.paragraph},e.gfm={fences:/^ *``` *(\w+)? *\n([^\0]+?)\s*``` *(?:\n+|$)/,paragraph:/^/},e.gfm.paragraph=h(e.paragraph)("(?!","(?!"+e.gfm.fences.source.replace(/(^|[^\[])\^/g,"$1")+"|")(),e.lexer=function(t){var n=[];return n.links={},t=t.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    "),e.token(t,n,!0)},e.token=function(t,n,r){var t=t.replace(/^ +$/gm,""),i,s,o,u,a,f,l;while(t){if(o=e.newline.exec(t))t=t.substring(o[0].length),o[0].length>1&&n.push({type:"space"});if(o=e.code.exec(t)){t=t.substring(o[0].length),o=o[0].replace(/^ {4}/gm,""),n.push({type:"code",text:v.pedantic?o:o.replace(/\n+$/,"")});continue}if(o=e.fences.exec(t)){t=t.substring(o[0].length),n.push({type:"code",lang:o[1],text:o[2]});continue}if(o=e.heading.exec(t)){t=t.substring(o[0].length),n.push({type:"heading",depth:o[1].length,text:o[2]});continue}if(o=e.lheading.exec(t)){t=t.substring(o[0].length),n.push({type:"heading",depth:o[2]==="="?1:2,text:o[1]});continue}if(o=e.hr.exec(t)){t=t.substring(o[0].length),n.push({type:"hr"});continue}if(o=e.blockquote.exec(t)){t=t.substring(o[0].length),n.push({type:"blockquote_start"}),o=o[0].replace(/^ *> ?/gm,""),e.token(o,n,r),n.push({type:"blockquote_end"});continue}if(o=e.list.exec(t)){t=t.substring(o[0].length),n.push({type:"list_start",ordered:isFinite(o[2])}),o=o[0].match(e.item),i=!1,l=o.length,f=0;for(;f<l;f++)u=o[f],a=u.length,u=u.replace(/^ *([*+-]|\d+\.) +/,""),~u.indexOf("\n ")&&(a-=u.length,u=v.pedantic?u.replace(/^ {1,4}/gm,""):u.replace(new RegExp("^ {1,"+a+"}","gm"),"")),s=i||/\n\n(?!\s*$)/.test(u),f!==l-1&&(i=u[u.length-1]==="\n",s||(s=i)),n.push({type:s?"loose_item_start":"list_item_start"}),e.token(u,n),n.push({type:"list_item_end"});n.push({type:"list_end"});continue}if(o=e.html.exec(t)){t=t.substring(o[0].length),n.push({type:"html",pre:o[1]==="pre",text:o[0]});continue}if(r&&(o=e.def.exec(t))){t=t.substring(o[0].length),n.links[o[1].toLowerCase()]={href:o[2],title:o[3]};continue}if(r&&(o=e.paragraph.exec(t))){t=t.substring(o[0].length),n.push({type:"paragraph",text:o[0]});continue}if(o=e.text.exec(t)){t=t.substring(o[0].length),n.push({type:"text",text:o[0]});continue}}return n};var t={escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:p,tag:/^<!--[^\0]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([^\0]+?)__(?!_)|^\*\*([^\0]+?)\*\*(?!\*)/,em:/^\b_((?:__|[^\0])+?)_\b|^\*((?:\*\*|[^\0])+?)\*(?!\*)/,code:/^(`+)([^\0]*?[^`])\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,text:/^[^\0]+?(?=[\\<!\[_*`]| {2,}\n|$)/};t._linkInside=/(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/,t._linkHref=/\s*<?([^\s]*?)>?(?:\s+['"]([^\0]*?)['"])?\s*/,t.link=h(t.link)("inside",t._linkInside)("href",t._linkHref)(),t.reflink=h(t.reflink)("inside",t._linkInside)(),t.normal={url:t.url,strong:t.strong,em:t.em,text:t.text},t.pedantic={strong:/^__(?=\S)([^\0]*?\S)__(?!_)|^\*\*(?=\S)([^\0]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([^\0]*?\S)_(?!_)|^\*(?=\S)([^\0]*?\S)\*(?!\*)/},t.gfm={url:/^(https?:\/\/[^\s]+[^.,:;"')\]\s])/,text:/^[^\0]+?(?=[\\<!\[_*`]|https?:\/\/| {2,}\n|$)/},t.lexer=function(e){var i="",s=r.links,o,u,a,c;while(e){if(c=t.escape.exec(e)){e=e.substring(c[0].length),i+=c[1];continue}if(c=t.autolink.exec(e)){e=e.substring(c[0].length),c[2]==="@"?(u=c[1][6]===":"?l(c[1].substring(7)):l(c[1]),a=l("mailto:")+u):(u=f(c[1]),a=u),i+='<a href="'+a+'">'+u+"</a>";continue}if(c=t.url.exec(e)){e=e.substring(c[0].length),u=f(c[1]),a=u,i+='<a href="'+a+'">'+u+"</a>";continue}if(c=t.tag.exec(e)){e=e.substring(c[0].length),i+=v.sanitize?f(c[0]):c[0];continue}if(c=t.link.exec(e)){e=e.substring(c[0].length),i+=n(c,{href:c[2],title:c[3]});continue}if((c=t.reflink.exec(e))||(c=t.nolink.exec(e))){e=e.substring(c[0].length),o=(c[2]||c[1]).replace(/\s+/g," "),o=s[o.toLowerCase()];if(!o||!o.href){i+=c[0][0],e=c[0].substring(1)+e;continue}i+=n(c,o);continue}if(c=t.strong.exec(e)){e=e.substring(c[0].length),i+="<strong>"+t.lexer(c[2]||c[1])+"</strong>";continue}if(c=t.em.exec(e)){e=e.substring(c[0].length),i+="<em>"+t.lexer(c[2]||c[1])+"</em>";continue}if(c=t.code.exec(e)){e=e.substring(c[0].length),i+="<code>"+f(c[2],!0)+"</code>";continue}if(c=t.br.exec(e)){e=e.substring(c[0].length),i+="<br>";continue}if(c=t.text.exec(e)){e=e.substring(c[0].length),i+=f(c[0]);continue}}return i};var r,i;p.exec=p;var v,m;d.options=d.setOptions=function(e){return m=e,g(e),d},d.setOptions({gfm:!0,pedantic:!1,sanitize:!1,highlight:null}),d.parser=function(e,t){return g(t),a(e)},d.lexer=function(t,n){return g(n),e.lexer(t)},d.parse=d,typeof module!="undefined"?module.exports=d:this.marked=d}.call(function(){return this||(typeof window!="undefined"?window:global)}()),marked}),define("md/MarkdownTextElement",["js/core/TextElement","md/lib/marked","underscore"],function(e,t,n){var r=/\r\n/g,i=/\r/g,s=/\n/,o=/\S/,u=/\s*/;return e.inherit("md.MarkdownTextElement",{render:function(){return this.$initialized||this._initialize(this.$creationPolicy),this.$el=this.$stage.$document.createElement("span"),n.isUndefined(this.$.textContent)||this._renderTextContent(this.$.textContent),this.$el},normalizeIndent:function(e){var t=e.split(s),n=null,r,i;for(r=0;r<t.length;r++){i=t[r];if(o.test(i)){var a=u.exec(i);if(!a)return e;n===null?n=a[0].length:n=Math.min(n,a[0].length);if(n===0)return e}}var f=new RegExp("^\\s{"+n+"}");for(r=0;r<t.length;r++)t[r]=t[r].replace(f,"");return t.join("\n")},_renderTextContent:function(e){e=e.replace(r,"\n"),e=e.replace(i,"\n"),this.$.normalizeIndent===!0&&(e=this.normalizeIndent(e)),this.$el.innerHTML=t(e.trim())}})}),define("md/View",["js/html/HtmlElement","md/MarkdownTextElement"],function(e){return e.inherit("md/View",{defaults:{tagName:"span",normalizeIndent:!0},_createTextElement:function(e,t){return this.$stage.$applicationContext.createInstance("md/MarkdownTextElement",[{normalizeIndent:this.$.normalizeIndent},e,this.$stage,this,t])}})}),define("xaml!app/module/Wiki",["app/module/WikiClass","js/core/Element","js/core/Router","js/conf/RouteConfiguration","js/core/Head","js/core/Content","js/html/HtmlElement","md/View"],function(e,t){return e.inherit({_$descriptor:t.xmlStringToDom('<module:WikiClass xmlns="http://www.w3.org/1999/xhtml" xmlns:js="js.core" xmlns:ui="js.ui" xmlns:module="app.module" xmlns:md="md" xmlns:conf="js.conf">\n\n    <js:Router>\n        <conf:RouteConfiguration onexec="defaultRoute" route="^wiki\\/?$"/>\n        <conf:RouteConfiguration onexec="showPage" route="^wiki\\/(.+)$"/>\n    </js:Router>\n\n    <js:Head title="Wiki - rAppid.js" author="Tony Findeisen &amp; Marcus Krejpowicz"/>\n\n    <js:Content name="main">\n        <div id="wiki">\n            <md:View>\n                {text}\n            </md:View>\n        </div>\n    </js:Content>\n</module:WikiClass>')})}),define("app/module/Wiki",function(){});