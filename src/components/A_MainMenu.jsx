import React from "react";
import classNames from "classnames";

const A_MainMenu = ({text, current, url, type}) => {
    const classes = classNames({
        A_MainMenu: true,
        current: current,
        [`${type}`]: true
    })

    return(
        <a href={url} className={classes}>
            {text}
        </a>
    )
}

export default A_MainMenu