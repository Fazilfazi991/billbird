"use client";

import { Camera, ImagePlus, Pencil, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatAed } from "@/data/products";
import {
  calculateCoverCustomizationPrice,
  coverCustomizationLabel,
  coverCustomizationType,
  formatCoverCustomizationType,
} from "@/lib/cover-customization";
import type { CoverCustomization, ProductCoverOptions } from "@/types/commerce";

const maxFileSize = 8 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const defaultCrop = { x: 50, y: 50, zoom: 1, rotation: 0 };

function standardCustomization(): CoverCustomization {
  return {
    enabled: false,
    additionalPrice: 0,
    customizationConfirmed: false,
  };
}

function getDefaultCustomCover(options: ProductCoverOptions): CoverCustomization {
  const cover = options.covers[0];
  const color = cover?.colors.find((item) => item.inStock) ?? cover?.colors[0];
  return {
    enabled: true,
    coverId: cover?.id,
    coverName: cover?.name,
    coverColorId: color?.id,
    coverColorName: color?.name,
    coverColorValue: color?.value,
    mockupImage: color?.mockupImage ?? cover?.mockupImage,
    photo: { crop: defaultCrop, cropConfirmed: false },
    engraving: { text: "", alignment: "center", spellingConfirmed: false },
    additionalPrice: options.pricing.basePrice,
    customizationConfirmed: false,
  };
}

function normalizeCustomization(options: ProductCoverOptions, customization?: CoverCustomization) {
  if (!customization?.enabled) return standardCustomization();
  const next = {
    ...getDefaultCustomCover(options),
    ...customization,
    photo: { ...getDefaultCustomCover(options).photo, ...customization.photo },
    engraving: {
      ...getDefaultCustomCover(options).engraving,
      ...customization.engraving,
      text: customization.engraving?.text ?? "",
      spellingConfirmed: Boolean(customization.engraving?.spellingConfirmed),
    },
  };
  return withCalculatedPrice(next, options);
}

function withCalculatedPrice(customization: CoverCustomization, options: ProductCoverOptions) {
  const type = coverCustomizationType(customization);
  return {
    ...customization,
    type,
    additionalPrice: calculateCoverCustomizationPrice(customization, options.pricing),
    customizationConfirmed: Boolean(type) && customization.customizationConfirmed,
  };
}

function validateCustomization(customization: CoverCustomization, options: ProductCoverOptions) {
  const errors: string[] = [];
  if (!customization.enabled) return errors;

  const type = coverCustomizationType(customization);
  if (!type) errors.push("Upload a photo or enter engraving text to customize your cover.");
  if (customization.photo?.originalFile && !customization.photo.cropConfirmed) {
    errors.push("Please confirm the photo crop before saving.");
  }
  const text = customization.engraving?.text?.trim() ?? "";
  if (text.length > options.engravingCharacterLimit) {
    errors.push(`Engraving must be ${options.engravingCharacterLimit} characters or fewer.`);
  }
  if (text && !customization.engraving?.spellingConfirmed) {
    errors.push("Please confirm that the engraving spelling is correct.");
  }
  if (type && !customization.customizationConfirmed) {
    errors.push("Please confirm the customization details before saving.");
  }
  return errors;
}

