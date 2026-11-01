import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Fecha relativa a hoy, en hora local del servidor. */
function at(dayOffset: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  console.log("Limpiando datos existentes…");
  await prisma.appointment.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando usuarios…");
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const admin = await prisma.user.create({
    data: {
      id: "usr_0001",
      name: "Dra. Laura Restrepo",
      email: "admin@ortodoncia.co",
      passwordHash,
      role: "ADMIN",
      color: "#0f766e",
    },
  });

  const drGomez = await prisma.user.create({
    data: {
      id: "usr_0002",
      name: "Dr. Andrés Gómez",
      email: "andres.gomez@ortodoncia.co",
      passwordHash,
      role: "ODONTOLOGO",
      color: "#1d4ed8",
    },
  });

  await prisma.user.create({
    data: {
      id: "usr_0003",
      name: "Sofía Martínez",
      email: "recepcion@ortodoncia.co",
      passwordHash,
      role: "ASISTENTE",
      color: "#9333ea",
    },
  });

  console.log("Creando pacientes…");
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        id: "pat_0001",
        fullName: "María Fernanda López",
        documentId: "1015884230",
        birthDate: new Date("2009-03-12T00:00:00"),
        phone: "310 456 7890",
        email: "maria.lopez@correo.com",
        address: "Cra 45 # 12-34, Bogotá",
        notes: "Sensibilidad leve a la pasta dental con flúor.",
      },
    }),
    prisma.patient.create({
      data: {
        id: "pat_0002",
        fullName: "Juan David Ramírez",
        documentId: "1020304050",
        birthDate: new Date("2012-07-25T00:00:00"),
        phone: "312 890 1122",
        address: "Calle 80 # 24-10, Bogotá",
        guardianName: "Claudia Ramírez",
        guardianPhone: "315 223 4455",
      },
    }),
    prisma.patient.create({
      data: {
        id: "pat_0003",
        fullName: "Sofía Torres",
        documentId: "1098765432",
        birthDate: new Date("2001-11-02T00:00:00"),
        phone: "300 112 3344",
        email: "sofia.torres@correo.com",
      },
    }),
    prisma.patient.create({
      data: {
        id: "pat_0004",
        fullName: "Andrés Felipe Cárdenas",
        documentId: "1032456789",
        birthDate: new Date("1998-05-19T00:00:00"),
        phone: "301 556 7788",
        email: "af.cardenas@correo.com",
        notes: "Bruxismo nocturno.",
      },
    }),
    prisma.patient.create({
      data: {
        id: "pat_0005",
        fullName: "Valentina Gómez",
        documentId: "1100223344",
        birthDate: new Date("2010-01-30T00:00:00"),
        phone: "318 334 5566",
        guardianName: "Marcela Gómez",
        guardianPhone: "318 334 5566",
      },
    }),
    prisma.patient.create({
      data: {
        id: "pat_0006",
        fullName: "Camila Restrepo",
        documentId: "1088997766",
        birthDate: new Date("2004-09-14T00:00:00"),
        phone: "305 778 9900",
        email: "camila.restrepo@correo.com",
      },
    }),
    prisma.patient.create({
      data: {
        id: "pat_0007",
        fullName: "Santiago Herrera",
        documentId: "1055667788",
        birthDate: new Date("1995-12-08T00:00:00"),
        phone: "314 667 8899",
        email: "santiago.herrera@correo.com",
      },
    }),
    prisma.patient.create({
      data: {
        id: "pat_0008",
        fullName: "Isabella Muñoz",
        documentId: "1077889900",
        birthDate: new Date("2008-04-21T00:00:00"),
        phone: "320 889 0011",
        guardianName: "Jorge Muñoz",
        guardianPhone: "320 889 0011",
      },
    }),
  ]);

  console.log("Creando tratamientos…");
  await prisma.treatment.createMany({
    data: [
      {
        id: "tr_0001",
        patientId: patients[0].id,
        type: "BRACKETS_METALICOS",
        status: "ACTIVO",
        startedAt: at(-120, 9),
        estimatedEndAt: at(240, 9),
        totalPrice: 3500000,
      },
      {
        id: "tr_0002",
        patientId: patients[1].id,
        type: "BRACKETS_ESTETICOS",
        status: "ACTIVO",
        startedAt: at(-60, 10),
        estimatedEndAt: at(300, 10),
        totalPrice: 4200000,
      },
      {
        id: "tr_0003",
        patientId: patients[2].id,
        type: "ALINEADORES",
        status: "ACTIVO",
        startedAt: at(-30, 11),
        estimatedEndAt: at(330, 11),
        totalPrice: 5800000,
      },
      {
        id: "tr_0004",
        patientId: patients[3].id,
        type: "BRACKETS_METALICOS",
        status: "ACTIVO",
        startedAt: at(-200, 8),
        estimatedEndAt: at(160, 8),
        totalPrice: 3200000,
      },
      {
        id: "tr_0005",
        patientId: patients[4].id,
        type: "BRACKETS_ESTETICOS",
        status: "ACTIVO",
        startedAt: at(-15, 14),
        estimatedEndAt: at(345, 14),
        totalPrice: 4500000,
      },
      {
        id: "tr_0006",
        patientId: patients[5].id,
        type: "RETENEDOR",
        status: "FINALIZADO",
        startedAt: at(-400, 9),
        estimatedEndAt: at(-30, 9),
        finishedAt: at(-30, 9),
        totalPrice: 900000,
      },
    ],
  });

  console.log("Creando citas…");
  await prisma.appointment.createMany({
    data: [
      // Hoy
      {
        id: "apt_0001",
        patientId: patients[0].id,
        orthodontistId: admin.id,
        type: "CONTROL",
        status: "CONFIRMADA",
        startsAt: at(0, 8),
        durationMin: 40,
      },
      {
        id: "apt_0002",
        patientId: patients[1].id,
        orthodontistId: drGomez.id,
        type: "AJUSTE",
        status: "CONFIRMADA",
        startsAt: at(0, 8, 40),
        durationMin: 40,
        notes: "Cambio de ligas.",
      },
      {
        id: "apt_0003",
        patientId: patients[3].id,
        orthodontistId: admin.id,
        type: "CONTROL",
        status: "PROGRAMADA",
        startsAt: at(0, 9, 20),
        durationMin: 40,
      },
      {
        id: "apt_0004",
        patientId: patients[4].id,
        orthodontistId: drGomez.id,
        type: "INSTALACION",
        status: "CONFIRMADA",
        startsAt: at(0, 10),
        durationMin: 60,
        notes: "Primera instalación de brackets.",
      },
      {
        id: "apt_0005",
        patientId: patients[5].id,
        orthodontistId: admin.id,
        type: "URGENCIA",
        status: "PROGRAMADA",
        startsAt: at(0, 11, 30),
        durationMin: 30,
        notes: "Molestia con retenedor.",
      },
      {
        id: "apt_0006",
        patientId: patients[2].id,
        orthodontistId: drGomez.id,
        type: "CONTROL",
        status: "ATENDIDA",
        startsAt: at(0, 14),
        durationMin: 40,
      },
      {
        id: "apt_0007",
        patientId: patients[6].id,
        orthodontistId: admin.id,
        type: "VALORACION",
        status: "PROGRAMADA",
        startsAt: at(0, 15),
        durationMin: 40,
      },
      // Mañana
      {
        id: "apt_0008",
        patientId: patients[7].id,
        orthodontistId: admin.id,
        type: "VALORACION",
        status: "CONFIRMADA",
        startsAt: at(1, 8, 30),
        durationMin: 40,
      },
      {
        id: "apt_0009",
        patientId: patients[0].id,
        orthodontistId: drGomez.id,
        type: "AJUSTE",
        status: "PROGRAMADA",
        startsAt: at(1, 10),
        durationMin: 40,
      },
      // Próximos días
      {
        id: "apt_0010",
        patientId: patients[1].id,
        orthodontistId: drGomez.id,
        type: "CONTROL",
        status: "PROGRAMADA",
        startsAt: at(3, 9),
        durationMin: 40,
      },
      {
        id: "apt_0011",
        patientId: patients[4].id,
        orthodontistId: drGomez.id,
        type: "CONTROL",
        status: "PROGRAMADA",
        startsAt: at(5, 11),
        durationMin: 40,
      },
    ],
  });

  console.log("\n✅ Datos de demostración creados.");
  console.log("   Usuarios:");
  console.log("   - admin@ortodoncia.co / demo1234 (Administradora)");
  console.log("   - andres.gomez@ortodoncia.co / demo1234 (Odontólogo)");
  console.log("   - recepcion@ortodoncia.co / demo1234 (Asistente)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
