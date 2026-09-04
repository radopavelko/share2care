// Cloudflare Pages Function: reverse-proxy Firebase Auth's handler pages so
// Google sign-in stays on OUR domain (first-party). Without this, the redirect
// flow bounces through share2care-7bb3a.firebaseapp.com, which iOS treats as a
// third-party site and blocks — the installed Home Screen app then loops back
// to the login button. See Firebase docs: "Best practices for signInWithRedirect".
//
// Maps  https://<our-domain>/__/auth/*  →  https://share2care-7bb3a.firebaseapp.com/__/auth/*

const FIREBASE_AUTH_ORIGIN = "https://share2care-7bb3a.firebaseapp.com";

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const target = FIREBASE_AUTH_ORIGIN + url.pathname + url.search;

  // Forward the request, but let fetch set the Host for the target origin.
  const headers = new Headers(request.headers);
  headers.delete("host");

  const init = { method: request.method, headers, redirect: "manual" };
  if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;

  const upstream = await fetch(target, init);

  const out = new Headers(upstream.headers);
  out.delete("content-security-policy");
  out.set("cache-control", "no-store");
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: out });
}
