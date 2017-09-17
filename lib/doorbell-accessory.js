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
  this.switchValue = 0;
}

DoorbellAccessory.prototype.getServices = function() {
  let informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, "Philip Kocanda")
    .setCharacteristic(Characteristic.Model, "GenericDoorbell")
    .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

  let doorbellService = new Service.Doorbell(this.name);

  doorbellService
    .getCharacteristic(Characteristic.ProgrammableSwitchEvent)
      .on('get', this.getSwitchValue.bind(this))

  this.informationService = informationService;
  this.doorbellService = doorbellService;

  setTimeout(function() {
    this.log("Ding Dong");
    this.doorbellService.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(1);
  }.bind(this), 10000);

  setTimeout(function() {
    this.log("Ding Dong");
    this.doorbellService.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(0);
  }.bind(this), 20000);

  setTimeout(function() {
    this.log("Ding Dong");
    this.doorbellService.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(1);
  }.bind(this), 40000);

  setTimeout(function() {
    this.log("Ding Dong");
    this.doorbellService.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(0);
  }.bind(this), 50000);

  return [informationService, doorbellService];
};

DoorbellAccessory.prototype.getSwitchValue = function(callback) {
  callback(null, this.switchValue);
};
