'use strict';

const request = require('request');
const url = require('url');
const fs = require('fs');

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
  this.sslOptions = {
    key: fs.readFileSync(config['key']),
    cert: fs.readFileSync(config['cert']),
    passphrase: config['passphrase']
  };
  this.username=config['username'];
  this.password=config['password'];
  this.lockState = Characteristic.LockCurrentState.SECURED;
}

LockAccessory.prototype.getServices = function() {
  let informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, "Philip Kocanda")
    .setCharacteristic(Characteristic.Model, "GenericLock")
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
  var options = {
    'auth': {
      'username': this.username,
      'password': this.password,
      'sendImmediately': false
    },
    cert: this.sslOptions.cert,
    key: this.sslOptions.key,
    passphrase: this.sslOptions.passphrase,
    url: this.postUrl,
    method: 'POST',
    rejectUnauthorized: false,
    headers: {'Content-type': 'multipart/form-data'}
  }
  request(options, this.handlePostResponse(targetState, callback).bind(this));
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
