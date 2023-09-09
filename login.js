const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const iconClose = document.querySelector('.icon-close');
const btnpopup = document.querySelector('.btnLogin-popup');

registerLink.addEventListener('click',()=>{
    wrapper.classList.add('active');
});


loginLink.addEventListener('click',()=>{
    wrapper.classList.remove('active');
});


iconClose.addEventListener('click',()=>{
    wrapper.classList.remove('active');
});

btnpopup.addEventListener('click',()=>{
    wrapper.classList.add('active-popup');
});


