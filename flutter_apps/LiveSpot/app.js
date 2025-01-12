
function checkUrl(url) {
    if (url.includes("azrotv.com")) {
		document.getElementById("ad_asd").style.display = "none";
		alert(0)
		setTimeout(function () {
				document.getElementById('messageBox').remove();
				document.getElementById('laoad_Adbl').remove();
				document.getElementById('laoad_Adb2').remove();
				document.querySelector('iframe').remove();
		},1000); 
    }
}
checkUrl(page_url);




