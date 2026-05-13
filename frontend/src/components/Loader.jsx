/**
 * Spinner used during async operations (catalog load, checkout).
 */

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
}

export default function Loader({ size = 'md', text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-slate-200 border-t-emerald-600`}
        aria-hidden
      />
      {text ? (
        <p className="text-sm text-slate-600" role="status">
          {text}
        </p>
      ) : null}
    </div>
  )
}
