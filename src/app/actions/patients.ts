"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { patientSchema, toFieldErrors } from "@/lib/schemas";
import { createPatient } from "@/server/services/patients";
import { requireUser } from "@/lib/session";
import { errorState, successState, type ActionState } from "@/lib/action-state";

export async function createPatientAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = patientSchema.safeParse({
    fullName: formData.get("fullName"),
    documentId: formData.get("documentId"),
    birthDate: formData.get("birthDate"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    guardianName: formData.get("guardianName"),
    guardianPhone: formData.get("guardianPhone"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    const patient = await createPatient(parsed.data);
    revalidatePath("/pacientes");
    revalidatePath("/agenda");
    return successState(`Paciente ${patient.fullName} registrado correctamente.`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorState("Ya existe un paciente con ese documento de identidad.", {
        documentId: "Documento ya registrado",
      });
    }
    console.error("[createPatientAction]", error);
    return errorState("No fue posible registrar el paciente. Inténtalo de nuevo.");
  }
}
