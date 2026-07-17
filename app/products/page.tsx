import { Navbar } from "@/components/Navbar";
import { ProductListing } from "@/components/commerce/ProductListing";

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <ProductListing mode="products" />
    </>
  );
}
