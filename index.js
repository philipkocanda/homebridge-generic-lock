'use strict';

let Accessory, Service, Characteristic;

module.exports = function (homebridge) {
  Accessory = homebridge.hap.Accessory;
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  const exportedTypes = {
    Accessory: Accessory,
    Service: Service,
    Characteristic: Characteristic
  };

  const LockAccessory = require('./lib/lock-accessory.js')(exportedTypes);

  homebridge.registerAccessory("generic-lock-plugin", "MyGenericLock", LockAccessory);
};

