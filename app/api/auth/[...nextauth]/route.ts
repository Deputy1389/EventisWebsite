import { handlers } from "@/lib/auth";

export const runtime = "nodejs"; // Force Node.js runtime for bcryptjs compatibility

export const { GET, POST } = handlers;
