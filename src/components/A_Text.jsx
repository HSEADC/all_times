import React from "react";
import classNames from 'classnames';

export default function A_Text({text, type}) {
    //обращаясь к библиотеке класс нэймс - если класс а_текст - то вынь его тайп (заголовок, абзац, название тега и тп)
    const classes = classNames({
        A_Text: true,
        [`${type}`]: true
    })
    return <div className={classes}>{text}</div>
}

//classNames заменила на className