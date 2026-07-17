import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ProductDetailView } from "@/components/commerce/ProductDetailView";
import { ProductListing } from "@/components/commerce/ProductListing";
import { categories, getProductBySlug } from "@/data/products";

export default async function ProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if ((categories as readonly string[]).includes(slug)) {
    return (
      <>
        <Navbar />
        <ProductListing mode={slug} />
      </>
    );
  }

  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <Navbar />
      <ProductDetailView product={product} />
    </>
  );
}
