var cheerio = require("cheerio");

/**
* Converts ordered and unordered lists to tables.
*/
var bulletproofList = ((function(cheerio) {

	function processList(numbered) {

		var processListElem = (function listElemBulletproofer(numbered) {
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
	
				var actContent = act.html();
	
				var tr = $("<tr></tr>");
	
				tr.append($("<td align=\"left\" width=\"15\" valign=\"top\">" + listElemMarker(idx) + "</td>"));
				tr.append($("<td align=\"left\"></td>").html(actContent));
				act.replaceWith(tr);
			};
		})(numbered);

		return function processedList(act) {
			var alignments = [];
			var alignmentObj = act.children("li").each(processListElem).css(["text-align"]);
			var actAlignProp = alignmentObj["text-align"];
			
			if (actAlignProp) {
				alignments.push(actAlignProp);
			}

			function align() {
				if (alignments.length !== 0) {
					var allMatch = alignments.every((currentValue, idx, array) => array[0] === currentValue);
				}
					
				allMatch 
					? alignment = " align=\"" +  alignments[0] + "\""
					: alignment = "";

				return alignment;
			};

			var table = $("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"" + align() + "></table>");

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
		// console.log($.html())
		// console.log("==============================")
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