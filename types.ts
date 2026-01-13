
export interface BusinessCard {
  id: string;
  name: string;
  companyName: string;
  jobTitle: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  imageUrl: string;
  createdAt: number;
}

export type CardFormData = Omit<BusinessCard, 'id' | 'imageUrl' | 'createdAt'>;

export enum ScanStatus {
  IDLE = 'idle',
  SCANNING = 'scanning',
  SUCCESS = 'success',
  ERROR = 'error'
}
