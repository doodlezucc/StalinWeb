const translations = [
	[" my", "our"],
	[" me ", "us"],
	[" mine ", "ours"],
	[" mine", "our"],
	[" i'm ", "we're"],
	[" i'", "we'"],
	[" i ", "we"],
];

const phaseOne = [
	"my",
	"i",
	"me",
	"mine"
];

const capitalizers = [
	"'",
	'"'
];
const beginnings = [
	" ",
].concat(capitalizers);

const endOfSentence = [
	".",
	"?",
	"!"
];
const endings = [
	" ",
	",",
].concat(capitalizers, endOfSentence);

let all = [];
translations.forEach((c) => {
	let k = c[0];

	const hasPre = k[0] === " ";
	const hasSuf = k[k.length - 1] === " ";

	k = k.trim();
	let v = c[1];

	function push(operator) {
		if (hasPre) {
			if (hasSuf) {
				for (let prefix of beginnings) {
					for (let suffix of endings) {
						all.push([operator(k), operator(v), prefix, suffix]);
					}
				}
			} else {
				for (let prefix of beginnings) {
					all.push([operator(k), operator(v), prefix, ""]);
				}
			}
		} else if (hasSuf) {
			for (let suffix of endings) {
				all.push([operator(k), operator(v), "", suffix]);
			}
		}
	}

	push(s => s);
	push(s => s[0].toUpperCase() + s.substr(1));
	if (k.length > 1) {
		push(s => s.toUpperCase());
	}
});
//console.log(all);

function communize() {
	const start = new Date();

	$(document).find("*").each(function() {
		if (!(this instanceof HTMLScriptElement)) {
			const isTitle = this instanceof HTMLTitleElement;
			const texts = $(this).textNodes();
			texts.each(function() {
				if (needsFix(this.data)) {
					$(this).replaceWith(fix(this.data, !isTitle));
				}
			});
		}
	});

	console.log("Communized in " + (new Date() - start) + "ms");
}

function needsFix(s) {
	s = " " + s.toLowerCase() + " ";
	for (let word of phaseOne) {
		if (s.includes(" " + word)) {
			return true;
		}
	};
	return false;
}

/**
 * 
 * @param {String} s 
 */
function fix(s, strikethrough) {
	s = " " + s + " ";

	let i = 0;

	while (true) {
		let next = {
			index: Infinity,
			c: null
		};

		for (let c of all) {
			const cIndex = s.indexOf(c[2] + c[0] + c[3], i);
			if (cIndex >= 0 && cIndex < next.index) {
				next = { index: cIndex, c: c };
			}
		}
		if (next.c) {
			i = next.index;
			const pre = next.c[2];
			const suf = next.c[3];
			let replacement = next.c[1];

			let capitalize = i <= 1;
			if (!capitalize) {
				if (pre.length > 0) {
					capitalizers.forEach(b => {
						if (pre === b) capitalize = true;
					});
				}
				if (!capitalize) {
					endOfSentence.forEach(b => {
						if (s[i - 1] === b) capitalize = true;
					});
				}
			}
			if (!capitalize) replacement = replacement.toLowerCase();

			if (strikethrough) {
				replacement = pre + "<del>" + next.c[0].trim() + "</del>" +
					" <strong>" + replacement.trim() + "</strong>" + suf;
			} else {
				replacement = pre + replacement + suf;
			}
			s = s.substr(0, i) + replacement + s.substr(i + pre.length + next.c[0].length + suf.length);
			i += replacement.length;
		} else {
			return s;
		}
	}
}

//Add a jQuery extension so it can be used on any jQuery object
jQuery.fn.textNodes = function() {
	return this.contents().filter(function() {
		return (this.nodeType === Node.TEXT_NODE && this.nodeValue.trim() !== "");
	});
}

$(document).ready(function() {
	setTimeout(() => {
		communize();
	}, 1000);
});

// Select the node that will be observed for mutations
const targetNode = document.body;

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
	// Use traditional 'for loops' for IE 11
	console.log("hmmm");
	for (let mutation of mutationsList) {
		if (mutation.type === 'childList') {
			console.log('A child node has been added or removed.');
		}
		else if (mutation.type === 'attributes') {
			console.log('The ' + mutation.attributeName + ' attribute was modified.');
		}
	}
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
observer.disconnect();