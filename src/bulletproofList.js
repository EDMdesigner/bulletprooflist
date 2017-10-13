var cheerio = require("cheerio");

/**
* Converts ordered and unordered lists to tables.
*/
var listsToTables = ((function(cheerio) {
	function createProcessLiFn(numbered) {
		var bullet = ((function() {
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

        return function processLi(idx, actLiElem) {
            var act = $(actLiElem);
                    
            var actContent = act.html();
            var actStyles = act.attr("style");

            var tr = $("<tr></tr>");
        
            tr.append($("<td align=\"left\" width=\"15\" valign=\"top\" style=\"" + actStyles + "\">" + bullet(idx) + "</td>"));
            tr.append($("<td align=\"left\" style=\"" + actStyles + "\"></td>").html(actContent));
            act.replaceWith(tr);
        };
    }

	function createProcessListElemFn(numbered) {
		var liProcessor = createProcessLiFn(numbered);

		return function processListElem(act) {
			act.children("li").each(liProcessor);

			var table = $("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"></table>");

			table.html(act.html());
			act.replaceWith(table);
		};
	}

	var processOl = createProcessListElemFn(true);
	var processUl = createProcessListElemFn(false);

	function listsToTables(htmlString) {
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

	return listsToTables;
})(cheerio));

(function (name, definition){
	// if (typeof this.define === "function"){ // AMD
	// 	this.define(definition);
	// } else if (typeof module !== "undefined" && module.exports) { // Node.js
	// 	module.exports = definition();
	// } else { // Browser
		var theModule = definition();
		var global = this;
		var old = global[name];
		theModule.noConflict = function () {
			global[name] = old;
			return theModule;
		};
		global[name] = theModule;
	//}
})("createBulletproofList", function () {
	return listsToTables;
});