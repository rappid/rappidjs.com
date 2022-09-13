#Node rendering

rAppid.js applications are designed to render completely on the client side. The html source code seen by search engines is limited to nearly nothing. That's why we implemented a special node application https://github.com/it-ony/rAppid.js-server (MIT) which can render rAppid:js applications on a node server. In combination with the hashbang ajax crawling concept from google https://developers.google.com/webmasters/ajax-crawling/ the html source code visible for search engines is equal to the source DOM rendered on the client.

Check the html source code visible at http://www.rappidjs.com vs. the html source code of the server rendered version http://www.rappidjs.com/?_escaped_fragment_= for SEO reasons.

A complete documentation about node-rendering applications will follow soon.