const { PrismaClient } = require("./node_modules/.prisma/client/index.js");

(async () => {
  const prisma = new PrismaClient();
  try {
    const u = await prisma.user.create({
      data: { id: "usr_test", name: "Prueba", email: "prueba@test.co", passwordHash: "x", role: "ASISTENTE", color: "#0f766e" },
    });
    console.log("create user OK:", u.id, u.name);
    const no = await prisma.user.findUnique({ where: { id: "usr_test" } });
    console.log("findUnique OK:", !!no);
    const ps = await prisma.patient.findMany({ take: 1 });
    console.log("patient OK:", Array.isArray(ps), ps.length);
    const tables = await prisma.$queryRaw(`SHOW TABLES LIMIT 8`);
    console.log("@@tables:", JSON.stringify(tables));
  } catch (e) {
    console.error("fallo:", e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
