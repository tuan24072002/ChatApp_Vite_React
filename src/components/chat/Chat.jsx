import React, { useEffect, useState } from 'react'
import './Chat.scss'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { FaCircle, FaFile } from "react-icons/fa";
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
import { uploadFile, uploadImage } from '../../lib/upload';
import { FaSpinner } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { toast } from 'react-toastify';
import { IoCaretBackOutline } from "react-icons/io5";
import more from '../../assets/images/more.png'
const Chat = (props) => {
    const { setOpenDetail, openDetail } = props
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [chat, setChat] = useState(null)
    const [moreOption, setMoreOption] = useState(false);
    const [openImage, setOpenImage] = useState(false)
    const [message, setMessage] = useState('')
    const [fileMessage, setFileMessage] = useState({
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
        if (e.target.files[0] && (
            e.target.files[0].name.split('.').pop() === 'jpg' ||
            e.target.files[0].name.split('.').pop() === 'png' ||
            e.target.files[0].name.split('.').pop() === 'gif'
        )) {
            setFileMessage({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        } else {
            setFileMessage({
                file: e.target.files[0],
                url: e.target.files[0].name
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
        if (fileMessage && fileMessage.file?.size > 2097152) {
            toast.warning(`File size must under 2MiB !`)
            setLoading(false);
            scrollLastMessage();
            return;
        }
        let imgUrl = null;
        let fileUrl = null;
        try {

            if (fileMessage.file &&
                (
                    fileMessage.file.name.split('.').pop() === 'jpg' ||
                    fileMessage.file.name.split('.').pop() === 'png' ||
                    fileMessage.file.name.split('.').pop() === 'gif'
                )) {
                imgUrl = await uploadImage(fileMessage.file);
            } else if (fileMessage.file &&
                (
                    fileMessage.file.name.split('.').pop() === 'pdf' ||
                    fileMessage.file.name.split('.').pop() === 'xlsx' ||
                    fileMessage.file.name.split('.').pop() === 'doc' ||
                    fileMessage.file.name.split('.').pop() === 'docx' ||
                    fileMessage.file.name.split('.').pop() === 'txt'
                )) {
                fileUrl = await uploadFile(fileMessage.file);
            }
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text: message,
                    image: imgUrl ? imgUrl : "",
                    fileName: fileUrl ? fileMessage.url : "",
                    fileUrl: fileUrl ? fileUrl : "",
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
                    userChatData.chats[chatIndex].lastMessage = message;
                    userChatData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    if (imgUrl !== null) {
                        if (!userChatData.chats[chatIndex].imgList) {
                            userChatData.chats[chatIndex].imgList = [];
                        }
                        userChatData.chats[chatIndex].imgList.push({
                            imgUrl: imgUrl,
                            updateAt: Date.now()
                        });
                    }
                    if (fileUrl !== null) {
                        if (!userChatData.chats[chatIndex].fileList) {
                            userChatData.chats[chatIndex].fileList = [];
                        }
                        userChatData.chats[chatIndex].fileList.push({
                            fileUrl: fileUrl,
                            fileName: fileMessage.url,
                            updateAt: Date.now()
                        });
                    }
                    userChatData.chats[chatIndex].updateAt = Date.now();

                    await updateDoc(userChatRef, {
                        chats: userChatData.chats
                    })
                }
            })
        } catch (error) {
            console.log(error);
        } finally {
            setFileMessage({
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
    const handleClickBack = () => {
        closeChat();
        const elements = document.getElementsByClassName('list');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'block';
        }
        setOpenDetail(false);
    }
    const handleClickViewDetail = () => {
        setOpenDetail(!openDetail);
        if (window.matchMedia('(max-width: 1350px)').matches) {
            const elements = document.getElementsByClassName('chat');
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.display = 'none';
            }
            const elements_2 = document.getElementsByClassName('detail');
            for (let i = 0; i < elements.length; i++) {
                elements_2[i].style.display = 'flex';
            }
        }
    }
    return (
        <div className="chat">
            <div className="top">
                <div className='iconBack' id='iconBack' onClick={() => handleClickBack()}>
                    <i><IoCaretBackOutline /></i>
                </div>
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
                    <img src={info} alt="" onClick={() => handleClickViewDetail()} />
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
                                            message.image && <a href={message.image} target='_blank'><img src={message.image} alt="" onClick={() => setOpenImage(true)} /></a>
                                        }
                                        {
                                            message.text !== '' && <p className='textMessage' id='textMessage'>{message.text}</p>
                                        }
                                        {
                                            message.fileUrl && <a href={message.fileUrl} className='file'><span>{message.fileName}</span> <i className='icon_file'><FaFile /></i></a>
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
                    <div id='intoView'></div>
                </div>
            </PerfectScrollbar>
            <div className="bottom">
                <div className="icons">
                    <img src={more} alt="" onClick={() => setMoreOption(!moreOption)} className='more' />
                    {
                        moreOption && <div className="option">
                            <label htmlFor="image">
                                <img src={img} alt="" />
                            </label>
                            <input type="file" name="image" id='image' hidden onChange={handleUploadImage} disabled={isCurrentUserBlocked || isReceiverBlocked || loading} />
                            <img src={camera} alt="" onClick={handleCamera} />
                            <img src={microphone} alt="" />
                        </div>
                    }
                    <div className="option_responsive">
                        <label htmlFor="image">
                            <img src={img} alt="" />
                        </label>
                        <input type="file" name="image" id='image' hidden onChange={handleUploadImage} disabled={isCurrentUserBlocked || isReceiverBlocked || loading} />
                        <img src={camera} alt="" onClick={handleCamera} />
                        <img src={microphone} alt="" />
                    </div>
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
            {
                fileMessage.url !== '' && (
                    fileMessage.file.name.split('.').pop() === 'jpg' ||
                    fileMessage.file.name.split('.').pop() === 'png' ||
                    fileMessage.file.name.split('.').pop() === 'gif'
                ) && (
                    <div className="preview">
                        <div className="image">
                            <img src={fileMessage.url} alt="" />
                            <IoIosCloseCircle className='close' onClick={() => setFileMessage({ file: null, url: "" })} />
                        </div>
                    </div>
                )
            }
            {
                fileMessage.url !== '' && (
                    fileMessage.file.name.split('.').pop() === 'pdf' ||
                    fileMessage.file.name.split('.').pop() === 'xlsx' ||
                    fileMessage.file.name.split('.').pop() === 'doc' ||
                    fileMessage.file.name.split('.').pop() === 'docx' ||
                    fileMessage.file.name.split('.').pop() === 'txt'
                ) && (
                    <div className="preview">
                        <div className="file">
                            <p>{fileMessage.file.name}</p> <FaFile size={'1.5rem'} />
                            <IoIosCloseCircle className='close' onClick={() => setFileMessage({ file: null, url: "" })} />
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default Chat