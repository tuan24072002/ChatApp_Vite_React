import React, { useState } from 'react'
import './Detail.scss'
import { FaCircle } from "react-icons/fa";
import PerfectScrollbar from 'react-perfect-scrollbar'
import avatar from '../../assets/images/avatar.png'
import up from '../../assets/images/arrowUp.png'
import down from '../../assets/images/arrowDown.png'
import cake from '../../assets/images/cake.jpg'
import download from '../../assets/images/download.png'
import { auth, db } from '../../lib/firebase';
import { toast } from 'react-toastify';
import { useChatStore } from '../../lib/useChatStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { useUserStore } from '../../lib/userStore';
const Detail = (props) => {
    const [option1, setOption1] = useState(false)
    const [option2, setOption2] = useState(false)
    const [option3, setOption3] = useState(false)
    const [option4, setOption4] = useState(false)
    const { user, changeBlock, isReceiverBlocked, isCurrentUserBlocked } = useChatStore();
    const { currentUser } = useUserStore();

    const handleBlock = async () => {
        if (!user) {
            return;
        }
        const uerDocRef = doc(db, "users", currentUser.id)
        try {
            await updateDoc(uerDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id)
            })
            changeBlock();

        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className="detail">
            <PerfectScrollbar>
                <div className="user">
                    <img src={user?.avatar || avatar} alt="" />
                    <h2>{user.blocked.includes(currentUser.id) ? "User" : user.name}</h2>
                    <p><FaCircle style={{ color: "#00FF00" }} /> Online</p>
                </div>
                <div className="info">
                    <div className="option">
                        <div className="title" onClick={() => setOption1(!option1)}>
                            <span>Chat Settings</span>
                            {
                                !option1 ? <img src={down} alt="" /> : <img src={up} alt="" />
                            }
                        </div>
                    </div>
                    <div className="option">
                        <div className="title" onClick={() => setOption2(!option2)}>
                            <span>Privacy & Help</span>
                            {
                                !option2 ? <img src={down} alt="" /> : <img src={up} alt="" />
                            }
                        </div>
                    </div>
                    <div className="option">
                        <div className="title" onClick={() => setOption3(!option3)}>
                            <span>Shared Photos</span>
                            {
                                !option3 ? <img src={down} alt="" /> : <img src={up} alt="" />
                            }
                        </div>
                        <div className="photos">
                            {
                                option3 &&
                                <>
                                    <div className="photoItem">
                                        <div className="photoDetail">
                                            <img src={cake} alt="" />
                                            <span>photo_2024_1.png</span>
                                        </div>
                                        <img src={download} alt="" className='icon' />
                                    </div>
                                    <div className="photoItem">
                                        <div className="photoDetail">
                                            <img src={cake} alt="" />
                                            <span>photo_2024_1.png</span>
                                        </div>
                                        <img src={download} alt="" className='icon' />
                                    </div>
                                    <div className="photoItem">
                                        <div className="photoDetail">
                                            <img src={cake} alt="" />
                                            <span>photo_2024_1.png</span>
                                        </div>
                                        <img src={download} alt="" className='icon' />
                                    </div>
                                    <div className="photoItem">
                                        <div className="photoDetail">
                                            <img src={cake} alt="" />
                                            <span>photo_2024_1.png</span>
                                        </div>
                                        <img src={download} alt="" className='icon' />
                                    </div>
                                    <div className="photoItem">
                                        <div className="photoDetail">
                                            <img src={cake} alt="" />
                                            <span>photo_2024_1.png</span>
                                        </div>
                                        <img src={download} alt="" className='icon' />
                                    </div>
                                    <div className="photoItem">
                                        <div className="photoDetail">
                                            <img src={cake} alt="" />
                                            <span>photo_2024_1.png</span>
                                        </div>
                                        <img src={download} alt="" className='icon' />
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                    <div className="option">
                        <div className="title" onClick={() => setOption4(!option4)}>
                            <span>Shared Files</span>
                            {
                                !option4 ? <img src={down} alt="" /> : <img src={up} alt="" />
                            }
                        </div>
                    </div>
                    <button onClick={() => handleBlock()}>
                        {
                            isCurrentUserBlocked ? "You are Blocked !" : isReceiverBlocked ? "User blocked" : "Block User"
                        }
                    </button>
                    <button className='logout' onClick={() => {
                        auth.signOut()
                        toast.success(`Logout successfully !`)
                    }}>Logout</button>
                </div>
            </PerfectScrollbar>
        </div>
    )
}

export default Detail