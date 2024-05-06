import React from 'react'
import './ColorMessage.scss'
import { FaWindowClose } from "react-icons/fa";
import { IoIosColorPalette } from "react-icons/io";
const ColorMessage = (props) => {
    function changeColor(colorMessage) {
        document.getElementById("color").style.color = colorMessage;
        document.documentElement.style.setProperty('--bg-color-message', colorMessage + '');
        if (colorMessage === '#D8BFD8' || colorMessage === 'white') {
            document.documentElement.style.setProperty('--text-color-message', '#333');
            document.documentElement.style.setProperty('--file-color-message', '#333');
        } else {
            document.documentElement.style.setProperty('--text-color-message', 'white');
            document.documentElement.style.setProperty('--file-color-message', 'azure');
        }

        if (colorMessage === '#5183fe') {
            document.documentElement.style.setProperty('--text-color-detail', 'white');
        } else {
            document.documentElement.style.setProperty('--text-color-detail', colorMessage);
        }
    }
    return (
        <div className='color_container'>
            <div className="title">Colors <i className="close" onClick={() => props.setOpenColor(false)}><FaWindowClose /></i></div>
            <div className='content'>
                <div className="theme_sys">
                    <i className="item" onClick={() => changeColor('#5183fe')}><IoIosColorPalette /></i>
                    <i className="item" onClick={() => changeColor('#D8BFD8')}><IoIosColorPalette /></i>
                    <i className="item" onClick={() => changeColor('#9B30FF')}><IoIosColorPalette /></i>
                    <i className="item" onClick={() => changeColor('#FF3E96')}><IoIosColorPalette /></i>
                    <i className="item" onClick={() => changeColor('#F08080')}><IoIosColorPalette /></i>
                    <i className="item" onClick={() => changeColor('#FF7F24')}><IoIosColorPalette /></i>
                    <i className="item" onClick={() => changeColor('white')}><IoIosColorPalette /></i>
                    <i className="item" onClick={() => changeColor('black')}><IoIosColorPalette /></i>
                </div>
            </div>

        </div>
    )
}

export default ColorMessage