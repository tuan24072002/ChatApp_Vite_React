import React, { useEffect, useState } from 'react'
import './Detail.scss'
import { FaCircle } from "react-icons/fa";
import PerfectScrollbar from 'react-perfect-scrollbar'
import avatar from '../../assets/images/avatar.png'
import up from '../../assets/images/arrowUp.png'
import down from '../../assets/images/arrowDown.png'
import download from '../../assets/images/download.png'
import { auth, db } from '../../lib/firebase';
import { toast } from 'react-toastify';
import { useChatStore } from '../../lib/useChatStore';
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useUserStore } from '../../lib/userStore';
import { FaDotCircle } from "react-icons/fa"
import Theme from './theme/Theme';
import ColorMessage from './color/ColorMessage';
import { IoIosColorPalette } from "react-icons/io";
import { IoCaretBackOutline } from "react-icons/io5";
// import EmojiPicker from 'emoji-picker-react';
const Detail = (props) => {
    const [option1, setOption1] = useState(false)
    const [option2, setOption2] = useState(false)
    const [option3, setOption3] = useState(false)
    const [openTheme, setOpenTheme] = useState(false);
    const [openColor, setOpenColor] = useState(false);
    // const [openEmoji, setOpenEmoji] = useState(false)
    const { user, changeBlock, isReceiverBlocked, isCurrentUserBlocked } = useChatStore();
    const { currentUser } = useUserStore();
    const { chatId } = useChatStore();
    const [imgList, setImgList] = useState([]);
    const [fileList, setFileList] = useState([]);
    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userChats", currentUser.id), (res) => {
            res.data().chats.forEach((chat) => {
                if (chat.chatId === chatId) {
                    setImgList(chat.imgList.sort((a, b) => b.updateAt - a.updateAt));
                    setFileList(chat.fileList.sort((a, b) => b.updateAt - a.updateAt))
                }
            })
        })
        return () => {
            unSub();
        }

    }, [currentUser.id])

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
    const handleClickBack = () => {
        props.setOpenDetail(!props.openDetail);
        const elements = document.getElementsByClassName('chat');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'flex';
        }
        const elements_2 = document.getElementsByClassName('detail');
        for (let i = 0; i < elements_2.length; i++) {
            elements_2[i].style.display = 'none';
        }
        const element = document.getElementById("intoView");
        if (element) {
            element.scrollIntoView();
        }
    }
    return (
        <>
            <div className="detail">
                <PerfectScrollbar>
                    <div className="user">
                        <div className='iconBack' onClick={() => handleClickBack()}>
                            <i><IoCaretBackOutline /></i>
                        </div>
                        <img src={user?.avatar || avatar} alt="" />
                        <h2>{user?.name}</h2>
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
                            <div className="settings">
                                {
                                    option1 &&
                                    <>
                                        <div className="settingItem" onClick={() => setOpenTheme(!openTheme)}>
                                            <FaDotCircle size={'1.5em'} className='theme' />
                                            <span>Change themes</span>
                                        </div>
                                        <div className="settingItem" onClick={() => setOpenColor(!openColor)}>
                                            <IoIosColorPalette size={'1.5em'} className='color' id='color' />
                                            <span>Change colors</span>
                                        </div>
                                        {/* <div className="settingItem" onClick={() => setOpenEmoji(!openEmoji)}>
                                            <FaDotCircle size={'1.5em'} className='emotion' />
                                            <span>Change emoticons</span>
                                        </div> */}
                                    </>
                                }
                            </div>
                        </div>
                        <div className="option">
                            <div className="title" onClick={() => setOption2(!option2)}>
                                <span>Shared Photos</span>
                                {
                                    !option2 ? <img src={down} alt="" /> : <img src={up} alt="" />
                                }
                            </div>
                            <div className="photos">
                                {
                                    option2 && imgList && imgList.length > 0 && imgList.map((value, index) => {
                                        return (
                                            <div className="photoItem" key={`imgList_${index}`}>
                                                <a href={value.imgUrl} target='_blank'>
                                                    <div className="photoDetail">
                                                        <img src={value.imgUrl} alt="image" className='image' />
                                                        <img src={download} alt="" className='icon' />
                                                    </div>
                                                </a>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className="option">
                            <div className="title" onClick={() => setOption3(!option3)}>
                                <span>Shared Files</span>
                                {
                                    !option3 ? <img src={down} alt="" /> : <img src={up} alt="" />
                                }
                            </div>
                            <div className="files">
                                {
                                    option3 && fileList && fileList.length > 0 && fileList.map((value, index) => {
                                        return (
                                            <div className="fileItem" key={`fileList_${index}`}>
                                                <a href={value.fileUrl} target='_blank'>
                                                    <div className="fileDetail">
                                                        <p>{value.fileName}</p>
                                                        <img src={download} alt="" className='icon' />
                                                    </div>
                                                </a>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <button onClick={() => handleBlock()} className='btnBlock'>
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
                {
                    openTheme && !openColor && <Theme setOpenTheme={setOpenTheme} />
                }
                {
                    openColor && !openTheme && <ColorMessage setOpenColor={setOpenColor} />
                }
            </div>
        </>
    )
}

export default Detail