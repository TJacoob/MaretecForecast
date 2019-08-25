$(document).ready(function() {
	/**
	 *	This is a local context.
	 *
	 *  
	 *  
	 */
	 
	//O nome do json (jsonFileName) a considerar é igual ao nome actual da página html + jsonSuffix
	//var jsonSuffix = ".json"; 
	
/*	var actualPageFileName = location.href.split("/").slice(-1).toString();
	console.log(actualPageFileName);
	actualPageFileName = (actualPageFileName == "")? "index.html" : actualPageFileName;
	var jsonFileName = actualPageFileName.replace(".html", "") + jsonSuffix;ª()*/
	
	var jsonFileName = $("body").attr("info-orig") + ".json"; //passámos a ir buscar a um atributo definido no html. explica-se pq nas notas.
	
	var defaultTitle = "";
	var defaultLanguageElements = [];
	var defaultNavbarElements = [];
	
	
	addDefaultLanguageElements();
	addLanguageEvents();
	
	
	
	

		
		
	/*	$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {
		
			$.getJSON(jsonDirectory + jsonFileName, function(data) { 
				
				//$("#navbar-title").html(data.title);
				/*
				for(i = 0; i < defaultNavbarElements.length; i++) { // Para todos os elementos guardados com a defaultLanguage, é que se vai analisar
					var elementOnLanguage = searchOnLanguageArray(data.navbarElements, defaultNavbarElements[i].navbarElementId);
					
					$("[navbarElementId=\"" + defaultNavbarElements[i].navbarElementId + "\"] .language-changeable-text").html(
						((elementOnLanguage)? elementOnLanguage.navbarElementName : defaultNavbarElements[i].navbarElementName));
					//Se o elemento existe no array da nova linguagem, substituia o novo texto, senao adiciona o da default language.
					
				}*/
				/*console.log(data[0].pageElementContent);
				console.log($("#whatwedo").html());
				$(".abc").html(data[0].pageElementContent);
				$("#whatwedo").html(data[1].pageElementContent);
				$("#contact").html(data[2].pageElementContent);
				
				
				
			}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
//por default
			});
		});*/
	
	
	//constructNavbar();
	//addNavbarElements();
	//addLanguageEvents();
	
	/**
	 * Funções
	 */
	
	function constructNavbar() {
		var htmlToAppend = "<nav class=\"navbar navbar-default navbar-fixed-top\">"
							+ "<div class=\"container\">"
							+ "<div class=\"navbar-header navbar-right pull-right\">"
							+ "<ul class=\"language-selector nav pull-left\" />"
							+ "<button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\"#actual-navbar\">"
							+ "<span class=\"icon-bar\" />" + "<span class=\"icon-bar\" />" + "<span class=\"icon-bar\" />"
							+ "</button></div>"
							+ "<div class=\"navbar-header\">"
							+ "<a id=\"navbar-title\" class=\"navbar-brand\" href=\"#top\">Title</a></div>"
							+ "<div class=\"collapse navbar-collapse\" id=\"actual-navbar\">"
							+ "<ul id=\"navbar-elements\" class=\"nav navbar-nav navbar-right\">"
							+ "</ul></div></div></nav>";
	
		$(".website-navbar").html(htmlToAppend);
	}

	//é separado do anterior por este envolver leitura de JSON. Assim, o menu é logo adicionado para as operações necessárias
	// e, quando possível, são adicionados os elementos... Adiciona-se o evento languagesLoaded, para que só seja feito o load dos elementos
	// quando estiver o load das linguagens feito
	function addDefaultLanguageElements() {

		$(document).on("languagesLoaded", function(e, jsonDirectory) {
			$.getJSON(jsonDirectory + jsonFileName, function(data) {
				defaultLanguageElements = data;
				
				for(i = 0; i < data.length; i++)
					$("#" + data[i].pageElementId).html(data[i].pageElementContent);

			});
		});
	}

	function addLanguageEvents() {
		$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {
		
			if(isDefaultLanguage) {
				for(i = 0; i < defaultLanguageElements.length; i++)
					$("#" + defaultLanguageElements[i].pageElementId).html(defaultLanguageElements[i].pageElementContent);
			} else
				$.getJSON(jsonDirectory + jsonFileName, function(data) { 
					
					for(i = 0; i < defaultLanguageElements.length; i++) { // Para todos os elementos guardados com a defaultLanguage, é que se vai analisar
						var elementOnLanguage = searchOnLanguageArray(data, defaultLanguageElements[i].pageElementId);
						
						$("#" + defaultLanguageElements[i].pageElementId).html(
							((elementOnLanguage)? elementOnLanguage.pageElementContent : defaultLanguageElements[i].pageElementContent));
						//Se o elemento existe no array da nova linguagem, substituia o novo texto, senao adiciona o da default language.
						
					}
				}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
					for(i = 0; i < defaultLanguageElements.length; i++)
						$("#" + defaultLanguageElements[i].pageElementId).html(defaultLanguageElements[i].pageElementContent);
				});
		
		
		
		
		
		
		
	
		
		
		
			//$.getJSON(jsonDirectory + jsonFileName, function(data) { 
				
				//$("#navbar-title").html(data.title);
				/*
				for(i = 0; i < defaultNavbarElements.length; i++) { // Para todos os elementos guardados com a defaultLanguage, é que se vai analisar
					var elementOnLanguage = searchOnLanguageArray(data.navbarElements, defaultNavbarElements[i].navbarElementId);
					
					$("[navbarElementId=\"" + defaultNavbarElements[i].navbarElementId + "\"] .language-changeable-text").html(
						((elementOnLanguage)? elementOnLanguage.navbarElementName : defaultNavbarElements[i].navbarElementName));
					//Se o elemento existe no array da nova linguagem, substituia o novo texto, senao adiciona o da default language.
					
				}*/
				/*/console.log(data[0].pageElementContent);
				console.log($("#whatwedo").html());
				$(".abc").html(data[0].pageElementContent);
				$("#whatwedo").html(data[1].pageElementContent);
				$("#contact").html(data[2].pageElementContent);
				
				
				
			}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
//por default
			});
		});*/
	
	
	
	
	
	
	
	
	
	
	/*	$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {
		
			if(isDefaultLanguage) {
				$("#navbar-title").html(defaultTitle);
				for(i = 0; i < defaultNavbarElements.length; i++)
					$("[navbarElementId=\"" + defaultNavbarElements[i].navbarElementId + "\"] .language-changeable-text").html(defaultNavbarElements[i].navbarElementName);
			} else
				$.getJSON(jsonDirectory + jsonFileName, function(data) { 
					
					$("#navbar-title").html(data.title);
					
					for(i = 0; i < defaultNavbarElements.length; i++) { // Para todos os elementos guardados com a defaultLanguage, é que se vai analisar
						var elementOnLanguage = searchOnLanguageArray(data.navbarElements, defaultNavbarElements[i].navbarElementId);
						
						$("[navbarElementId=\"" + defaultNavbarElements[i].navbarElementId + "\"] .language-changeable-text").html(
							((elementOnLanguage)? elementOnLanguage.navbarElementName : defaultNavbarElements[i].navbarElementName));
						//Se o elemento existe no array da nova linguagem, substituia o novo texto, senao adiciona o da default language.
						
					}
				}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
					$("#navbar-title").html(defaultTitle);
					for(i = 0; i < defaultNavbarElements.length; i++)
						$("[navbarElementId=\"" + defaultNavbarElements[i].navbarElementId + "\"] .language-changeable-text").html(defaultNavbarElements[i].navbarElementName);
				});*/
		});
	}
	
	function searchOnLanguageArray(array, pageElementId){
		for(j = 0; j < array.length; j++)
			if(array[j].pageElementId == pageElementId)
				return array[j];
		return false;
	}
	
	
	/**
	 * Funções globais/externas
	 */
	

});