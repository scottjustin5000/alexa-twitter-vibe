var Storage = require('./storage');
var stemmer = require('porter-stemmer').stemmer;

function Bayes() {

	var storage = new Storage();

	var tokenizer = closeProximtyUnigramTokenizer;

	var negations = new RegExp('^(never|no|nothing|nowhere|noone|none|not|havent|hasnt|hadnt|cant|couldnt|shouldnt|wont|wouldnt|dont|doesnt|didnt|isnt|arent|aint)$');

	// function setTokenizer(tokenizerType) {
	// 	tokenizer = tokenizerTypes[tokenizerType];
	// }

	function stemKey (stem, label) {
		return '_Bayes::stem:' + stem + '::label:' + label;
	}

	function docCountKey(label) {
		return '_Bayes::docCount:' + label;
	}

	function stemCountKey(stem) {
		return '_Bayes::stemCount:' + stem;
	}

	function getLabels() {
		var labels = storage.getItem('_Bayes::registeredLabels');
		if (!labels) labels = '';
		return labels.split(',').filter(function (a) {
			return a.length;
		});
	}

	function registerLabel(label) {
		var labels = getLabels();
		if (labels.indexOf(label) === -1) {
			labels.push(label);
			storage.setItem('_Bayes::registeredLabels', labels.join(','));
		}
		return true;
	}

	function stemLabelCount(stem, label) {
		var count = parseInt(storage.getItem(stemKey(stem, label)));
		if (!count) count = 0;
		return count;
	}

	function stemInverseLabelCount(stem, label) {
		var labels = getLabels();
		var total = 0;
		for (var i = 0, length = labels.length; i < length; i++) {
			if (labels[i] === label) 
				continue;
			total += parseInt(stemLabelCount(stem, labels[i]));
		}
		return total;
	}

	function stemTotalCount(stem) {
		var count = parseInt(storage.getItem(stemCountKey(stem)));
		if (!count) count = 0;
		return count;
	}

	function docCount(label) {
		var count = parseInt(storage.getItem(docCountKey(label)));
		if (!count) count = 0;
		return count;
	}

	function docInverseCount(label) {
		var labels = getLabels();
		var total = 0;
		for (var i = 0, length = labels.length; i < length; i++) {
			if (labels[i] === label) 
				continue;
			total += parseInt(docCount(labels[i]));
		}
		return total;
	}

	function increment (key) {
		var count = parseInt(storage.getItem(key));
		if (!count) {
			count = 0;
		}
		storage.setItem(key, parseInt(count) + 1);
		return count + 1;
	}

	function incrementStem(stem, label) {
		increment(stemCountKey(stem));
		increment(stemKey(stem, label));
	}

	function incrementDocCount(label) {
		return increment(docCountKey(label));
	}

	 function unigramTokenizer(text) {
		text = text.toLowerCase().replace(/'/g, '').replace(/\W/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
		return text;
	}

	function bigramTokenizer(text) {
		text = tokenizer(text);
		var toks = [];
		for (var i = 0, len = text.length; i < len-1; i++) {
			toks.push(text.slice(i, i+2).join(' '));
		}
		return toks;
	}

	// Close-proximity negation-marked unigram ("eMSU")
	function closeProximtyUnigramTokenizer(text) {
		// Standard unigram tokenizer; lowercase, strip special characters, split by whitespace
		text = unigramTokenizer(text);
		// Step through our array of tokens
		for (var i = 0, len = text.length; i < len; i++) {
			// If we find a negation word, add an exclamation point to the word preceding and following it.
			if (text[i].match(negations)) {
				if (typeof text[i + 1] !== 'undefined') text[i + 1] = "!" + text[i + 1];
				if (typeof text[i - 1] !== 'undefined') text[i - 1] = "!" + text[i - 1];
			}
		}
		// Porter Stemmer; this reduces entropy a bit
		text = text.map(function (t) { return stemmer(t); });
		return text;
	}

	function train(text, label) {
		registerLabel(label);
		var words = tokenizer(text);
		var length = words.length;
		for (var i = 0; i < length; i++) {
			incrementStem(words[i], label);
		}
		incrementDocCount(label);
	}

	function guess(text) {
		var words = tokenizer(text);
		var length = words.length;
		var labels = getLabels();
		var totalDocCount = 0;
		var docCounts = {};
		var docInverseCounts = {};
		var scores = {};
		var labelProbability = {};
		
		for (var j = 0; j < labels.length; j++) {
			var label = labels[j];
			docCounts[label] = docCount(label);
			docInverseCounts[label] = docInverseCount(label);
			totalDocCount += parseInt(docCounts[label]);
		}
		
		for (var j = 0; j < labels.length; j++) {
			var label = labels[j];
			var logSum = 0;
			labelProbability[label] = docCounts[label] / totalDocCount;
		   
			for (var i = 0; i < length; i++) {
				var word = words[i];
				var _stemTotalCount = stemTotalCount(word);
				if (_stemTotalCount === 0) {
					continue;
				} else {
					var wordProbability = stemLabelCount(word, label) / docCounts[label];
					var wordInverseProbability = stemInverseLabelCount(word, label) / docInverseCounts[label];
					var wordicity = wordProbability / (wordProbability + wordInverseProbability);
					// Adjusted wordicity for rare words.
					wordicity = ((3*0.5) + (_stemTotalCount*wordicity)) / (3 + _stemTotalCount);

					if (wordicity === 0){
						wordicity = 0.00001;
					}
					else if (wordicity === 1){
						wordicity = 0.99999;
					}
			   }
				logSum += (Math.log(1 - wordicity) - Math.log(wordicity));
			}
			scores[label] = 1 / ( 1 + Math.exp(logSum) );
		}
		return scores;
	}
	
	function extractWinner(scores) {
		var bestScore = 0;
		var bestLabel = null;
		for (var label in scores) {
			if (scores[label] > bestScore) {
				bestScore = scores[label];
				bestLabel = bestScore == .5 ? 'neutral' :label;
			}
		}
		return {label: bestLabel, score: bestScore};
	}

	return {
		train: train,
		guess: guess,
		extractWinner: extractWinner

	}

}
module.exports = Bayes;