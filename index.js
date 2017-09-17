'use strict';

const request = require('request');
const url = require('url');

let Service, Characteristic;

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("generic-lock-plugin", "MyGenericLock", myLock);
};

function myLock(log, config) {
  this.log = log;
  this.postUrl = url.parse(config['postUrl']);
  this.name = config['name'];
  this.lockState = Characteristic.LockCurrentState.SECURED;
}

myLock.prototype = {
  getServices: function () {
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
  },

  getLockState: function (callback) {
    return callback(null, this.lockState);
  },

  setLockState: function (targetState, callback) {
    const that = this;

    // optimistic
    this.lockState = targetState;

    request({
      url: this.postUrl,
      body: JSON.stringify({'targetState': targetState}),
      method: 'POST',
      headers: {'Content-type': 'application/json'}
    },
    function (error, response) {
      if (error) {
        if (response) {
          that.log('STATUS: ' + response.statusCode);
        }
        that.log(error.message);
        return callback(error);
      }

      // This lock only unlocks temporarily, so change the state back to locked after an interval.
      setTimeout(function() {
        that.lockState = Characteristic.LockCurrentState.SECURED;
        callback(null, targetState);
      }, 500);
    });
  }
};
