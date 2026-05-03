import { Divider } from "antd"
import HotelInfo from "../components/HotelInfo"
import UserInfo from "../components/UserInfo"

const UserPage =() => {
    return (
        <div className="flex flex-col space-y-10">
            <UserInfo></UserInfo>
            <Divider></Divider>
            <HotelInfo></HotelInfo>
        </div>
    )
}

export default UserPage