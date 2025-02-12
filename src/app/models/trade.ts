export interface Trade{
    instrument: string,
    orderSide: string,
    volume: number,
    slPrice: number,
    tpPrice: number,
    isMobile: boolean
}