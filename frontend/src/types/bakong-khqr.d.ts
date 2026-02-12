declare module 'bakong-khqr' {
    export class BakongKHQR {
        constructor();
        generateIndividual(info: IndividualInfo): any;
        generateMerchant(info: MerchantInfo): any;
        static decode(qr: string): any;
        static verify(qr: string): any;
    }

    export class IndividualInfo {
        constructor(
            bakongAccountId: string,
            merchantName: string,
            merchantCity: string,
            currency: string,
            amount: number
        );
    }

    export class MerchantInfo {
        constructor(
            bakongAccountId: string,
            acquiringBank: string,
            merchantId: string,
            merchantName: string,
            currency: string,
            amount: number
        );
    }
}
