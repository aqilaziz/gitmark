"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-red-50 p-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Terjadi Kesalahan
        </h2>
        <p className="mb-6 max-w-sm text-sm text-gray-500">
          Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
