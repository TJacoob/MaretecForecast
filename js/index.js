$(document).ready(function() {

	 /////////TEMOS DE TIRAR OS AJAX STOP TODOS
	//O nome do json (jsonFileName) a considerar � igual ao nome actual da p�gina html + jsonSuffix
	//var jsonSuffix = ".json"; 
	
	var jsonFileName = $("body").attr("info-orig") + ".json"; //pass�mos a ir buscar a um atributo definido no html. explica-se pq nas notas.
	
	var defaultTitle = "";
	var defaultLanguageElements = [];
	var defaultNavbarElements = [];
	
	addSmoothScrolling();
	addDefaultLanguageElements();
	addLanguageEvents();
		
	
	
	/**
	 * Fun��es
	 */
	

	function addSmoothScrolling() {
		$(document).ajaxStop(function() {
			$("a:not(.not-smooth-scrolling)").click(function() {
				var hash = this.hash;				
				if(hash)
					if(hash.length > 0) {
						var hashOffset = $(hash).offset().top;
						var navBarActualHeight = parseInt($(".website-navbar > nav .navbar-header").css("height"));
						event.preventDefault();
						$("html, body").animate({
							scrollTop: ((hashOffset < navBarActualHeight)? hashOffset : (hashOffset - navBarActualHeight))
						}, 2000, "easeInOutExpo");
					}
			});
		});
	}

	//� separado do anterior por este envolver leitura de JSON. Assim, o menu � logo adicionado para as opera��es necess�rias
	// e, quando poss�vel, s�o adicionados os elementos... Adiciona-se o evento languagesLoaded, para que s� seja feito o load dos elementos
	// quando estiver o load das linguagens feito
	function addDefaultLanguageElements() {
		//$(document).on("languagesLoaded", function(e, jsonDirectory) {
			$.getJSON(getDefaultLanguageDirectory() + jsonFileName, function(data) {
				defaultLanguageElements = data;
				for(i = 0; i < data.length; i++)
					$("#" + data[i].pageElementId).html(data[i].pageElementContent);

				setInitialLanguage();
			}).always(function() {
			//	setInitialLanguage();
			});
		//});
	}

	function addLanguageEvents() {
		$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {
			if(isDefaultLanguage) {
				for(i = 0; i < defaultLanguageElements.length; i++)
					$("#" + defaultLanguageElements[i].pageElementId).html(defaultLanguageElements[i].pageElementContent);
			} else
				$.getJSON(jsonDirectory + jsonFileName, function(data) { 
					
					for(i = 0; i < defaultLanguageElements.length; i++) { // Para todos os elementos guardados com a defaultLanguage, � que se vai analisar
						var elementOnLanguage = data[defaultLanguageElements[i].pageElementId];
						$("#" + defaultLanguageElements[i].pageElementId).html(
							((elementOnLanguage)? elementOnLanguage : defaultLanguageElements[i].pageElementContent));
						// Se o elemento existe no array da nova linguagem, substituia o novo texto, senao adiciona o da default language.
						// � para isso que esta � mantida em mem�ria
					}
				}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
					for(i = 0; i < defaultLanguageElements.length; i++)
						$("#" + defaultLanguageElements[i].pageElementId).html(defaultLanguageElements[i].pageElementContent);					
				});
		});
	}
});