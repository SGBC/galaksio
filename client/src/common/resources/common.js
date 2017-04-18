function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}
Date.logFormat = function () {
    var date = new Date();
    return date.toUTCString() + " > ";
};
Object.values = function (o) {
    return Object.keys(o).map(function (k) {
        return o[k];
    });
};

function getPathname(){
	var pathname = window.location.pathname.split("/");
	if(pathname.length > 1 && pathname[1] !== "" && pathname[1].indexOf(".html") === -1){
			pathname = pathname[1] + "/";
	}else{
			pathname = "";
	}
	return pathname;
}
