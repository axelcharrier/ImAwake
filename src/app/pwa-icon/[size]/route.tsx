import { appIcon } from "@/lib/app-icon";

const SIZES = ["192", "512", "maskable-512"];

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

export async function GET(_: Request, ctx: RouteContext<"/pwa-icon/[size]">) {
  const { size } = await ctx.params;
  if (!SIZES.includes(size)) return new Response("Not found", { status: 404 });
  const maskable = size.startsWith("maskable-");
  return appIcon(Number(size.replace("maskable-", "")), { maskable });
}
