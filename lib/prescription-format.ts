import type { EyePrescription, PrescriptionData } from "@/types/commerce";

export function formatPrescriptionNumber(value?: number) {
  if (value === undefined) return "";
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
}

export function formatEyePrescription(eye?: EyePrescription) {
  if (!eye) return "Not entered";

  const parts = [
    eye.sph !== undefined ? `SPH ${formatPrescriptionNumber(eye.sph)}` : "",
    eye.cyl !== undefined ? `CYL ${formatPrescriptionNumber(eye.cyl)}` : "",
    eye.axis !== undefined ? `AXIS ${eye.axis}` : "",
    eye.add !== undefined ? `ADD ${formatPrescriptionNumber(eye.add)}` : "",
    eye.pd !== undefined ? `PD ${eye.pd}` : "",
  ].filter(Boolean);

  return parts.length ? parts.join(" / ") : "Not entered";
}

export function prescriptionStatusText(prescription?: PrescriptionData) {
  if (prescription?.method === "submit-later") return "Prescription pending - our team will contact you after checkout.";
  if (prescription?.method === "upload") return `Prescription uploaded${prescription.uploadedFile?.name ? `: ${prescription.uploadedFile.name}` : ""}`;
  if (prescription?.method === "manual") return "Manual prescription saved";
  return "Prescription not required";
}

export function prescriptionMethodLabel(method?: PrescriptionData["method"]) {
  if (method === "manual") return "Manual entry";
  if (method === "upload") return "Uploaded file";
  if (method === "submit-later") return "Send later";
  return "Not required";
}
