const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

// Lets us use 'should' style syntax
const expect = chai.expect;

// Lets us make HTTP requests
chai.use(chaiHttp);

describe('Recipes', function() {

// 'runServer' function returns a promise to avoid a race condition
	before(function() {
		return runServer();
	});

// Close server at the end of tests
	after(function() {
		return closeServer();
	});

// Test for GET requests
	it('should list recipes on GET', function() {
		return chai.request(app)
// Make request to '/recipes'
		.get('/recipes')
		.then(function(res) {
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			expect(res.body).to.be.a('array');
			expect(res.body.length).to.be.at.least(1);
// Inspect response object to prove it has right code & keys
			res.body.forEach(function(item) {
				expect(item).to.be.a('object');
				expect(item).to.include.keys('id', 'name', 'ingredients');
			});
		});

	});

// Test for POST requests
	it('should add an item on POST', function() {
// Post request for data with new item
		const newRecipe = { 
			name: 'Grilled Cheese', 
			ingredients: ['2 Bread Slices', '2 Cheese Slices'] 
		};
		return chai.request(app)
			.post('/recipes')
			.send(newRecipe)
			.then(function(res) {
// Inspect reponse for right status code
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('id', 'name', 'ingredients');
				expect(res.body.name).equal(newRecipe.name)
				expect(res.body.ingredients).to.be.a('array');
				expect(res.body.ingredients).include.members(newRecipe.ingredients);
			});
		});

// Test PUT
	it('should update items on PUT', function() {
		const updateData = {
			name: 'foo',
			ingredients: ['bizz', 'bar']
		};

		return chai.request(app)
// Make GET request so we can get an item to update
			.get('/recipes')
			.then(function(res) {
// Add 'id' to 'updateData'
				updateData.id = res.body[0].id;
		return chai.request(app)
// PUT request with 'updateData'
			.put(`/recipes/${updateData.id}`)
			.send(updateData);
			})
// Prove PUT request has right status code & returns updated item
			.then(function(res) {
				expect(res).to.have.status(204);
			});
		});

// Test DELETE
	it('should delete items on DELETE', function() {
		return chai.request(app)
// GET shopping list items so we can get id of one to delete
			.get('/recipes')
			.then(function(res) {
		return chai.request(app)
// DELETE an item
			.delete(`/recipes/${res.body[0].id}`);
			})
// Make sure I get 204 status
			.then(function(res) {
				expect(res).to.have.status(204);
			});
		});
});