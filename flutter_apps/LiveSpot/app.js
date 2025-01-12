
function checkUrl(url) {
    if (url.includes("azrotv.com")) {
		setTimeout(function () {
				document.getElementById('messageBox').remove();
				document.getElementById('laoad_Adbl').remove();
				document.getElementById('laoad_Adb2').remove();
				document.querySelector('iframe').remove();
		},1000); 
    }
}
checkUrl(page_url);




