import { KHQR } from '@/components/KHQR';

export default function TestKhqrPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
            <KHQR
                amount={200}
                currency="KHR"
                billNumber="TEST-1234"
                width={300}
            />
        </div>
    );
}
