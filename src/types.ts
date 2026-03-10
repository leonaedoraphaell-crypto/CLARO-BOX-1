export enum EquipmentCategory {
  BOX = "BOX",
  BOX_SOUND = "BOX SOUND",
  CONTROLE = "CONTROLE",
  CAMERA = "CAMERA",
  CHIP = "CHIP"
}

export interface EquipmentItem {
  id: string;
  contract: string;
  serial: string;
  photos: string[];
  createdAt?: number;
}

export interface DailyData {
  [EquipmentCategory.BOX]: EquipmentItem[];
  [EquipmentCategory.BOX_SOUND]: EquipmentItem[];
  [EquipmentCategory.CONTROLE]: EquipmentItem[];
  [EquipmentCategory.CAMERA]: EquipmentItem[];
  [EquipmentCategory.CHIP]: EquipmentItem[];
}

export interface AppData {
  [date: string]: DailyData;
}

export interface UserProfile {
  name: string;
  cpf: string;
  profileImage: string;
  menuButtonImage?: string;
}

export interface AppNotification {
  id: number;
  time: string;
  type: string;
  details: string;
  timestamp: number;
  read?: boolean;
}
