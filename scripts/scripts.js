const STAR_DENSITY = 0.003;
const STAR_R_MIN = 0.1;
const STAR_R_MAX = 1.5;
const TAU = 2 * Math.PI;
const SCROLL_MIN = 0.0;
const SCROLL_MAX = 0.125;

//  Move to content box with id of key press (encyclopedia)
document.addEventListener('keypress', keyPressed);
function keyPressed(e) {
    document.getElementById(e.key).scrollIntoView();
}

//  Generate and draw stars
let stars;
function initializeCanvas() {
    var canvas = document.getElementById("stars");
    canvas.style.width ='100%';
    canvas.style.height ='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
function createStars() {
    //  Get max window resolution to handle resizing corner cases
    let w = window.screen.width * window.devicePixelRatio;
    let h = window.screen.height * window.devicePixelRatio;
    let area = w * h;
    let starCount = area * STAR_DENSITY;
    stars = [];
    for (let i = 0; i < starCount; i++) {
        let x = Math.random() * w;
        let y = Math.random() * h;
        let r = STAR_R_MIN + Math.random() * Math.random() * (STAR_R_MAX - STAR_R_MIN);
        let scroll = SCROLL_MIN + Math.random() * (SCROLL_MAX - SCROLL_MIN);
        stars.push({x: x, y: y, r: r, scroll: scroll});
    }
}
function drawStars() {
    var canvas = document.getElementById("stars");
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    let offset = document.getElementById("content").scrollTop;
    let maxScroll = document.getElementById("content").scrollHeight * SCROLL_MAX;
    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];
        let y = (s.y + maxScroll - s.scroll * offset) % canvas.height;
        context.moveTo(s.x, y);
        context.arc(s.x, y, s.r, 0, TAU);
    }
    context.fillStyle = "white";
    context.fill();
    context.closePath();
}
document.getElementById("content").addEventListener("scroll", function() {
    drawStars();
});
window.onresize = function() {
    initializeCanvas();
    drawStars();
}


//  Page load
window.onload = async function() {

    //  If someone tries to access the page with an incomplete url, direct to default page
    if (!window.location.href.includes("?")) {
        window.location.href += "?path=nav/truth_ii";
    }
    //  Get content html from url params
    let params = new URLSearchParams(window.location.search);
    let path = params.get("path");
    let html = await contentHTML(path);
    
    let titleIndex = html.search('\n');
    let title = document.getElementById("title");
    document.title = title.innerHTML = html.substring(0, titleIndex);

    let content = document.getElementById("content");
    content.innerHTML = html.substring(titleIndex);
    
    //  Move to element id passed through url
    let hashtagID = window.location.hash;
    if (hashtagID) {
        hashtagID = hashtagID.replace("#", "");
        document.getElementById(hashtagID).scrollIntoView();
    }
    initializeCanvas();
    createStars();
    drawStars();
}

async function contentHTML(path) {
    let url = window.location.href;
    let cutIndex = url.indexOf("index.html");
    let dataPath = url.substring(0, cutIndex) + path + ".html";
    return fetch(dataPath).then(response => response.text());
}