import React, { useRef } from "react";

export default function A_Input({value, placeholder, handleInput, handleSubmit}) {
    //добавили хук (по сути просто фенкция) реф -- имеет ссылку на наш элемент
    const input = useRef()
    //конст онинпут содержит в себе анонимную функцию, которая берёт функцию инпут и передаёт в неё корректное значение инпута
    const onInput = () => handleInput(input.current.value)
    
    return (
        <input
            className="A_Input"
            value={value}

            ref = {input}
            
            placeholder={placeholder}
            onInput={onInput}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
    )
}
