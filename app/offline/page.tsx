'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <svg
            className="w-20 h-20 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3l18 18M8.111 8.111A5.97 5.97 0 006 12c0 1.657.672 3.157 1.757 4.243M10.584 10.584A3 3 0 0112 10c1.657 0 3 1.343 3 3a3 3 0 01-.584 1.784M12 18h.01M1.42 5.832A13.937 13.937 0 0112 2c3.073 0 5.9 1 8.143 2.671M4.99 9.74a9.96 9.96 0 00-1.99 6.26 9.997 9.997 0 003.757 7.77M16.5 14.5a6.002 6.002 0 00-4.5-9"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Vous êtes hors ligne
        </h1>
        <p className="text-gray-500 mb-8">
          Reconnectez-vous pour accéder à toutes les offres d'emploi
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
