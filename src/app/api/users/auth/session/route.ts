import { NextRequest } from 'next/server';
import { getSessionFromCookies } from '@/server/auth/session';
import { jsonOk } from '@/server/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const session = getSessionFromCookies(request.cookies);
  return jsonOk(session);
}
