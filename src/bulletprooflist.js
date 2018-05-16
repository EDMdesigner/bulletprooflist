var cheerio = require("cheerio");

/**
* Converts ordered and unordered lists to tables.
*/
var bulletproofList = ((function(cheerio) {

	function processList(numbered) {
		var tableAligns =  [];

		var listItemProcessor = function (act, func) {
			act.children("li").each(func);
		};

		var alignmentModifier = (function () {
			var tableAlign =  ""
			

			return function (idx, actLiElem) {
				var act = $(actLiElem);
				console.log(act.css(["text-align"]))
				tableAligns.push(act.css(["text-align"]));
			};
		})();
		// console.log(typeof listItemCollection)
		// var alignment = act.css(["text-align"]);
		// console.log("alignment", act.prop(["text-align"]))
		
		
		// console.log(processedListElems)
		// if alignment is defined for the FIRST text element...
		// console.log("geciiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", processedListElems/*.css(["style"])*/)
		// if(processedListElems[0].attribs.hasOwnProperty("style")) {
		// 	// ... it is extracted to be used on the whole bulletproof table 
		// 	var listAlign = processedListElems[0].attribs.style.split(":")[1].split(";").shift().trim();
		// 	// console.log(listAlign);
		// 	tableAlign = "align=\"" + listAlign + "\"";
		// }

		var listItemBulletproofer = (function (numbered) {
			// REPLACES LIST ITEMS WITH TABLE ROWS AND TABLE CELLS 
			var bullet = ((function() {
				if (numbered) {
					return function(idx) {
						return idx + 1 + ".";
					};
				}
	
				return function() {
					return "&#x02022;"; //not good: Lotus Notes 7, Outlook 2013
					return "&#8226;"; //not good: Lotus Notes 7, Outlook 2013
					//return "&bull;";
					//return "&bullet;";
					//return "*";					
				};
			})());
	
			return function (idx, actLiElem) {
				var act = $(actLiElem);
				var actContent = act.html();
	
				var tr = $("<tr></tr>");
	
				tr.append($("<td align=\"left\" width=\"15\" valign=\"top\">" + bullet(idx) + "</td>"));
				tr.append($("<td align=\"left\"></td>").html(actContent));
				act.replaceWith(tr);
			};
		})();

		return function (act) {
			var alignment = "";
			// REPLACES THE UL / OL WITH THE BUILT TABLE
			listItemProcessor(act, listItemBulletproofer);
			listItemProcessor(act, alignmentModifier);
			// var processedListElems = listItemCollection.each(listItemBulletproofer);
			const allEqual = tableAligns => tableAligns.every( v => v === tableAligns[0] );
			if (allEqual(tableAligns)){
				alignment = tableAligns[0]
			}

			console.log(alignment)

			var table = $("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"" + alignment + "></table>");

			table.html(act.html());
			act.replaceWith(table);
		};
	}

	var processOl = processList(true);
	var processUl = processList(false);

	function bulletproofList(htmlString) {
		$ = cheerio.load(htmlString, {
			decodeEntities: false,
			normalizeWhitespace: false
		});

		var uls = $("ul");
		//Has to be processed in reverse order, because it's using in-depth search...
		var idx;

		for (idx = uls.length - 1; idx >= 0; idx -= 1) {
			processUl($(uls[idx]));
		}

		var ols = $("ol");

		for (idx = ols.length - 1; idx >= 0; idx -= 1) {
			processOl($(ols[idx]));
		}

		return $.html();
	}

	return bulletproofList;
})(cheerio));

(function (name, definition){
	if (this && typeof this.define === "function"){ // AMD
		this.define(definition);
	} else if (typeof module !== "undefined" && module.exports) { // Node.js
		module.exports = definition();
	} else { // Browser
		var theModule = definition();
		var global = this;
		var old = global[name];
		theModule.noConflict = function () {
			global[name] = old;
			return theModule;
		};
		global[name] = theModule;
	}
})("bulletprooflist", function () {
	return bulletproofList;
});
