const ethers = require('ethers');
const prompt = require('prompt-sync')({sigint: true});
require('dotenv').config()
const env = require('env-process');

const addresses = {
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // Wrapped BNB address, please doublecheck
    router: "0x10ed43c718714eb63d5aa57b78b54704e256024e", // PancakeSwap Router v2
    target: process.env.YOUR_ACCOUNT_ADDRESS
}

const BNBAmount = ethers.utils.parseEther(process.env.BNB_AMOUNT).toHexString();

const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

const wallet = new ethers.Wallet(process.env.YOUR_ACCOUNT_PRIVATE_KEY);

const account = wallet.connect(provider);

const checkConfig = async () => {
    await env.getEnv();

    if (!process.env.YOUR_ACCOUNT_PRIVATE_KEY || process.env.YOUR_ACCOUNT_PRIVATE_KEY === ''){
        console.log('Private key note set');
        return false;
    }
    if (!process.env.YOUR_ACCOUNT_ADDRESS || process.env.YOUR_ACCOUNT_ADDRESS === ''){
        console.log('Your account address not set, it is required to specify where the sniped tokens should be delivered');
        return false;
    }
    if (!process.env.BNB_AMOUNT || process.env.BNB_AMOUNT === ''){
        console.log('BNB Amount not set');
        return false;
    }
}

const buy = async (token) => {

    //Below we have the standard PancakeSwap Router 2 Contract methods
    // But we only care about the swap method swapExactTokensForETHSupportingFeeOnTransferTokens
    const router = new ethers.Contract(
        addresses.router,
        [
            {
                "inputs":[
                    {"internalType":"uint256","name":"amountIn","type":"uint256"},
                    {"internalType":"uint256","name":"amountOutMin","type":"uint256"},
                    {"internalType":"address[]","name":"path","type":"address[]"},
                    {"internalType":"address","name":"to","type":"address"},
                    {"internalType":"uint256","name":"deadline","type":"uint256"}
                ],
                "name":"swapExactTokensForETHSupportingFeeOnTransferTokens",
                "outputs":[],
                "stateMutability":"nonpayable",
                "type":"function"
            }
        ],
        account
    );

    console.log(`Transaction being created`);
    const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
        BNBAmount,
        0,// Fuck slippage we are apes
        [addresses.WBNB, token],
        addresses.target,
        Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes from now
    );

    console.log(`Swapping BNB for tokens...`);
    const receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);

}

const token = prompt('Input token address:');

(async () => {
    // check config
    await checkConfig();

    //do the buy
    await buy();
})();
