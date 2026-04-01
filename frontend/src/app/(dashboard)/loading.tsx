export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                    <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
                <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
                        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                            </div>
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
