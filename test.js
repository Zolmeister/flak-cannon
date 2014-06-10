/*globals describe, it*/
'use strict'

var app = require('./')
var flare = require('flare-gun')
  .route('http://localhost:3001/api')
  .docFile('doc.json')
var Joi = require('joi')
var _ = require('lodash')
var Promise = require('bluebird')
var uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

app.listen(3001)

var userSchema = {
  id: Joi.string().regex(uuidRegExp).required(),
  group: Joi.string(),
  info: Joi.object(),
  experiments: Joi.object(),
  convertions: Joi.object()
}

var experimentSchema = {
  name: Joi.string(),
  values: Joi.array().includes(Joi.string())
}

flare = flare.put('/_tests/reset')

describe('Flak Cannon', function(){
  describe('User', function () {
    it('Creates', function(){
      return flare
        .post('/users', {})
        .expect(200, userSchema)
    })

    it('Creates with info', function () {
      return flare
        .post('/users', {
          info: {
            abc: 'def'
          }
        })
        .expect(200, _.defaults({
          info: {
            abc: 'def'
          }
        }, userSchema))
        .doc('User', 'create')
    })

    it('Gets users', function () {
      return flare
        .post('/users', {
          group: '123',
          info: {
            abc: 'def'
          }
        })
        .stash('joe')
        .get('/users/:joe.id')
        .expect(200, _.defaults({
          group: '123',
          info: {
            abc: 'def'
          }
        }, userSchema))
        .doc('User', 'get')
    })

    it('Converts actions', function () {
      return flare
        .post('/users', {
          group: '123',
          info: {
            abc: 'def'
          }
        })
        .stash('joe')
        .put('/users/:joe.id/convert/testing')
        .expect(200, _.defaults({
          conversions: {
            testing: 1
          }
        }, userSchema))
        .doc('User', 'convert')
    })

    it('Updates group', function () {
      return flare
        .put('/users/:joe.id/group/same')
        .expect(200, _.defaults({
          group: 'same',
          conversions: {
            testing: 1
          }
        }, userSchema))
        .doc('User', 'set testing group')
    })
  })

  describe('Experiment', function () {
    it('Creates', function () {
      return flare
        .post('/experiments', {
          name: 'expTest',
          values: ['red', 'green', 'blue', 'a', 'b', 'c', 'd', 'e', 'f']
        })
        .expect(200, _.defaults({
          name: 'expTest',
          values: Joi.array().includes(Joi.string())
        }, experimentSchema))
        .doc('Experiment', 'create')
    })

    it('Gets new users', function () {
      return flare
        .post('/users', {
          group: 'tester'
        })
        .stash('joe')
        .expect(200, _.defaults({
          experiments: {
            expTest: Joi.string().regex(/red|green|blue|a|b|c|d|e|f/)
          }
        }, userSchema))
    })

    it('has results', function () {
      return flare
        .get('/experiments/expTest/results')
        .expect(200, Joi.array().includes(userSchema))
        .doc('Experiment', 'results')
    })

    it('Removes from experiment', function () {
      return flare
        .del('/users/:joe.id/experiments/expTest')
        .expect(200, _.defaults({
          experiments: {}
        }, userSchema))
        .doc('User', 'remove from experiment')
    })

    it('Adds to experiment', function () {
      return flare
        .put('/users/:joe.id/experiments/expTest')
        .expect(200, _.defaults({
          experiments: {
            expTest: Joi.string().regex(/red|green|blue|a|b|c|d|e|f/).required()
          }
        }, userSchema))
        .doc('User', 'add to experiment')
    })

    it('Adds to experiment with assignment', function () {
      return flare
        .put('/users/:joe.id/experiments/expTest/red')
        .expect(200, _.defaults({
          group: 'tester',
          experiments: {
            expTest: 'red'
          }
        }, userSchema))
        .doc('User', 'add to experiment, with value')
    })

    it('Creates with same experiments of matching group', function () {
      return flare
      .then(function (f) {
        return Promise.map(Array(10), function () {
          return flare
          .post('/users', {
            group: 'same'
          })
          .expect(200, _.defaults({
            experiments: {
              expTest: 'red'
            }
          }, userSchema))
        }).then(function () {
          return f
        })
      })
    })
  })
})
