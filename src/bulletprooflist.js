const cheerio = require("cheerio");

/**
* Converts ordered and unordered lists to tables.
*/
const bulletproofList = ((function(cheerio) {

	function listElemProcessorFn(numbered) {
        let tableAligns = [];
        
        function listAlignmentModifier(idx, actLiElem) {
            const act = $(actLiElem);
            const alignProp = act.css(["text-align"])["text-align"];
            
            if (alignProp) {
                tableAligns.push(alignProp);
            }
        };
        
        function listElemBulletproofer(idx, actLiElem) {

            function listElemMarker() {
                if (numbered) {
                    return function(idx) {
                        return idx + 1 + ".";
                    };
                }
    
                //return "*";
                return "&#x02022;"; //not good: Lotus Notes 7, Outlook 2013
                //return "&#8226;"; //not good: Lotus Notes 7, Outlook 2013
                //return "&bull;";
                //return "&bullet;";
            };
    

            const act = $(actLiElem);

            const actContent = act.html();

            const tr = $("<tr></tr>");

            tr.append($("<td align=\"left\" width=\"15\" valign=\"top\">" + listElemMarker(idx) + "</td>"));
            tr.append($("<td align=\"left\"></td>").html(actContent));
            act.replaceWith(tr); 
        };

		return function processListElems(act) {
            
            act.children("li").each(listAlignmentModifier);
            act.children("li").each(listElemBulletproofer);

            // CHECK LIST ITEM ALIGNMENT
            const equalityChecker = tableAligns.every((v, i, a) => i === 0 || v === a[i - 1] );
            const alignmentProp = equalityChecker && tableAligns.length !== 0 ? tableAligns[0] : "";
            const alignment = alignmentProp ? "align=\"" + alignmentProp + "\"" : "";

            const table = $("<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" " + alignment + "></table>");

            // set back alignments for the next list
            tableAligns = [];
            
			table.html(act.html());
            act.replaceWith(table);
		};
	}

	const processOl = listElemProcessorFn(true);
	const processUl = listElemProcessorFn(false);

	function bulletproofList(htmlString) {
		$ = cheerio.load(htmlString, {
			decodeEntities: false,
			normalizeWhitespace: false
		});

		const uls = $("ul");
		//Has to be processed in reverse order, because it's using in-depth search...
		let idx;

		for (idx = uls.length - 1; idx >= 0; idx -= 1) {
			processUl($(uls[idx]));
		}

		const ols = $("ol");

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
		const theModule = definition();
		const global = this;
		const old = global[name];
		theModule.noConflict = function () {
			global[name] = old;
			return theModule;
		};
		global[name] = theModule;
	}
})("bulletprooflist", function () {
	return bulletproofList;
});