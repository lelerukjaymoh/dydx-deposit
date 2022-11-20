import { Contract, providers, Wallet, ethers, BigNumber } from "ethers";
import dydxABI from "../utils/abi/dydxABI.json";

const dydxAddress = "0x8e8bd01b5A9eb272CC3892a2E40E64A716aa2A40"
const provider = new providers.WebSocketProvider(process.env.NODE_URL!)
const signer = new Wallet(process.env.PRIVATE_KEY!)
const account = signer.connect(provider)

const contract = new Contract(dydxAddress, dydxABI, account)

export const deposit = async (depositAmount: BigNumber, starkKey: string, positionId: number, signature: string) => {
    try {


        // depositAmount: 20000000
        // starkKey: 1404676883098641591148151172199430786588366678085119649262757810759849218892

        // positionId: 189414
        // signature:
        // 0x6c6898101f63ee2893fc919e3d2fe056a0fe2d6962245b70b61dbfedb4c6176817278bef97b8d092907df8a9383a03c0f7ca21bbbbab92643980268d5a41a5541c

        // console.log("Stark key ", starkKey)
        // console.log(BigInt(starkKey.toString()))

        console.log("Deposit amount : ", depositAmount)
        console.log("starkKey : ", starkKey)
        console.log("signature : ", signature)



        // BigInt

        const tx = await contract.callStatic.deposit("1000000", `${starkKey}`, positionId, signature)


        console.log("TX : ", tx)
    } catch (error) {
        console.log("Error depositing : ", error)
    }


}