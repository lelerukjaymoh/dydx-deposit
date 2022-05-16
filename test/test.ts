import axios from "axios"

const getData = async () => {
    try {
        const data = await axios.post("https://api.dydx.exchange/v3/accounts/")

        console.log(data.data)
    } catch (error) {
        console.log("Error : ", error)
    }

}

getData()