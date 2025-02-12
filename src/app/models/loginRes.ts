import { TradingAccount } from "./user";

export interface LoginRes {
    email: string,
    token: string,
    tradingAccounts: TradingAccount[]
}