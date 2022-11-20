
import { DydxClient, SignEthPrivateAction, SigningMethod } from "@dydxprotocol/v3-client";
import { ethers, utils } from 'ethers'
import { WebSocket } from 'ws'
import Web3 from "web3"
import { deposit } from "../deposit/deposit";
import { RequestMethod } from "@dydxprotocol/v3-client/build/src/lib/axios";


const web3: any = new Web3(process.env.NODE_URL!)
web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

let accountDetails;
const client = new DydxClient(process.env.DYDX_HTTP_HOST!, { web3 })
let localSigner = new SignEthPrivateAction(web3, 1);


const getApiCred = async (client: DydxClient) => {

    // Get the api credentials of your account. The account needs to have connected to DYDX
    // TODO: Implement the onboarding process if  the account is not yet connected

    const apiCreds = await client.onboarding.recoverDefaultApiCredentials(ethers.utils.getAddress(process.env.WALLET_ADDRESS!))
    client.apiKeyCredentials = apiCreds


    console.log("Creds ", apiCreds)

    return apiCreds

}

const getApiCredentials = async () => {

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

    // console.log(data)

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

            console.log("response ", response)

            const request = {
                requestPath: '/ws/accounts',
                method: RequestMethod.GET,
                body: '{}',
                timestamp: new Date().toISOString()
            }

            // const mockRequestNoBody = {
            //     requestPath: 'v3/test',
            //     method: ApiMethod.POST,
            //     body: '{}',
            //     timestamp: '2021-01-08T10:06:12.500Z',
            // };

            // const signature = await localSigner.sign(
            //     GANACHE_ADDRESS,
            //     SigningMethod.Hash,
            //     mockRequestNoBody,
            // );

            // Generate the signature
            const signature = await localSigner.sign(
                process.env.WALLET_ADDRESS!,
                SigningMethod.Hash,
                request,
            );

            // const starkKey = deriveStarkKey()

            // console.log("Signature ", signature)


            const starkkey = await client.onboarding.deriveStarkKey(process.env.l2!)
            console.log("Starkkey ", starkkey)

            const client_account_info = await client.private.getAccount(process.env.WALLET_ADDRESS!);

            console.log("Clienc ", client_account_info)

            console.log(await client.starkPrivateKey)


            if (response.type == "subscribed") {
                accountDetails = response.contents.account
                console.log("Account details ", accountDetails)

                const depositAmount = utils.parseUnits("1", 6)

                // deposit
                await deposit(depositAmount, accountDetails.starkKey.toString(), accountDetails.positionId, signature)
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