import { NextResponse } from "next/server";
import { Resend } from "resend";

function getString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing RESEND_API_KEY." }, { status: 500 });
  }

  const formData = await request.formData();
  const nombre = getString(formData.get("nombre"));
  const email = getString(formData.get("email"));
  const mensaje = getString(formData.get("mensaje"));

  if (!nombre || !email || !mensaje) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios." },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);
  const from = "TuEjecutiva.cl <contacto@kumeraweb.com>";
  const toInternal = "contacto@kumeraweb.com";

  try {
    await resend.emails.send({
      from,
      to: toInternal,
      subject: "Nueva postulación desde TuEjecutiva.cl",
      text: `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
    });

    await resend.emails.send({
      from,
      to: email,
      subject: "Recibimos tu postulación ✔️",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; background-color: #f8fafc; padding: 24px;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <img src="https://tuejecutiva.cl/logo/logonbg.png" alt="TuEjecutiva.cl" style="height: 36px; margin-bottom: 16px;" />
            <h2 style="margin: 0 0 12px; font-size: 20px;">Gracias por postular a TuEjecutiva.cl</h2>
            <p>Hola ${nombre},</p>
            <p>Recibimos tu postulación correctamente. Nuestro equipo la revisará y te contactará si necesitamos más información.</p>
            <p style="margin-top: 16px;">Equipo TuEjecutiva.cl</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
