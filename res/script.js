const backend_uri = 'https://video-watchers-backend.vercel.app';
let videos_list = [];

function check_login() {
    console.log("check")
    if (localStorage.getItem('token') != null) {
        document.querySelector('.auth').style.display = 'none';
        document.querySelector('.main').style.display = 'block';
        document.getElementById('credit').innerHTML = `$ ${localStorage.getItem('credit')}`;
        get_videos();
    } else {
        document.querySelector('.auth').style.display = 'block';
        document.querySelector('.main').style.display = 'none';
    }
}

async function login(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await fetch(`${backend_uri}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    }).then(
        res => res.json()
    ).then(data => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('credit', data.credit);
        localStorage.setItem('role', data.role);
        window.location.reload();
    }).catch(error => console.log(error));
}

async function register(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await fetch(`${backend_uri}/api/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    }).then(
        res => res.json()
    ).then(data => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('credit', data.credit);
        localStorage.setItem('role', data.role);
        window.location.reload();
    }).catch(error => console.log(error));
}

function logout() {
    localStorage.removeItem('token');
    window.location.reload();
}


async function get_videos() {
    let url_to_fetch = localStorage.getItem('role') === 'admin' ? '/api/videos/all' : '/api/videos/active';
    await fetch(`${backend_uri}${url_to_fetch}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    }).then(
        res => res.json()
    ).then(data => {
        videos_list = data.data;
    }).catch(error => console.log(error));
}


// https://youtu.be/zCDo-l5DJSo?si=aUxuu_HjfF3bMct7

class VideoCard {
    constructor(title, url, status, owner, watchers, backend_id) {
        this.title = title;
        this.url = url;
        this.status = status;
        this.owner = owner;
        this.watchers = watchers;
        this.id;
        this.player;
        this.watched = false;
        this.backend_id = backend_id;
    }
    create() {
        this.id = document.querySelectorAll('.player').length + 1;
        this.card = document.createElement('div');
        this.card.classList.add('card');

        this.video_id = this.url.split('/')[3].split('?')[0];

        this.video_player = document.createElement('div');
        this.video_player.classList.add('player');
        this.video_player.id = this.id;

        this.stats = document.createElement('div');
        this.stats.classList.add('stats');
        this.stats.innerHTML = `<span>${this.title}</span><span>${this.watchers.length} Watches</span>`

        this.card.appendChild(this.video_player);
        this.card.appendChild(this.stats);
        document.querySelector('.videos').appendChild(this.card);
        this.player = new YT.Player(this.id.toString(), {
            height: '180',
            width: '275',
            videoId: this.video_id,
            playerVars: {
                'playsinline': 1
            }
        });
        this.player.addEventListener('onStateChange', (e) => {
            if (e.data === 0) {
                this.watchedVideo();
            }
        });
    }
    playVideo() {
        this.player.playVideo();
    }
    stopVideo() {
        this.player.stopVideo();
    }
    async watchedVideo() {
        await fetch(`${backend_uri}/api/videos/${this.backend_id}/watch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
        }).then(
            (res) => {
                return res.json();
            }
        ).then(data => {
            console.log(data)
            localStorage.setItem('credit', data.credit);
            document.getElementById('credit').innerHTML = `$ ${localStorage.getItem('credit')}`;
            // window.location.reload();
        }).catch(error => console.log(error));
    }
}

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    for (let z = 0; z < videos_list.length; z++) {
        let vidCard = new VideoCard(videos_list[z].title, videos_list[z].url, videos_list[z].status, videos_list[z].owner, videos_list[z].watchers, videos_list[z]._id);
        vidCard.create();
        // for (let i = 0; i < videos_list[z].watchers.length; i++) {
        //     if (videos_list[z].watchers[i] !== localStorage.getItem('token')) {

        //     }
        // }
    }
}

check_login();