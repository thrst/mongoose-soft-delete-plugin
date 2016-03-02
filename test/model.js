(function IIFE(){
  'use strict';

  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;

  const softDeletePlugin = require('../index');

  const ModelSchema = new Schema({
    name: String
  });

  ModelSchema.plugin(softDeletePlugin);

  module.exports = mongoose.model('Model', ModelSchema);
})();
