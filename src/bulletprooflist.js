var cheerio = require("cheerio");

/**
* Converts ordered and unordered lists to tables.
*/
var bulletproofList = ((function (cheerio) {
	function createProcessLiFn(numbered) {
		var bullet = ((function () {
			if (numbered) {
				return function (idx) {
					return idx + 1 + ".";
				};
			}

			return function () {
				//return "*";
				return "&#x02022;"; //not good: Lotus Notes 7, Outlook 2013
				//return "&#8226;"; //not good: Lotus Notes 7, Outlook 2013
				//return "&bull;";
				//return "&bullet;";
			};
		})());

		return function processLi(idx, actLiElem) {
			var act = $(actLiElem);

			var actContent = act.html();

			var tr = $("<tr></tr>");
			tr.append($("<td align=\"right\" width=\"35\" valign=\"top\" style=\"padding-right:6px;\">" + bullet(idx) + "</td>"));
			tr.append($("<td align=\"left\"></td>").html(actContent));
			act.replaceWith(tr);
		};
	}

	function createProcessListElemFn(numbered) {
		var liProcessor = createProcessLiFn(numbered);

		return function processListElem(act) {
			act.children("li").each(liProcessor);

			var listLength = act.children("tr").children("td[width=\"35\"]").length;
			var calcLength = listLength.toString().length;
			var charLength = 3; // default marker width in the current editor

			if(calcLength >= 3){
				charLength = calcLength;
			}

			act.children("tr").children("td[width=\"35\"]").attr("class", "charLength_"+charLength);

			if (listLength >= 100 && numbered) {
				act.children("tr").children("td[width=\"35\"]").attr("width", 35 + 15 * (calcLength - 1));
			}

			var table = $("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"></table>");

			table.html(act.html());
			act.replaceWith(table);
		};
	}

	var processOl = createProcessListElemFn(true);
	var processUl = createProcessListElemFn(false);

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

(function (name, definition) {
	if (this && typeof this.define === "function") { // AMD
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