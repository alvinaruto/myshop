declare module 'bakong-khqr' {
    export const khqrData: {
        currency: {
            usd: number;
            khr: number;
        };
        merchantType: {
            merchant: string;
            individual: string;
        };
    };

    export class BakongKHQR {
        constructor();
        generateIndividual(info: IndividualInfo): {
            data: { qr: string; md5: string };
            status: any;
        };
        generateMerchant(info: MerchantInfo): {
            data: { qr: string; md5: string };
            status: any;
        };
        static decode(qr: string): any;
        static verify(qr: string): { isValid: boolean };
    }

    export class IndividualInfo {
        constructor(
            bakongAccountID: string,
            merchantName: string,
            merchantCity: string,
            optional?: {
                currency?: number;
                amount?: number;
                billNumber?: string;
                mobileNumber?: string;
                storeLabel?: string;
                terminalLabel?: string;
                expirationTimestamp?: number;
                merchantCategoryCode?: string;
            }
        );
    }

    export class MerchantInfo {
        constructor(
            bakongAccountID: string,
            merchantName: string,
            merchantCity: string,
            merchantID: string,
            acquiringBank: string,
            optional?: any
        );
    }
}
