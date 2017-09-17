'use strict';

const request = require('request');
const url = require('url');

let Accessory, Service, Characteristic;

module.exports = function(exportedTypes) {
    Accessory = exportedTypes.Accessory;
    Service = exportedTypes.Service;
    Characteristic = exportedTypes.Characteristic;

    return LockAccessory;
};

function LockAccessory(log, config) {
  this.log = log;
  this.postUrl = url.parse(config['postUrl']);
  this.name = config['name'];
  this.lockState = Characteristic.LockCurrentState.SECURED;
}

LockAccessory.prototype.getServices = function() {
  let informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, "Acme Corp.")
    .setCharacteristic(Characteristic.Model, "GenericLock v1")
    .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

  let lockService = new Service.LockMechanism(this.name);

  lockService
    .getCharacteristic(Characteristic.LockCurrentState)
      .on('get', this.getLockState.bind(this))

  lockService
    .getCharacteristic(Characteristic.LockTargetState)
      .on('get', this.getLockState.bind(this))
      .on('set', this.setLockState.bind(this));

  this.informationService = informationService;
  this.lockService = lockService;
  return [informationService, lockService];
};

LockAccessory.prototype.getLockState = function(callback) {
  return callback(null, this.lockState);
};

LockAccessory.prototype.setLockState = function(targetState, callback) {
  // optimistic
  this.lockState = targetState;

  request({
    url: this.postUrl,
    body: JSON.stringify({'targetState': targetState}),
    method: 'POST',
    headers: {'Content-type': 'application/json'}
  }, this.handlePostResponse(targetState, callback).bind(this));
};

LockAccessory.prototype.handlePostResponse = (targetState, callback) => function(error, response) {
  var that = this;

  if (error) {
    if (response) {
      this.log('STATUS: ' + response.statusCode);
    }
    this.log(error.message);
    return callback(error);
  }

  // This lock only unlocks temporarily, so change the state back to locked after an interval.
  setTimeout(function() {
    that.lockState = Characteristic.LockCurrentState.SECURED;
    callback(null, targetState);
  }, 500);
};
