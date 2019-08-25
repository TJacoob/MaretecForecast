	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
	
	function setParameterByName(name, val, url) {
		//var actualUrl = false;
		
		if (!url) {
			url = window.location.href;
			//actualUrl = true;
		}
		
		var newAdditionalURL = "";
		var tempArray = url.split("?");
		var baseURL = tempArray[0];
		var additionalURL = tempArray[1];
		var temp = "";
		if (additionalURL) {
			tempArray = additionalURL.split("&");
			for (var i=0; i<tempArray.length; i++){
				if(tempArray[i].split('=')[0] != name){
					newAdditionalURL += temp + tempArray[i];
					temp = "&";
				}
			}
		}


		
		var rows_txt = temp + "" + name + "=" + val;
		
		//if(actualUrl) {
			window.history.replaceState(null, null, baseURL + "?" + newAdditionalURL + rows_txt);
			console.log("substitui");
		//}//window.history.pushState(null, null, baseURL + "?" + newAdditionalURL + rows_txt);
		
		
		//window.history.replaceState(null, null, "maps.html?"+name+"="+val);
		
		
		return baseURL + "?" + newAdditionalURL + rows_txt;
		
		
		
		
		
	}