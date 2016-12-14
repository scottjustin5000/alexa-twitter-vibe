function TweetScore(id, name, screenName, scoreData, content) {
	var self = this;
	self.id = id;
	self.name = name;
	self.screenName = screenName;
	self.label = scoreData.label;
	self.score = scoreData.score; 
	self.content  = content; 
	return self;
}

module.exports = TweetScore;