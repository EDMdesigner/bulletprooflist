var cheerio = require("cheerio");

/**
* Converts ordered and unordered lists to tables.
*/
var bulletproofList = ((function(cheerio) {

	function processList(numbered) {
		var tableAligns = [];

		function listElemBulletproofer(numbered) {
			var listElemMarker = ((function() {
				if (numbered) {
					return function(idx) {
						return idx + 1 + ".";
					};
				}
	
				return function() {
					//return "*";
					return "&#x02022;"; //not good: Lotus Notes 7, Outlook 2013
					//return "&#8226;"; //not good: Lotus Notes 7, Outlook 2013
					//return "&bull;";
					//return "&bullet;";
				};
			})());
	
			return function bulletProofLiElem(idx, actLiElem) {
				var act = $(actLiElem);

				var alignProp = act.css(["text-align"])["text-align"];
			
				if (alignProp) {
					tableAligns.push(alignProp);
				}
	
				var actContent = act.html();
	
				var tr = $("<tr></tr>");
	
				tr.append($("<td align=\"left\" width=\"15\" valign=\"top\">" + listElemMarker(idx) + "</td>"));
				tr.append($("<td align=\"left\"></td>").html(actContent));
				act.replaceWith(tr);
			};
		}

		var processListElem = listElemBulletproofer(numbered);

		return function processedList(act) {
			act.children("li").each(processListElem);

			// CHECK LIST ITEM ALIGNMENT
			var equalityChecker = tableAligns.every((v, i, a) => i === 0 || v === a[i - 1] );
			var alignmentProp = equalityChecker && tableAligns.length !== 0 ? tableAligns[0] : "";
			var alignment = alignmentProp ? "align=\"" + alignmentProp + "\"" : "";

			var table = $("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " + alignment + "></table>");

			// set back alignments for the next list
			tableAligns = [];

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