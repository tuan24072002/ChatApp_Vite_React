import React, { useEffect } from 'react'
import './List.scss'
import UserInfo from './userInfo/UserInfo'
import ChatList from './chatList/ChatList'
import { useChatStore } from '../../lib/useChatStore'
const List = () => {
    const { chatId } = useChatStore();
    useEffect(() => {
        if (window.matchMedia('(max-width: 1350px)').matches && chatId !== null) {
            const elements = document.getElementsByClassName('list');
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.display = 'none';
            }
        } else if (window.matchMedia('(max-width: 1350px)').matches && chatId === null) {
            const elements = document.getElementsByClassName('list');
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.display = 'flex';
            }
        } else {
            const elements = document.getElementsByClassName('list');
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.display = 'flex';
            }
        }
    })
    return (
        <div className='list'>
            <UserInfo />
            <ChatList />
        </div>
    )
}

export default List