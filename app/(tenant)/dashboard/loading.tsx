export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-6 w-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}
