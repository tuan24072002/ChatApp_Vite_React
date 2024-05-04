import React, { useState } from 'react'
import './AddUser.scss'
import avatar from '../../../../assets/images/avatar.png'
import { collection, where, query, getDocs, or, setDoc, doc, serverTimestamp, arrayUnion, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../../../../lib/firebase'
import { useUserStore } from '../../../../lib/userStore'
import { toast } from 'react-toastify'
import { FaSpinner } from "react-icons/fa";
import nProgress from 'nprogress'
const AddUser = () => {
    const [user, setUser] = useState(null);
    const { currentUser } = useUserStore();
    const [loading, setLoading] = useState(false);
    const handleSearch = async (e) => {
        e.preventDefault();
        nProgress.start();
        setLoading(true);
        setUser([])
        const formData = new FormData(e.target);
        const username = formData.get(`username`);

        try {
            const userRef = collection(db, 'users');
            const q = query(userRef, or(where('username', '==', username), where('name', '==', username)));
            const querySnapshot = await getDocs(q);
            if (querySnapshot) {
                setUser(querySnapshot.docs[0].data());
            } else {
                toast.error(`Username or name is invalid !`)
                setLoading(false);
                nProgress.done();
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            nProgress.done();
        }
    }
    const handleClickAddUserChat = async () => {
        nProgress.start();
        setLoading(true);
        if (user.id === currentUser.id) {
            toast.warning(`Cannot add myself !`);
            setLoading(false);
            nProgress.done();
            return;
        }
        const userRef = collection(db, 'userChats');
        const q = query(userRef, where('receivedId', '==', user.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            toast.warning(`This person is already in the chat list !`);
            setLoading(false);
            nProgress.done();
            return;
        }


        const chatRef = collection(db, 'chats');
        const userChatRef = collection(db, 'userChats');
        try {
            const newChatRef = doc(chatRef)
            await setDoc(newChatRef, {
                createAt: serverTimestamp(),
                messages: []
            });
            await updateDoc(doc(userChatRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updateAt: Date.now()
                })
            });

            await updateDoc(doc(userChatRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updateAt: Date.now()
                })
            });

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            nProgress.done();
            toast.success(`Add user successfully !`);
        }
    }
    return (
        <div className='addUser'>
            <form onSubmit={handleSearch}>
                <input type="text" placeholder='Username or Name' name='username' />
                <button>Search</button>
            </form>
            {
                user && user.name && <div className="user">
                    <div className="detail">
                        <img src={user.avatar || avatar} alt="" />
                        <span>{user.name}</span>
                    </div>
                    <button onClick={handleClickAddUserChat} disabled={loading}>Add User {loading && <FaSpinner className='loading' />}</button>
                </div>
            }
        </div>
    )
}

export default AddUser