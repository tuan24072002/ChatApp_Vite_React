import React, { useEffect, useState } from 'react'
import './Chat.scss'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { FaCircle } from "react-icons/fa";
import avatar from '../../assets/images/avatar.png'
import phone from '../../assets/images/phone.png'
import video from '../../assets/images/video.png'
import info from '../../assets/images/info.png'
import emoji from '../../assets/images/emoji.png'
import img from '../../assets/images/img.png'
import camera from '../../assets/images/camera.png'
import microphone from '../../assets/images/mic.png'
import { IoSend } from "react-icons/io5";
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase'
import { useChatStore } from '../../lib/useChatStore';
import { FaWindowClose } from "react-icons/fa";
import { BiHappy } from "react-icons/bi";
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import { FaSpinner } from "react-icons/fa";
const Chat = (props) => {
    const { setOpenDetail, openDetail } = props
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [chat, setChat] = useState(null)
    const [openImage, setOpenImage] = useState(false)
    const [message, setMessage] = useState('')
    const [image, setImage] = useState({
        file: null,
        url: "",
    })
    const { chatId, user, closeChat, isReceiverBlocked, isCurrentUserBlocked } = useChatStore();
    const { currentUser } = useUserStore();
    const scrollLastMessage = () => {
        const element = document.getElementById("intoView");
        element.scrollIntoView();
    }
    useEffect(() => {
        scrollLastMessage();
    })
    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        })
        return () => {
            unSub();
        }
    }, [chatId])

    const handleUploadImage = (e) => {
        if (e.target.files[0]) {
            setImage({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
        scrollLastMessage();
    }

    const handleSendMessage = async () => {
        setLoading(true)
        if (message === '' && image.url === '') {
            setLoading(false);
            scrollLastMessage();
            return;
        }
        let imgUrl = null;
        try {

            if (image.file) {
                imgUrl = await upload(image.file);
            }
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text: message,
                    image: imgUrl ? imgUrl : "",
                    createdAt: new Date(),
                })
            })

            const userIDs = [currentUser.id, user.id]
            userIDs.forEach(async (id) => {
                const userChatRef = doc(db, "userChats", id);
                const userChatSnapshot = await getDoc(userChatRef);
                if (userChatSnapshot) {
                    const userChatData = userChatSnapshot.data();
                    const chatIndex = userChatData.chats.findIndex(i => i.chatId === chatId)
                    userChatData.chats[chatIndex].lastMessage = message !== '' ? message : imgUrl;
                    userChatData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    userChatData.chats[chatIndex].updateAt = Date.now();

                    await updateDoc(userChatRef, {
                        chats: userChatData.chats
                    })
                }
            })
        } catch (error) {
            console.log(error);
        } finally {
            setImage({
                file: null,
                url: ""
            })
            setMessage('');
            setLoading(false);
            scrollLastMessage();
        }
    }

    const handleCamera = () => {
        console.log(isReceiverBlocked);
        console.log(isCurrentUserBlocked);
        console.log(user);
    }
    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || avatar} alt="" />
                    <div className="texts">
                        <span>{user?.name}</span>
                        <p><FaCircle style={{ color: "#00FF00" }} /> Online</p>
                    </div>
                </div>
                <div className="icons">
                    <img src={phone} alt="" />
                    <img src={video} alt="" />
                    <img src={info} alt="" onClick={() => setOpenDetail(!openDetail)} />
                </div>
                {
                    !openDetail &&
                    <div className="close" onClick={() => closeChat()}>
                        <FaWindowClose />
                    </div>
                }
            </div>
            <PerfectScrollbar>
                <div className="center">
                    {
                        chat && chat?.messages?.length > 0 ? chat?.messages?.map((message) => {
                            return (
                                <div className={`message ${message.senderId === currentUser.id ? 'own' : ''}`} key={`chat_${message.createdAt}`}>
                                    {
                                        message.senderId !== currentUser.id && <img src={user?.avatar} alt='' />
                                    }
                                    <div className="texts">
                                        {
                                            message.image && <img src={message.image} alt="" onClick={() => setOpenImage(true)} />
                                        }
                                        {
                                            message.text !== '' && <p>{message.text}</p>
                                        }
                                        {/* <span>1 min ago</span> */}
                                    </div>
                                </div>
                            )
                        })
                            : <div className="message_empty">
                                <p>Don't have any message! You can start this message now! Have funny </p><BiHappy size={'2rem'} />
                            </div>
                    }
                    {
                        image.url && (
                            <div className="message own">
                                <div className="texts">
                                    <img src={image.url} alt="" />
                                </div>
                            </div>
                        )
                    }
                    <div id='intoView'></div>
                </div>
            </PerfectScrollbar>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="image">
                        <img src={img} alt="" />
                    </label>
                    <input type="file" name="image" id='image' hidden onChange={handleUploadImage} disabled={isCurrentUserBlocked || isReceiverBlocked || loading} />
                    <img src={camera} alt="" onClick={handleCamera} />
                    <img src={microphone} alt="" />
                </div>
                <input type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a message" : 'Aa'} value={message} onChange={(e) => setMessage(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked || loading} />
                <div className="emoji">
                    <img src={emoji} alt="" onClick={() => setOpen(!open)} />
                    <div className="picket">
                        <EmojiPicker open={open} onEmojiClick={(e) => setMessage(prev => prev + e.emoji)} className='iconEmoji' />
                    </div>
                </div>
                <button className='sendButton' onClick={() => handleSendMessage()} disabled={isCurrentUserBlocked || isReceiverBlocked || loading}>{loading ? <FaSpinner className='loading' /> : <IoSend />}</button>
            </div>
        </div>
    )
}

export default Chat