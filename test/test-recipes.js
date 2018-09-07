const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../require");

// Lets us use 'should' style syntax
const expect = chai.should();

// Lets us make HTTP requests
chai.us(chaiHttp);

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
	it('should list items on GET', function() {
		return chai.request(app)
// Make request to '/recipes'
		.get('/recipes')
		.then(function(res) {
			should(res).to.have.status(200);
			should(res).to.be.json;
			should(res.body).to.be.a('array');
			should(res.body.length).to.be.at.least(1);
// Inspect response object to prove it has right code & keys
			const expectedKeys = ['id', 'name', 'ingredients'];
			res.body.forEach(function(item) {
				should(item).to.be.a('object');
				should(item).to.include.keys(expectedKeys);
			});
		});

	});

// Test for POST requests
	it('should add an item on POST', function() {
// Post request for data with new item
		const newItem = {name: 'Grilled Cheese', ingredients: ['2 Bread Slices', '2 Cheese Slices']};
		return chai.request(app)
			.post('/recipes')
			.send(newItem)
			.then(function(res) {
// Inspect reponse for right status code
				should(res).to.have.status.(201);
				should(res).to.be.a('object');
				should(res.body).to.be.a('array');
				should(res.body).to.include.keys('id', 'name', 'ingredients');
				should(res.body.id).to.not.equal(Object.assign(newItem, {id: res.body.id}));
			});
		});

// Test PUT
	it('should update items on PUT', function() {
		const updateData = {
			name: 'foo',
			ingredients: ['foo', 'bar'],
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
				should(res).to.have.status(204);
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
				should(res).to.have.status(204);
			});
		});
});