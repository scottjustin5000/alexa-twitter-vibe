var _ = require('lodash');
var VibeTypes = require('./vibe-types');

function VibeResult(tweetScores) {
	
	var self = this;
	self.scores = tweetScores;

	self.negatives = _.filter(self.scores, function(s) {
			if(s.label === VibeTypes.NEGATIVE) {
				return s;
			}
	});

	self.positives = _.filter(self.scores, function(s) {
			if(s.label === VibeTypes.POSITIVE) {
				return s;
			}
	});
	
	// self.neutral = _.filter(self.scores, function(s) {
	// 	if(s.label === VibeTypes.NEUTRAL) {
	// 		return s;
	// 	}
	// });

	self.negativesCount = self.negatives.length;
	self.positivesCount = self.positives.length;
	self.mostNegative = _.max(self.negatives, function(n) {n.score});
	self.mostPostive = _.max(self.positives, function(n) {n.score});
	
	self.overallVibe = VibeTypes.NEUTRAL;

	if(self.negativesCount > self.positivesCount) {
		self.overallVibe = VibeTypes.NEGATIVE;
	} else if(self.positivesCount > self.negativesCount) {
		self.overallVibe = VibeTypes.POSITIVE;
	} 

	return self;
}

VibeResult.prototype.format = function(screenName) {

	var exampleTweet = '';

	if(this.overallVibe === VibeTypes.POSITIVE) {

		exampleTweet = this.mostPostive.content;

	} else if(this.overallVibe === VibeTypes.NEGATIVE) {

		exampleTweet = this.mostNegative.content;

	} else {
		//just pull random
		var random = Math.random() * (this.scores.length - 0) + 0;
		exampleTweet = this.score[random].content;
	}

	var target = screenName ? screenName : 'Your';

	var content =  target +' twitter feed is vibing as '+this.overallVibe+' here is an sample: <break time="500ms"/> ';
	return content + ' ' + exampleTweet;
};

module.exports = VibeResult;