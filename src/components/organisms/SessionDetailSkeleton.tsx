export default function SessionDetailSkeleton() {

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="w-full flex flex-col space-y-6 bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                    <div className="h-5 w-32 bg-neutral-900 rounded-md animate-pulse" />
                    <div className="h-8 w-24 bg-neutral-900 rounded-xl animate-pulse" />
                </div>

                {/* Main Vehicle Label Skeleton */}
                <div className="flex flex-col space-y-2">
                    <div className="h-3 w-32 bg-neutral-900 rounded-md animate-pulse" />
                    <div className="h-8 w-56 bg-neutral-900 rounded-xl animate-pulse" />
                </div>

                {/* Timer Display Skeleton */}
                <div className="h-28 w-full bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800/60" />

                {/* Floor and Bay Indicators Skeleton */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800/60" />
                    <div className="h-24 bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800/60" />
                </div>

                {/* Notes Skeleton */}
                <div className="h-20 w-full bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800/60" />

                {/* Photo Display Skeleton */}
                <div className="flex flex-col space-y-2">
                    <div className="h-3 w-16 bg-neutral-900 rounded-md animate-pulse" />
                    <div className="w-full aspect-[4/3] bg-neutral-900/60 rounded-2xl animate-pulse border border-neutral-800" />
                </div>

                {/* Action Commands Skeleton */}
                <div className="flex flex-col space-y-2 pt-2">
                    <div className="h-[52px] w-full bg-neutral-900 rounded-2xl animate-pulse" />
                    <div className="h-12 w-full bg-neutral-900/50 rounded-2xl animate-pulse" />
                </div>
            </div>
        </div>
    );
}
