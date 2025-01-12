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
		document.getElementById('messageBox').remove();
		document.querySelector('iframe').remove();

    }
}
checkUrl(page_url);




