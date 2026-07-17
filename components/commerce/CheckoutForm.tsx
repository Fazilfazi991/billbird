"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderSummary } from "./OrderSummary";
import { useCart } from "@/lib/cart-store";

const requiredFields = ["fullName", "email", "phone", "city", "area", "building", "street"] as const;

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState<Record<string, string>>({
    fullName: "",
    email: "",
    phone: "",
    country: "United Arab Emirates",
    countryCode: "+971",
    emirate: "Dubai",
    city: "",
    area: "",
    building: "",
    apartment: "",
    street: "",
    landmark: "",
    postalCode: "",
    notes: "",
    delivery: "standard",
    payment: "card",
  });
  const [confirmed, setConfirmed] = useState(false);
  const [coverConfirmed, setCoverConfirmed] = useState(false);

  const needsPrescriptionConfirmation = useMemo(
    () => items.some((item) => ["manual", "upload"].includes(item.lensSelection?.prescription.method ?? "")),
    [items],
  );
  const needsCoverConfirmation = useMemo(
    () => items.some((item) => item.coverCustomization?.enabled),
    [items],
  );

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function placeOrder() {
    const nextErrors = requiredFields
      .filter((key) => !form[key])
      .map((key) => `${key.replace(/([A-Z])/g, " $1")} is required.`);
    if (!items.length) nextErrors.push("Your cart is empty.");
    if (needsPrescriptionConfirmation && !confirmed) nextErrors.push("Please confirm the prescription information is accurate.");
    if (needsCoverConfirmation && !coverConfirmed) nextErrors.push("Please confirm the cover customization details are correct.");
    setErrors(nextErrors);
    if (nextErrors.length) return;

    setProcessing(true);
    const orderId = `BB-${Date.now().toString().slice(-8)}`;
    window.sessionStorage.setItem(
      `order-${orderId}`,
      JSON.stringify({ form, items, createdAt: new Date().toISOString() }),
    );
    clearCart();
    router.push(`/order-success/${orderId}`);
  }

  return (
    <main className="bg-ivory pb-20 pt-24 text-ink md:pt-28">
      <section className="section-shell">
        <p className="eyebrow">Checkout</p>
        <h1 className="display-title mt-2 text-4xl md:text-6xl">Complete your order</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <section className="rounded-[10px] border border-ink/10 bg-white p-5">
              <h2 className="font-serif text-2xl">Contact information</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Input label="Full name" value={form.fullName} onChange={(value) => update("fullName", value)} />
                <Input label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} />
                <Input label="Country code" value={form.countryCode} onChange={(value) => update("countryCode", value)} />
                <Input label="Phone" type="tel" value={form.phone} onChange={(value) => update("phone", value)} />
              </div>
            </section>

            <section className="rounded-[10px] border border-ink/10 bg-white p-5">
              <h2 className="font-serif text-2xl">Delivery address</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {["country", "emirate", "city", "area", "building", "apartment", "street", "landmark", "postalCode"].map((key) => (
                  <Input key={key} label={key.replace(/([A-Z])/g, " ")} value={form[key]} onChange={(value) => update(key, value)} />
                ))}
              </div>
              <label className="mt-3 block text-sm font-medium capitalize">Delivery notes
                <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-ink/15 p-3" />
              </label>
            </section>

            <section className="rounded-[10px] border border-ink/10 bg-white p-5">
              <h2 className="font-serif text-2xl">Delivery method</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {["standard", "express", "store pickup"].map((option) => (
                  <button key={option} onClick={() => update("delivery", option)} className={`min-h-20 rounded-lg border p-3 text-start capitalize ${form.delivery === option ? "border-ink bg-ivory" : "border-ink/10"}`}>
                    <strong>{option}</strong>
                    <span className="mt-1 block text-sm text-ink/60">{option === "express" ? "AED 35" : option === "standard" ? "Free above AED 500" : "Subject to store setup"}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[10px] border border-ink/10 bg-white p-5">
              <h2 className="font-serif text-2xl">Payment method</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {["card", "apple pay", "google pay", "cash on delivery"].map((option) => (
                  <button key={option} onClick={() => update("payment", option)} className={`min-h-14 rounded-lg border px-4 text-start capitalize ${form.payment === option ? "border-ink bg-ivory" : "border-ink/10"}`}>
                    {option}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-ink/55">Payment gateway adapter is prepared as UI only; real processing connects later.</p>
            </section>

            {needsPrescriptionConfirmation ? (
              <section className="rounded-[10px] border border-ink/10 bg-white p-5">
                <h2 className="font-serif text-2xl">Prescription confirmation</h2>
                <label className="mt-4 flex min-h-11 items-start gap-3 text-sm">
                  <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 size-4 accent-ink" />
                  <span>I confirm that the prescription information provided is accurate.</span>
                </label>
              </section>
            ) : null}

            {needsCoverConfirmation ? (
              <section className="rounded-[10px] border border-ink/10 bg-white p-5">
                <h2 className="font-serif text-2xl">Cover customization confirmation</h2>
                <p className="mt-2 text-sm leading-6 text-ink/58">
                  Custom cover details will be saved with each order item for production review.
                </p>
                <label className="mt-4 flex min-h-11 items-start gap-3 text-sm">
                  <input type="checkbox" checked={coverConfirmed} onChange={(event) => setCoverConfirmed(event.target.checked)} className="mt-1 size-4 accent-ink" />
                  <span>I confirm that the uploaded photo and engraving details are correct.</span>
                </label>
              </section>
            ) : null}

            {errors.length ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                {errors.map((error) => <p key={error}>{error}</p>)}
              </div>
            ) : null}

            <button disabled={processing} onClick={placeOrder} className="min-h-12 w-full rounded-full bg-ink px-5 text-sm font-bold uppercase tracking-[0.14em] text-ivory disabled:opacity-55">
              {processing ? "Processing..." : "Place Order"}
            </button>
          </div>
          <OrderSummary showCheckoutButton={false} />
        </div>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium capitalize">
      {label}
      <input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-ink/15 px-3" />
    </label>
  );
}
