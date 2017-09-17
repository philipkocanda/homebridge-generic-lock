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
  const DoorbellAccessory = require('./lib/doorbell-accessory.js')(exportedTypes);

  homebridge.registerAccessory("generic-lock-plugin", "GenericLock", LockAccessory);
  homebridge.registerAccessory("generic-lock-plugin", "GenericDoorbell", DoorbellAccessory);
};
