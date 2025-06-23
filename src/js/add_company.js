import '../index.css'
document.addEventListener('DOMContentLoaded', () => {
    const btn_to_index = document.querySelectorAll('.Btn_to_index');
    const btn_to_mail = document.querySelectorAll('.Send_project_btn');

    btn_to_index.forEach(btn => {
        btn.addEventListener("click", (event) => {
            window.location.href = 'index.html';
        });
    });

    btn_to_mail.forEach(btn => {
        btn.addEventListener("click", (event) => {
            window.location.href = 'mailto:alltimes.archive@gmail.com';
        });
    });
});