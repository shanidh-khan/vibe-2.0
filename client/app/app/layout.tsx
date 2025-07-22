"use client";

import { useGetEndpointsQuery } from "@/apis/mocket";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const collectionId = params.collectionId as string;
  const { data: endpoints = [] } = useGetEndpointsQuery({ collectionId }, { skip: !collectionId });
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);

  // Auto-select first endpoint if on /app/[collectionId] root
//   useEffect(() => {
//     if (!selectedEndpointId && endpoints.length > 0 && typeof window !== "undefined") {
//       const path = window.location.pathname;
//       if (path.endsWith(`/app/${collectionId}`)) {
//         setSelectedEndpointId(endpoints[0]._id);
//       }
//     }
//   }, [endpoints, selectedEndpointId, collectionId]);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* <ArenaSidebar
        collectionId={collectionId}
        endpointId={selectedEndpointId || endpoints[0]?._id || ""}
        endpoints={endpoints}
      /> */}
      {children}
      {/* <main className="flex-1 h-full flex items-center justify-center p-0 overflow-hidden">
        <div className="w-full h-full flex flex-col overflow-hidden">{children}</div>
      </main> */}
    </div>
  );
}
