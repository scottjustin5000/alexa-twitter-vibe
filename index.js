var Alexa = require('alexa-app');
var app = new Alexa.app('twitter-vibe-app');

var Vibe = require('./vibe-skill');


app.launch(function(req, res) {
	var prompt = 'Let me find out if your twitter timeline currently has a negative or positive vibe.';
	res.say('').reprompt(prompt).shouldEndSession(false);
});

app.intent('home_timeline_vibe', {
	"slots": {},
	"utterances": [
		"Tell me my vibe",
		"Tell me my twitter vibe",
		"Get my timeline vibe",
		"Get my twitter timeline vibe"

	]
}, function(req, res) {
	 var vibe = new Vibe();
 	return vibe.getForToday().then(function(response) {
 		res.say(response.format()).send();
 	});
	return false;
});

app.intent('user_timeline_vibe', {
	"slots": {},
	"utterances": [
		"Get the vibe {of|for} {-|USERNAME}",
		"Get vibe of {-|USERNAME}'s timeline",
		"Get vibe of {-|USERNAME}'s twitter timeline",
		"Tell me {-|USERNAME}'s vibe",
		"Tell me {-|USERNAME}'s timeline vibe",
		"Tell me {-|USERNAME}'s twitter timeline vibe",
		"Tell me the vibe {of|for} {-|USERNAME}"
	]
}, function(req, res) {
	var vibe = new Vibe();
	var twitterUserName = req.slot('USERNAME');
 	return vibe.getForUserToday(twitterScreenName).then(function(response) {
 		res.say(response.format(twitterScreenName)).send();
 	});
	return false;
});

//hack to support custom utterances in utterance expansion string
//console.log(app.utterances().replace(/\{\-\|/g, '{'));
module.exports = app;

