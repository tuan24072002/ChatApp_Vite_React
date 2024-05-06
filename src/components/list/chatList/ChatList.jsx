import React, { useEffect, useState } from 'react'
import './ChatList.scss'
import search from '../../../assets/images/search.png'
import plus from '../../../assets/images/plus.png'
import minus from '../../../assets/images/minus.png'
import avatar from '../../../assets/images/avatar.png'
import PerfectScrollbar from 'react-perfect-scrollbar'
import AddUser from './addUser/AddUser'
import { useUserStore } from '../../../lib/userStore'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import { useChatStore } from '../../../lib/useChatStore'
import { FaFile } from "react-icons/fa";
const ChatList = () => {
    const [addMode, setAddMode] = useState(false)
    const [chats, setChats] = useState([])
    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();
    const [inputSearch, setInputSearch] = useState('')
    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) => {
            const items = res.data().chats;
            const promises = items.map(async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                const user = userDocSnap.data();

                return { ...item, user };
            });
            const chatData = await Promise.all(promises);
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt))
        })
        return () => {
            unSub();
        }
    }, [currentUser.id])
    const handleSelectChat = async (chat) => {
        const userChat = chats.map(item => {
            const { user, ...rest } = item
            return rest;
        })

        const chatIndex = userChat.findIndex(i => i.chatId === chat.chatId)
        userChat[chatIndex].isSeen = true;

        const userChatRef = doc(db, "userChats", currentUser.id)
        try {
            await updateDoc(userChatRef, {
                chats: userChat
            })
            changeChat(chat.chatId, chat.user)
        } catch (error) {
            console.log(error);
        }
        const element = document.getElementById("intoView");
        if (element) {
            element.scrollIntoView();
        }
        if (window.matchMedia('(max-width: 1350px)').matches) {
            const elements = document.getElementsByClassName('list');
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.display = 'none';
            }
        }
    }

    const filterChats = chats.filter(i => i.user.name.toLowerCase().includes(inputSearch.toLowerCase()))

    return (
        <>
            <PerfectScrollbar>
                <div className='chatList'>
                    <div className="search">
                        <div className="searchBar">
                            <img src={search} alt="" />
                            <input type="text" placeholder='Search...' value={inputSearch} onChange={(e) => setInputSearch(e.target.value)} />
                        </div>
                        <img src={addMode ? minus : plus} alt="" className='add' onClick={() => setAddMode(!addMode)} />
                    </div>
                    {
                        chats && chats.length > 0 && filterChats.map((value) => {
                            return (
                                <div
                                    className="item"
                                    key={value.chatId}
                                    onClick={() => { handleSelectChat(value) }}
                                    style={{
                                        backgroundColor: value?.isSeen ? "transparent" : "rgba(155, 157, 160, 0.75)"
                                    }}>
                                    <img src={value.user?.avatar || avatar} alt="" />
                                    <div className="text">
                                        <span>{value.user.blocked.includes(currentUser.id) ? "User" : value.user?.name}</span>
                                        <p>{value.lastMessage !== '' ? (value.lastMessage.length > 50 ? `${value.lastMessage.slice(0, 50)} ...` : value.lastMessage) : <span>File sent <FaFile /></span>}</p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

            </PerfectScrollbar>
            {
                addMode && <AddUser />
            }
        </>
    )
}

export default ChatList