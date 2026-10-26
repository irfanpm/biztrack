export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({
    version: 'vercel-auth-fix-v2',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    environment: process.env.VERCEL_ENV || 'local',
  }, { headers: { 'Cache-Control': 'no-store' } });
}
