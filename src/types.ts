export type UserRole = 'Pemilik' | 'Supervisor' | 'Karyawan' | 'Customer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  referralCode?: string; // For Pemilik
  invitedBy?: string; // UID of Pemilik
  createdAt: any;
}

export interface Land {
  id: string;
  ownerId: string;
  name: string;
  cropType: string;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: any;
}

export interface SensorData {
  id: string;
  landId: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  timestamp: any;
}

export interface OperationalLog {
  id: string;
  landId: string;
  workerId: string;
  type: 'pemupukan' | 'pestisida' | 'observasi';
  details?: string;
  observation?: string;
  timestamp: any;
}

export interface CropGuide {
  id: string;
  name: string;
  category: string;
  planting: string;
  fertilization: string;
  operational: string;
  pestControl: string;
  image: string;
}

export interface InventoryItem {
  id: string;
  ownerId: string;
  name: string;
  category: 'alat' | 'pupuk' | 'pestisida' | 'herbisida' | 'lainnya';
  stock: number;
  unit: string;
  updatedAt: any;
}

export interface Product {
  id: string;
  ownerId: string;
  name: string;
  stock: number;
  price: number;
  unit: string;
  image?: string;
}

export interface Buyer {
  id: string;
  ownerId: string;
  name: string;
  phone: string;
  address?: string;
}

export interface Transaction {
  id: string;
  ownerId: string;
  buyerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  timestamp: any;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Livestock {
  id: string;
  ownerId: string;
  name: string;
  type: 'Ayam' | 'Sapi' | 'Kambing' | 'Burung' | 'Ikan' | 'Lainnya';
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  cageCapacity: string;
  quantity: number;
  maleQuantity: number;
  femaleQuantity: number;
  healthStatus: 'Optimal' | 'Warning' | 'Critical';
  feedLevel: number;
  lastVaccination?: any;
  createdAt: any;
}

export interface ShopProduct {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  unit?: string;
  image?: string;
  description?: string;
  storeType: 'Peternakan' | 'Pertanian' | 'Makanan';
  isWaste?: boolean;
  isSafeForKids?: boolean;
  isSafeForPregnancy?: boolean;
  nutritionDetails?: string;
  deliveryOptions?: string[];
  createdAt?: any;
}

export interface WasteManagement {
  id: string;
  ownerId: string;
  parentId: string; // Land or Livestock ID
  type: 'raw' | 'cooked' | 'animalPoop' | 'foliage' | 'other';
  quantity: number;
  unit: string;
  pricePerUnit: number;
  isForSale: boolean;
  deliveryOptions: string[];
  updatedAt: any;
}

export interface LivestockGuide {
  id: string;
  name: string;
  category: string;
  breeding: string;
  feeding: string;
  operational: string;
  diseaseControl: string;
  image: string;
}
