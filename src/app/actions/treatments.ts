"use server";

import { revalidatePath } from "next/cache";
import { treatmentSchema, treatmentStatusSchema, toFieldErrors } from "@/lib/schemas";
import { createTreatment, updateTreatmentStatus } from "@/server/services/treatments";
import { requireUser } from "@/lib/session";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { treatmentTypeLabels } from "@/lib/labels";

export async function createTreatmentAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = treatmentSchema.safeParse({
    patientId: formData.get("patientId"),
    type: formData.get("type"),
    startedAt: formData.get("startedAt"),
    estimatedEndAt: formData.get("estimatedEndAt"),
    totalPrice: formData.get("totalPrice"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los datos del tratamiento.",
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    const treatment = await createTreatment(parsed.data);
    revalidatePath(`/pacientes/${parsed.data.patientId}`);
    revalidatePath("/tratamientos");
    revalidatePath("/agenda");
    return successState(`Tratamiento de ${treatmentTypeLabels[treatment.type]} registrado.`);
  } catch (error) {
    console.error("[createTreatmentAction]", error);
    return errorState("No fue posible registrar el tratamiento.");
  }
}

export async function updateTreatmentStatusAction(formData: FormData): Promise<void> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  const parsedStatus = treatmentStatusSchema.safeParse(formData.get("status"));
  if (!id || !parsedStatus.success) return;

  try {
    await updateTreatmentStatus(id, parsedStatus.data);
    revalidatePath("/tratamientos");
    if (patientId) revalidatePath(`/pacientes/${patientId}`);
  } catch (error) {
    console.error("[updateTreatmentStatusAction]", error);
  }
}
