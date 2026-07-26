"use client";

import dynamic from "next/dynamic";

// This tells Next.js to skip Server-Side Rendering for this dashboard
const HomeContent = dynamic(() => import("./HomeContent"), {
  ssr: false,
});

export default function Page() {
  return <HomeContent />;
}
