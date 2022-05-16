
import { DydxClient } from "@dydxprotocol/v3-client";
import { ethers } from 'ethers'
import { WebSocket } from 'ws'
import Web3 from "web3"
import { deposit } from "../deposit/deposit";
import { toHex } from "../utils/common";


const web3: any = new Web3(process.env.NODE_URL!)
web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

let accountDetails;

const getApiCred = async (client: DydxClient) => {

    // Get the api credentials of your account. The account needs to have connected to DYDX
    // TODO: Implement the onboarding process if  the account is not yet connected

    const apiCreds = await client.onboarding.recoverDefaultApiCredentials(ethers.utils.getAddress(process.env.WALLET_ADDRESS!))
    client.apiKeyCredentials = apiCreds

    return apiCreds

}

const getApiCredentials = async () => {
    const client = new DydxClient(process.env.DYDX_HTTP_HOST!, { web3 })

    const apiCreds = await getApiCred(client)
    const method: any = "GET"
    const timestamp = new Date().toISOString()

    const signature = client.private.sign({
        requestPath: '/ws/accounts',
        method: method,
        isoTimestamp: timestamp,
    })

    const data = {
        signature,
        timestamp,
        apiCreds
    }

    return data
}

const fetchAccountDetails = async () => {

    try {

        const creds = await getApiCredentials()

        const request = {
            type: 'subscribe',
            channel: 'v3_accounts',
            accountNumber: '0',
            apiKey: creds.apiCreds.key,
            signature: creds.signature,
            timestamp: creds.timestamp,
            passphrase: creds.apiCreds.passphrase
        }

        const ws: any = new WebSocket(process.env.DYDX_WS_HOST!)

        ws.on('message', async (message: string) => {
            const response = JSON.parse(message)

            if (response.type == "subscribed") {
                accountDetails = response.contents.account
                console.log(accountDetails)

                const depositAmount = 20 * 1e18

                // deposit
                await deposit(toHex(depositAmount), accountDetails.starkKey, accountDetails.positionId, creds.signature)
            }

        })

        ws.on('open', () => {
            ws.send(JSON.stringify(request))
        })

        ws.on('error', (error: any) => {
            console.log("The websocket encountered an error", error)
        })

        ws.on('close', () => {
            console.log('The websocket Connection closed')
        })

    } catch (error) {
        console.log("Error getting dydx info : ", error)
    }

}


fetchAccountDetails()