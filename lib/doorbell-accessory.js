'use strict';

const request = require('request');
const url = require('url');

let Accessory, Service, Characteristic;

module.exports = function(exportedTypes) {
    Accessory = exportedTypes.Accessory;
    Service = exportedTypes.Service;
    Characteristic = exportedTypes.Characteristic;

    return DoorbellAccessory;
};

function DoorbellAccessory(log, config) {
  this.log = log;
  this.name = config['name'];
  this.doorbellState = false;
}

DoorbellAccessory.prototype.getServices = function() {
  let informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, "Philip Kocanda")
    .setCharacteristic(Characteristic.Model, "GenericDoorbell")
    .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

  let doorbellService = new Service.LockMechanism(this.name);

  doorbellService
    .getCharacteristic(Characteristic.ProgrammableSwitchEvent)
      .on('get', this.getState.bind(this))

  this.informationService = informationService;
  this.doorbellService = doorbellService;

  return [informationService, doorbellService];
};

DoorbellAccessory.prototype.getState = function(callback) {
  setTimeout(function() {
    callback(null, Math.round(Math.random()));
  }, 2000);
};
