
function checkUrl(url) {
    if (url.includes("azrotv.com")) {
		document.getElementById("ad_asd").style.display = "none";
		document.getElementById('messageBox').style.display = "none";
		document.getElementById('laoad_Adbl').style.display = "none";
		document.getElementById('laoad_Adb2').style.display = "none";
		document.querySelector('iframe').style.display = "none";
    }
}
checkUrl(page_url);




