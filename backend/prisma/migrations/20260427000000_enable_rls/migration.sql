-- Supabase exposes tables in the public schema through its Data API.
-- This app uses the NestJS backend plus Prisma as the access layer, so there
-- should be no direct anon/authenticated access to application tables.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shared_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
