"use client";

import dynamic from "next/dynamic";

/** Decorative hero background — client-only so it stays out of the SSR critical path. */
export const HomeColorBlastLazy = dynamic(
  () => import("./home-color-blast").then((mod) => mod.HomeColorBlast),
  { ssr: false, loading: () => null }
);
