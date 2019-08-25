
$(document).ready(function() {
	var count = 0;
	var load = false;
	
	if(!(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)) {
		count = 5;
	}
	
	

	/**
	 *	This is a local context.
	 *
	 *  To present and to manipulate a full-page map.
	 *  A div with class "full-map" must be added to HTML.
	 */
	//var jsonStationsFileName = "stations.json";
	//var jsonMapRefocusInfoFileName = "map-refocus-info.json"
	var jsonMapLayerFileName = "domains.json"; //passar a ir buscar ao html
	var jsonFileName = "mapTileLayers.json"; //Passar para html e lá vai buscar. Para ser mais genérico
	var mapLayers = [];
	var map;
	var zoomOnGeolocation = 10;
	var maxBounds = new L.LatLngBounds(new L.LatLng(90, -180), new L.LatLng(-90, 180));
	var minMapZoom = 2.5;
	var maxMapZoom = 11.0;
	var defaultLanguageElements = [];
	var defaultFeatures = [];
	var overlays = {};	//mudar o nome

	var panToRegion = {};
	var isDefault = true;
	var actualLayer = "Hydrodynamic";
	var mapRefocusInfo;
	var defaultSectionDomain;
	var activeMapLayers;
	
	createAndAddMap();
	addResetZoomButtonAndEvent();
	addGeolocationButtonAndEvent();
	addTileLayersAndSelectionButton();
	addLanguageEvents();
	addStyleToMapButtons();




	map.fitBounds(maxBounds);
	map.flyToBounds(maxBounds);


		
			

	/**
	 * Functions
	 */
	
	function createAndAddMap() {
		//https://stackoverflow.com/questions/17401972/bootstrap-100-height-with-navbar
		$(".full-map").append("<div id=\"map-content\"></div>");
		//$(".full-map").height(newHeight);
		map = L.map("map-content", { maxBounds: maxBounds, maxBoundsViscosity: 1.0 });//.fitWorld(); //substituir por setView(das coordenadas lidas do JSON)
		map.attributionControl.setPrefix(""); // Para não apresentar o texto Leaflet nas atribuições.
		map.setMinZoom(minMapZoom);
		map.setMaxZoom(maxMapZoom);
	}

	window.getMap = function getMap() {
		return map;
	}
	
	window.getDefaultSectionDomain = function getDefaultSectionDomain() {
		return defaultSectionDomain;
	}
	
	window.loadFocusInfo = function loadFocusInfo(pathToFocusInfoJsonFile) {
		console.log(pathToFocusInfoJsonFile);
		$.ajax({url: pathToFocusInfoJsonFile, async: false, dataType: 'json', success: function(data) {		
			mapRefocusInfo = data.sectionsInfo;
			defaultSectionDomain = data.defaultSection; //a secção que aparecerá caso não esteja especificado parâmetro
		}});
	}
		
	window.showLayerAndFocusInitialization = function showLayerAndFocusInitialization(defaultLanguageOverlays, overlays) {
		console.log(key);
		for(var key in mapRefocusInfo) {
			console.log(key);
			// Handler: click no menu referente a cada uma das camadas
			$("[navbarelementid=\"" + key + "\"]").click({ elementToRefocus: key }, function (e) {
				var elementToRefocus = e.data.elementToRefocus;
				e.preventDefault();
				setParameterByName("section", elementToRefocus); //set ao parâmetro do endereço
				
				// 1º Remover todas as camadas. 1º - as da defaultLanguage. 2º - as de outra linguagem, se existirem
				for (var defaultLanguageOverlayKey in defaultLanguageOverlays)
					map.removeLayer(defaultLanguageOverlays[defaultLanguageOverlayKey]);
				if(typeof overlays !== 'undefined')
					for (var overlayKey in overlays)
						map.removeLayer(overlays[overlayKey]);
				
				// 2º Adicionar camada pretendida
				if(mapRefocusInfo[elementToRefocus].domain == "All") {
					actualLayer = "All";
					for (var overlayKey in defaultLanguageOverlays)
						map.addLayer((isDefaultLanguage())? defaultLanguageOverlays[overlayKey] : ((typeof overlays !== 'undefined')?  overlays[overlayKey] : defaultLanguageOverlays[overlayKey]));
				} else {
					actualLayer = mapRefocusInfo[elementToRefocus].domain;
					map.addLayer((isDefaultLanguage())? defaultLanguageOverlays[actualLayer] : ((typeof overlays !== 'undefined')?  overlays[actualLayer] : defaultLanguageOverlays[actualLayer]));
				}
				
				// 3º Fazer (re)focus, de acordo com os limites estabelecidos
				// Desactivar controlos do mapa, enquanto faz flyToBounds e activar, novamente, no fim.
				map.zoomControl.disable();
				map.boxZoom.disable();
				map.doubleClickZoom.disable();
				map.dragging.disable();
				map.keyboard.disable();
				map.scrollWheelZoom.disable();
				//map.tap.disable();
				map.touchZoom.disable();
				map.setMinZoom(minMapZoom); 
				map.setMaxBounds(maxBounds);
				
				map.flyToBounds(mapRefocusInfo[elementToRefocus].panTo);
				
				var zoomendfunction = function() { 
					map.setMinZoom(map.getZoom());
					
					// Os limites do mapa são os limites actuais, após flyToBounds,
					// que não são necessariamente os maxBounds anteriores, devido ao zoom ser discreto e não contínuo
					newMaxBounds = map.getBounds();
					
					// Dar uma margem aos limites do mapa, para não originar problemas de recentragem
					newMaxBounds._northEast.lat = newMaxBounds._northEast.lat + 0.1;
					newMaxBounds._northEast.lng = newMaxBounds._northEast.lng + 0.1;
					newMaxBounds._southWest.lat = newMaxBounds._southWest.lat - 0.1;
					newMaxBounds._southWest.lng = newMaxBounds._southWest.lng - 0.1;
					
					map.setMaxBounds(newMaxBounds);
					map.zoomControl.enable();
					map.boxZoom.enable();
					map.doubleClickZoom.enable();
					map.dragging.enable();
					map.keyboard.enable();
					map.scrollWheelZoom.enable();
					//map.tap.enable();
					map.touchZoom.enable();
					map.off("zoomend", zoomendfunction); 
				}
				
				map.on("zoomend", zoomendfunction);
				$("#zoom-reset button").click(function(e) {
					map.flyToBounds(mapRefocusInfo[elementToRefocus].panTo);
					$(this).blur();
					$(this).removeClass("active");
					e.preventDefault();
				});

			});
		}

		// Após inicialização e handling do Focus / aparecimento de cada uma das camadas, determinar
		// se é passado em parâmetro, a secção a mostrar ou não.
		// Se sim, é essa que é mostrada. Se não, é a estabelecida como default em map-refocus-info.
		var sectionToPresent = getParameterByName("section");
		if(sectionToPresent)
			$("[navbarelementid=\""+ sectionToPresent +"\"]").click(); //simular click.
		else
			$("[navbarelementid=\""+ defaultSectionDomain +"\"]").click();
	}
	
	function addResetZoomButtonAndEvent() {
		$(".full-map").append("<div id=\"zoom-reset\">"
							+ "<button type=\"button\" class=\"map-btn\">"
							+ "<i class=\"fas fa-sync\"></i>"
							+ "</button>"
							+ "</div>");
	}
	
	function addGeolocationButtonAndEvent() {
		$(".full-map").append("<div id=\"geolocation\">"
							+ "<button type=\"button\" class=\"map-btn\">"
							+ "<i class=\"fas fa-map-marker-alt\"></i>"
							+ "</button>"
							+ "</div>");
							
		//Event handler
		$("#geolocation button").click(function(e) {
			map.locate({setView: true, maxZoom: zoomOnGeolocation});
			$(this).blur();
			$(this).removeClass("active");
			e.preventDefault();
		});
		
		// Os erros na geolocalizacao sao emitidos num alert
		map.on("locationerror", function(e) {
			alert(e.message);
		});
	}

	function addTileLayersAndSelectionButton() {
		//$(document).on("languagesLoaded", function(jsonDirectory) {
			$.ajax({url: getDefaultLanguageDirectory() + jsonFileName, async: false, dataType: 'json', success: function(data) {		
				/*var htmlToAppend = "<div id=\"map-tile-layers\">"
									+ "<div class=\"btn-group\">"
									+ "<button type=\"button\" class=\"map-btn dropdown-toggle\" data-toggle=\"dropdown\">"
									+ "<i class=\"fas fa-layer-group\"></i>"
									+ "</span>"
									+ "</button>"
									+ "<ul class=\"dropdown-menu dropdown-menu-right dropdown-menu-form\" role=\"menu\">"; // BS3 version*/
									
				var htmlToAppend = "<div id=\"map-tile-layers\">"
									+ "<div class=\"dropdown\">"
									+ "<button type=\"button\" class=\"map-btn dropdown-toggle no-dropdown-arrow\" data-toggle=\"dropdown\">"
									+ "<i class=\"fas fa-layer-group\"></i>"
									+ "</button>"
									+ "<div class=\"dropdown-menu dropdown-menu-right dropdown-menu-form\" role=\"menu\">";

				htmlToAppend += storeMapLayers(data.allLayers);
				
				htmlToAppend += "</div>"
								+ "</div>"
								+ "</div>";
								
				$(".full-map").append(htmlToAppend);
				
				addEventToMapLayers();
				
				addStyleToMapButtons();
				addInitialLayers();
			}});
			
			
			
//referir que teve de se retirar getJson, pois era necessario uma ordem. E para ficar so um ou dois n fazia sentido.
		//});
	}

	function storeMapLayers(allLayerArray) {
		var htmlToReturn = "";
		
		// Cookie
		var activeMapLayersCookie = readCookie("activeMapLayers");
		
		console.log(activeMapLayersCookie);
		activeMapLayers = activeMapLayersCookie? JSON.parse(activeMapLayersCookie) : [];
		if(activeMapLayersCookie) console.log("THERE IS COOKIE");
		
		for(i = 0; i < allLayerArray.length; i++) {
			var layersArray = [];
			
			for(j = 0; j < allLayerArray[i].layersInfo.length; j++) {
				
				switch(allLayerArray[i].layersInfo[j].type) {
					case "Bing":
						layersArray.push(L.tileLayer.bing({ bingMapsKey: allLayerArray[i].layersInfo[j].urlTemplateOrKey,
															imagerySet: allLayerArray[i].layersInfo[j].imagerySet,
															attribution: allLayerArray[i].layersInfo[j].attribution }));
						break;
						// Se se adicionar outros tipos de mapas que necessitem de interface/biblioteca especial
						// para serem adicionados (ex: Bing, Google, ...) , adicionar aqui os "case" correspondentes
					case "normal":
					default:
						layersArray.push(L.tileLayer(allLayerArray[i].layersInfo[j].urlTemplateOrKey, {
														attribution: allLayerArray[i].layersInfo[j].attribution }));
						break;
				}
				
				defaultLanguageElements.push({langMapId: allLayerArray[i].layersInfo[j].langMapId,
												name: allLayerArray[i].layersInfo[j].name});
				
				/*htmlToReturn += "<li class=\"activable\" name=\""
								+ allLayerArray[i].idPrefix
								+ "\" id=\"" + allLayerArray[i].idPrefix + j
								+ "\" langMapId=\"" + allLayerArray[i].layersInfo[j].langMapId + "\">"
								+ "<a href=\"#\">"
								+ "<input name=\""
								+ allLayerArray[i].idPrefix
								+ "\" type=\"radio\"><span class=\"language-changeable-text\"> "
								+ allLayerArray[i].layersInfo[j].name
								+ "</span></a></li>"; //BS3 version*/
				
				htmlToReturn += "<a  href=\"#\" class=\"activable dropdown-item\" name=\""
								+ allLayerArray[i].idPrefix
								+ "\" id=\"" + allLayerArray[i].idPrefix + j
								+ "\" langMapId=\"" + allLayerArray[i].layersInfo[j].langMapId + "\">"
								+ "<input name=\""
								+ allLayerArray[i].idPrefix
								+ "\" type=\"radio\"><span class=\"language-changeable-text\"> "
								+ allLayerArray[i].layersInfo[j].name
								+ "</span></a>";
			}
			
			
			
			mapLayers[i] = { idPrefix: allLayerArray[i].idPrefix,
								layersInfo:  layersArray,
								activeLayer: activeMapLayersCookie? activeMapLayers[i] : (activeMapLayers[i] = 0) };
		
			htmlToReturn += "<div class=\"dropdown-divider\"></div>";//<li class=\"divider\" />";	
		}
		
		createCookie("activeMapLayers", JSON.stringify(activeMapLayers), 7);
		
		return htmlToReturn;
	
	}
	
	function addEventToMapLayers() {
		for(i = 0; i < mapLayers.length; i++)
			for (j = 0; j < mapLayers[i].layersInfo.length; j++)
				addEventToEachLayer(i, j);
	}
	
	//tinha de vir para aqui, pq se fosse fora o i e o j era igual. VERIFICAR QUE NÃO ESTÁ CORRECTAMENTE A PASSAGEM DE PARAMETROS
	function addEventToEachLayer(actualIndexOnMapLayers, actualIndexOnLayerInfo) {
		$("#" + mapLayers[actualIndexOnMapLayers].idPrefix + actualIndexOnLayerInfo).click(function() {
			if(actualIndexOnLayerInfo == mapLayers[actualIndexOnMapLayers].activeLayer)
				return;
		
			for(k = 0; k < mapLayers[actualIndexOnMapLayers].layersInfo.length; k++)
				mapLayers[actualIndexOnMapLayers].layersInfo[k].remove();

			mapLayers[actualIndexOnMapLayers].activeLayer = actualIndexOnLayerInfo;
			mapLayers[actualIndexOnMapLayers].layersInfo[actualIndexOnLayerInfo].addTo(map);
			
			// para o cookie
			activeMapLayers[actualIndexOnMapLayers] = actualIndexOnLayerInfo;
			createCookie("activeMapLayers", JSON.stringify(activeMapLayers), 7);
			
			reorderLayers(true);
			
		});
	}
	
	function addInitialLayers() {
		for(i = 0; i < mapLayers.length; i++) {
			if(mapLayers[i].layersInfo[activeMapLayers[i]]) {
				mapLayers[i].layersInfo[activeMapLayers[i]].addTo(map);
				$("#" + mapLayers[i].idPrefix + activeMapLayers[i]).addClass("active");
				$("#" + mapLayers[i].idPrefix + activeMapLayers[i]).find("input").prop('checked', true);
			} else { // se a interface mudar ou se alguém andar a brincar com o cookie externamente.
				mapLayers[i].layersInfo[0].addTo(map);
				$("#" + mapLayers[i].idPrefix + "0").addClass("active");
				$("#" + mapLayers[i].idPrefix + "0").find("input").prop('checked', true);
				activeMapLayers[i] = 0;
				createCookie("activeMapLayers", JSON.stringify(activeMapLayers), 7);
			}
		}
	
	}
	
	function reorderLayers(ascending) {
		if(ascending)
			for(i = 0; i < mapLayers.length; i++) {
				mapLayers[i].layersInfo[mapLayers[i].activeLayer].remove();
				mapLayers[i].layersInfo[mapLayers[i].activeLayer].addTo(map);
			}
		else
			for(i = length-1; i > -1; i--) {
				mapLayers[i].layersInfo[mapLayers[i].activeLayer].remove();
				mapLayers[i].layersInfo[mapLayers[i].activeLayer].addTo(map);
			}
	}
	
	function addLanguageEvents() {
		$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {

			if(isDefaultLanguage) {

				for(i = 0; i < defaultLanguageElements.length; i++)
					$("[langMapId=\"" + defaultLanguageElements[i].langMapId + "\"] .language-changeable-text").html(" " + defaultLanguageElements[i].name);
				for(i = 0; i < defaultFeatures.length; i++)
					$("[langFeatureId=\"" + defaultFeatures[i].langFeatureId + "\"] b").html(defaultFeatures[i].name);
			}
			else	{	
			
				$.getJSON(jsonDirectory + jsonFileName, function(data) { 
					for(i = 0; i < defaultLanguageElements.length; i++) { // Para todos os elementos guardados com a defaultLanguage, é que se vai analisar
						var elementOnLanguage = searchOnLanguageArray(data, defaultLanguageElements[i].langMapId);
						
						$("[langMapId=\"" + defaultLanguageElements[i].langMapId + "\"] .language-changeable-text").html(" "
							+ ((elementOnLanguage)? elementOnLanguage.name : defaultLanguageElements[i].name));
						//Se o elemento existe no array da nova linguagem, substituia o novo texto, senao adiciona o da default language.
						
					}


				}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
					for(i = 0; i < defaultLanguageElements.length; i++)
						$("[langMapId=\"" + defaultLanguageElements[i].langMapId + "\"] .language-changeable-text").html(" " + defaultLanguageElements[i].name);
				});
			
			
			
			
			
			//Esta parte nao funciona, apagar
			
				$.getJSON(jsonDirectory + jsonMapLayerFileName, function(data) { 

					for(i = 0; i < defaultFeatures.length; i++) { // Para todos os elementos guardados com a defaultLanguage, é que se vai analisar
						if(i == 1)
							continue;
						var elementOnLanguage = searchOnLanguageArray2(data, defaultFeatures[i].langFeatureId);
						//console.log(defaultFeatures[i].langFeatureId);
						//console.log(elementOnLanguage);
						//console.log($("[langfeatureid=\"" + defaultFeatures[i].langFeatureId + "\"]").html());
						$("[langFeatureId=\"" + defaultFeatures[i].langFeatureId + "\"] b").html(
							((elementOnLanguage)? elementOnLanguage.name : defaultFeatures[i].name));
						//Se o elemento existe no array da nova linguagem, substituia o novo texto, senao adiciona o da default language.
						
					}


				}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
					for(i = 0; i < defaultFeatures.length; i++)
						$("[langFeatureId=\"" + defaultFeatures[i].langFeatureId + "\"] b").html(defaultFeatures[i].name);
				});
			
			
			
			
			
			
			}
		});
	}
	
	function searchOnLanguageArray(array, langMapId){
		for(j = 0; j < array.length; j++)
			if(array[j].langMapId == langMapId)
				return array[j];
		return false;
	}
	
	
	function searchOnLanguageArray2(array, langFeatureId){
		for(j = 0; j < array.length; j++) {
									if(j == 1)
							continue;
			
			//console.log(array[j].langFeatureId);
			if(array[j].langFeatureId == langFeatureId)
				return array[j];
		}
		return false;
	}

	function addStyleToMapButtons() {
		$(".map-btn").addClass("btn btn-primary");
	}


});


	