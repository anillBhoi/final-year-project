/** Animated emoji for status messages (upload, verify, delete, etc.) */
window.certEmoji = function certEmoji(emoji, animation) {
  const anim = animation || 'emoji-bounce'
  return `<span class="${anim}" style="font-size: 1.35em; line-height: 1; vertical-align: middle;" aria-hidden="true">${emoji}</span>`
}

window.onscroll = function () {
	scrollFunctionBTT(); // back to top button
};

myButton = document.getElementById("scroll-btn");

function scrollFunctionBTT() {
    if (document.body.scrollTop > 45 || document.documentElement.scrollTop > 45) {
        myButton.style.display = "block";
    } else {
        myButton.style.display = "none";
    }
}


function topFunction() {
    document.body.scrollTop = 0; // for Safari
    document.documentElement.scrollTop = 0; // for Chrome, Firefox, IE and Opera
}

// AOS ANIMATION ON SCROLL
AOS.init({
    duration: 1000,
    easing: "ease",
    once: true, // whether animation should happen only once - while scrolling down
});

function changeBackground(){
    setInterval(() => {
        var bgs = ['../assets/images/bg.jpg',
        '../assets/images/home5.jpg'
    ]
    
      var index=Math.floor(Math.random() * bgs.length) ;
    
      document.querySelector(".home").style = ` background-image: url( ${bgs[index]})`;
    }, 10000);
    
    
    
    }
