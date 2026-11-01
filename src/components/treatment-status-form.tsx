import { updateTreatmentStatusAction } from "@/app/actions/treatments";

const tones = {
  finalize: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  suspend: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  reactivate: "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100",
} as const;

export function TreatmentStatusForm({
  treatmentId,
  patientId,
  status,
  label,
  tone = "finalize",
}: {
  treatmentId: string;
  patientId: string;
  status: "ACTIVO" | "FINALIZADO" | "SUSPENDIDO";
  label: string;
  tone?: keyof typeof tones;
}) {
  return (
    <form action={updateTreatmentStatusAction} className="inline">
      <input type="hidden" name="id" value={treatmentId} />
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${tones[tone]}`}
      >
        {label}
      </button>
    </form>
  );
}
