export interface Position{
    tradingApiToken: string;
    system_uuid: string;
    id: string;
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