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
  this.getUrl = url.parse(config['getUrl']);
  this.postUrl = url.parse(config['postUrl']);
  this.name = config['name'];
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
        .on('get', this.getLockCurrentStateCharacteristic.bind(this))

    lockService
      .getCharacteristic(Characteristic.LockTargetState)
        .on('get', this.getLockTargetStateCharacteristic.bind(this))
        .on('set', this.setLockTargetStateCharacteristic.bind(this));

    this.informationService = informationService;
    this.lockService = lockService;
    return [informationService, lockService];
  },

  getLockCurrentStateCharacteristic: function (callback) {
    const that = this;

    return callback(null, Characteristic.LockCurrentState.SECURED);
  },

  getLockTargetStateCharacteristic: function (callback) {
    return callback(null, Characteristic.LockCurrentState.SECURED);
  },

  setLockTargetStateCharacteristic: function (targetState, callback) {
    const that = this;

    setTimeout(function() {
      callback(null, Characteristic.LockCurrentState.UNSECURED);
    }, 1000);

    return;

    request({
      url: that.postUrl,
      body: JSON.stringify({'targetState': targetState}), // on or off
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

      setTimeout(function() {
        callback(null, Characteristic.LockCurrentState.UNSECURED);
      }, 1000);
    });
  }
};
