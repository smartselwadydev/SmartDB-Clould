function removeElementsExceptClass(className) {
    const bodyChildren = document.body.children;
    const bodyChildrenArray = Array.from(bodyChildren);
    bodyChildrenArray.forEach(child => {
        if (!child.classList.contains(className)) {
            child.remove();
        }
    });
}
function removeScriptWithFunction(functionName) {
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].innerHTML.includes(functionName)) {
                scripts[i].parentNode.removeChild(scripts[i]);
            }
        }
}
	
function checkUrl(url) {
    if (url.includes("azrotv.com")) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js'; 
		document.getElementsByTagName('body')[0].appendChild(script);
		
		document.getElementById('messageBox').remove();
		document.getElementById('laoad_Adbl').remove();
		document.getElementById('laoad_Adb2').remove();
		document.querySelector('iframe').remove();
		removeScriptWithFunction('myFunctionShow');
		removeScriptWithFunction('_Hasync');
		removeScriptWithFunction('undefined');
		$('.message-box').remove()
		

    }
}
checkUrl(page_url);




