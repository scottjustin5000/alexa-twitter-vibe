var Twit = require('twit');
var Promise = require('bluebird');
var _ = require('lodash');

//remove this...in prod we'll use node lambda, for tests we'll load env in the test structure
require('dotenv').load({
	path: __dirname + '/.env'
});

var TweetScore = require('./tweet-score');
var VibeResult = require('./vibe-result');
var VibeTypes = require('./vibe-types');
var BayesClassifier = require('./bayes-classifier');

function Vibe() {

	var bayes;

	var config = {
		consumer_key: process.env.TWITTER_KEY,
		consumer_secret: process.env.TWITTER_SECRET,
		access_token: process.env.TWITTER_ACCESS_TOKEN,
		access_token_secret: process.env.TWITTER_TOKEN_SECRET
	};

	var T = new Twit(config);

	function getHomeTimeline() {
		return new Promise(function(fulfill, reject) {
			T.get('statuses/home_timeline', {
				count: 100
			}, function(err, data, response) {
				fulfill(data);
			});
		});
	}

	function getUserTimeLine(screenName) {
		return new Promise(function(fulfill, reject) {
			T.get('statuses/user_timeline', {
				count: 100,
				screen_name: screenName
			}, function(err, data, response) {
				fulfill(data);
			});
		});
	}

	function score(tweets) {
		return _.map(tweets, function(tweet) {

			var score = bayes.extractWinner(bayes.guess(tweet.text));

			var user = tweet.user;
			//console.log(user.name, score, tweet.text);

			var tweetScore = new TweetScore(user.id, user.name, user.screen_name, score, tweet.text);

			return tweetScore;
		});
	} 

	function getForToday() {

		return getHomeTimeline().
			then(function(tweets) {
				var scores = score(tweets);
				return new VibeResult(scores);
			});
	}

	function getForUserToday(twitterScreenName) {

		return getUserTimeLine(twitterScreenName).
			then(function(tweets) {
				var scores = score(tweets);
				return new VibeResult(scores);
			});
	}

	(function init() {
		bayes = new BayesClassifier();
		var negatives = ['trump', 'senator', 'frown', 'mug', 'trap','breitbart','fake', 'market','angry', 'bad', 'journalist', 'news', 'presidential','politicians', 'polls', 'pundits', 'Fox', 'war', 'Syria', 'guns', 'D.C.', 'Washington', 'troll','racist', 'racism', 'Congress', 'Senate', 'election', 'Jeff Sessions', 'Donald Trump', 'main stream media', 'Russia', 'Putin', 'Republican', 'stocks', 'crash', 'Democrats', 'ISIS', 'Bannon', 'white nationalist', 'white supremist', 'Giuliani', 'Gingrich', 'mean', 'nasty', 'hack', 'hacked', 'hate', 'security', 'Standing Rock', 'yankees', 'alt-right', 'president', 'money'];
		var positives = ['Celtics', 'smiles', 'beautiful', 'node', 'Go', 'start-up', 'startup', 'aws', 'weather', 'girls','players', 'passion', 'football', 'basketball', 'baseball','sportradar', 'ufc', 'earth', 'nature', 'hip hop', 'NBA', 'NHL', 'NFL', 'MLB', 'Champ', 'Red Sox', 'Oakland', 'Obama', 'Rhode Island', 'Boston', 'children', 'happy', 'love', 'technology', 'numbers', 'math', 'education', 'football', 'baseball', 'candy', 'blm', 'black lives matter', 'Mookie Betts', 'David Price', 'candy', 'HBO', 'San Francisco', 'California', 'Oregon', 'coffee', 'nodejs', 'javascript', 'socialism', 'Canada', '#LETSGOCHAMP'];
		var length = negatives.length;
		negatives.sort(function() {
			return Math.random() - 0.5;
		});
		positives.sort(function() {
			return Math.random() - 0.5;
		});

		for (var i = 0; i < length; i++) {
			bayes.train(negatives[i], VibeTypes.NEGATIVE);
			bayes.train(positives[i], VibeTypes.POSITIVE);
		}

	})();

	return {
		getForToday: getForToday,
		getForUserToday: getForUserToday
	}
}
module.exports = Vibe;
