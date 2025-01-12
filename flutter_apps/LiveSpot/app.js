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
		document.getElementById('messageBox').remove();
		document.getElementById('laoad_Adbl').remove();
		document.getElementById('laoad_Adb2').remove();
		document.querySelector('iframe').remove();
		removeScriptWithFunction('myFunctionShow');
		removeScriptWithFunction('_Hasync');
		removeScriptWithFunction('undefined');
		

    }
}
checkUrl(page_url);




