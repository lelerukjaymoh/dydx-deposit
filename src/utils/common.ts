export const toHex = (currencyAmount: any) => {
    if (currencyAmount.toString().includes("e")) {
        let hexedAmount = currencyAmount.toString(16);
        return `0x${hexedAmount}`;
    } else {
        let parsedAmount = parseInt(currencyAmount);
        let hexedAmount = parsedAmount.toString(16);
        return `0x${hexedAmount}`;
    }
}