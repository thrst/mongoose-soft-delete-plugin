(function IIFE(){
  'use strict';

  const deletedAtAttribute = {
    deletedAt: {
      type: Date,
      default: null
    }
  };

  function softDeletePlugin(schema) {
    // Add deletedAt attribute
    schema.add(deletedAtAttribute);

    // Pre hooks to exclude finding deleted documents
    function addDeletedAtCondition(method) {
      return function(next) {
        if(this.op === method && !this._conditions.deleted) {
          this._conditions.deletedAt = null;
        }

        delete this._conditions.deleted;

        next();
      };
    }

    schema.pre('count', addDeletedAtCondition('count'));
    schema.pre('find', addDeletedAtCondition('find'));
    schema.pre('findOne', addDeletedAtCondition('findOne'));
    schema.pre('findOneAndUpdate', addDeletedAtCondition('findOneAndUpdate'));

    // Soft delete methods
    schema.statics.softDeleteById = function(id, cb) {
      const schema = this;

      const conditions = {
        _id: id
      };

      const update = {
        deletedAt: new Date()
      };

      const options = {
        new: true
      };

      return schema.findOneAndUpdate(conditions, update, options, cb);
    };

    schema.methods.softDelete = function(cb) {
      return this.constructor.softDeleteById(this._id, cb);
    };


    // Exclude deletedAt from being included in json if null
    if(!schema.options.toJSON) {
      schema.options.toJSON = {};
    }

    const previousJSONTransformation = schema.options.toJSON.transform || function() {};

    schema.options.toJSON.transform = function(doc, ret, opts) {
      if(ret.deletedAt === null) {
        delete ret.deletedAt;
      }

      return previousJSONTransformation(doc, ret, opts);
    };
  }

  module.exports = softDeletePlugin;
})();
