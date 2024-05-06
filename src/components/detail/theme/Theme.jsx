import React, { useState } from 'react'
import './Theme.scss'
import { FaDotCircle } from "react-icons/fa"
import { FaWindowClose } from "react-icons/fa";
const Theme = (props) => {
    const [bgTheme, setBgTheme] = useState(null);
    function changeTheme(theme) {
        setBgTheme(null);
        document.body.style.backgroundImage = '';
        const body = document.querySelector('body');
        body.dataset.theme = theme;
    }
    const customTheme = (bg) => {
        if (bg !== null) {
            setBgTheme(bg);
            document.body.style.backgroundImage = `url('${URL.createObjectURL(bg)}')`;
        }
    }
    return (
        <div className='theme_container'>
            <div className="title">Themes <i className="close" onClick={() => props.setOpenTheme(false)}><FaWindowClose /></i></div>
            <div className='content'>
                <div className="theme_sys">
                    <i className="item" onClick={() => changeTheme('C6E2FF')}><FaDotCircle /></i>
                    <i className="item" onClick={() => changeTheme('97FFFF')}><FaDotCircle /></i>
                    <i className="item" onClick={() => changeTheme('FFE4C4')}><FaDotCircle /></i>
                    <i className="item" onClick={() => changeTheme('FFE4E1')}><FaDotCircle /></i>
                    <i className="item" onClick={() => changeTheme('63B8FF')}><FaDotCircle /></i>
                    <i className="item" onClick={() => changeTheme('54FF9F')}><FaDotCircle /></i>
                    <i className="item" onClick={() => changeTheme('light')}><FaDotCircle /></i>
                    <i className="item" onClick={() => changeTheme('dark')}><FaDotCircle /></i>
                </div>
                <label htmlFor="theme">
                    <div className="your_theme">
                        <span>Choose your image</span>
                        <input type="file" name="" id="theme" hidden onChange={(e) => customTheme(e.target.files[0])} />
                    </div>
                </label>
            </div>

        </div>
    )
}

export default Theme