import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import type { TreatmentInput } from "@/lib/schemas";

export type TreatmentWithPatient = Prisma.TreatmentGetPayload<{
  include: { patient: { select: { id: true; fullName: true } } };
}>;

export async function listActiveTreatments(): Promise<TreatmentWithPatient[]> {
  return prisma.treatment.findMany({
    where: { status: "ACTIVO" },
    include: { patient: { select: { id: true, fullName: true } } },
    orderBy: { startedAt: "asc" },
  });
}

export async function listTreatmentsByPatient(patientId: string) {
  return prisma.treatment.findMany({
    where: { patientId },
    orderBy: { startedAt: "desc" },
  });
}

export async function createTreatment(input: TreatmentInput) {
  return prisma.treatment.create({
    data: {
      patientId: input.patientId,
      type: input.type,
      startedAt: input.startedAt,
      estimatedEndAt: input.estimatedEndAt,
      totalPrice: input.totalPrice,
      notes: input.notes,
    },
  });
}

export async function updateTreatmentStatus(
  id: string,
  status: "ACTIVO" | "FINALIZADO" | "SUSPENDIDO",
) {
  return prisma.treatment.update({
    where: { id },
    data: {
      status,
      finishedAt: status === "FINALIZADO" ? new Date() : null,
    },
  });
}
