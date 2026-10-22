import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { connectToDatabase } from "@/lib/mongodb";
import { recrutementPayloadSchema, sanitizeRecrutementPayload } from "@/lib/validationRecrutement";
import RecrutementAgent from "@/models/RecrutementAgent";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

type RateLimitEntry = { count: number; start: number };

declare global {
  // eslint-disable-next-line no-var
  var recrutementRateLimit: Map<string, RateLimitEntry> | undefined;
}

const rateLimitStore = global.recrutementRateLimit ?? new Map<string, RateLimitEntry>();

if (!global.recrutementRateLimit) {
  global.recrutementRateLimit = rateLimitStore;
}

const jsonResponse = (payload: unknown, status = 200) =>
  NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
};

const isRateLimited = (ip: string) => {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.start >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, start: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return false;
};

const formatZodErrors = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return jsonResponse(
        {
          success: false,
          message: "Trop de tentatives. Réessayez dans une minute.",
        },
        429,
      );
    }

    const body = await request.json();
    const parsedBody = recrutementPayloadSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonResponse(
        {
          success: false,
          message: "Données invalides.",
          errors: formatZodErrors(parsedBody.error),
        },
        400,
      );
    }

    const sanitizedPayload = sanitizeRecrutementPayload(parsedBody.data);

    await connectToDatabase();

    const createdEntry = await RecrutementAgent.create({
      contact: sanitizedPayload.contact,
      usage: sanitizedPayload.usage,
      retours: sanitizedPayload.retours,
      zonesDeploiement: sanitizedPayload.zonesDeploiement,
    });

    return jsonResponse(
      {
        success: true,
        message: "Candidature enregistrée avec succès.",
        id: createdEntry._id,
      },
      201,
    );
  } catch (error) {
    console.error("[api/recrutement-terrain][POST] erreur:", error);
    return jsonResponse(
      {
        success: false,
        message: "Erreur serveur lors de l'enregistrement de la candidature.",
      },
      500,
    );
  }
}
