import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default async function OrderSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return (
    <>
      <Navbar />
      <main className="bg-ivory pb-20 pt-24 text-ink md:pt-28">
        <section className="section-shell">
          <div className="mx-auto max-w-2xl rounded-[14px] border border-ink/10 bg-white p-8 text-center shadow-sm">
            <p className="eyebrow">Order Confirmed</p>
            <h1 className="display-title mt-3 text-4xl md:text-6xl">Thank you</h1>
            <p className="mt-4 text-ink/60">
              Your BillBirD order has been created. Payment and fulfillment services can now be connected to this confirmation step.
            </p>
            <div className="mt-6 rounded-lg bg-ivory p-4 text-start">
              <p className="text-sm text-ink/55">Order number</p>
              <p className="font-bold">{orderId}</p>
              <p className="mt-3 text-sm text-ink/55">Order date</p>
              <p className="font-bold">{new Date().toLocaleDateString("en-AE", { dateStyle: "medium" })}</p>
              <p className="mt-3 text-sm text-ink/55">Prescription support</p>
              <p className="font-bold">If power is pending, our optical support team will contact you within the configured support window.</p>
            </div>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/products" className="min-h-12 rounded-full bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-ivory">
                Continue Shopping
              </Link>
              <Link href="/cart" className="min-h-12 rounded-full border border-ink/15 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em]">
                View Order
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
