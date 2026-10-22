import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isOnboarding = pathname.startsWith("/onboarding");
  const isPrivate = isOnboarding || ["/home", "/selected", "/interests", "/chat", "/profile"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (!isPrivate) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const { data: profile } = await supabase.from("profiles").select("is_complete").eq("id", user.id).maybeSingle();
  if (isOnboarding && profile?.is_complete) {
    const home = request.nextUrl.clone();
    home.pathname = "/home";
    home.search = "";
    return NextResponse.redirect(home);
  }
  if (!isOnboarding && !profile?.is_complete) {
    const setup = request.nextUrl.clone();
    setup.pathname = "/onboarding/profile-setup";
    setup.search = "";
    return NextResponse.redirect(setup);
  }
  return response;
}

export const config = {
  matcher: ["/home/:path*", "/selected/:path*", "/interests/:path*", "/chat/:path*", "/profile/:path*", "/onboarding/:path*"],
};
