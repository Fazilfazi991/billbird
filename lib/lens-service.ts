import { lensPackages } from "@/data/products";
import type { LensPackage, PowerType, Product } from "@/types/commerce";

export async function getLensTypes(
  product: Product,
  powerType: PowerType,
): Promise<LensPackage[]> {
  return lensPackages.filter(
    (lens) =>
      lens.compatiblePowerTypes.includes(powerType) &&
      lens.compatibleCategories.includes(product.category),
  );
}
