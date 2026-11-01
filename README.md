# OrtoAgenda — Sistema de agendamiento de citas de ortodoncia

Aplicación web para gestionar la agenda diaria de una clínica de ortodoncia: pacientes,
tratamientos y citas por profesional, con detección automática de cruces de horario.

## Stack

- **Next.js 16** (App Router, Server Actions) + **React 19**
- **TypeScript** en modo estricto
- **Prisma 6** + **PostgreSQL 16**
- **Tailwind CSS 4**
- Sesión con cookie firmada (HMAC-SHA256) y contraseñas con **bcrypt**
- Validación de formularios con **Zod**

## Puesta en marcha

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
cp .env.example .env
# Edita DATABASE_URL y SESSION_SECRET (genera uno con: openssl rand -hex 32)

# 3. Base de datos (Docker)
docker compose up -d

# 4. Esquema y datos de demostración
npm run db:push
npm run db:seed

# 5. Servidor de desarrollo
npm run dev
```

Abre http://localhost:3000 e inicia sesión con:

| Correo | Contraseña | Rol |
| --- | --- | --- |
| `admin@ortodoncia.co` | `demo1234` | Administradora |
| `andres.gomez@ortodoncia.co` | `demo1234` | Odontólogo |
| `recepcion@ortodoncia.co` | `demo1234` | Asistente |

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera el cliente Prisma y compila para producción |
| `npm start` | Sirve la compilación de producción |
| `npm run typecheck` | Verificación de tipos |
| `npm run db:push` | Aplica el esquema Prisma a la base de datos |
| `npm run db:seed` | Carga datos de demostración |
| `npm run db:reset` | Reinicia la base y vuelve a sembrar datos |
| `npm run db:studio` | Abre Prisma Studio |

## Estructura

```
prisma/
  schema.prisma          Modelo de datos (User, Patient, Treatment, Appointment)
  seed.ts                Datos de demostración
src/
  app/
    layout.tsx           Layout raíz
    page.tsx             Redirige a /agenda
    login/               Inicio de sesión
    (app)/               Rutas protegidas con el shell autenticado
      layout.tsx         Header, navegación y cierre de sesión
      agenda/            Agenda diaria y agendamiento de citas
      pacientes/         Listado, búsqueda y registro de pacientes
      pacientes/[id]/    Historia clínica del paciente
      tratamientos/      Tratamientos activos
    actions/             Server Actions (auth, pacientes, citas, tratamientos)
  components/            Componentes de UI y formularios de cliente
  lib/                   Sesión, validación Zod, fechas y etiquetas
  server/
    db.ts                Cliente Prisma (singleton)
    services/            Lógica de negocio y acceso a datos
```

## Reglas de negocio implementadas

- No se pueden agendar citas en el pasado.
- Un profesional no puede tener dos citas superpuestas; las canceladas y las marcadas
  como "no asistió" liberan el horario.
- Una cita puede pasar por `PROGRAMADA → CONFIRMADA → ATENDIDA`, o terminar en
  `CANCELADA` / `NO_ASISTIO`.
- Al finalizar un tratamiento se registra automáticamente la fecha de finalización.

## Notas

- Las fechas se interpretan en la zona horaria del servidor. Para producción en la nube,
  configura `TZ=America/Bogota` (o la zona de la clínica) en el entorno.
- `SESSION_SECRET` debe tener al menos 32 caracteres; en producción usa un valor único.
- La aplicación no incluye envío de recordatorios por WhatsApp/SMS; el modelo de datos ya
  está preparado para agregarlo.
