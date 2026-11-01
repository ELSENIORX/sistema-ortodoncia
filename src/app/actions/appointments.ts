"use server";

import { revalidatePath } from "next/cache";
import { appointmentSchema, appointmentStatusSchema, toFieldErrors } from "@/lib/schemas";
import {
  AppointmentConflictError,
  AppointmentValidationError,
  createAppointment,
  updateAppointmentStatus,
} from "@/server/services/appointments";
import { requireUser } from "@/lib/session";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { formatTimeRange } from "@/lib/dates";

function revalidateAppointmentViews(patientId?: string) {
  revalidatePath("/agenda");
  revalidatePath("/");
  revalidatePath("/pacientes");
  if (patientId) revalidatePath(`/pacientes/${patientId}`);
}

export async function createAppointmentAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = appointmentSchema.safeParse({
    patientId: formData.get("patientId"),
    orthodontistId: formData.get("orthodontistId"),
    type: formData.get("type"),
    startsAt: formData.get("startsAt"),
    durationMin: formData.get("durationMin"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los datos de la cita.",
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    const appointment = await createAppointment(parsed.data);
    revalidateAppointmentViews(parsed.data.patientId);
    return successState(
      `Cita agendada con ${appointment.patient.fullName} de ${formatTimeRange(
        appointment.startsAt,
        appointment.durationMin,
      )}.`,
    );
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      return errorState(error.message, { startsAt: "Horario ocupado para este profesional" });
    }
    if (error instanceof AppointmentValidationError) {
      return errorState(error.message, { startsAt: error.message });
    }
    console.error("[createAppointmentAction]", error);
    return errorState("No fue posible agendar la cita. Inténtalo de nuevo.");
  }
}

/** Se usa desde formularios pequeños en la agenda (no requiere estado de UI). */
export async function updateAppointmentStatusAction(formData: FormData): Promise<void> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  const parsedStatus = appointmentStatusSchema.safeParse(formData.get("status"));
  if (!id || !parsedStatus.success) return;

  try {
    await updateAppointmentStatus(id, parsedStatus.data);
    revalidateAppointmentViews();
  } catch (error) {
    console.error("[updateAppointmentStatusAction]", error);
  }
}
