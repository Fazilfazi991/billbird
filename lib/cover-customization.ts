import type {
  CoverCustomization,
  CoverCustomizationType,
  ProductCoverOptions,
} from "@/types/commerce";

export function calculateCoverCustomizationPrice(
  customization: CoverCustomization | undefined,
  pricing: ProductCoverOptions["pricing"],
) {
  if (!customization?.enabled) return 0;

  const hasPhoto = Boolean(customization.photo?.originalFile);
  const hasText = Boolean(customization.engraving?.text?.trim());

  if (hasPhoto && hasText && pricing.photoAndTextPrice != null) {
    return pricing.basePrice + pricing.photoAndTextPrice;
  }

  return (
    pricing.basePrice +
    (hasPhoto ? pricing.photoPrice : 0) +
    (hasText ? pricing.engravingPrice : 0)
  );
}

export function coverCustomizationType(customization?: CoverCustomization): CoverCustomizationType | undefined {
  if (!customization?.enabled) return undefined;
  const hasPhoto = Boolean(customization.photo?.originalFile);
  const hasText = Boolean(customization.engraving?.text?.trim());
  if (hasPhoto && hasText) return "photo-and-engraving";
  if (hasPhoto) return "photo";
  if (hasText) return "engraving";
  return undefined;
}

export function coverCustomizationLabel(customization?: CoverCustomization) {
  const type = coverCustomizationType(customization);
  if (type === "photo-and-engraving") return "Photo + Engraving";
  if (type === "photo") return "Photo";
  if (type === "engraving") return "Engraving";
  return "Standard Cover";
}

export function hasValidCoverCustomization(customization?: CoverCustomization) {
  if (!customization?.enabled) return true;
  const type = coverCustomizationType(customization);
  if (!type) return false;
  const hasValidPhoto =
    !customization.photo?.originalFile ||
    Boolean(customization.photo.cropConfirmed && customization.photo.crop);
  const hasValidText =
    !customization.engraving?.text?.trim() ||
    Boolean(customization.engraving.spellingConfirmed);
  return hasValidPhoto && hasValidText && customization.customizationConfirmed;
}

export function formatCoverCustomizationType(customization?: CoverCustomization) {
  return customization?.enabled ? coverCustomizationLabel(customization) : "Standard Cover";
}
