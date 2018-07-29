/* globals describe it */
const should = require('should');

const zapier = require('zapier-platform-core');

// Use this to make test calls into your app:
const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('Have I Been Pawned', () => {
  it('should find some breaches', done => {
    const bundle = { 
      inputData: {
        email: "example@example.com"
      } 
  };

    appTester(App.searches.breachedaccount.operation.perform, bundle)
      .then(results => {
        should(results[0].pawnedCount).greaterThan(2);
        done();
      })
      .catch(done);
  }).timeout(5000);

  it('should not find any breaches', done => {
    const bundle = { 
      inputData: {
        email: "secure@verysecure.com"
      } 
  };

    appTester(App.searches.breachedaccount.operation.perform, bundle)
      .then(results => {
        should(results[0].pawnedCount).equal(0);
        done();
      })
      .catch(done);
  }).timeout(5000);
})
