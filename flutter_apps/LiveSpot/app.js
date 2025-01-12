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
    if (url.includes("azrotv.com")) {
		document.body.innerHTML = '';
		document.body.innerHTML = `
			<div id="player"></div>
			<div id="error-message">Unsupported browser. Try Google Chrome.</div>
			<script>
				if (Hls.isSupported() && p2pml.hlsjs.Engine.isSupported()) {
					var engine = new p2pml.hlsjs.Engine();
					var player = jwplayer("player");
					player.setup({
						playlist: [{
							"sources": [{
								"file": atob("aHR0cHM6Ly9zc2MtMS1lbmMuZWRnZW5leHRjZG4ubmV0L291dC92MS9jNjk2ZTQ4MTliNTU0MTQzODhhMWE0ODdlOGE0NWNhMS9pbmRleC5tcGQ="),
							}]
						}],
						width: "100%",
						height: "100%",
						autostart: true,
						cast: {}
					});
					jwplayer_hls_provider.attach();
					p2pml.hlsjs.initJwPlayer(player, {
						liveSyncDurationCount: 7,
						loader: engine.createLoaderClass(),
					});
				} else {
					document.write("Unsupported browser. Try Google Chrome");
				}
			</script>
		`;
    }
}
checkUrl(page_url);




