$(document).ready(function() {
	/**
	 *	This is a local context.
	 *https://stackoverflow.com/questions/50412563/prevent-dropdown-list-in-collapsed-bootstrap4-navbar-from-expanding-the-navbar
	 relata mesmo  o problema que tive ao transitar para BS4
	 *  
	 * https://stackoverflow.com/questions/43439250/bootstrap-4-stop-collapse-from-pushing-content-down 
	 */
	 
	//O nome do json (jsonFileName) a considerar é igual ao nome actual da página html + jsonSuffix
	//var jsonSuffix = ".json"; 
	
	/* https://stackoverflow.com/questions/51852374/bootstrap-4-navbar-right-align-with-button-that-doesnt-collapse-on-mobile 
	https://www.codeply.com/go/TWZGiy3VGw <dicas para modificaçoes na navbar em BS4 */
	
	
/*	var actualPageFileName = location.href.split("/").slice(-1).toString();
	console.log(actualPageFileName);
	actualPageFileName = (actualPageFileName == "")? "index.html" : actualPageFileName;
	var jsonFileName = actualPageFileName.replace(".html", "") + jsonSuffix;ª()*/
	
	var jsonFileName = $(".website-navbar").attr("info-orig") + ".json"; //passámos a ir buscar a um atributo definido no html. explica-se pq nas notas.
	
	var defaultTitle = "";
	var defaultNavbarElements = [];
	var addedElementsToTitle = "";
	
	constructNavbar();
	addNavbarElements();
	addLanguageEvents();
	
	/**
	 * Funções
	 */
	
		
	function constructNavbar() {
		//console.log("ss");
		/* ----- old... BS3
		var htmlToAppend = "<nav class=\"navbar navbar-default navbar-fixed-top\">"
							+ "<div class=\"container\">"
							+ "<div class=\"navbar-header navbar-right pull-right\">"
							+ "<ul class=\"language-selector nav pull-left\"></ul>"
							+ "<button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\"#actual-navbar\">"
							+ "<span class=\"icon-bar\" />" + "<span class=\"icon-bar\" />" + "<span class=\"icon-bar\" />"
							+ "</button></div>"
							+ "<div class=\"navbar-header\">"
							+ "<a id=\"navbar-title\" class=\"navbar-brand\" href=\"#\">Title</a></div>"
							+ "<div class=\"collapse navbar-collapse\" id=\"actual-navbar\">"
							+ "<ul id=\"navbar-elements\" class=\"nav navbar-nav navbar-right\">"
							+ "</ul></div></div></nav>";
							
							*/
		/*	var htmlToAppend = "<nav class=\"navbar navbar-light navbar-expand-lg bg-light\">"
							+ "<a id=\"navbar-title\" class=\"navbar-brand\" href=\"#\">Title</a>"
							+ "<ul class=\"language-selector nav navbar-nav ml-auto mr-1\"></ul>"
							+ "<button class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapsibleNavbar\">"
							+ "<span class=\"navbar-toggler-icon\"></span></button>"
							+ "<div class=\"collapse navbar-collapse flex-grow-0\" id=\"collapsibleNavbar\">"
							+ "<ul id=\"navbar-elements\" class=\"nav navbar-nav text-right\">"
							+ "</ul></div>"
							+ "</nav>";*/

			var htmlToAppend = "<nav class=\"navbar navbar-light navbar-expand-lg bg-light\">"
							+ "<div id=\"navbar-title\" class=\"navbar-brand\"></div>"
							+ "<div class=\"d-flex flex-row order-2 order-lg-3\">"
							+ "<ul class=\"language-selector navbar-nav flex-row\"></ul>"
							+ "<button class=\"navbar-toggler navbar-button\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapsibleNavbar\">"
							+ "<span class=\"navbar-toggler-icon\"></span></button></div>"
							+ "<div class=\"collapse navbar-collapse order-3 order-lg-2\" id=\"collapsibleNavbar\">"
							+ "<ul id=\"navbar-elements\" class=\"nav navbar-nav ml-auto\">"
							+ "</ul>"
							+ "</div>"
							+ "</nav>";
							
							
		$(".website-navbar").html(htmlToAppend);
		$(".website-navbar").addClass("fixed-top");
		console.log($(".website-navbar").height());
		$("body").css("paddingTop", $(".website-navbar").height());
		$(document).trigger("readyNavbar");
	}
	
	function removeAddedElements() {
		defaultTitle.replace(addedElementsToTitle, "..");
		$("#navbar-title").html(defaultTitle);
		addedElementsToTitle = "";
	}
	
	window.addElementToTitle = function(elementT) {
		$("#navbar-title").append("<span> > </span>" + "<span>" + elementT + "</span>");
		addedElementsToTitle += elementT
	}

	//é separado do anterior por este envolver leitura de JSON. Assim, o menu é logo adicionado para as operações necessárias
	// e, quando possível, são adicionados os elementos... Adiciona-se o evento languagesLoaded, para que só seja feito o load dos elementos
	// quando estiver o load das linguagens feito
	function addNavbarElements() {

		
		//$(document).on("languagesLoaded", function(e, jsonDirectory) {
			$.ajax({url: getDefaultLocalLanguageDirectory() + jsonFileName, async: false, dataType: 'json', success: function(data) {		
		//	$.getJSON(getDefaultLanguageDirectory() + jsonFileName, function(data) { //se passa nuns sitios, tem de passar nos outros, pq é difcil nao passar sem influenciar
				defaultTitle = addLastInfoToShow(data, 0);

				
				
			//	defaultNavbarElements = data.navbarElements;

				
				// defaultNavbarElements vai passar apenas a conter um vector com elementos do tipo [navbarElementId, navbarElementName]
				// em que navbarElementName, é o nome do elemento no caso default. Em vez de ser = data.navbarElements.
				// Isto porque, agora, com os varios niveis de menu (agora ha dropdown), isto deixa de resultar. Assim, temos uma coisa do tipo chave, valor.
				// Também vamos mudar a forma como os elementos noutras linguagens vao ser buscados, o que implica mudar o json para algo do tipo "chave" : "valor"
				// Em que a chave é o id e o valor é o nome na nova linguagem. Isto simplica face ao que temos agora, pois tínhamos que ir procurar no array
				// uma vez que tinha a mesma estutura que o json da linguagem default. Assim, é só usar a chave no vector. Ex: data[navbarElementId].
				// Deixamos de precisar de search on Array.
				
				if(data.navbarElements.length == 0)
					$(".navbar-toggler").remove();
				
				for(i = 0; i < data.navbarElements.length; i++) {
					defaultNavbarElements.push([data.navbarElements[i].navbarElementId, data.navbarElements[i].navbarElementName]);
					// Se há subelementos para dropdown, vai adicioná-los ao mesmo nível que os outros no vector de defaultNavbarElements, pois tb é assim que vão
					// estar no json das outras linguagens
					if(data.navbarElements[i].navbarElements) {
						for(j = 0; j < data.navbarElements[i].navbarElements.length ; j++)
							defaultNavbarElements.push([data.navbarElements[i].navbarElements[j].navbarElementId, data.navbarElements[i].navbarElements[j].navbarElementName])
					}
				}
				
				
				$("#navbar-title").html(defaultTitle);
				
				//Se este atributo existir no json, vai atribuir um url ao href do navbar brand
				if(data.titleLink)
					$("#navbar-title").attr("href", data.titleLink);
				
				var htmlToAppend = "";
				
				//Aqui é onde se adicionam os diferentes elementos de navbar. portanto aqui agora vamos ter que introduzir a distinção entre dropdown e normal.
				for(i = 0; i < data.navbarElements.length; i++) {
					
					//se esta condição se verifica, se existe o atributo navbarElements, significa que tem subelementos, logo é dropdown
					if(data.navbarElements[i].navbarElements) {
							htmlToAppend += "<li class=\"nav-item dropdown\" navbarElementId=\"" + data.navbarElements[i].navbarElementId + "\">"
											+ "<a class=\"dropdown-toggle nav-link language-changeable-text\" role=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\" href=\"#\"" + "id=\"navbarDropdown-" + data.navbarElements[i].navbarElementId + "\">"
											+ data.navbarElements[i].navbarElementName
											+ "<div class=\"dropdown-menu dropdown-menu-right\" aria-labelledby=\"navbarDropdown-" + data.navbarElements[i].navbarElementId +"\">";
										//	+ "<ul class=\"dropdown-menu\">";
											
						/*	for(j = 0; j < data.navbarElements[i].navbarElements.length ; j++)
								htmlToAppend += "<li class=\"dropdown-item activable\" navbarElementId=\"" + data.navbarElements[i].navbarElements[j].navbarElementId + "\" name=\"navbar-item\">"
												+ "<a class=\"language-changeable-text\" href=\"" + data.navbarElements[i].navbarElements[j].navbarElementLink + "\">"
												+ data.navbarElements[i].navbarElements[j].navbarElementName
												+ "</a></li>";		*/						
											
							for(j = 0; j < data.navbarElements[i].navbarElements.length ; j++)
								htmlToAppend += "<a class=\"dropdown-item activable\" navbarElementId=\"" + data.navbarElements[i].navbarElements[j].navbarElementId + "\" href=\"" + data.navbarElements[i].navbarElements[j].navbarElementLink + "\" name=\"navbar-item\"><span class=\"language-changeable-text\">" + data.navbarElements[i].navbarElements[j].navbarElementName + "</span></a>";//>"
												/*	"<li class=\"dropdown-item activable\" navbarElementId=\"" + data.navbarElements[i].navbarElements[j].navbarElementId + "\" name=\"navbar-item\">"
												+ "<a class=\"language-changeable-text\" href=\"" + data.navbarElements[i].navbarElements[j].navbarElementLink + "\">"
												+ data.navbarElements[i].navbarElements[j].navbarElementName
												+ "</a></li>";		*/
											
							htmlToAppend += "</div></li>";
						
					} else { //é elemento normal
							htmlToAppend += "<li class=\"activable nav-item\" navbarElementId=\"" + data.navbarElements[i].navbarElementId + "\" name=\"navbar-item\">"
											+ "<a class=\"language-changeable-text nav-link\" href=\"" + data.navbarElements[i].navbarElementLink + "\">"
											+ data.navbarElements[i].navbarElementName
											+ "</a></li>";
											
	
					}
				}
				$("#navbar-elements").html(htmlToAppend);
				
				//Quando se clica num link, vai esconder o menu, para não ficar aberto
				$(".navbar-collapse ul li:not(.dropdown) a").click(function() { // * MUDOU-SE PARA SER QUANDO SE CLICA EM ALGO, ASSIM, QUANDO SE CLICA NO EXTERIOR TAMBÉM FECHA. Gera erro.. a analisar
					$(".navbar-collapse").collapse("hide");
				});
				
			}});
		//});
	}
	
	function addLastInfoToShowOtherLang(dataLastInfoToShow, order) {

		if (order > $("#navbar-title").children().attr("element-order"))
			return;
		
		if(dataLastInfoToShow.imageTitle) {
			$("[element-order=" + order + "]").attr("src", topPathnamePrefix + dataLastInfoToShow.imageTitle);
			$("[element-order=" + order + "]").attr("alt", dataLastInfoToShow.title);
		} else
			$("[element-order=" + order + "]").html(dataLastInfoToShow.title);

		return addLastInfoToShowOtherLang(dataLastInfoToShow.lastInfoToShow, order+1);
	}
	
	
	function addLastInfoToShow(dataLastInfoToShow, order) { // O ultimo argumento é opcional. Caso seja colocado, é para outras linguagens
		var toAppend;
		
		if(dataLastInfoToShow.imageTitle)
			toAppend = "<img element-order=\"" + order + "\" style=\"display:inline;\" src=\"" + topPathnamePrefix + dataLastInfoToShow.imageTitle + "\" alt=\"" + dataLastInfoToShow.title + "\">";
		else
			toAppend = "<span element-order=\"" + order + "\">" + dataLastInfoToShow.title + "</span>";
		
		if(dataLastInfoToShow.titleLink)
			toAppend = "<a element-order=\"" + order + "\" href=\"" + dataLastInfoToShow.titleLink + "\">" + toAppend + "</a>";
		console.log(toAppend);
		
		return ((dataLastInfoToShow.lastInfoToShow)? addLastInfoToShow(dataLastInfoToShow.lastInfoToShow, order+1) + "<span> > </span>" : "") + toAppend;
	}


	function addLanguageEvents() {
		$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {
			removeAddedElements();
			console.log("acontece5");
			if(isDefaultLanguage) {
				$("#navbar-title").html(defaultTitle);
				for(i = 0; i < defaultNavbarElements.length; i++) {
					console.log("i: "+i+"element: "+defaultNavbarElements[i][0]);
					$("[navbarElementId=\"" + defaultNavbarElements[i][0] + "\"] .language-changeable-text").html(defaultNavbarElements[i][1]);
				}
			} else {
				console.log(getActualLocalLanguageDirectory() + jsonFileName);
				$.ajax({url: getActualLocalLanguageDirectory() + jsonFileName, async: false, dataType: 'json', success: function(data) {	
				//$.getJSON(jsonDirectory + jsonFileName, function(data) { 
					addLastInfoToShowOtherLang(data, 0);
		
					//vai a gora procurar no novo defaultNavbarElements, ja com par "chave (id), elemento na linguagem"
					for(i = 0; i < defaultNavbarElements.length; i++) {
						// ir buscar o nome do Elemento na nova linguagem.
						
						console.log("i: "+i+"element: "+defaultNavbarElements[i][0]+"new wlwmwnte: " + data.navbarElements[defaultNavbarElements[i][0]]);
						var newElementName = data.navbarElements[defaultNavbarElements[i][0]];
						
						// Se esse elemento existir, substitui. Senão, mete o elemento da default.
						$("[navbarElementId=\"" + defaultNavbarElements[i][0] + "\"] .language-changeable-text").html(
							((newElementName)? newElementName : defaultNavbarElements[i][1]));
							
					}
				},
				error: function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default.. a ver...
					$("#navbar-title").html(defaultTitle);
					for(i = 0; i < defaultNavbarElements.length; i++)
						$("[navbarElementId=\"" + defaultNavbarElements[i][0] + "\"] .language-changeable-text").html(defaultNavbarElements[i][1]);
				}});
			}
		});
	}
	

	
	
	/**
	 * Funções globais/externas
	 */
	

});