import { CalisthenicsScene } from "./scenes/Calisthenics";
import { EquipmentScene } from "./scenes/Equipment";
import { GroupClassesScene } from "./scenes/GroupClasses";
import { HyroxScene } from "./scenes/Hyrox";
import { MmaScene } from "./scenes/Mma";
import { PilatesScene } from "./scenes/Pilates";

export const PROGRAM_ANIMATIONS = {
  calisthenics: CalisthenicsScene,
  hyrox: HyroxScene,
  mma: MmaScene,
  pilates: PilatesScene,
  equipment: EquipmentScene,
  "group-classes": GroupClassesScene,
} as const;

export type ProgramAnimationKey = keyof typeof PROGRAM_ANIMATIONS;
