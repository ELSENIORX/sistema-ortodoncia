import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import type { PatientInput } from "@/lib/schemas";

export type PatientListItem = Prisma.PatientGetPayload<{
  include: {
    _count: { select: { appointments: true; treatments: true } };
    treatments: { select: { id: true; status: true } };
  };
}>;

export async function listPatients(options: { query?: string; includeInactive?: boolean } = {}) {
  const query = options.query?.trim();
  return prisma.patient.findMany({
    where: {
      ...(options.includeInactive ? {} : { active: true }),
      ...(query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" as const } },
              { documentId: { contains: query, mode: "insensitive" as const } },
              { phone: { contains: query } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { appointments: true, treatments: true } },
      treatments: { select: { id: true, status: true } },
    },
    orderBy: { fullName: "asc" },
  });
}

export async function getPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      treatments: { orderBy: { startedAt: "desc" } },
      appointments: {
        orderBy: { startsAt: "desc" },
        take: 25,
        include: { orthodontist: { select: { name: true } } },
      },
    },
  });
}

export async function createPatient(input: PatientInput) {
  return prisma.patient.create({
    data: {
      fullName: input.fullName,
      documentId: input.documentId,
      birthDate: input.birthDate,
      phone: input.phone,
      email: input.email,
      address: input.address,
      guardianName: input.guardianName,
      guardianPhone: input.guardianPhone,
      notes: input.notes,
    },
  });
}

export async function countActivePatients(): Promise<number> {
  return prisma.patient.count({ where: { active: true } });
}
