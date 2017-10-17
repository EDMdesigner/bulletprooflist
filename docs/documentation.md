---
layout: page
title: Documentation
permalink: /documentation/
---

# bulletprooflist

A universal tool to convert unordered and ordered lists in HTML file to bulletproof email HTML list by changing
`ul`, `ol` and `li` elements to nested `table`s to consistent email client rendered view.

INSTALLATION

```js
npm install bulletproofList
```

USAGE:

```js
var createBulletproofList = require("bulletproofList");
 var yourHtml = "<h1>Your HTML</h1><ul><li>goes</li><li>here.</li></ul>";

var OutputWithBulletproofList = createBulletproofList(yourHtml);
```
**yourHtml** is the input HTML string

**returns OutputWithBulletproofList** containing the same text as in yourHtml, but with list converted to bulletproof 
email HTML list
