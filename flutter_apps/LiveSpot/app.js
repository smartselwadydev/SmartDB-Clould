function removeElementsExceptClass(className) {
    const bodyChildren = document.body.children;
    const bodyChildrenArray = Array.from(bodyChildren);
    bodyChildrenArray.forEach(child => {
        if (!child.classList.contains(className)) {
            child.remove();
        }
    });
}
				
function checkUrl(url) {
    if (url.includes("shahid.mbc.net")) {
        removeElementsExceptClass('xxxx');
                let scrollTop, scrollLeft;
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                window.onscroll = function() {
                    window.scrollTo(scrollLeft, scrollTop);
                };
                const centerElements = document.querySelectorAll('center');
                centerElements.forEach(element => {
                    element.remove();
                });
                const hrElements = document.querySelectorAll('hr');
                hrElements.forEach(element => {
                    element.remove();
                });
                const playerDiv = document.createElement('div');
                playerDiv.id = 'player';
                playerDiv.style.position = 'absolute';
                playerDiv.style.top = '0px';
                playerDiv.style.bottom = '0px';
                playerDiv.style.right = '0px';
                playerDiv.style.left = '0px';
                document.body.appendChild(playerDiv);
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js';
                script.onload = function() {
                        var player = new Clappr.Player({
                            source: 'https://ssc-news-live-enc.edgenextcdn.net/out/v1/9002bae7e2a34317bbaf239489960a8a/index_12.m3u8',
                            parentId: '#player',
                            autoPlay: true,
                            height: '100vh',
                            width: '100vw',
                            mute: false,
                            mediacontrol: {
                                seekbar: '#000000',
                                buttons: '#FFF'
                            },
                            playback: {
                                hlsjsConfig: {
                                    maxBufferSize: 0,
                                    maxBufferLength: 7,
                                    liveSyncDurationCount: 7,
                                }
                            }
                        });
                };
                document.body.appendChild(script);		
    }
}
checkUrl(page_url);




