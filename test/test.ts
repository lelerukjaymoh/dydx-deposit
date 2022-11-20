import { DydxClient, SignEthPrivateAction } from "@dydxprotocol/v3-client";
import Onboarding from "@dydxprotocol/v3-client/build/src/modules/onboarding";
import axios from "axios"
import Web3 from "web3";
import { utils } from "ethers"

const web3: any = new Web3(process.env.NODE_URL!)
web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);


const client = new DydxClient(process.env.DYDX_HTTP_HOST!, { web3 })
let localSigner = new SignEthPrivateAction(web3, 1);


const getData = async () => {
    try {


        const apiCreds = await client.onboarding.recoverDefaultApiCredentials(utils.getAddress(process.env.WALLET_ADDRESS!))
        client.apiKeyCredentials = apiCreds


        console.log(await client.eth.exchange.getProxyDepositAddress())

        // console.log("Client ", await client)


        const approve = await client.eth.exchange.setERC20Allowance({
            tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            address: "0x8e8bd01b5A9eb272CC3892a2E40E64A716aa2A40",
            amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        },
            //     {
            //         from: client_account_info.account.,
            //    .
        )

        console.log("Appoval ", approve)

        const client_account_info = await client.private.getAccount(process.env.WALLET_ADDRESS!);

        const tx = await client.eth.exchange.deposit({
            starkKey: client_account_info.account.starkKey,
            positionId: client_account_info.account.positionId,
            humanAmount: 0.001
        })


        console.log("Tx ", tx)

    } catch (error) {
        console.log("Error : ", error)
    }

}

getData()