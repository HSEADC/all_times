import React, {useEffect, useState} from "react";
import { getManifests } from '../js/search-data.js'; 
import A_MainMenu from "./A_MainMenu.jsx";
import O_SearchBar from "./O_SearchBar.jsx";

export default function S_MenuBar({
    searchInputValue: initialSearchInputValue,
    prerender,
    menu,
    homeURL
}) {
    //если тру -- метод виндов.локейшн чтобы менять адрес страницы, иначе ничего не меняй -- склеенная ссылка равна адресу
    const currentURL = !prerender ? window.location.href : ''

    //map по индексам массива проходимся
    const menuElements = menu.map(({text, url}, i) => {
        //ссылко собирается из менюБарДата -- отдельно есть название штмл страницы - склеиваем в полноценный адрес с локал хостом (потом локал хост заменить)
        const linkURL = homeURL + url //тут локал + просто юрл для каждой ссылки - для каждой линки свой уникальный юрл
        return (
            <A_MainMenu
                key = {i} 
                current={linkURL === currentURL} //если адрес совпадает с текущей ссылкой то ввернётся тру
                text={text}
                url={linkURL}
                type='mainMenuItem'
            />
        )
    })

    return (
        //создали пустой div
        <>
            <A_MainMenu
            current={false}
            text='main page'
            url={homeURL}
            type='mainMenuLogo'
            />

            <div className="C_MainMenu">
                {menuElements}
            </div>
        </>
    )
}