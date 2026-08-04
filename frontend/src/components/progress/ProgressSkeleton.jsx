export default function ProgressSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="h-6 w-28 rounded bg-base-700" />
          <div className="mt-2 h-3 w-48 rounded bg-base-800" />
        </div>

        <div className="h-8 w-24 rounded-lg bg-base-800" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-base-700/70 bg-base-900/30 p-4"
          >
            <div className="h-3 w-14 rounded bg-base-700" />
            <div className="mt-3 h-8 w-16 rounded bg-base-700" />
            <div className="mt-2 h-3 w-20 rounded bg-base-800" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <div className="h-4 w-36 rounded bg-base-700" />
          <div className="mt-2 h-3 w-56 rounded bg-base-800" />
        </div>

        <div className="rounded-2xl border border-base-700/70 bg-base-900/30 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-28 rounded bg-base-700" />
              <div className="mt-2 h-3 w-52 rounded bg-base-800" />
            </div>

            <div className="flex gap-1 rounded-lg border border-base-700 bg-base-900 p-0.5">
              <div className="h-6 w-14 rounded-md bg-base-700" />
              <div className="h-6 w-14 rounded-md bg-base-800" />
            </div>
          </div>

          <div className="mt-5 flex h-40 items-end gap-2">
            {[35, 60, 50, 85, 40, 70, 55].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col justify-end">
                <div className="rounded-md bg-base-700" style={{ height: `${height}%` }} />
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-base-700/60 bg-base-950/20 p-3">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="h-3 w-16 rounded bg-base-700" />
                  <div className="h-7 rounded bg-base-800" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="h-4 w-24 rounded bg-base-700" />
          <div className="mt-2 h-3 w-52 rounded bg-base-800" />
        </div>

        <div className="rounded-2xl border border-base-700/70 bg-base-900/30 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-28 rounded bg-base-700" />
              <div className="mt-2 h-3 w-36 rounded bg-base-800" />
            </div>

            <div className="h-4 w-12 rounded bg-base-800" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-base-700/60 bg-base-950/20 p-4">
                <div className="h-3 w-14 rounded bg-base-700" />
                <div className="mt-2 h-3 w-20 rounded bg-base-800" />
                <div className="mt-4 h-2 w-16 rounded bg-base-700" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="h-4 w-32 rounded bg-base-700" />
          <div className="mt-2 h-3 w-56 rounded bg-base-800" />
        </div>

        <div className="rounded-2xl border border-base-700/70 bg-base-900/30 p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="h-4 w-28 rounded bg-base-700" />
              <div className="mt-2 h-3 w-40 rounded bg-base-800" />
            </div>

            <div className="h-4 w-4 rounded-full bg-base-800" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-base-700/60 bg-base-950/20 p-4">
                <div className="h-3 w-14 rounded bg-base-700" />
                <div className="mt-2 h-3 w-20 rounded bg-base-800" />
                <div className="mt-4 h-2 w-16 rounded bg-base-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}