import React, { useState } from 'react'
import './Login.scss'
import avt from '../../assets/images/avatar.png'
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { doc, setDoc } from "firebase/firestore";
import upload from '../../lib/upload'
import NProgress from 'nprogress';
import { FaSpinner } from "react-icons/fa";
const Login = (props) => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ''
    })
    const [loading, setLoading] = useState(false)
    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }
    const handleSubmitSignIn = async (e) => {
        e.preventDefault();
        NProgress.start();
        setLoading(true);
        const formData = new FormData(e.target)
        const { email, password } = Object.fromEntries(formData);
        if (!email) {
            toast.error(`Invalid Email !`);
            return;
        }
        if (!password) {
            toast.error(`Invalid Password !`);
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password)
            toast.success('Login successfully !')
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
            NProgress.done();
        }
    }
    const handleSubmitSignUp = async (e) => {
        e.preventDefault();
        NProgress.start();
        setLoading(true);
        const formData = new FormData(e.target)
        // formData.append('username', username)
        // formData.append('email', email)
        // formData.append('password', password)
        const { username, email, yourname, password, confirmpassword } = Object.fromEntries(formData);
        if (!username) {
            toast.error(`Invalid Username !`);
            return;
        }
        if (!email) {
            toast.error(`Invalid Email !`);
            return;
        }
        if (!password) {
            toast.error(`Invalid Password !`);
            return;
        }
        if (!confirmpassword) {
            toast.error(`Invalid Confirm Password !`);
            return;
        }
        if (!yourname) {
            toast.error(`Invalid Name !`);
            return;
        }
        if (password === confirmpassword) {
            try {
                //Register
                const res = await createUserWithEmailAndPassword(auth, email, password)
                //Upload Avatar
                const imgUrl = await upload(avatar.file)
                //Save Data to Collection
                await setDoc(doc(db, "users", res.user.uid), {
                    username,
                    email,
                    name: yourname,
                    avatar: imgUrl,
                    id: res.user.uid,
                    blocked: []
                });
                await setDoc(doc(db, "userChats", res.user.uid), {
                    chats: [],
                });
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            } finally {
                toast.success('Account created! You can login now!')
                setLoading(false);
                NProgress.done();
                window.location.reload();
            }
        } else {
            toast.error(`Confirm Password does not match !`);
            setLoading(false);
            NProgress.done();
        }
    }
    return (
        <div className='login'>
            <div className="item">
                <h2>Welcom back...</h2>
                <form onSubmit={handleSubmitSignIn}>
                    <input type="text" placeholder='Enter your Email' name='email' />
                    <input type="password" placeholder='Enter your Password' name='password' />
                    <button type='submit' disabled={loading}>Sign In {loading && <FaSpinner className='loading' />}</button>
                </form>
            </div>
            <div className="separator"><span>OR</span></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleSubmitSignUp}>
                    <div className='item_register'>
                        <input type="text" name="yourname" placeholder='Enter your Name' />
                        <div className='item_child'>
                            <label htmlFor="file">
                                <img src={avatar.url || avt} alt="" />
                                Upload an Avatar
                            </label>
                            <input type="file" id='file' hidden onChange={handleAvatar} />
                        </div>
                    </div>
                    <div className='item_register'>
                        <input type="text" placeholder='Enter your Username' name='username' />
                        <input type="text" placeholder='Enter your Email' name='email' />
                    </div>
                    <div className='item_register'>
                        <input type="password" placeholder='Enter your Password' name='password' />
                        <input type="password" placeholder='Enter your Confirm Password' name='confirmpassword' />
                    </div>
                    <button type='submit' disabled={loading}>Sign Up {loading && <FaSpinner className='loading' />}</button>
                </form>
            </div>
        </div>
    )
}

export default Login