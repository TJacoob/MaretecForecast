//$(document).ready(function() {
	/**
	 *	This is a local context.
	 *
	 *  
	 *  
	 */
    
    var topPathname = "/forecastNeu/";        // CAREFUL: change to suit to your actual installation
    
	var noTopPathnameSlashes = (topPathname.match( new RegExp( "/", "g")) || []).length;
    var topPathnamePrefix = "";                     // pathname prefix enabling use from any directory
	var isFirstPage = (window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1) == "") ||
					  (window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1) == "index.html");
	var cookieAllowed = false;
	var localJSONDirectory = "";
	var globalJSONDirectory = "";
    var browserLanguageCode = (navigator.language || navigator.userLanguage).slice( 0,2);
	var defaultLanguage = {}; //onde se vai bucar a informação do JSON basica. a unica que contém toda a informação
	var otherAvailableLanguages = [];
	var actualLanguage = {}; // a apresentar a bandeira no menu e dizer que e a actual e ir buscar informação de linguagem
	// depois vai ser necessario verificar se e diferente da default
	
	buildRelativePathPrefix();
	constructAndAddHtmlLanguageSelectorComponent();
	
	
	/**
	 * Funções
	 */
    
    // create the relative path prefix so that languages may be used from any directory 
    
    function buildRelativePathPrefix() {
        noTopPathnameSlashes = (topPathname.match( new RegExp( "/", "g")) || []).length;
        var pathname = document.location.pathname;
        var count = (pathname.match( new RegExp( "/", "g")) || []).length - noTopPathnameSlashes;
        topPathnamePrefix = (new String( "../")).repeat(count);
    }
    
	
	function constructAndAddHtmlLanguageSelectorComponent() {
		$.ajax({url: topPathnamePrefix + "ajax/languages.json",
                async: false, dataType: 'json', success: function(data) {
		//$.getJSON("ajax/languages.json", function(data) {
			var htmlToAppend = "";
			console.log("Construct ... ", readCookie( "lang"));
            // make sure that globalJSONDirectory points to the correct directory
			localJSONDirectory = data.globalJSONDirectory;
			globalJSONDirectory = topPathnamePrefix + data.globalJSONDirectory;
 			defaultLanguage = data.defaultLanguage;
			otherAvailableLanguages = data.otherAvailableLanguages;
 			actualLanguage = defaultLanguage; //a ver!! isto não vai ser sempre assim... construir é sempre com default
 			console.log(data);
			console.log(defaultLanguage);//<div id=\"map-tile-layers\">"
			htmlToAppend += ""
					+ "<li class=\"nav-item dropdown\">"
					+ "<button type=\"button\" class=\"dropdown-toggle no-dropdown-arrow btn-language-selection navbar-button\" data-toggle=\"dropdown\">"
					+ "<span class=\"actual-language-shower lang-sm\" lang=\"" + actualLanguage.langId + "\"></span>"
					+ "</button>"
					+ "<div class=\"dropdown-menu dropdown-menu-right dropdown-menu-form language-list\" role=\"menu\">";
					
			//default language		
			htmlToAppend += "<a href=\"#\" class=\"activable dropdown-item\" name=\"languages\" langId=\""
							+ defaultLanguage.langId + "\"><span class=\"lang-sm lang-lbl\" lang=\""
							+ defaultLanguage.langId + "\"></span></a>";
			
			
			


			
			
			
			
		/*	htmlToAppend += "<div class=\"btn-group\">"
							+ "<button type=\"button\" class=\"dropdown-toggle btn-language-selection\" data-toggle=\"dropdown\">"
							+ "<span class=\"actual-language-shower lang-sm\" lang=\"" + actualLanguage.langId + "\"></span>"
							+ "<b class=\"caret\"></b></a>"
							+ "</button>"
							+ "<ul class=\"dropdown-menu dropdown-menu-right language-list\" role=\"menu\">"
							+ "<li class=\"activable\" name=\"languages\" langId=\""
							+ defaultLanguage.langId + "\"><a href=\"#\"><span class=\"lang-sm lang-lbl\" lang=\""
							+ defaultLanguage.langId + "\"></span></a></li>"; //BS3 version*/

			console.log("lang2");				
			for(i = 0; i < otherAvailableLanguages.length; i++)
					htmlToAppend += "<a href=\"#\" class=\"activable dropdown-item\" name=\"languages\" langId=\""
					+ otherAvailableLanguages[i].langId + "\"><span class=\"lang-sm lang-lbl\" lang=\""
					+ otherAvailableLanguages[i].langId + "\"></span></a>";
			
			
				/* htmlToAppend += "<li class=\"activable\" name=\"languages\" langId=\""
								+ otherAvailableLanguages[i].langId + "\"><a href=\"#\"><span class=\"lang-sm lang-lbl\" lang=\""
								+ otherAvailableLanguages[i].langId + "\"></span></a></li>"; //BS3 version*/

			
			htmlToAppend += "</div>"
							+ "</li>";
							
			$(document).on("readyNavbar", function() {				
				$(".language-selector").append(htmlToAppend);
				$(".language-selector a[langId=\"" + actualLanguage.langId + "\"]").addClass("active");
				$(document).trigger("languagesLoaded", [globalJSONDirectory + defaultLanguage.JSONDirectory]);
				addEventToLanguageList();
			});
			
		}});		
	}

	function addEventToLanguageList() {
		addEventToEachLanguageElement(actualLanguage);
		for (i = 0; i < otherAvailableLanguages.length; i++)
			addEventToEachLanguageElement(otherAvailableLanguages[i]);
	
	}
	
	function addEventToEachLanguageElement(language) {
		$(".language-selector a[langId=\"" + language.langId + "\"]").click(function (e) {
		e.preventDefault(); //Para não acrecentar no estado actual (link) coisas à parva, '#' e para ele fazer replace State bem
		if(language.langId == actualLanguage.langId) // Se clicou na linguagem actual, não faz nada, devolve e não faz mais nada, senão segue
				return;
			
			$(".actual-language-shower").attr("lang", language.langId);
			//Ao utilizarmos cookie, deixa de ser necessário recorrermos a um parâmetro.
			//setParameterByName("lang", language.langId);
			if(cookieAllowed)
				createCookie("lang",language.langId,365*20);
			actualLanguage = language;
			console.log("LANG FAZ");
			console.log(language.langId);
			console.log(globalJSONDirectory + language.JSONDirectory);
			console.log((language.langId == defaultLanguage.langId));
			$(document).trigger("languageChange", [language.langId,
													globalJSONDirectory + language.JSONDirectory,
													(language.langId == defaultLanguage.langId)]);
			
			//$("a[href]").attr('href');
			//$("a[href]").attr('href', setParameterByName("lang", language.langId, $("a[href]").attr('href')));
			

			
			// AdicionarHandler a este evento 
			//$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {
			
		});
	}
    
   
    window.translateToSelectedLanguage = function translateToSelectedLanguage( filename) {
 		var langText;
        console.log( "path: " + getActualLanguageDirectory() + filename + ".json");
 		$.ajax({url: getActualLanguageDirectory() + filename + ".json", async: false, dataType: 'json', success: function(jsondata) {		
			langText = jsondata;
		}});
	
		for (var key in langText)
			$('[lang-id="' + key + '"]').html(langText[key]);
		
   }
    
     	
	/**
	 * Funções globais/externas
	 */
	window.setInitialLanguage = function setInitialLanguage() {
		
		//$(window).on('load', function() {	
        var lang = readCookie("lang");
        var needsWarning = !lang;
        console.log( "Set initial ... ", needsWarning, lang);
//             loadModal( "cookieWarningModal", "cookieWarningItens");
//        $("#cookieWarningModal").modal( "show");
//        $("#cookieWarningModal").modal( {backdrop: 'static', keyboard: false});
//        translateToSelectedLanguage( "cookieWarningItens");

       
        if ( !lang ) {
            lang = defaultLanguage.langId;
            for( var i=0; i<otherAvailableLanguages.length; i++) {
                if ( otherAvailableLanguages[i].langId == browserLanguageCode ) {
                    console.log ( otherAvailableLanguages[i].langId, browserLanguageCode);
                    lang = otherAvailableLanguages[i].langId;
                    createCookie( "lang", lang, 7);
                    break;
                }
            }
         }
 			
        cookieAllowed = true; // assegurar que sabemos que é allowed, se ele já lá está. pois isto nao passa de uma pag para a outra
        
				
        for(i = 0; i < otherAvailableLanguages.length; i++) {				
            if(otherAvailableLanguages[i].langId == lang) {
				$(".language-selector a[langId=\"" + lang + "\"]").click();
				$("[name=\"languages\"]").removeClass("active");
				$(".language-selector a[langId=\"" + lang + "\"]").addClass("active");				
				break;
            }
        }

         if ( needsWarning ) 
            loadModal( "cookieSelectionModal", "cookieWarningItens");
 	}
	
	window.getDefaultLanguageDirectory = function () {
		return globalJSONDirectory + defaultLanguage.JSONDirectory;
	}
    
    window.getActualLanguageDirectory = function () {
        return globalJSONDirectory + actualLanguage.JSONDirectory;
    }
	
	window.getDefaultLocalLanguageDirectory = function () {
		return localJSONDirectory + defaultLanguage.JSONDirectory;
	}
    
    window.getActualLocalLanguageDirectory = function () {
        return localJSONDirectory + actualLanguage.JSONDirectory;
    }
	
	
	window.isDefaultLanguage = function () {
		return actualLanguage.langId == defaultLanguage.langId;
	}
	
	window.getDefaultLanguage = function () {
		return defaultLanguage.langId;
	}
    
    window.getActualLanguage = function() {
        return actualLanguage;
    }
    
//    function selectLanguageFromBrowser() {
//        var language = (navigator.language || navigator.userLanguage).slice( 0,2);
//        console.log( language);
//        return language;
//    }
    
    // testing
    
    window.resultTesting = function resultTesting() {
        console.log( "Aqui É o langua-selection!");
    }

    
//});
