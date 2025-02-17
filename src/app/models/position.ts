export interface Position{
    id: string;
    idAccount: string;
    tradingAccountId: string;
    symbol: string;
    alias: string;
    volume: number;
    side: string;
    openTime: string;
    openTimeMillis: number;
    openPrice: number;
    stopLoss: number,
    takeProfit: number,
    trailingDistance: number,
    swap: number,
    profit: number,
    netProfit: number,
    currentPrice: number,
    commission: number,
}