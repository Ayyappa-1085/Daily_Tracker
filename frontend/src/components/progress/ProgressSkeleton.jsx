export default function ProgressSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-36 rounded bg-base-700" />
          <div className="mt-2 h-3 w-56 rounded bg-base-800" />
        </div>

        <div className="h-8 w-28 rounded-lg bg-base-800" />
      </div>

      {/* Top Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-base-700 bg-base-900 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-base-700" />
              <div className="h-6 w-6 rounded-md bg-base-800" />
            </div>

            <div className="mt-3 h-7 w-16 rounded bg-base-700" />

            <div className="mt-2 h-3 w-20 rounded bg-base-800" />
          </div>
        ))}
      </div>

      {/* Weekly Activity */}
      <div className="rounded-xl border border-base-700 bg-base-900 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-4 w-32 rounded bg-base-700" />
            <div className="mt-2 h-3 w-44 rounded bg-base-800" />
          </div>

          <div className="h-8 w-8 rounded-lg bg-base-800" />
        </div>

        <div className="flex h-36 items-end gap-2">
          {[35, 60, 50, 85, 40, 70, 55].map((height, index) => (
            <div
              key={index}
              className="flex flex-1 flex-col justify-end"
            >
              <div
                className="rounded-md bg-base-700"
                style={{
                  height: `${height}%`,
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-14 rounded-lg bg-base-800"
            />
          ))}
        </div>
      </div>

      {/* Monthly Heatmap */}
      <div className="rounded-xl border border-base-700 bg-base-900 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-4 w-32 rounded bg-base-700" />
            <div className="mt-2 h-3 w-40 rounded bg-base-800" />
          </div>

          <div className="h-8 w-8 rounded-lg bg-base-800" />
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, index) => (
              <div
                key={index}
                className="h-3 w-3 rounded-sm bg-base-800"
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 rounded-lg bg-base-800"
            />
          ))}
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-base-700 bg-base-900 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="h-4 w-28 rounded bg-base-700" />
                <div className="mt-2 h-3 w-36 rounded bg-base-800" />
              </div>

              <div className="h-8 w-8 rounded-lg bg-base-800" />
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-lg bg-base-800"
                />
              ))}
            </div>

            <div className="mt-4 h-12 rounded-lg bg-base-800" />
          </div>
        ))}
      </div>
    </div>
  );
}