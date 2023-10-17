import BaseAccessory from "./BaseAccessory";
import { configureActive } from './characteristic/Active';

const SCHEMA_CODE = {
  ACTIVE: ["Power"],
  MODE: ["mode"],
  ANION: ["anion"],
  WINDSPEED: ["windspeed"],
  LOCK: ["lock"],
  COUNTDOWN: ["countdown"],
  HUMIDITY: ["humidity"],
  TIME: ["time"],
  SLEEP: ["SLEEP"],
};

export default class SmartDehumidifier extends BaseAccessory {
  requiredSchema() {
    return [SCHEMA_CODE.ACTIVE];
  }

  configureServices() {
    // Required Characteristics
    configureActive(this, this.mainService(), this.getSchema(...SCHEMA_CODE.ACTIVE));
    this.configureCurrentState();

  }

  mainService() {
    return this.accessory.getService(this.Service.HumidifierDehumidifier)
      || this.accessory.addService(this.Service.HumidifierDehumidifier);
  }


  configureCurrentState() {
    const schema = this.getSchema(...SCHEMA_CODE.ACTIVE);
    if (!schema) {
      this.log.warn('CurrentHumidifierDehumidifierState not supported.');
      return;
    }

    const { INACTIVE, DEHUMIDIFYING } = this.Characteristic.CurrentHumidifierDehumidifierState;

    this.mainService().getCharacteristic(this.Characteristic.CurrentHumidifierDehumidifierState)
      .onGet(() => {
        const status = this.getStatus(schema.code);
        return (status?.value as boolean) ? DEHUMIDIFYING : INACTIVE;
      });
  }

}
