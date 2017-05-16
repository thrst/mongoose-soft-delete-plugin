'use strict';

/**
 * No operation function
 * @author Lawrence Page <lpage2008@gmail.com>
 * @return {Function}
 * @api private
**/
function noop() {
  return function() {};
}

/**
 * Get UTC date & time
 * @author Lawrence Page <lpage2008@gmail.com>
 * @return {Date}
 * @api private
**/
function utcDate() {
  var now = new Date();
  return Date.UTC(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() ,
      now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
}

/**
 * Soft-delete mongoose plugin
 * @author Various
 * @api public
**/
function softDeletePlugin(schema) {
  // Add deletedAt attribute
  schema.add({
    deletedAt: {
      type: Date,
      default: null
    }
  });

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

  [ 'count',
    'find',
    'findOne',
    'findOneAndUpdate' ].forEach(function(op) {
      schema.pre(op, addDeletedAtCondition(op));
  });

  // Soft delete methods
  schema.statics.softDeleteById = function(id, cb) {

    const conditions = {
      _id: id
    };

    const update = {
      deletedAt: utcDate()
    };

    const options = {
      new: true
    };

    return this.findOneAndUpdate(conditions, update, options, cb);
  };

  schema.methods.softDelete = function(cb) {
    return this.constructor.softDeleteById(this._id, cb);
  };

  // Exclude deletedAt from being included in json if null
  schema.options.toJSON = schema.options.toJSON || {};
  const baseTransform = schema.options.toJSON.transform || noop();

  schema.options.toJSON.transform = function(doc, ret, opts) {
    if(ret.deletedAt === null) {
      delete ret.deletedAt;
    }

    return baseTransform(doc, ret, opts);
  };
}

module.exports = softDeletePlugin;
