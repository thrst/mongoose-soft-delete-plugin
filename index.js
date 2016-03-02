(function IIFE(){
  'use strict';

  function softDelete(schema) {
    schema.add({
      deletedAt: {
        type: Date,
        default: null
      }
    });

    schema.methods.softDelete = function *() {
      if(this.deletedAt === null) {
        this.deletedAt = new Date();
        yield this.save();
      }
    };

    if(!schema.options.toJSON) {
      schema.options.toJSON = {};
    }

    const previousTransformation = schema.options.toJSON.transform || function() {};

    schema.options.toJSON.transform = function(doc, ret, opts) {
      if(ret.deletedAt === null) {
        delete ret.deletedAt;
      }

      return previousTransformation(doc, ret, opts);
    };
  }

  module.exports = softDelete;
})();
