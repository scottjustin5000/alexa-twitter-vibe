function Storage() {
	var self = this;
	var data = {};
	
	self.setItem = function(k,v) {
		data[k] = v;
	};

	self.getItem = function(k) {
		if (!data){
			return;
		}
		return data[k];
	};

	return self;
}
module.exports = Storage;