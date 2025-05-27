import React from "react";

import A_Text from "./A_Text.jsx";

export default function M_PostTeaser({url, title, description, tags}) {
    // своеборазный фор ич по тегам
    const tagsEl = tags.map((tag, i) => {
        return <A_Text key={i} text={title} type='tag' />
    })
    
    return (
        <a className="M_PostTeaser" href={url}>
            <A_Text text={title} type='h1' />
            <A_Text text={description} type='p' />
            <div className="C_PostTeaserTags">{tagsEl}</div>
        </a>
    ) 
}
