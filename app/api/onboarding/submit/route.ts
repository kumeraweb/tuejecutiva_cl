import { NextResponse } from "next/server";
import {
  createSubmission,
  getTokenByValue,
  isTokenValid,
  markTokenUsed,
  uploadSubmissionPhoto,
  uploadSubmissionFile,
} from "@/lib/onboarding";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const rateStore = new Map<string, { count: number; resetAt: number }>();

function getString(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return "";
  return value.trim();
}

function getBoolean(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return false;
  return value === "true" || value === "on";
}

function getNumber(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return NaN;
  return Number(value);
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || entry.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count += 1;
  return false;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`onboarding:${ip}`)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta nuevamente en unos minutos." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const mode = getString(formData.get("mode"));
    const tokenValue = getString(formData.get("token"));

    let tokenId: string | null = null;
    if (!tokenValue) {
      return NextResponse.json({ error: "Token requerido." }, { status: 400 });
    }
    const token = await getTokenByValue(tokenValue);
    if (!isTokenValid(token)) {
      return NextResponse.json({ error: "Token inválido o expirado." }, { status: 403 });
    }
    tokenId = token ? token.id : null;

    const fullName = getString(formData.get("full_name"));
    const email = getString(formData.get("email"));
    const phone = getString(formData.get("phone"));
    const company = getString(formData.get("company"));
    const experienceYears = getNumber(formData.get("experience_years"));
    const specialty = getString(formData.get("specialty"));
    const description = getString(formData.get("description"));
    const whatsappMessage = getString(formData.get("whatsapp_message"));
    const coverageAll = getBoolean(formData.get("coverage_all"));
    const customCategory = getString(formData.get("custom_category"));
    const acceptedTerms = getBoolean(formData.get("accepted_terms"));
    const acceptedDataUse = getBoolean(formData.get("accepted_data_use"));

    const categoryIds = formData.getAll("category_ids").filter((value) => typeof value === "string") as string[];
    const regionIds = formData.getAll("region_ids").filter((value) => typeof value === "string") as string[];

    if (!fullName || !phone || !company || !specialty || !description) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }

    if (!Number.isFinite(experienceYears)) {
      return NextResponse.json({ error: "Experience years inválido." }, { status: 400 });
    }

    if (!acceptedTerms || !acceptedDataUse) {
      return NextResponse.json({ error: "Debes aceptar términos y uso de datos." }, { status: 400 });
    }

    if (categoryIds.length === 0 && !customCategory) {
      return NextResponse.json({ error: "Debes seleccionar una categoría o escribir una categoría libre." }, { status: 400 });
    }

    if (!coverageAll && regionIds.length === 0) {
      return NextResponse.json({ error: "Debes seleccionar regiones si no es cobertura nacional." }, { status: 400 });
    }

    const files = formData.getAll("supporting_files");
    const validFiles = files.filter((item): item is File => item instanceof File && item.size > 0);
    if (validFiles.length === 0) {
      return NextResponse.json({ error: "Debes adjuntar al menos un archivo." }, { status: 400 });
    }
    for (const file of validFiles) {
      if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
        return NextResponse.json({ error: "Formato de archivo no permitido." }, { status: 400 });
      }
    }

    const photoFileEntry = formData.get("photo_file");
    const photoFile =
      photoFileEntry instanceof File && photoFileEntry.size > 0 ? photoFileEntry : null;
    if (photoFile && !["image/jpeg", "image/png", "image/webp"].includes(photoFile.type)) {
      return NextResponse.json({ error: "Formato de foto no permitido." }, { status: 400 });
    }

    const submissionId = await createSubmission({
      token_id: tokenId,
      full_name: fullName,
      email,
      phone,
      company,
      experience_years: experienceYears,
      specialty,
      description,
      whatsapp_message: whatsappMessage || null,
      coverage_all: coverageAll,
      custom_category: customCategory || null,
      accepted_terms: acceptedTerms,
      accepted_data_use: acceptedDataUse,
      status: "pending",
      category_ids: categoryIds,
      region_ids: coverageAll ? [] : regionIds,
    });
    for (const file of validFiles) {
      await uploadSubmissionFile({
        submissionId,
        file,
        fileType: "other",
      });
    }
    if (photoFile) {
      await uploadSubmissionPhoto({ submissionId, file: photoFile });
    }

    if (tokenId && mode !== "dev") {
      await markTokenUsed(tokenId);
    }

    return NextResponse.json({ success: true, submissionId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