export function CoverAddOnSelector({
  options,
  value,
  onChange,
}: {
  options?: ProductCoverOptions;
  value?: CoverCustomization;
  onChange: (customization?: CoverCustomization) => void;
}) {
  const [open, setOpen] = useState(false);
  const customization = useMemo(
    () => (options ? normalizeCustomization(options, value) : standardCustomization()),
    [options, value],
  );

  if (!options?.customizationAvailable) return null;

  return (
    <section className="rounded-[10px] border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-leather">
            Add a Custom Cover?
          </p>
          <p className="mt-1 text-sm text-ink/58">
            Custom Cover from {formatAed(options.pricing.basePrice)}. Photo + text package{" "}
            {formatAed(options.pricing.basePrice + (options.pricing.photoAndTextPrice ?? options.pricing.photoPrice + options.pricing.engravingPrice))}.
          </p>
        </div>
        {customization.enabled ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-h-10 rounded-full border border-ink/15 px-4 text-xs font-bold uppercase tracking-[0.12em]"
          >
            Edit Cover
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`min-h-16 rounded-lg border p-4 text-start transition ${
            !customization.enabled ? "border-ink bg-ivory" : "border-ink/10"
          }`}
        >
          <span className="block font-serif text-xl">No, use the standard cover</span>
          <span className="mt-1 block text-sm text-ink/55">Included with the frame.</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
          className={`min-h-16 rounded-lg border p-4 text-start transition ${
            customization.enabled ? "border-gold bg-gold/10 ring-2 ring-gold/20" : "border-ink/10"
          }`}
        >
          <span className="block font-serif text-xl">Yes, customize my cover</span>
          <span className="mt-1 block text-sm text-ink/55">
            {formatAed(customization.enabled ? customization.additionalPrice : options.pricing.basePrice)} add-on
          </span>
        </button>
      </div>

      {customization.enabled ? (
        <CoverCustomizationSummary customization={customization} compact />
      ) : null}

      {open ? (
        <CoverCustomizationModal
          options={options}
          value={customization.enabled ? customization : getDefaultCustomCover(options)}
          onClose={() => setOpen(false)}
          onSave={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}

export function CoverCustomizationModal({
  options,
  value,
  onClose,
  onSave,
}: {
  options: ProductCoverOptions;
  value: CoverCustomization;
  onClose: () => void;
  onSave: (customization: CoverCustomization) => void;
}) {
  const [draft, setDraft] = useState(() => normalizeCustomization(options, value));
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const cover = options.covers.find((item) => item.id === draft.coverId) ?? options.covers[0];
  const engravingLimit = options.engravingCharacterLimit;
  const engravingText = draft.engraving?.text ?? "";
  const methods = [
    ["photo", "Upload Photo", ImagePlus],
    ["engraving", "Add Engraved Text", Pencil],
    ["photo-and-engraving", "Photo + Engraved Text", Camera],
  ] as const;
  const selectedType = coverCustomizationType(draft);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function update(next: CoverCustomization) {
    setErrors([]);
    setDraft(withCalculatedPrice({ ...next, customizationConfirmed: false }, options));
  }

  async function handleFile(file?: File) {
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) {
      setErrors(["Use JPG, JPEG, PNG, WEBP, or HEIC where supported."]);
      return;
    }
    if (file.size > maxFileSize) {
      setErrors(["File must be smaller than 8 MB."]);
      return;
    }

    setUploading(true);
    const previewUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Unable to read image"));
      reader.readAsDataURL(file);
    }).catch(() => "");
    setUploading(false);

    if (!previewUrl) {
      setErrors(["Unable to preview this image. Try another file."]);
      return;
    }

    const qualityWarning = file.size < 120 * 1024 ? "This image may be low resolution for printing." : undefined;
    update({
      ...draft,
      photo: {
        originalFile: { name: file.name, type: file.type, size: file.size, previewUrl },
        crop: defaultCrop,
        cropConfirmed: false,
        qualityWarning,
      },
    });
  }

  function selectMethod(method: "photo" | "engraving" | "photo-and-engraving") {
    update({
      ...draft,
      photo: method === "engraving" ? { crop: defaultCrop, cropConfirmed: false } : draft.photo,
      engraving: method === "photo" ? { text: "", alignment: "center", spellingConfirmed: false } : draft.engraving,
    });
  }

  function save() {
    const finalDraft = withCalculatedPrice(draft, options);
    const nextErrors = validateCustomization(finalDraft, options);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    onSave(finalDraft);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-ink/60 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[14px] bg-ivory text-ink shadow-soft"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cover-modal-title"
      >
        <header className="flex items-center justify-between border-b border-ink/10 p-4 md:p-5">
          <div>
            <p className="eyebrow text-[0.62rem]">Custom Cover</p>
            <h2 id="cover-modal-title" className="font-serif text-3xl">
              Customize your cover
            </h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full border border-ink/10" aria-label="Close cover customization">
            <X size={20} />
          </button>
        </header>

        <div className="grid flex-1 overflow-y-auto lg:grid-cols-[0.95fr_1.05fr]">
          <div className="order-2 space-y-5 p-4 md:p-6 lg:order-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-leather">Customization Method</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {methods.map(([method, label, Icon]) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => selectMethod(method)}
                    className={`min-h-24 rounded-lg border bg-white p-4 text-start transition hover:-translate-y-0.5 ${
                      selectedType === method ? "border-gold ring-2 ring-gold/20" : "border-ink/10"
                    }`}
                  >
                    <Icon className="text-leather" size={20} />
                    <span className="mt-3 block font-serif text-xl">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-leather">Cover Color</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {cover.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    disabled={!color.inStock}
                    onClick={() => update({
                      ...draft,
                      coverColorId: color.id,
                      coverColorName: color.name,
                      coverColorValue: color.value,
                      mockupImage: color.mockupImage ?? cover.mockupImage,
                    })}
                    className={`flex min-h-12 items-center gap-3 rounded-lg border bg-white px-3 text-sm font-semibold ${
                      draft.coverColorId === color.id ? "border-ink" : "border-ink/10"
                    } disabled:opacity-40`}
                  >
                    <span className="size-5 rounded-full border border-ink/10" style={{ backgroundColor: color.value }} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedType !== "engraving" ? (
              <div className="rounded-[10px] border border-dashed border-ink/20 bg-white p-4">
                <p className="font-serif text-2xl">Upload Photo</p>
                <p className="mt-1 text-sm text-ink/58">Upload a clear photo to print on your eyewear cover.</p>
                <label
                  className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg bg-ivory p-4 text-center text-sm text-ink/58"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleFile(event.dataTransfer.files[0]);
                  }}
                >
                  <Upload className="text-leather" size={26} />
                  <span className="mt-2 font-semibold text-ink">
                    {uploading ? "Preparing preview..." : "Upload from device or drag here"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    capture="environment"
                    className="sr-only"
                    onChange={(event) => void handleFile(event.target.files?.[0])}
                  />
                </label>
                {draft.photo?.originalFile ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-ivory p-3 text-sm">
                      <span className="min-w-0 truncate">{draft.photo.originalFile.name}</span>
                      <button
                        type="button"
                        onClick={() => update({ ...draft, photo: { crop: defaultCrop, cropConfirmed: false } })}
                        className="text-leather"
                      >
                        Remove
                      </button>
                    </div>
                    {draft.photo.qualityWarning ? (
                      <p className="rounded-lg bg-gold/15 p-3 text-sm text-leather">{draft.photo.qualityWarning}</p>
                    ) : null}
                    <CropSlider label="Zoom" min={1} max={2.5} step={0.1} value={draft.photo.crop?.zoom ?? 1} onChange={(value) => update({ ...draft, photo: { ...draft.photo, crop: { ...(draft.photo?.crop ?? defaultCrop), zoom: value }, cropConfirmed: false } })} />
                    <CropSlider label="Move X" min={0} max={100} step={1} value={draft.photo.crop?.x ?? 50} onChange={(value) => update({ ...draft, photo: { ...draft.photo, crop: { ...(draft.photo?.crop ?? defaultCrop), x: value }, cropConfirmed: false } })} />
                    <CropSlider label="Move Y" min={0} max={100} step={1} value={draft.photo.crop?.y ?? 50} onChange={(value) => update({ ...draft, photo: { ...draft.photo, crop: { ...(draft.photo?.crop ?? defaultCrop), y: value }, cropConfirmed: false } })} />
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => update({ ...draft, photo: { ...draft.photo, crop: defaultCrop, cropConfirmed: false } })} className="min-h-10 rounded-full border border-ink/15 px-4 text-xs font-bold uppercase tracking-[0.12em]">
                        <RotateCcw className="mr-1 inline" size={14} /> Reset Crop
                      </button>
                      <button type="button" onClick={() => update({ ...draft, photo: { ...draft.photo, crop: draft.photo?.crop ?? defaultCrop, cropConfirmed: true } })} className="min-h-10 rounded-full bg-ink px-4 text-xs font-bold uppercase tracking-[0.12em] text-ivory">
                        Confirm Crop
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {selectedType !== "photo" ? (
              <div className="rounded-[10px] border border-ink/10 bg-white p-4">
                <label className="block text-sm font-semibold">
                  Text to Engrave
                  <input
                    value={engravingText}
                    onChange={(event) => {
                      const sanitized = event.target.value.replace(/[^\w\s.,'&-]/g, "");
                      update({
                        ...draft,
                        engraving: {
                          ...(draft.engraving ?? { alignment: "center", spellingConfirmed: false }),
                          text: sanitized,
                          spellingConfirmed: false,
                        },
                      });
                    }}
                    maxLength={engravingLimit}
                    placeholder="Enter a name or short message"
                    className="mt-2 min-h-11 w-full rounded-lg border border-ink/15 px-3"
                  />
                </label>
                <div className="mt-2 flex justify-between text-xs text-ink/55">
                  <span>Letters, numbers, spaces, and basic punctuation only.</span>
                  <span>{engravingText.length}/{engravingLimit}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(["start", "center", "end"] as const).map((alignment) => (
                    <button
                      key={alignment}
                      type="button"
                      onClick={() => update({ ...draft, engraving: { ...(draft.engraving ?? { text: "" }), alignment, spellingConfirmed: false } })}
                      className={`min-h-10 rounded-full border px-4 text-xs font-bold uppercase tracking-[0.12em] ${
                        draft.engraving?.alignment === alignment ? "border-ink bg-ink text-ivory" : "border-ink/15"
                      }`}
                    >
                      {alignment}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink/58">The final engraving may vary slightly from the digital preview.</p>
                <label className="mt-4 flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.engraving?.spellingConfirmed)}
                    onChange={(event) => update({ ...draft, engraving: { ...(draft.engraving ?? { text: "" }), spellingConfirmed: event.target.checked } })}
                    className="mt-1 size-4 accent-ink"
                  />
                  <span>I have checked the spelling and confirm the engraving text is correct.</span>
                </label>
              </div>
            ) : null}

            <label className="flex items-start gap-3 rounded-[10px] border border-ink/10 bg-white p-4 text-sm">
              <input
                type="checkbox"
                checked={draft.customizationConfirmed}
                onChange={(event) => setDraft(withCalculatedPrice({ ...draft, customizationConfirmed: event.target.checked }, options))}
                className="mt-1 size-4 accent-ink"
              />
              <span>I confirm that the uploaded photo and engraving details are correct.</span>
            </label>

            {errors.length ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errors.map((error) => <p key={error}>{error}</p>)}
              </div>
            ) : null}
          </div>

          <div className="order-1 border-b border-ink/10 bg-bone p-4 md:p-6 lg:order-2 lg:border-b-0 lg:border-l">
            <CoverCustomizationPreview customization={draft} />
            <div className="mt-5 rounded-[10px] bg-white p-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-ink/58">Cover Add-on</span>
                <strong>{formatAed(draft.additionalPrice)}</strong>
              </div>
              <p className="mt-2 text-xs leading-5 text-ink/55">
                Preview is for reference only. A production-ready backend can store original and cropped assets later.
              </p>
            </div>
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-ink/10 p-4 md:flex-row md:justify-end md:p-5">
          <button type="button" onClick={onClose} className="min-h-11 rounded-full border border-ink/15 px-5 text-sm font-bold uppercase tracking-[0.14em]">
            Cancel
          </button>
          <button type="button" onClick={save} className="min-h-11 rounded-full bg-ink px-5 text-sm font-bold uppercase tracking-[0.14em] text-ivory">
            Save Customization
          </button>
        </footer>
      </div>
    </div>
  );
}

function CropSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-ink/50">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-ink"
      />
    </label>
  );
}

export function CoverCustomizationPreview({ customization }: { customization?: CoverCustomization }) {
  const crop = customization?.photo?.crop ?? defaultCrop;
  const textAlign = customization?.engraving?.alignment ?? "center";

  return (
    <div className="rounded-[12px] border border-ink/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-serif text-2xl">Preview</p>
        <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-leather">
          Reference only
        </span>
      </div>
      <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[16px] bg-ink p-5 shadow-sm">
        <div
          className="absolute inset-0 opacity-75"
          style={{ backgroundColor: customization?.coverColorValue ?? "#0b0b0b" }}
        />
        {customization?.mockupImage ? (
          <img src={customization.mockupImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen" />
        ) : null}
        <div className="absolute inset-[14%] overflow-hidden rounded-[10px] border border-dashed border-gold/70 bg-black/20">
          {customization?.photo?.originalFile?.previewUrl ? (
            <img
              src={customization.photo.originalFile.previewUrl}
              alt=""
              className="absolute h-full w-full object-cover"
              style={{
                transform: `scale(${crop.zoom}) translate(${crop.x - 50}%, ${crop.y - 50}%)`,
              }}
            />
          ) : null}
          {customization?.engraving?.text ? (
            <div className="absolute inset-x-4 bottom-5" style={{ textAlign }}>
              <span className="inline-block rounded bg-ivory/86 px-3 py-1 font-serif text-lg text-ink">
                {customization.engraving.text}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-xs text-ink/55">Printable safe area is shown with the gold dashed line.</p>
    </div>
  );
}

export function CoverCustomizationSummary({
  customization,
  compact = false,
}: {
  customization?: CoverCustomization;
  compact?: boolean;
}) {
  if (!customization?.enabled) {
    return (
      <div className={compact ? "mt-3 rounded-lg bg-ivory p-3 text-sm text-ink/60" : "rounded-lg bg-ivory p-3 text-sm text-ink/60"}>
        Cover: Standard Cover
      </div>
    );
  }

  return (
    <div className={compact ? "mt-3 rounded-lg bg-ivory p-3 text-sm leading-6 text-ink/65" : "rounded-lg bg-ivory p-3 text-sm leading-6 text-ink/65"}>
      <p><strong className="text-ink">Cover:</strong> {customization.coverName ?? "Custom Cover"}</p>
      <p><strong className="text-ink">Customization:</strong> {coverCustomizationLabel(customization)}</p>
      {customization.engraving?.text ? (
        <p><strong className="text-ink">Engraving:</strong> &ldquo;{customization.engraving.text}&rdquo;</p>
      ) : null}
      <p><strong className="text-ink">Cover Color:</strong> {customization.coverColorName ?? "Default"}</p>
      {customization.photo?.originalFile ? (
        <p><strong className="text-ink">Photo:</strong> {customization.photo.originalFile.name}</p>
      ) : null}
      <p><strong className="text-ink">Cover Add-on:</strong> {formatAed(customization.additionalPrice)}</p>
      <p className="text-xs text-ink/45">{formatCoverCustomizationType(customization)} preview is for reference only.</p>
    </div>
  );
}

export function RemoveCoverCustomizationButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-leather">
      <Trash2 size={14} /> Remove Customization
    </button>
  );
}
