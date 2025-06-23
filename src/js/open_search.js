import '../index.css'

document.addEventListener('DOMContentLoaded', () => {
    const search = document.querySelectorAll('.A_Search_Container');

    search.forEach(el => {
        el.addEventListener("click", (event) => {
            window.location.href = '/search.html';
        });
    });

});





