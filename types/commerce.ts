export type PowerType = "without-power" | "with-power";

export type PrescriptionMethod =
  | "manual"
  | "upload"
  | "submit-later"
  | "not-required";

export interface EyePrescription {
  sph?: number;
  cyl?: number;
  axis?: number;
  add?: number;
  pd?: number;
  prism?: string;
}

export interface PrescriptionData {
  method: PrescriptionMethod;
  rightEye?: EyePrescription;
  leftEye?: EyePrescription;
  singlePd?: number;
  rightPd?: number;
  leftPd?: number;
  uploadedFile?: {
    name: string;
    type: string;
    size: number;
    url?: string;
  };
  notes?: string;
}

export interface LensSelection {
  powerType: PowerType;
  lensPackageId: string;
  lensPackageName: string;
  prescription: PrescriptionData;
  lensPrice: number;
}

export type CoverCustomizationType = "photo" | "engraving" | "photo-and-engraving";

export interface CoverPhotoCustomization {
  originalFile?: {
    name: string;
    type: string;
    size: number;
    previewUrl?: string;
    url?: string;
  };
  crop?: {
    x: number;
    y: number;
    zoom: number;
    rotation?: number;
  };
  cropConfirmed?: boolean;
  qualityWarning?: string;
}

export interface CoverEngraving {
  text: string;
  fontId?: string;
  alignment?: "start" | "center" | "end";
  spellingConfirmed: boolean;
}

export interface CoverCustomization {
  enabled: boolean;
  type?: CoverCustomizationType;
  coverId?: string;
  coverName?: string;
  coverColorId?: string;
  coverColorName?: string;
  coverColorValue?: string;
  mockupImage?: string;
  photo?: CoverPhotoCustomization;
  engraving?: CoverEngraving;
  previewImageUrl?: string;
  additionalPrice: number;
  customizationConfirmed: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  frameColor: string;
  frameSize: string;
  quantity: number;
  framePrice: number;
  lensSelection?: LensSelection;
  coverCustomization?: CoverCustomization;
  totalPrice: number;
}

export interface ProductColor {
  name: string;
  value: string;
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  category: "sunglasses" | "eyeglasses";
  gender: "men" | "women" | "kids" | "unisex";
  shape: string;
  material: string;
  frameType: string;
  price: number;
  originalPrice?: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  bestSeller?: boolean;
  isNew?: boolean;
  prescriptionAvailable: boolean;
  rating?: number;
  dimensions: {
    lensWidth: number;
    bridgeWidth: number;
    templeLength: number;
    weight: string;
  };
  highlights: string[];
  coverOptions?: ProductCoverOptions;
}

export interface ProductCoverOptions {
  standardCoverIncluded: boolean;
  customizationAvailable: boolean;
  covers: Array<{
    id: string;
    name: string;
    mockupImage: string;
    colors: Array<{
      id: string;
      name: string;
      value: string;
      mockupImage?: string;
      inStock: boolean;
    }>;
  }>;
  pricing: {
    basePrice: number;
    photoPrice: number;
    engravingPrice: number;
    photoAndTextPrice?: number;
  };
  engravingCharacterLimit: number;
}

export interface LensPackage {
  id: string;
  name: string;
  color: string;
  price: number;
  compatiblePowerTypes: PowerType[];
  compatibleCategories: Product["category"][];
  features: string[];
  details: {
    description: string;
    index: string;
    coating: string;
    uvProtection: string;
    scratchResistance: string;
    thickness: string;
    recommendedUse: string;
    deliveryImpact: string;
    warranty: string;
  };
}
