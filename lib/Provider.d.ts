import { Tx, TxOutput, TxType, Web3 } from "@bywise/web3";
export declare class BywiseProvider {
    readonly web3: Web3;
    private readonly explorer;
    private readonly walletApi;
    private readonly chain;
    private static data;
    isConnected: boolean;
    address: string;
    private isInit;
    constructor(chain?: string);
    private popupCenter;
    connect: () => Promise<boolean>;
    send: (to: string[], amount: string[], type?: TxType, data?: any) => Promise<{
        tx: Tx;
        output: TxOutput;
    } | null>;
}
