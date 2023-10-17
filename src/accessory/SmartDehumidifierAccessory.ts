import BaseAccessory from "./BaseAccessory";
import { configureActive } from "./characteristic/Active";
import { configureCurrentRelativeHumidity } from "./characteristic/CurrentRelativeHumidity";
import { configureSmartRelativeHumidityDehumidifierThreshold } from './characteristic/SmartRelativeHumidityDehumidifierThreshold';

const SCHEMA_CODE = {
  ACTIVE: ["Power"],
  MODE: ["mode"],
  ANION: ["anion"],
  WINDSPEED: ["windspeed"],
  LOCK: ["lock"],
  COUNTDOWN: ["countdown"],
  TARGET_HUMIDITY: ["humidity"],
  CURRENT_HUMIDITY: ["get_hum"],
  TIME: ["time"],
  SLEEP: ["SLEEP"],
};

export default class SmartDehumidifier extends BaseAccessory {
  requiredSchema() {
    return [SCHEMA_CODE.ACTIVE];
  }

  configureServices() {
    // Required Characteristics
    configureActive(
      this,
      this.mainService(),
      this.getSchema(...SCHEMA_CODE.ACTIVE)
    );
    this.configureCurrentState();
    this.configureTargetState();
    configureCurrentRelativeHumidity(this, this.mainService(), this.getSchema(...SCHEMA_CODE.CURRENT_HUMIDITY));
    configureSmartRelativeHumidityDehumidifierThreshold(this, this.mainService(), this.getSchema(...SCHEMA_CODE.TARGET_HUMIDITY));
  }

  mainService() {
    return (
      this.accessory.getService(this.Service.HumidifierDehumidifier) ||
      this.accessory.addService(this.Service.HumidifierDehumidifier)
    );
  }

  configureCurrentState() {
    const schema = this.getSchema(...SCHEMA_CODE.ACTIVE);
    if (!schema) {
      this.log.warn("CurrentHumidifierDehumidifierState not supported.");
      return;
    }

    const { INACTIVE, DEHUMIDIFYING } =
      this.Characteristic.CurrentHumidifierDehumidifierState;

    this.mainService()
      .getCharacteristic(this.Characteristic.CurrentHumidifierDehumidifierState)
      .onGet(() => {
        const status = this.getStatus(schema.code);
        return (status?.value as boolean) ? DEHUMIDIFYING : INACTIVE;
      });
  }

  configureTargetState() {
    const { DEHUMIDIFIER } = this.Characteristic.TargetHumidifierDehumidifierState;
    const validValues = [DEHUMIDIFIER];

    this.mainService().getCharacteristic(this.Characteristic.TargetHumidifierDehumidifierState)
      .onGet(() => {
        return DEHUMIDIFIER;
      }).setProps({ validValues });
  }
}
