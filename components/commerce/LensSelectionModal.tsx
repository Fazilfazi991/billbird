"use client";

import { Check, ChevronLeft, ChevronRight, FileUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatAed, lensPackages } from "@/data/products";
import type { LensPackage, LensSelection, PowerType, PrescriptionData, Product } from "@/types/commerce";

const sphValues = Array.from({ length: 81 }, (_, index) => (8 - index * 0.25).toFixed(2));
const cylValues = Array.from({ length: 25 }, (_, index) => (0 - index * 0.25).toFixed(2));

function emptyPrescription(method: PrescriptionData["method"]): PrescriptionData {
  return { method, rightEye: {}, leftEye: {} };
}

export function LensSelectionModal({
  product,
  frameColor,
  frameSize,
  onClose,
  onComplete,
}: {
  product: Product;
  frameColor: string;
  frameSize: string;
  onClose: () => void;
  onComplete: (selection: LensSelection) => void;
}) {
  const [step, setStep] = useState(1);
  const [powerType, setPowerType] = useState<PowerType | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<LensPackage | null>(null);
  const [prescription, setPrescription] = useState<PrescriptionData>(emptyPrescription("submit-later"));
  const [errors, setErrors] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  });

  const compatiblePackages = useMemo(
    () =>
      lensPackages.filter(
        (item) =>
          powerType &&
          item.compatiblePowerTypes.includes(powerType) &&
          item.compatibleCategories.includes(product.category),
      ),
    [powerType, product.category],
  );

  function hasEnteredPrescription() {
    return (
      prescription.method === "manual" ||
      prescription.method === "upload" ||
      Boolean(prescription.notes)
    );
  }

  function requestClose() {
    if (hasEnteredPrescription() && !window.confirm("Close lens selection and discard prescription details?")) return;
    onClose();
  }

  function validatePrescription() {
    const nextErrors: string[] = [];
    if (prescription.method === "manual") {
      if (prescription.rightEye?.sph === undefined) nextErrors.push("Right eye SPH is required.");
      if (prescription.leftEye?.sph === undefined) nextErrors.push("Left eye SPH is required.");
      const rightCyl = prescription.rightEye?.cyl ?? 0;
      const leftCyl = prescription.leftEye?.cyl ?? 0;
      if (rightCyl !== 0 && !prescription.rightEye?.axis) nextErrors.push("Right eye AXIS is required when CYL is used.");
      if (leftCyl !== 0 && !prescription.leftEye?.axis) nextErrors.push("Left eye AXIS is required when CYL is used.");
    }
    if (prescription.method === "upload" && !prescription.uploadedFile) nextErrors.push("Upload your prescription file.");
    setErrors(nextErrors);
    return nextErrors.length === 0;
  }

  function addToCart() {
    if (!powerType || !selectedPackage || !validatePrescription()) return;
    onComplete({
      powerType,
      lensPackageId: selectedPackage.id,
      lensPackageName: selectedPackage.name,
      lensPrice: selectedPackage.price,
      prescription,
    });
  }

  function updateEye(eye: "rightEye" | "leftEye", key: string, value: string) {
    setPrescription((current) => ({
      ...current,
      [eye]: {
        ...current[eye],
        [key]: value === "" ? undefined : Number(value),
      },
    }));
  }

  const reviewReady = step === 4 && powerType && selectedPackage;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end bg-ink/60 p-0 backdrop-blur-sm md:items-center md:justify-center md:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lens-modal-title"
    >
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-ivory text-ink shadow-soft md:h-[90vh] md:max-w-5xl md:rounded-[16px]">
        <header className="sticky top-0 z-10 border-b border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex min-h-11 items-center justify-between gap-3">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : requestClose())}
              className="grid size-10 place-items-center rounded-full border border-ink/10"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-leather">{product.name}</p>
              <h2 id="lens-modal-title" className="font-serif text-xl md:text-2xl">
                {step === 1 ? "Select your Power Type" : step === 2 ? "Choose Lens Package" : step === 3 ? "Eye Power" : "Review Selection"}
              </h2>
            </div>
            <button onClick={requestClose} className="grid size-10 place-items-center rounded-full border border-ink/10" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[0.68rem] font-bold uppercase tracking-[0.1em]">
            {["Power Type", "Lenses", "Add Power"].map((label, index) => {
              const itemStep = index + 1;
              const complete = step > itemStep;
              return (
                <button
                  key={label}
                  disabled={itemStep > step}
                  onClick={() => setStep(itemStep)}
                  aria-current={step === itemStep ? "step" : undefined}
                  className={`min-h-9 rounded-full border px-2 ${complete ? "border-emerald-600 bg-emerald-50 text-emerald-700" : step === itemStep ? "border-ink bg-ink text-ivory" : "border-ink/10 text-ink/40"}`}
                >
                  {complete ? <Check className="mx-auto inline" size={14} /> : null} {label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 md:px-8 md:py-7">
          {step === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { type: "without-power" as PowerType, title: "Without Power", text: "Regular sunglasses" },
                { type: "with-power" as PowerType, title: "With Power", text: "Prescription sunglasses" },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    setPowerType(option.type);
                    setSelectedPackage(null);
                    setPrescription(emptyPrescription(option.type === "without-power" ? "not-required" : "submit-later"));
                    setStep(2);
                  }}
                  className={`flex min-h-32 items-center gap-4 rounded-[12px] border bg-white p-4 text-start transition hover:border-leather ${powerType === option.type ? "border-ink ring-2 ring-ink/10" : "border-ink/10"}`}
                >
                  <img src={product.images[0]} alt="" className="size-20 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-2xl">{option.title}</span>
                    <span className="mt-1 block text-sm text-ink/60">{option.text}</span>
                  </span>
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {compatiblePackages.map((item) => (
                <article key={item.id} className="rounded-[12px] border border-ink/10 bg-white p-4">
                  <div className="flex gap-4">
                    <div className="grid size-20 place-items-center rounded-full border border-ink/10" style={{ background: item.color.toLowerCase() === "clear" ? "#f5f5f5" : item.color.toLowerCase() }}>
                      <span className="size-10 rounded-full bg-white/50" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-2xl">{item.name}</h3>
                      <p className="mt-1 text-sm font-semibold">{formatAed(item.price)}</p>
                      <ul className="mt-3 space-y-1 text-sm text-ink/60">
                        {item.features.map((feature) => (
                          <li key={feature}>- {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailsOpen(detailsOpen === item.id ? null : item.id)}
                    className="mt-4 min-h-10 text-sm font-bold text-leather"
                    aria-expanded={detailsOpen === item.id}
                  >
                    View Details
                  </button>
                  {detailsOpen === item.id ? (
                    <div className="mt-2 rounded-lg bg-ivory p-3 text-sm leading-6 text-ink/65">
                      {Object.entries(item.details).map(([key, value]) => (
                        <p key={key}>
                          <strong className="text-ink">{key.replace(/([A-Z])/g, " $1")}:</strong> {value}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  <button
                    onClick={() => {
                      setSelectedPackage(item);
                      setStep(powerType === "without-power" ? 4 : 3);
                    }}
                    className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full bg-ink text-xs font-bold uppercase tracking-[0.14em] text-ivory"
                  >
                    Select Lens
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { method: "submit-later", title: "Submit Power Later", text: "Our experts will contact you within 24 hours" },
                  { method: "manual", title: "Enter Power Manually", text: "Enter your latest eye prescription" },
                  { method: "upload", title: "Upload Prescription", text: "Upload a clear copy" },
                ].map((option) => (
                  <button
                    key={option.method}
                    onClick={() => setPrescription(emptyPrescription(option.method as PrescriptionData["method"]))}
                    className={`min-h-28 rounded-[12px] border bg-white p-4 text-start ${prescription.method === option.method ? "border-ink ring-2 ring-ink/10" : "border-ink/10"}`}
                  >
                    <span className="block font-serif text-xl">{option.title}</span>
                    <span className="mt-1 block text-sm text-ink/60">{option.text}</span>
                  </button>
                ))}
              </div>

              {prescription.method === "manual" ? (
                <div className="rounded-[12px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-serif text-2xl">Manual Prescription</h3>
                    <button
                      onClick={() => setPrescription((current) => ({ ...current, leftEye: { ...current.rightEye } }))}
                      className="min-h-10 rounded-full border border-ink/15 px-4 text-xs font-bold uppercase tracking-[0.12em]"
                    >
                      Copy Right to Left
                    </button>
                  </div>
                  {(["rightEye", "leftEye"] as const).map((eye) => (
                    <div key={eye} className="mt-5">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-leather">
                        {eye === "rightEye" ? "Right Eye / OD" : "Left Eye / OS"}
                      </p>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        <label className="text-sm">SPH
                          <select className="mt-1 min-h-11 w-full rounded-lg border border-ink/15 bg-white px-3" value={prescription[eye]?.sph ?? ""} onChange={(event) => updateEye(eye, "sph", event.target.value)}>
                            <option value="">Select</option>
                            {sphValues.map((value) => <option key={value} value={value}>{value}</option>)}
                          </select>
                        </label>
                        <label className="text-sm">CYL
                          <select className="mt-1 min-h-11 w-full rounded-lg border border-ink/15 bg-white px-3" value={prescription[eye]?.cyl ?? 0} onChange={(event) => updateEye(eye, "cyl", event.target.value)}>
                            {cylValues.map((value) => <option key={value} value={value}>{value}</option>)}
                          </select>
                        </label>
                        <label className="text-sm">AXIS
                          <input className="mt-1 min-h-11 w-full rounded-lg border border-ink/15 px-3 disabled:bg-ink/5" type="number" min="1" max="180" disabled={(prescription[eye]?.cyl ?? 0) === 0} value={prescription[eye]?.axis ?? ""} onChange={(event) => updateEye(eye, "axis", event.target.value)} />
                        </label>
                        <label className="text-sm">ADD
                          <input className="mt-1 min-h-11 w-full rounded-lg border border-ink/15 px-3" type="number" step="0.25" value={prescription[eye]?.add ?? ""} onChange={(event) => updateEye(eye, "add", event.target.value)} />
                        </label>
                        <label className="text-sm">PD
                          <input className="mt-1 min-h-11 w-full rounded-lg border border-ink/15 px-3" type="number" step="0.5" value={prescription[eye]?.pd ?? ""} onChange={(event) => updateEye(eye, "pd", event.target.value)} />
                        </label>
                      </div>
                    </div>
                  ))}
                  <label className="mt-5 block text-sm">Notes
                    <textarea className="mt-1 min-h-24 w-full rounded-lg border border-ink/15 p-3" value={prescription.notes ?? ""} onChange={(event) => setPrescription((current) => ({ ...current, notes: event.target.value }))} />
                  </label>
                </div>
              ) : null}

              {prescription.method === "upload" ? (
                <div className="rounded-[12px] border border-dashed border-ink/20 bg-white p-6 text-center">
                  <FileUp className="mx-auto text-leather" size={30} />
                  <p className="mt-3 font-serif text-2xl">Upload Prescription</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
                    Upload a clear prescription showing your name, prescription values and issue date.
                  </p>
                  <input
                    className="mt-5 w-full max-w-sm text-sm"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (file.size > 8 * 1024 * 1024) {
                        setErrors(["File must be smaller than 8 MB."]);
                        return;
                      }
                      setErrors([]);
                      setPrescription((current) => ({
                        ...current,
                        uploadedFile: { name: file.name, type: file.type, size: file.size },
                      }));
                    }}
                  />
                  {prescription.uploadedFile ? (
                    <div className="mt-4 rounded-lg bg-ivory p-3 text-sm">
                      {prescription.uploadedFile.name} uploaded
                    </div>
                  ) : null}
                </div>
              ) : null}

              {errors.length ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {errors.map((error) => <p key={error}>{error}</p>)}
                </div>
              ) : null}

              <button onClick={() => validatePrescription() && setStep(4)} className="flex min-h-12 w-full items-center justify-center rounded-full bg-ink text-sm font-bold uppercase tracking-[0.14em] text-ivory">
                Review Selection
              </button>
            </div>
          ) : null}

          {reviewReady ? (
            <div className="mx-auto max-w-2xl rounded-[12px] border border-ink/10 bg-white p-5">
              <h3 className="font-serif text-3xl">Review Selection</h3>
              <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                <div><dt className="text-ink/50">Frame</dt><dd className="font-semibold">{product.name}</dd></div>
                <div><dt className="text-ink/50">Color / Size</dt><dd className="font-semibold">{frameColor} / {frameSize}</dd></div>
                <div><dt className="text-ink/50">Power Type</dt><dd className="font-semibold">{powerType === "with-power" ? "With Power" : "Without Power"}</dd></div>
                <div><dt className="text-ink/50">Lens Package</dt><dd className="font-semibold">{selectedPackage.name}</dd></div>
                <div><dt className="text-ink/50">Prescription</dt><dd className="font-semibold">{prescription.method.replace("-", " ")}</dd></div>
                <div><dt className="text-ink/50">Estimated Delivery</dt><dd className="font-semibold">3-5 business days</dd></div>
              </dl>
              <div className="mt-5 space-y-2 border-t border-ink/10 pt-4">
                <div className="flex justify-between"><span>Frame</span><strong>{formatAed(product.price)}</strong></div>
                <div className="flex justify-between"><span>Lens</span><strong>{formatAed(selectedPackage.price)}</strong></div>
                <div className="flex justify-between text-xl"><span>Total</span><strong>{formatAed(product.price + selectedPackage.price)}</strong></div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <button onClick={() => setStep(1)} className="min-h-12 rounded-full border border-ink/15 font-bold uppercase tracking-[0.14em]">Edit Selection</button>
                <button onClick={addToCart} className="min-h-12 rounded-full bg-ink font-bold uppercase tracking-[0.14em] text-ivory">Add to Cart</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
