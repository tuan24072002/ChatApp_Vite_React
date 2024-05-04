import List from './components/list/List'
import Chat from './components/chat/Chat'
import Detail from './components/detail/Detail'
import Login from './components/login/Login'
import Notify from './components/notification/Notify'
import NProgress from 'nprogress';
import { useCallback, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import { useUserStore } from './lib/userStore'
import { FaSpinner } from "react-icons/fa";
import { useChatStore } from './lib/useChatStore'
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 50,
})
const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const [openDetail, setOpenDetail] = useState(false);
  const { chatId } = useChatStore();
  const unSub = useCallback(() => {
    onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    })
  }, [fetchUserInfo])
  useEffect(() => {
    unSub();
  }, [unSub])
  if (isLoading) {
    return <div className="loading_page">Loading... <FaSpinner className='loading' /></div>
  }
  return (
    <div className='container'>
      {
        currentUser !== null ? <>
          <List />
          {
            chatId && <Chat setOpenDetail={setOpenDetail} openDetail={openDetail} />
          }
          {
            chatId && openDetail && <Detail />
          }
        </> :
          <Login />
      }
      <Notify />
    </div>
  )
}

export default App