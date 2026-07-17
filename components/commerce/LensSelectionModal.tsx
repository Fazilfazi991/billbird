"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Glasses,
  Loader2,
  ScanEye,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatAed } from "@/data/products";
import { getLensTypes } from "@/lib/lens-service";
import {
  formatEyePrescription,
  prescriptionMethodLabel,
  prescriptionStatusText,
} from "@/lib/prescription-format";
import type { CoverCustomization, LensPackage, LensSelection, PowerType, PrescriptionData, Product } from "@/types/commerce";
import { CoverCustomizationSummary } from "./CoverCustomization";

const sphValues = Array.from({ length: 81 }, (_, index) => (8 - index * 0.25).toFixed(2));
const cylValues = Array.from({ length: 25 }, (_, index) => (0 - index * 0.25).toFixed(2));
const addValues = Array.from({ length: 12 }, (_, index) => (0.75 + index * 0.25).toFixed(2));

function emptyPrescription(method: PrescriptionData["method"]): PrescriptionData {
  return { method, rightEye: {}, leftEye: {} };
}

export function LensSelectionModal({
  product,
  frameColor,
  frameSize,
  coverCustomization,
  onClose,
  onComplete,
}: {
  product: Product;
  frameColor: string;
  frameSize: string;
  coverCustomization?: CoverCustomization;
  onClose: () => void;
  onComplete: (selection: LensSelection) => void;
}) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerContentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [powerType, setPowerType] = useState<PowerType | null>(null);
  const [advancingPowerType, setAdvancingPowerType] = useState(false);
  const [processingSelection, setProcessingSelection] = useState(false);
  const [cartStatus, setCartStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showToast, setShowToast] = useState(false);
  const [lensOptions, setLensOptions] = useState<LensPackage[]>([]);
  const [loadingLens, setLoadingLens] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<LensPackage | null>(null);
  const [prescription, setPrescription] = useState<PrescriptionData>(emptyPrescription("submit-later"));
  const [errors, setErrors] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
        ),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    window.setTimeout(() => drawerRef.current?.querySelector<HTMLElement>("button")?.focus(), 0);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  });

  useEffect(() => {
    if (!powerType) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoadingLens(true);
      setSelectedPackage(null);
      setDetailsOpen(null);

      getLensTypes(product, powerType)
        .then((lenses) => {
          if (!cancelled) setLensOptions(lenses);
        })
        .finally(() => {
          if (!cancelled) setLoadingLens(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [powerType, product]);

  const activeTitle = useMemo(() => {
    if (cartStatus === "success") return "Added to Cart";
    if (step === 1) return "Select Lens Type";
    if (step === 2) return "Choose Your Lens";
    return "Add Your Prescription";
  }, [cartStatus, step]);

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
    if (powerType === "with-power" && prescription.method === "manual") {
      if (prescription.rightEye?.sph === undefined) nextErrors.push("Right eye SPH is required.");
      if (prescription.leftEye?.sph === undefined) nextErrors.push("Left eye SPH is required.");
      const rightCyl = prescription.rightEye?.cyl ?? 0;
      const leftCyl = prescription.leftEye?.cyl ?? 0;
      if (rightCyl !== 0 && !prescription.rightEye?.axis) nextErrors.push("Right eye AXIS is required when CYL is used.");
      if (leftCyl !== 0 && !prescription.leftEye?.axis) nextErrors.push("Left eye AXIS is required when CYL is used.");
    }
    if (powerType === "with-power" && prescription.method === "upload" && !prescription.uploadedFile) {
      nextErrors.push("Upload your prescription file.");
    }
    setErrors(nextErrors);
    return nextErrors.length === 0;
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

  function scrollDrawerToTop() {
    drawerContentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePowerTypeSelect(type: PowerType) {
    if (advancingPowerType) return;

    setPowerType(type);
    setAdvancingPowerType(true);
    setPrescription(emptyPrescription(type === "without-power" ? "not-required" : "submit-later"));
    setErrors([]);

    window.setTimeout(() => {
      setStep(2);
      setAdvancingPowerType(false);
      scrollDrawerToTop();
    }, 250);
  }

  async function addConfiguredProductToCart(lensOverride?: LensPackage) {
    const lensToAdd = lensOverride ?? selectedPackage;
    if (!powerType || !lensToAdd) return;
    if (powerType === "with-power" && !validatePrescription()) return;

    try {
      setCartStatus("loading");
      setProcessingSelection(true);
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      onComplete({
        powerType,
        lensPackageId: lensToAdd.id,
        lensPackageName: lensToAdd.name,
        lensPrice: lensToAdd.price,
        prescription: powerType === "without-power" ? { method: "not-required" } : prescription,
      });
      setCartStatus("success");
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 3000);
      scrollDrawerToTop();
    } catch {
      setCartStatus("error");
    } finally {
      setProcessingSelection(false);
    }
  }

  function handleLensSelect(lens: LensPackage) {
    if (processingSelection) return;

    setSelectedPackage(lens);
    setProcessingSelection(true);
    setErrors([]);

    window.setTimeout(() => {
      if (powerType === "with-power") {
        setStep(3);
        setProcessingSelection(false);
        scrollDrawerToTop();
        return;
      }

      void addConfiguredProductToCart(lens);
    }, 250);
  }

  function continueFlow() {
    setErrors([]);
    if (step === 3) void addConfiguredProductToCart();
  }

  function handlePrescriptionMethodSelect(method: PrescriptionData["method"]) {
    setErrors([]);
    setPrescription((current) => {
      if (current.method === method) return current;
      if (method === "manual") {
        return {
          method,
          rightEye: current.rightEye ?? {},
          leftEye: current.leftEye ?? {},
          notes: current.notes,
        };
      }
      if (method === "upload") {
        return {
          method,
          uploadedFile: current.uploadedFile,
          notes: current.notes,
        };
      }
      return emptyPrescription(method);
    });
  }

  const canContinue = step === 3 && Boolean(prescription.method);

  const buttonLabel = cartStatus === "loading" ? "Adding to Cart..." : "Add to Cart";
  const coverPrice = coverCustomization?.additionalPrice ?? 0;
  const totalPrice = product.price + (selectedPackage?.price ?? 0) + coverPrice;
  const powerTypeLabel = powerType === "with-power" ? "With Power" : "Without Power";

  return (
    <AnimatePresence>
      {showToast ? (
        <motion.div
          className="fixed bottom-5 left-1/2 z-[95] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ivory shadow-soft md:bottom-auto md:left-auto md:right-6 md:top-24 md:translate-x-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          Product added to cart
        </motion.div>
      ) : null}
      <motion.div
        className="fixed inset-0 z-[90] bg-ink/58"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={requestClose}
        aria-hidden="true"
      />
      <motion.aside
        ref={drawerRef}
        className="fixed inset-y-0 end-0 z-[91] flex h-[100dvh] w-full flex-col overflow-hidden bg-ivory text-ink shadow-soft outline-none sm:max-w-[520px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lens-drawer-title"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="border-b border-ink/10 bg-ivory/95 px-5 py-4 backdrop-blur">
          <div className="grid min-h-11 grid-cols-[80px_1fr_44px] items-center gap-2">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : requestClose())}
              className="inline-flex min-h-11 items-center gap-1 rounded-full text-sm font-bold uppercase tracking-[0.12em]"
            >
              <ChevronLeft size={18} /> Back
            </button>
            <h2 id="lens-drawer-title" className="text-center font-serif text-2xl">
              {activeTitle}
            </h2>
            <button
              onClick={requestClose}
              className="grid size-11 place-items-center rounded-full border border-ink/10"
              aria-label="Close lens drawer"
            >
              <X size={20} />
            </button>
          </div>

          {cartStatus !== "success" ? (
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[0.64rem] font-bold uppercase tracking-[0.1em]">
              {["Power Type", "Lenses", "Add Power"].map((label, index) => {
                const itemStep = index + 1;
                const complete = step > itemStep;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={itemStep > step || processingSelection}
                    onClick={() => itemStep < step && setStep(itemStep)}
                    aria-current={step === itemStep ? "step" : undefined}
                    className={`min-h-10 rounded-full border px-2 transition ${
                      complete
                        ? "border-gold bg-gold/15 text-ink"
                        : step === itemStep
                          ? "border-ink bg-ink text-ivory"
                          : "border-ink/10 text-ink/38"
                    }`}
                  >
                    {complete ? <Check className="mx-auto inline" size={13} /> : null} {label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </header>

        <div ref={drawerContentRef} className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 pb-32">
          {cartStatus === "success" ? (
            <section className="flex min-h-full flex-col items-center justify-center text-center">
              <div className="grid size-16 place-items-center rounded-full bg-gold/20 text-leather">
                <Check size={30} />
              </div>
              <h3 className="mt-5 font-serif text-4xl">Product Added to Cart</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-ink/58">
                Your selected frame and lens have been added to the cart.
              </p>
              <div className="mt-6 w-full rounded-[16px] border border-ink/10 bg-white p-4 text-start shadow-sm">
                <div className="flex gap-4">
                  <img src={product.images[0]} alt={product.name} className="size-20 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="font-serif text-2xl leading-tight">{product.name}</p>
                    <p className="mt-1 text-sm text-ink/58">Frame Size: {frameSize}</p>
                    <p className="text-sm text-ink/58">Power Type: {powerTypeLabel}</p>
                    <p className="text-sm text-ink/58">Lens: {selectedPackage?.name}</p>
                    {coverCustomization?.enabled ? (
                      <p className="text-sm text-ink/58">Cover: Custom Cover</p>
                    ) : null}
                    <p className="mt-2 font-bold">{formatAed(totalPrice)}</p>
                  </div>
                </div>
                <CoverCustomizationSummary customization={coverCustomization} compact />
                <div className="mt-4 rounded-lg bg-ivory p-3 text-sm leading-6 text-ink/65">
                  <p>
                    <strong className="text-ink">Prescription:</strong>{" "}
                    {prescriptionMethodLabel(powerType === "without-power" ? "not-required" : prescription.method)}
                  </p>
                  {powerType === "with-power" && prescription.method === "manual" ? (
                    <>
                      <p>
                        <strong className="text-ink">Right / OD:</strong>{" "}
                        {formatEyePrescription(prescription.rightEye)}
                      </p>
                      <p>
                        <strong className="text-ink">Left / OS:</strong>{" "}
                        {formatEyePrescription(prescription.leftEye)}
                      </p>
                      {prescription.notes ? (
                        <p>
                          <strong className="text-ink">Notes:</strong> {prescription.notes}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p>{prescriptionStatusText(powerType === "without-power" ? { method: "not-required" } : prescription)}</p>
                  )}
                </div>
              </div>
              <div className="mt-7 grid w-full gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push("/cart");
                  }}
                  className="min-h-12 rounded-full bg-ink px-5 text-sm font-bold uppercase tracking-[0.14em] text-ivory transition hover:bg-leather"
                >
                  Go to Cart
                </button>
                <button
                  onClick={onClose}
                  className="min-h-12 rounded-full border border-ink/15 bg-white px-5 text-sm font-bold uppercase tracking-[0.14em] text-ink transition hover:border-gold"
                >
                  Continue Browsing
                </button>
              </div>
            </section>
          ) : (
            <>
          <div className="rounded-[14px] border border-ink/10 bg-white p-3">
            <div className="flex items-center gap-3">
              <img src={product.images[0]} alt="" className="size-16 rounded-lg object-cover" />
              <div>
                <p className="font-serif text-xl leading-tight">{product.name}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {frameColor} / {frameSize} / {formatAed(product.price + coverPrice)}
                </p>
              </div>
            </div>
            <CoverCustomizationSummary customization={coverCustomization} compact />
          </div>

          {step === 1 ? (
            <section className="mt-6">
              <h3 className="font-serif text-3xl">Select your Power Type</h3>
              <div className="mt-5 grid gap-3">
                {[
                  {
                    type: "without-power" as PowerType,
                    title: "Without Power",
                    text: "Regular Glasses / Sunglasses",
                    Icon: Glasses,
                  },
                  {
                    type: "with-power" as PowerType,
                    title: "With Power",
                    text: "Prescription Glasses / Sunglasses",
                    Icon: ScanEye,
                  },
                ].map(({ type, title, text, Icon }) => (
                  <button
                    key={type}
                    onClick={() => handlePowerTypeSelect(type)}
                    disabled={advancingPowerType || processingSelection}
                    className={`flex min-h-24 items-center gap-4 rounded-[14px] border bg-white p-4 text-start shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                      powerType === type ? "border-gold bg-gold/10 ring-2 ring-gold/25" : "border-ink/10"
                    }`}
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-bone text-leather">
                      <Icon size={23} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-2xl">{title}</span>
                      <span className="mt-1 block text-sm text-ink/58">{text}</span>
                    </span>
                    {powerType === type && advancingPowerType ? (
                      <Check className="text-gold" size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="mt-6">
              <h3 className="font-serif text-3xl">Choose Your Lens</h3>
              <p className="mt-2 text-sm leading-6 text-ink/58">
                Demo BillBirD lens options are shown here and can be connected to BillBirD Supabase later.
              </p>
              {loadingLens ? (
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-ink/58">
                  <Loader2 className="animate-spin" size={18} /> Loading lenses
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {lensOptions.map((item) => (
                    <article
                      key={item.id}
                      className={`rounded-[14px] border bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                        selectedPackage?.id === item.id ? "border-gold ring-2 ring-gold/25" : "border-ink/10"
                      }`}
                    >
                      <button
                        onClick={() => handleLensSelect(item)}
                        disabled={processingSelection}
                        className="flex min-h-16 w-full items-center gap-4 text-start"
                      >
                        <span
                          className="grid size-12 shrink-0 place-items-center rounded-full border border-ink/10"
                          style={{ background: item.color.toLowerCase() === "clear" ? "#f5f1e8" : item.color.toLowerCase() }}
                        >
                          <span className="size-6 rounded-full bg-white/55" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-2xl">{item.name}</span>
                          <span className="mt-1 block text-sm text-ink/58">
                            {item.price ? formatAed(item.price) : "Included"}
                          </span>
                        </span>
                        {processingSelection && selectedPackage?.id === item.id && powerType === "without-power" ? (
                          <span className="flex items-center gap-2 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-leather">
                            <Loader2 className="animate-spin" size={16} /> Adding to cart...
                          </span>
                        ) : selectedPackage?.id === item.id ? (
                          <Check className="text-gold" size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => setDetailsOpen(detailsOpen === item.id ? null : item.id)}
                        disabled={processingSelection}
                        className="mt-3 min-h-9 text-xs font-bold uppercase tracking-[0.14em] text-leather"
                        aria-expanded={detailsOpen === item.id}
                      >
                        View Details
                      </button>
                      {detailsOpen === item.id ? (
                        <div className="mt-2 rounded-lg bg-ivory p-3 text-sm leading-6 text-ink/65">
                          <p>{item.details.description}</p>
                          <p className="mt-2">
                            <strong className="text-ink">Coating:</strong> {item.details.coating}
                          </p>
                          <p>
                            <strong className="text-ink">Warranty:</strong> {item.details.warranty}
                          </p>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {step === 3 ? (
            <section className="mt-6 space-y-5">
              <h3 className="font-serif text-3xl">Add Your Prescription</h3>
              <div className="grid gap-3">
                {[
                  { method: "upload", title: "Upload Prescription", text: "PDF, JPG, PNG or HEIC" },
                  { method: "manual", title: "Enter Prescription Manually", text: "Use your latest prescription" },
                  { method: "submit-later", title: "I'll Send Later", text: "Checkout now and share power later" },
                ].map((option) => (
                  <button
                    key={option.method}
                    onClick={() => handlePrescriptionMethodSelect(option.method as PrescriptionData["method"])}
                    className={`min-h-20 rounded-[14px] border bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 ${
                      prescription.method === option.method ? "border-gold ring-2 ring-gold/25" : "border-ink/10"
                    }`}
                  >
                    <span className="block font-serif text-2xl">{option.title}</span>
                    <span className="mt-1 block text-sm text-ink/58">{option.text}</span>
                  </button>
                ))}
              </div>

              {prescription.method === "upload" ? (
                <div className="rounded-[14px] border border-dashed border-ink/20 bg-white p-5 text-center">
                  <FileUp className="mx-auto text-leather" size={30} />
                  <p className="mt-3 font-serif text-2xl">Upload Prescription</p>
                  <input
                    className="mt-5 w-full text-sm"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
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
                      {prescription.uploadedFile.name} selected
                    </div>
                  ) : null}
                </div>
              ) : null}

              {prescription.method === "manual" ? (
                <div className="rounded-[14px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-serif text-2xl">Prescription Form</h4>
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
                      <div className="grid grid-cols-2 gap-3">
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
                        <label className="text-sm">PD
                          <input className="mt-1 min-h-11 w-full rounded-lg border border-ink/15 px-3" type="number" step="0.5" value={prescription[eye]?.pd ?? ""} onChange={(event) => updateEye(eye, "pd", event.target.value)} />
                        </label>
                        <label className="text-sm">ADD
                          <select className="mt-1 min-h-11 w-full rounded-lg border border-ink/15 bg-white px-3" value={prescription[eye]?.add ?? ""} onChange={(event) => updateEye(eye, "add", event.target.value)}>
                            <option value="">Optional</option>
                            {addValues.map((value) => <option key={value} value={value}>{value}</option>)}
                          </select>
                        </label>
                      </div>
                    </div>
                  ))}
                  <label className="mt-5 block text-sm">Notes
                    <textarea className="mt-1 min-h-24 w-full rounded-lg border border-ink/15 p-3" value={prescription.notes ?? ""} onChange={(event) => setPrescription((current) => ({ ...current, notes: event.target.value }))} />
                  </label>
                </div>
              ) : null}
            </section>
          ) : null}

          {errors.length ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {errors.map((error) => <p key={error}>{error}</p>)}
              {cartStatus === "error" ? (
                <button onClick={() => void addConfiguredProductToCart()} className="mt-3 min-h-10 rounded-full bg-ink px-4 text-xs font-bold uppercase tracking-[0.12em] text-ivory">
                  Try Again
                </button>
              ) : null}
            </div>
          ) : null}
          {cartStatus === "error" && !errors.length ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              Unable to add this product to the cart.
              <button onClick={() => void addConfiguredProductToCart()} className="mt-3 block min-h-10 rounded-full bg-ink px-4 text-xs font-bold uppercase tracking-[0.12em] text-ivory">
                Try Again
              </button>
            </div>
          ) : null}
            </>
          )}
        </div>

        {cartStatus !== "success" ? (
        <footer className="sticky bottom-0 border-t border-ink/10 bg-ivory/96 p-5 backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-4 text-sm">
            <span className="text-ink/58">Frame + lens + cover</span>
            <strong>{formatAed(totalPrice)}</strong>
          </div>
          {step === 3 ? (
            <button
              onClick={continueFlow}
              disabled={!canContinue || loadingLens || processingSelection || cartStatus === "loading"}
              className="min-h-12 w-full rounded-full bg-ink px-5 text-sm font-bold uppercase tracking-[0.14em] text-ivory transition hover:bg-leather disabled:cursor-not-allowed disabled:opacity-45"
            >
              {buttonLabel}
            </button>
          ) : null}
        </footer>
        ) : null}
      </motion.aside>
    </AnimatePresence>
  );
}
