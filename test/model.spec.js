(function() {
  'use strict';

  const expect = require('chai').expect;

  const mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost');

  const Model = require('./model');

  const name = 'myModel';
  const minimumModel = {
    name: name
  };

  describe('Mongoose Soft Delete Plugin', function() {
    beforeEach(() => Model.create(minimumModel).then(doc => doc.softDelete()));
    afterEach(() => Model.remove({}));

    it('should add deletedAt property to model', function() {
      return Model.find(minimumModel)
        .then(doc => {
          expect(doc.deletedAt).to.be.ok;
          expect(doc.deletedAt).to.be.a.Date;
        });
    });

  });

})();
