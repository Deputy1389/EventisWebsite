"use client";

import { parseApiError } from "@/lib/api-error";

type UploadInitResponse = {
  document_id: string;
  bucket: string;
  object_path: string;
  signed_url: string;
  upload_intent: string;
  max_upload_bytes: number;
  expires_in_seconds: number;
};

type UploadedDocument = {
  id: string;
  matter_id: string;
  filename: string;
  mime_type: string;
  sha256: string;
  bytes: number;
  storage_uri: string;
  uploaded_at: string;
};

async function readError(response: Response): Promise<string> {
  const text = await response.text();
  return parseApiError(text) || `Request failed with status ${response.status}`;
}

export async function uploadMatterDocument(
  matterId: string,
  file: File,
): Promise<UploadedDocument> {
  const initRes = await fetch(`/api/citeline/matters/${matterId}/documents/upload-init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      byte_size: file.size,
      content_type: file.type || "application/pdf",
    }),
  });

  if (!initRes.ok) {
    throw new Error(await readError(initRes));
  }

  const init = (await initRes.json()) as UploadInitResponse;
  const uploadBody = new FormData();
  uploadBody.append("cacheControl", "3600");
  uploadBody.append("", file);

  const signedUploadRes = await fetch(init.signed_url, {
    method: "PUT",
    headers: {
      "x-upsert": "false",
    },
    body: uploadBody,
  });

  if (!signedUploadRes.ok) {
    throw new Error(await readError(signedUploadRes));
  }

  const completeRes = await fetch(`/api/citeline/matters/${matterId}/documents/upload-complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      upload_intent: init.upload_intent,
    }),
  });

  if (!completeRes.ok) {
    throw new Error(await readError(completeRes));
  }

  return (await completeRes.json()) as UploadedDocument;
}
