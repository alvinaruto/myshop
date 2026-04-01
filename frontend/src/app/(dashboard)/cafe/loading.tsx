export default function CafeLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-7 w-52 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                    <div className="h-4 w-36 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
                        <div className="p-4 space-y-2">
                            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
                            <div className="flex justify-between items-center pt-2">
                                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                <div className="flex gap-1">
                                    <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded" />
                                    <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
