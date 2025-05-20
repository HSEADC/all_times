// import React from "react";
// import M_SearchForm from "./M_SearchForm.jsx";
// import M_PostSuggestion from "./M_PostSuggestion.jsx";

// export default function O_SearchBar({    
//     searchInputValue, 
//     isSearchButtonDisabled, 
//     handleInput, 
//     handleSubmit,
//     postTeasers
// }) {

//     function renderPostSuggestions() {
//         const nbspRegEx = /[\u202F\u00A0]/gm
//         const punctuationRegEx = /[.,\/#!$%\^&\*;:{}=\-_`()]/gm
//         const lowerSearchInputValue = lowerSearchInputValue.toLowerCase()

//         const clean = (str) => {
//             str.replaceAll(nbspRegEx, ' ')
//             str.replaceAll(punctuationRegEx, '')
//             str.toLowerCase()
//         }

//         return (
//             <div className="C_PostSuggestions">
//                 {postTeasers.filter((post) => 
//                     // тут перепроверить!!!!!!!!!
//                     clean(post.title).includes(lowerSearchInputValue) ||
//                     clean(post.description).includes(lowerSearchInputValue)
//                 ).map((post) => (
//                     <M_PostSuggestion 
//                     url={post.url}
//                     title={post.title}
//                     description={post.description}
//                     key={post.id} 
//                     />
//                 ))}
//             </div>
//         )
//     }


//     return (
//         <div className="O_SearchBar">
//             <M_SearchForm     
//                 searchInputValue={searchInputValue}
//                 isSearchButtonDisabled={isSearchButtonDisabled}
//                 handleInput={handleInput}
//                 handleSubmit={handleSubmit}
//             />

//             {/* если есть 3 символа то -- активируем кнопку + активируем рендер постов */}
//             {searchInputValue.length >= 3 && 
//             !isSearchButtonDisabled && 
//             renderPostSuggestions()}
//         </div>
//     )
// }

































































import React from "react";
import M_SearchForm from "./M_SearchForm.jsx";
import M_PostSuggestion from "./M_PostSuggestion.jsx";

export default function O_SearchBar({
  searchInputValue,
  isSearchButtonDisabled,
  handleInput,
  handleSubmit,
  postTeasers,
}) {
  function renderPostSuggestions() {
    // Проверка на массив
    if (!Array.isArray(postTeasers)) return null;

    const nbspRegEx = /[\u202F\u00A0]/gm;
    const punctuationRegEx = /[.,\/#!$%\^&\*;:{}=\-_`()]/gm;
    const lowerSearchInputValue = searchInputValue?.toLowerCase() || '';

    const clean = (str) => {
      return str
        ?.replaceAll(nbspRegEx, ' ')
        ?.replaceAll(punctuationRegEx, '')
        ?.toLowerCase() || '';
    };

    return (
      <div className="C_PostSuggestions">
        {postTeasers
          .filter((post) => {
            const cleanTitle = clean(post?.title);
            const cleanDescription = clean(post?.description);
            return (
              cleanTitle.includes(lowerSearchInputValue) ||
              cleanDescription.includes(lowerSearchInputValue)
            );
          })
          .map((post) => (
            <M_PostSuggestion
              url={post.url}
              title={post.title}
              description={post.description}
              key={post.id}
            />
          ))}
      </div>
    );
  }

  return (
    <div className="O_SearchBar">
      <M_SearchForm
        searchInputValue={searchInputValue}
        isSearchButtonDisabled={isSearchButtonDisabled}
        handleInput={handleInput}
        handleSubmit={handleSubmit}
      />

      {searchInputValue.length >= 3 &&
        !isSearchButtonDisabled &&
        renderPostSuggestions()}
    </div>
  );
}