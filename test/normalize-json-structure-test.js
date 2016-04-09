/*
 * File: test/normalize-json-structure-test.js
 * Description: Test script for the normalize-json-structure library
 */

var normalJSON = require('../lib/normalize-json-structure'),
    chai = require('chai'),
    expect = require('chai').expect;

describe('normalize-json-structure', function() {

  var normal     = JSON.stringify(JSON.parse('{ "first": [ { "a": 1, "b": "test" }, { "a": 3, "b": "10" } ], "second": { "third": [ { "a": { "b": [ { "c": 1 } ] } }, { "a": { "b": [ { "c": 2 } ] } } ] } }'));
  var not_normal = '{ "first": [ [ { "a": 1, "b": "test" } ], { "a": 3, "b": 10 } ], "second": { "third": [ { "a": { "b": { "c": 1 } } }, { "a": { "b": [ { "c": 2 } ] } } ] } }';

  it('should return an error on invalid JSON input', function(done) {
    expect(function(){ normalJSON('{ "a": [ { not valid ] }'); }).to.throw(SyntaxError);
    done();
  });

  it('should return original JSON if it is already normalized', function(done) {
    expect(normalJSON(normal)).to.equal(normal);
    done();
  });

  it('should normalize JSON passed as a string', function(done) {
    expect(normalJSON(not_normal)).to.equal(normal);
    done();
  });

  it('should normalize a Javascript object into a JSON string', function(done) {
    expect(normalJSON(JSON.parse(not_normal))).to.equal(normal);
    done();
  });

});