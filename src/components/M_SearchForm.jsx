import React from "react";

import A_Input from "./A_Input.jsx";
import A_Button from "./A_Button.jsx";

export default function M_SearchForm({
    searchInputValue, 
    isSearchButtonDisabled, 
    handleInput, 
    handleSubmit
}) {
    return (
        <div className="M_SearchForm">
            <A_Input 
                value={searchInputValue} 
                handleInput={handleInput}
                handleSubmit={handleSubmit}
                placeholder='Что ищем?'
            />

            {searchInputValue != '' && (
                //по клику на крестик сёрч очищается
                <A_Button
                text = 'X'
                type='resetField'
                disabled={false}
                handleClick={() => handleInput('')}
                />
            )}

            {/* обычнная кнопка сёрч */}
            <A_Button
                text = 'Поиск'
                type='primary'
                disabled={isSearchButtonDisabled}
                handleClick={handleSubmit}
            />

        </div>
    )

}