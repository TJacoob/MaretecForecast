function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
            /* Remove the attribute, and call this function once more: */
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
        }
    } 
    xhttp.open("GET", file, true);
    xhttp.send();
    /* Exit the function: */
      return;
    }
  }
}
        
window.loadModal = function loadModal( modalName, jsonName) {
    console.log( "Loading: " + modalName, jsonName);
    translateToSelectedLanguage( jsonName);
    $( "#" + modalName).modal( "show");
    $( "#" + modalName).modal( {backdrop: 'static', keyboard: false});
}

function loadInstructions() {
    var pageFilename = location.pathname;
    if ( pageFilename.indexOf( "mapResultDisplay") != -1 ) {
        document.getElementById( "mapsAndStationsHelp").style.display = "none";
        document.getElementById( "stationsOnlyHelp").style.display = "none";
        document.getElementById( "domainMapHelp").style.display = "block";
     }
    else {
        document.getElementById( "mapsAndStationsHelp").style.display = "block";
        document.getElementById( "domainMapHelp").style.display = "none;"
        var show = "";
        var parameter = getParameterByName( "section");
        if ( parameter == null )
            show = pageFilename.indexOf ( "stations") != -1 ? "block": "none";
        else
            show = parameter.indexOf( "charts") != -1 ? "block": "none";
        document.getElementById( "stationsOnlyHelp").style.display = show;
    }
    loadModal( "infoDialogModal", "instructions");
}

function loadCookieSettings( modalToClose) {
    if ( modalToClose != null )
        $( "#" + modalToClose).modal( "hide");
    loadModal('cookieSelectionModal','cookieWarningItens'); document.getElementById('analyticsCookie').checked=readCookie('analytics')!=null;
}

function eraseLangCookie() {
    eraseCookie( "lang");
    console.log( "Depois de apagar ... ", readCookie( "lang"));
}