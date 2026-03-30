"use client";

export function EnterpriseCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      
      {/* image */}
      <div className="w-full h-48 bg-gray-200 rounded-xl" />

      {/* title */}
      <div className="h-4 bg-gray-200 rounded w-3/4" />

      {/* category */}
      <div className="h-3 bg-gray-200 rounded w-1/2" />

      {/* rating */}
      <div className="h-3 bg-gray-200 rounded w-1/4" />

    </div>
  );
}