import React from 'react'
import './UserInfo.scss'
import more from '../../../assets/images/more.png'
import video from '../../../assets/images/video.png'
import edit from '../../../assets/images/edit.png'
import avatar from '../../../assets/images/avatar.png'
import { useUserStore } from '../../../lib/userStore'
import { auth } from '../../../lib/firebase'
import { useChatStore } from '../../../lib/useChatStore'
const UserInfo = () => {
    const { currentUser } = useUserStore();
    const { closeChat } = useChatStore();
    return (
        <div className='userInfo'>
            <div className="user" onClick={() => { auth.signOut(); closeChat() }}>
                <img src={currentUser.avatar || avatar} alt="" />
                <h2>{currentUser.name.split(" ")[currentUser.name.split(" ").length - 1]}</h2>
            </div>
            <div className="icons">
                <img src={more} alt="" />
                <img src={video} alt="" />
                <img src={edit} alt="" />
            </div>
        </div>
    )
}

export default UserInfo