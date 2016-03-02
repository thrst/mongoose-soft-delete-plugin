(function IIFE() {
  'use strict';

  const expect = require('chai').expect;
  const mongoose = require('mongoose');
  const _ = require('ramda');

  mongoose.connect('mongodb://localhost');

  const Model = require('./model');

  const name = 'myModel';
  const minimumModel = {
    name: name
  };

  describe('Mongoose Soft Delete Plugin', function() {
    beforeEach(() => Model.create(minimumModel));
    afterEach(() => Model.remove({}));

    it('should add deletedAt property to model', function() {
      return Model.find(minimumModel)
        .then(docs => {
          const doc = docs[0];
          expect(doc.deletedAt).to.equal(null);
        });
    });

    describe('softDeleteById', function() {
      it('should set deletedAt upon soft delete', function() {
        return Model.find(minimumModel)
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(doc => {
            expect(doc.deletedAt).to.be.a.Date;
          });
      });
    });

    describe('softDelete method', function() {
      it('should set deletedAt upon soft delete', function() {
        return Model.find(minimumModel)
          .then(docs => docs[0].softDelete())
          .then(doc => {
            expect(doc.deletedAt).to.be.a.Date;
          });
      });
    });

    describe('count', function() {
      it('should only count non-deleted documents', function() {
        return Model.create(minimumModel)
          .then(() => Model.find(minimumModel))
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(() => Model.count(minimumModel))
          .then(count => {
            expect(count).to.equal(1);
          });
      });

      it('should count all documents', function() {
        return Model.create(minimumModel)
          .then(() => Model.find(minimumModel))
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(() => Model.count(_.merge({
            deleted: true
          }, minimumModel)))
          .then(count => {
            expect(count).to.equal(2);
          });
      });
    });

    describe('find', function() {
      it('should only find non-deleted document', function() {
        return Model.create(minimumModel)
          .then(() => Model.find(minimumModel))
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(() => Model.find(minimumModel))
          .then(docs => {
            expect(docs.length).to.equal(1);
          });
      });

      it('should find all documents when passing deleted:true', function() {
        return Model.create(minimumModel)
          .then(() => Model.find(minimumModel))
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(() => Model.find(_.merge({
            deleted: true
          }, minimumModel)))
          .then(docs => {
            expect(docs.length).to.equal(2);
          });
      });
    });

    describe('findOne', function() {
      it('should only find non-deleted document', function() {
        return Model.create(minimumModel)
          .then(() => Model.find(minimumModel))
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(() => Model.findOne(minimumModel))
          .then(doc => {
            expect(doc.deletedAt).to.equal(null);
          });
      });

      it('should find deleted document when passing deleted:true', function() {
        return Model.find(minimumModel)
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(() => Model.findOne(_.merge({
            deleted: true
          }, minimumModel)))
          .then(doc => {
            expect(doc.deletedAt).to.be.a.Date;
          });
      });
    });

    describe('findOneById', function() {
      it('should not be able to find a deleted document', function() {
        return Model.find(minimumModel)
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(doc => Model.findById(doc._id))
          .then(doc => {
            expect(doc).to.not.exist;
          });
      });
    });

    describe('findOneAndUpdate', function() {
      it('should only update non-deleted document', function() {
        return Model.create(minimumModel)
          .then(() => Model.find(minimumModel))
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(() => Model.findOneAndUpdate(minimumModel, {
            name: 'newModel'
          }, {
            new: true
          }))
          .then(doc => {
            expect(doc.deletedAt).to.equal(null);
            expect(doc.name).to.equal('newModel');
          });
      });

      it('should find deleted document when passing deleted:true', function() {
        return Model.find(minimumModel)
          .then(docs => Model.softDeleteById(docs[0]._id))
          .then(() => Model.findOneAndUpdate(_.merge({
            deleted: true
          }, minimumModel), {
            name: 'newModel'
          }, {
            new: true
          }))
          .then(doc => {
            expect(doc.deletedAt).to.be.a.Date;
            expect(doc.name).to.equal('newModel');
          });
      });
    });
  });
})();
