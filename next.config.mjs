/** @type {import('next').NextConfig} */
const nextConfig = {
  // Les erreurs TypeScript bloquent de nouveau la mise en ligne :
  // un code qui ne compile pas ne peut plus partir en production.
  // (Le lint se lance avec `npm run lint` ; Next.js 16 ne le lance plus au build.)
}

export default nextConfig
