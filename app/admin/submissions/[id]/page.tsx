import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import {
  createSignedFileUrl,
  createSignedPhotoUrl,
  getSubmissionDetail,
  updateSubmissionStatus,
  type OnboardingStatus,
} from "@/lib/onboarding";
import CopySqlBlock from "./CopySqlBlock";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function updateStatusAction(formData: FormData) {
  "use server";
  const submissionId = formData.get("submission_id");
  const status = formData.get("status");

  if (typeof submissionId !== "string" || typeof status !== "string") {
    return;
  }

  await updateSubmissionStatus(submissionId, status as OnboardingStatus);
  revalidatePath("/admin");
  revalidatePath(`/admin/submissions/${submissionId}`);
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const submission = await getSubmissionDetail(id);
  if (!submission) {
    notFound();
  }

  const categories = submission.onboarding_submission_categories
    .map((item) => item.categories)
    .filter(Boolean);
  const regions = submission.onboarding_submission_regions
    .map((item) => item.regions)
    .filter(Boolean);

  const files = await Promise.all(
    submission.onboarding_submission_files.map(async (file) => {
      const signedUrl =
        file.file_type === "photo"
          ? await createSignedPhotoUrl(file.file_path)
          : await createSignedFileUrl(file.file_path);
      return { ...file, signedUrl };
    })
  );

  const photoFile = files.find((file) => file.file_type === "photo") || null;
  const supportingFiles = files.filter((file) => file.file_type !== "photo");

  const copyPayload = {
    full_name: submission.full_name,
    email: submission.email,
    phone: submission.phone,
    company: submission.company,
    experience_years: submission.experience_years,
    specialty: submission.specialty,
    description: submission.description,
    whatsapp_message: submission.whatsapp_message,
    coverage_all: submission.coverage_all,
    custom_category: submission.custom_category,
    categories: categories.map((category) => category?.name),
    regions: regions.map((region) => region?.name),
  };

  const slug = slugify(submission.full_name);
  const sql = buildExecutiveSql({
    name: submission.full_name,
    slug,
    phone: submission.phone,
    company: submission.company,
    experience_years: submission.experience_years,
    specialty: submission.specialty,
    description: submission.description,
    whatsapp_message: submission.whatsapp_message,
    photo_url: null,
    company_logo_url: null,
    coverage_all: submission.coverage_all,
  });

  return (
    <main className="bg-slate-50 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-emerald-600 hover:underline">
              ← Volver al listado
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {submission.full_name}
            </h1>
            <p className="text-sm text-slate-600">
              Estado: {submission.status} · Creado:{" "}
              {new Date(submission.created_at).toLocaleString("es-CL")}
            </p>
          </div>

          <form action={updateStatusAction} className="flex items-center gap-3">
            <input type="hidden" name="submission_id" value={submission.id} />
            <select
              name="status"
              defaultValue={submission.status}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="pending">pending</option>
              <option value="reviewed">reviewed</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Actualizar estado
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Datos personales</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm text-slate-700">
                <div><strong>Email:</strong> {submission.email}</div>
                <div><strong>Teléfono:</strong> {submission.phone}</div>
                <div><strong>Empresa:</strong> {submission.company}</div>
                <div><strong>Años experiencia:</strong> {submission.experience_years}</div>
                <div><strong>Especialidad:</strong> {submission.specialty}</div>
                <div><strong>Coverage:</strong> {submission.coverage_all ? "Todo Chile" : "Por regiones"}</div>
                <div><strong>Categoría libre:</strong> {submission.custom_category || "—"}</div>
              </div>
              <div className="mt-4 text-sm text-slate-700">
                <strong>Descripción:</strong>
                <p className="mt-1 whitespace-pre-line">{submission.description}</p>
              </div>
              <div className="mt-4 text-sm text-slate-700">
                <strong>WhatsApp message:</strong> {submission.whatsapp_message || "—"}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Categorías</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {categories.length > 0
                  ? categories.map((category) => (
                      <span
                        key={category?.id}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"
                      >
                        {category?.name}
                      </span>
                    ))
                  : "Sin categorías"}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Regiones</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {submission.coverage_all
                  ? "Cobertura nacional"
                  : regions.length > 0
                    ? regions.map((region) => (
                        <span
                          key={region?.id}
                          className="rounded-full bg-slate-100 px-3 py-1 text-slate-600"
                        >
                          {region?.name}
                        </span>
                      ))
                    : "Sin regiones"}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Archivos</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {supportingFiles.length > 0
                  ? supportingFiles.map((file) => (
                      <li key={file.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-700">{file.file_name}</div>
                          <div className="text-xs text-slate-500">{file.file_type}</div>
                        </div>
                        <a
                          href={file.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          Ver archivo
                        </a>
                      </li>
                    ))
                  : "Sin archivos"}
              </ul>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Fotografía</h2>
              <p className="mt-2 text-xs text-slate-500">
                Asignación manual a executives.photo_url.
              </p>
              {photoFile ? (
                <div className="mt-3 space-y-2 text-sm">
                  <img
                    src={photoFile.signedUrl}
                    alt={`Foto de ${submission.full_name}`}
                    className="h-48 w-48 rounded-lg object-cover"
                  />
                  <div className="text-xs text-slate-500">{photoFile.file_name}</div>
                  <a
                    href={photoFile.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    Descargar foto
                  </a>
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-600">Sin fotografía.</div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Consentimientos</h2>
              <div className="mt-3 text-sm text-slate-700">
                <div>accepted_terms: {submission.accepted_terms ? "sí" : "no"}</div>
                <div>accepted_data_use: {submission.accepted_data_use ? "sí" : "no"}</div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Copiar datos</h2>
              <a
                href={`/admin/submissions/${submission.id}/copy`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
              >
                Copiar datos para creación manual
              </a>
              <textarea
                readOnly
                className="mt-3 h-64 w-full rounded-md border border-gray-300 p-3 text-xs"
                value={JSON.stringify(copyPayload, null, 2)}
              />
            </section>
            <CopySqlBlock sql={sql} />
          </div>
        </div>
      </div>
    </main>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function sqlString(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "NULL";
  const escaped = value.replace(/'/g, "''");
  return `'${escaped}'`;
}

function sqlNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "NULL";
  return String(value);
}

function sqlBoolean(value: boolean) {
  return value ? "TRUE" : "FALSE";
}

function buildExecutiveSql(payload: {
  name: string;
  slug: string;
  phone: string;
  company: string;
  experience_years: number | null;
  specialty: string | null;
  description: string | null;
  whatsapp_message: string | null;
  photo_url: string | null;
  company_logo_url: string | null;
  coverage_all: boolean;
}) {
  return [
    "insert into public.executives (",
    "  name,",
    "  slug,",
    "  phone,",
    "  company,",
    "  experience_years,",
    "  specialty,",
    "  description,",
    "  whatsapp_message,",
    "  photo_url,",
    "  company_logo_url,",
    "  coverage_all,",
    "  plan,",
    "  verified,",
    "  verified_date,",
    "  status",
    ")",
    "values (",
    `  ${sqlString(payload.name)},`,
    `  ${sqlString(payload.slug)},`,
    `  ${sqlString(payload.phone)},`,
    `  ${sqlString(payload.company)},`,
    `  ${sqlNumber(payload.experience_years)},`,
    `  ${sqlString(payload.specialty)},`,
    `  ${sqlString(payload.description)},`,
    `  ${sqlString(payload.whatsapp_message)},`,
    `  ${sqlString(payload.photo_url)},`,
    `  ${sqlString(payload.company_logo_url)},`,
    `  ${sqlBoolean(payload.coverage_all)},`,
    "  'bronce',",
    "  TRUE,",
    "  current_date,",
    "  'active'",
    ")",
    "returning id;",
  ].join("\n");
}
