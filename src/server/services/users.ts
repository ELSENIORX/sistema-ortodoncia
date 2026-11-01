import { prisma } from "@/server/db";

export async function listProfessionals() {
  return prisma.user.findMany({
    where: { active: true, role: { in: ["ADMIN", "ODONTOLOGO"] } },
    select: { id: true, name: true, color: true, role: true },
    orderBy: { name: "asc" },
  });
}

export async function countActiveProfessionals(): Promise<number> {
  return prisma.user.count({
    where: { active: true, role: { in: ["ADMIN", "ODONTOLOGO"] } },
  });
}
