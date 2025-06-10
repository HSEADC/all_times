// import React, {useEffect, useState} from "react";

// import {getManifests} from '../js/search-data.js' 
// import O_SearchBar from "./O_SearchBar.jsx";
// import M_PostTeaser from "./M_PostTeaser.jsx";

// const S_SearchContent = ({searchInputValue: initialInput}) => {
//     //принимать стартовые значения строки поиска
//     //которые будут передаваться из главного файла сёрч.жсх
//     //для этого хук useState -- даёёт переменную
//     //с возсожностью обновлять её -- он в иимпорте 1 строка
//     //мы можем менять тру или фолс - она будет меняться тк юзаем юзстейт

//     //посты
//     const [postTeasers, setPostTeasers] = useState([])
//     //текущая строка поиска
//     const [searchInputValue, setSearchInputValue] = useState(initialInput || '')
//     //включена кнопка или нет
//     const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(true)

//     //хук эффекта... я ничего не понимаю :(
//     useEffect(() => {
//         getManifests.then(setPostTeasers)
//     }, [])

//     useEffect(() => {
//         setIsSearchButtonDisabled(searchInputValue.trim().length < 3)
//     }, [searchInputValue])

//     // const handleInput = (value) => setSearchInputValue(value)
//     const handleSearchInput = (value) => setSearchInputValue(value)
//     const handleSubmit = () => {}

//     ///////////////????????????????????????????????
//     function renderPostTeasers = () => {
//         const clean = (str) => 
//             str 
//                 .replaceAll(nbspRegEx, ' ')
//                 .replaceAll(punctuationRegEx, '')
//                 .toLowerCase()
//         const value = searchInputValue.toLowerCase()

    
//             return postTeasers
//                 .filter(
//                     (t) => 
//                         clean(t.title).includes(value) || clean(t.description).includes(value) 
//                     // тут перепроверить!!!!!!!!!
//                     // clean(post.title).includes(lowerSearchInputValue) ||
//                     // clean(post.description).includes(lowerSearchInputValue)
//                 ).map((t) => (
//                     <M_PostTeaser
//                         key={t.id}
//                         title={t.title}
//                         description={t.description}
//                         url={t.url}
//                         image={t.image}
//                         tags={t.tags}
//                     />
//                 ))
//     }

//     return (
//         <div className="S_SearchContent">
//             <O_SearchBar
//                 searchInputValue = {searchInputValue}
//                 isSearchButtonDisabled = {isSearchButtonDisabled}
//                 handleInput = {handleInput}
//                 handleSubmit = {handleSubmit}
//                 postTeasers = {postTeasers}
//             />
//             {renderPostTeasers}
//         </div>
//     ) 

// }

// // export default S_SearchContent 

























































import React, {useEffect, useState} from "react";
import { getManifests } from '../js/search-data.js'; 
import O_SearchBar from "./O_SearchBar.jsx";
import M_PostTeaser from "./M_PostTeaser.jsx";

const S_SearchContent = ({searchInputValue: initialInput}) => {
    const [postTeasers, setPostTeasers] = useState([]);
    const [searchInputValue, setSearchInputValue] = useState(initialInput || '');
    const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(true);

    const nbspRegEx = /\u00A0/g;
    const punctuationRegEx = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;

    // useEffect(() => {
    //     // getManifests.then(setPostTeasers);
    //     setPostTeasers(getManifests);
    // }, []);

    //тут последний используемый гетМанифесты
    useEffect(() => {
        const data = getManifests(); 
        setPostTeasers(Array.isArray(data) ? data : []); 
    }, []);


    //выводит пустой массив :(
    useEffect(() => {
        console.log("Post Teasers:", postTeasers);
    }, [postTeasers]);

    //тут новое -- не работает
    // useEffect(() => {
    //     getManifests.then(data => setPostTeasers(data));
    // }, []);

    useEffect(() => {
        setIsSearchButtonDisabled(searchInputValue.trim().length < 3);
    }, [searchInputValue]);

    const handleSearchInput = (value) => setSearchInputValue(value);
    const handleSubmit = () => {};

    const renderPostTeasers = () => {
        const clean = (str) => 
            str 
                .replaceAll(nbspRegEx, ' ')
                .replaceAll(punctuationRegEx, '')
                .toLowerCase();
        const value = searchInputValue.toLowerCase();

        return postTeasers
            .filter((t) => 
                clean(t.title).includes(value) || clean(t.description).includes(value)
            )
            .map((t) => (
                <M_PostTeaser
                    key={t.id}
                    title={t.title}
                    description={t.description}
                    url={t.url}
                    image={t.image}
                    tags={t.tags}
                />
            ));
    };
    console.log(postTeasers)

    return (
        <div className="S_SearchContent">
            <O_SearchBar
                searchInputValue={searchInputValue}
                isSearchButtonDisabled={isSearchButtonDisabled}
                handleInput={handleSearchInput}
                handleSubmit={handleSubmit}
                postTeasers={postTeasers}
            />
            {renderPostTeasers()}
        </div>
    );
};

export default S_SearchContent;