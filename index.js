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
}

myLock.prototype = {
  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Acme Corp.")
      .setCharacteristic(Characteristic.Model, "GenericLock v1")
      .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

    let switchService = new Service.Switch("My lock");
    switchService
      .getCharacteristic(Characteristic.On)
        .on('get', this.getSwitchOnCharacteristic.bind(this))
        .on('set', this.setSwitchOnCharacteristic.bind(this));

    this.informationService = informationService;
    this.switchService = switchService;
    return [informationService, switchService];
  },

  getSwitchOnCharacteristic: function (next) {
    const that = this;

    if (!this.getUrl) {
      this.log('getUrl is empty, omitting request');
      return next(null, false);
    }

    return next(null, false);

    request({
        url: that.getUrl,
        method: 'GET',
    },
    function (error, response, body) {
      if (error) {
        if (response) {
          that.log('STATUS: ' + response.statusCode);
        }
        that.log(error.message);
        return next(error);
      }
      return next(null, body.currentState);
    });
  },

  setSwitchOnCharacteristic: function (targetState, next) {
    const that = this;

    if (!this.postUrl) {
      this.log('postUrl is empty, omitting request');
      return next(null, false);
    }

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
        return next(error);
      }
      return next(null, false);
    });
  }
};
