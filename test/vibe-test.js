var Vibe = require('../vibe-skill');

describe('Test Vibe', function() {
	it('should get my vibe response', function(done) {
		 var vibe = new Vibe();
 		return vibe.getForToday().then(function(response) {
 			(response !=null).should.equal(true);
 			done();
 		});
		
	});
	it('should get Shannon Briggs vibe', function(done) {
		 var vibe = new Vibe();
		 return vibe.getForUserToday('TheCannonBriggs').then(function(response) {
		 	console.log(response.format('Shannon Briggs'));
		 	done();
		 });
	});
});