import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const destination = new URL(code ? "/onboarding/profile-setup" : "/login", request.url);

  if (code && url && key) {
    const response = NextResponse.redirect(destination);
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        ),
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }

  return NextResponse.redirect(destination);
}
