import React from "react";

import A_Text from "./A_Text.jsx";

export default function M_PostSuggestion({url, title, description}) {
    return (
        <a className="M_PostSuggestion" href={url}>
            <A_Text text={title} type='h1' />
            <A_Text text={description} type='p' />
            <div className="C_PostTeaserTags">{tagsEl}</div>
        </a>
    ) 
}

//{url} замена "{url}" на {url}