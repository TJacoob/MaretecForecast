
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
	var jsonMapRefocusInfoFileName = "map-refocus-info.json"
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
	var defaultLanguageOverlays = {};
	var panToRegion = {};
	var geoJsonDirectory;
	var isDefault = true;
	var actualDomainLayer = "Hydrodynamic";
	var mapRefocusInfo;
	var defaultSectionDomain;
	
	//Provisório
	var defaultStyle  = {
	    color: "blue",
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.1,
        fillColor: "#b7eafb"
	};
	var highlightStyle = {
	    color: "blue", 
	    weight: 3,
	    opacity: 1,
	    fillOpacity: 0.4,
	    fillColor: '#27c0f3'
	};
	
	console.log("quantos loads fora2");
	createAndAddMap();
	//addStationsButton();
	loadRefocusInfo();
	addGeolocationButtonAndEvent();
	addTileLayersAndSelectionButton();
	addResetZoomButtonAndEvent();
	console.log("quantos loads fora3");
	addLanguageEvents();
	addStyleToMapButtons();
	addGeoJsonLayersAndControls();
	//loadStationsGeoJsonInfo();
	console.log("quantos loads fora4");
	reloadGeoJsonLayers(); //Quando muda de linguagem, é necessário fazer o reload das camadas
	console.log("quantos loads fora5");
	
	
	//$(document).ajaxStop(function() {
	//	count++;
		//if((count > 3)&&!load) {
			load = true;
			console.log("quantos loads");

			for(var key in mapRefocusInfo) {
				console.log("aaaa1");
				//$("[navbarelementid=\"" + key + "\"] a").click({ elementToRefocus: key }, function (e) { faz toda adifertença no BS4
				$("[navbarelementid=\"" + key + "\"]").click({ elementToRefocus: key }, function (e) {
					//console
					console.log(key);
					var elementToRefocus = e.data.elementToRefocus;
					
					e.preventDefault();
					setParameterByName("section", elementToRefocus);
					
					for (var overlayKey in overlays) {
						map.removeLayer(overlays[overlayKey]);
						map.removeLayer(defaultLanguageOverlays[overlayKey]);
					}

					if(mapRefocusInfo[elementToRefocus].layerType == "Stations") {
						addStationsLayer(mapRefocusInfo[elementToRefocus].domain);
						actualDomainLayer = "Stations";
					} else if(mapRefocusInfo[elementToRefocus].layerType == "Maps") {
						//removeStationsLayers();
						actualDomainLayer = mapRefocusInfo[elementToRefocus].domain;
						map.addLayer((isDefault)? defaultLanguageOverlays[actualDomainLayer] : overlays[actualDomainLayer]);
						console.log("aaaa2");
					}
			
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
						console.log(map.getBounds());
						newMaxBounds = map.getBounds();
						
						newMaxBounds._northEast.lat = newMaxBounds._northEast.lat + 0.1;
						newMaxBounds._northEast.lng = newMaxBounds._northEast.lng + 0.1;
						newMaxBounds._southWest.lat = newMaxBounds._southWest.lat - 0.1;
						newMaxBounds._southWest.lng = newMaxBounds._southWest.lng - 0.1;
						
						console.log(newMaxBounds);
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
		
			
			//if(!(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)) { //se nao é firefox... (pq tem de carregar em sitios diferentes
			
						//Analisar qual secção deve ser apresentado
				console.log("fez quanfas?");
				var sectionToPresent = getParameterByName("section");
				if(sectionToPresent)
					$("[navbarelementid=\""+ sectionToPresent +"\"]").click(); //simular click.
				else
					$("[navbarelementid=\""+ defaultSectionDomain +"\"]").click();
				setInitialLanguage();
		//	}
		
	//	}
	//});
	
	
	
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
	
	function addResetZoomButtonAndEvent() {
		$(".full-map").append("<div id=\"zoom-reset\">"
							+ "<button type=\"button\" class=\"map-btn\">"
							+ "<i class=\"fas fa-sync\"></i>"
							+ "</button>"
							+ "</div>");
							
	/*	$("#zoom-reset button").click(function(e) {
			map.flyToBounds(panToRegion[actualDomainLayer]);
			$(this).blur();
			$(this).removeClass("active");
			e.preventDefault();
		});*/
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
									+ "<button type=\"button\" class=\"map-btn dropdown-toggle\" data-toggle=\"dropdown\">"
									+ "<i class=\"fas fa-layer-group\"></i>"
									+ "</span>"
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
								activeLayer: 0 };
			
			htmlToReturn += "<div class=\"dropdown-divider\"></div>";//<li class=\"divider\" />";	
		}
	
		return htmlToReturn;
	
	}
	
	function addEventToMapLayers() {
		for(i = 0; i < mapLayers.length; i++)
			for (j = 0; j < mapLayers[i].layersInfo.length; j++)
				addEventToEachLayer(i, j);
	}
	
	//tinha de vir para aqui, pq se fosse fora o i e o j era igual.
	function addEventToEachLayer(actualIndexOnMapLayers, actualIndexOnLayerInfo) {
		$("#" + mapLayers[actualIndexOnMapLayers].idPrefix + actualIndexOnLayerInfo).click(function() {
			if(actualIndexOnLayerInfo == mapLayers[actualIndexOnMapLayers].activeLayer)
				return;
		
			for(k = 0; k < mapLayers[actualIndexOnMapLayers].layersInfo.length; k++)
				mapLayers[actualIndexOnMapLayers].layersInfo[k].remove();

			mapLayers[actualIndexOnMapLayers].activeLayer = actualIndexOnLayerInfo;
			mapLayers[actualIndexOnMapLayers].layersInfo[actualIndexOnLayerInfo].addTo(map);
			
			reorderLayers(true);
			
		});
	}
	
	function addInitialLayers() {
		for(i = 0; i < mapLayers.length; i++) {
			mapLayers[i].layersInfo[0].addTo(map);
			mapLayers[i].activeLayer = 0;
			$("#" + mapLayers[i].idPrefix + "0").addClass("active");
			$("#" + mapLayers[i].idPrefix + "0").find("input").prop('checked', true);
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
		//console.log(array);
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
	
	
	function reloadGeoJsonLayers() {
		$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) { //REGISTAR EVENTO
		
			//apagar as que estão. é preciso
		console.log(overlays);
		for (var key in overlays)
			map.removeLayer(overlays[key]);

		console.log("mudou");
		
		if(isDefaultLanguage) {
			
			console.log("mudou para default");
			console.log(defaultLanguageOverlays);
			//overlays = defaultLanguageOverlays; pq estava a dar erro, pois estava a mudar as referencias. Alterava a linguagem e nada mais (quando ia para default ja n voltava pois o objecto tinha sido alterado)
			isDefault = true;
			if(!(actualDomainLayer == "Stations"))
				map.addLayer(defaultLanguageOverlays[actualDomainLayer]);

		} else
			$.getJSON(jsonDirectory + jsonMapLayerFileName, function(data2) { 

				isDefault = false;

				$.getJSON(geoJsonDirectory + jsonMapLayerFileName, function(data) { // guardar esta info (no primeiro load) e tirar este load d Json q n faz sentido
					console.log(data2);
					console.log(data);
					var isFistDomain = true;
					for (var key in data) {
						var actualJsonLayer = data[key];
						
						var layer = L.geoJson(actualJsonLayer, {
							onEachFeature: function (feature, layer) {

								html = "";
								var name = feature.properties.name;
								var url = feature.properties.url;
								var langFeatureId = feature.properties.langFeatureId;

								name = data2[langFeatureId];

								defaultFeatures.push( {name: name,
														url: url,
														langFeatureId: langFeatureId});
								

								//o caso em que ha' um unico projecto para a regiao, o nome e o url sao strings, senao, sao arrays de strings
								if(typeof name === "string") {
									//html += "<b>Project: "+_name+ "</b><br><a href="+_url+" target='_blank'> - link to project</a><br>";
									layer.on('click',
										function(e) {
											window.open(url, "_self");
										} );
									layer.bindTooltip("<p langFeatureId=\"" + langFeatureId + "\" style=\"font-size:16px\"><b>" + name + "</b></p>");
								} else { //tem mais que um projecto por regiao (caso do PCOMS e do PCOMS2)
									for (n = 0; n < name.length; ++n) {
										html += "<p langFeatureId=\"" + langFeatureId + "\" style=\"font-size:16px\">"
												+ "<b><a SubFeatureNo=\"" + n + "\"href="+ url[n]+" target='_self'>"+ name[n]+ "</a></b></p>";
										layer.bindPopup(html);
									} 
								}


								layer.setStyle(defaultStyle);
								
								// Create a mouseover event
								layer.on("mouseover", function (e) {
									// Change the style to the highlighted version
									layer.setStyle(highlightStyle);
									
									// Create a popup with a unique ID linked to this record
									var popup = $("<div></div>", {
										id: "popup-" + feature.id,
										css: {
											position: "absolute",
											top: "10px",
											left: "50px",
											zIndex: 9999,
											backgroundColor: "white",
											padding: "8px",
											border: "1px solid #ccc"
										}
									});
									
									// Insert a headline into that popup
									var hed = $("<div></div>", {
										text: "Domain: " + feature.properties.name,
										css: {fontSize: "12px", marginBottom: "3px"}
									}).appendTo(popup);
									
									// Add the popup to the map
									popup.appendTo("#leafletmap");
								});
							
								// Create a mouseout event that undoes the mouseover changes
								layer.on("mouseout", function (e) {
									// Start by reverting the style back
									layer.setStyle(defaultStyle); 
									// And then destroying the popup
									$("#popup-" + feature.id).remove();
								});
				  
				  
							}
						});
				
						overlays[key] = layer;

						//if(key == actualDomainLayer) {
							//map.addLayer(layer)
							//map.fitBounds(panToRegion["Hydrodynamic"]);
						//}
						
//						if(isFistDomain){
	//						map.addLayer(layer);
//							isFistDomain = false;

	//		map.fitBounds(panToRegion["Hydrodynamic"]);
			//			}
						
						
					}
					console.log(overlays);
					console.log(overlays[actualDomainLayer]);
					console.log(actualDomainLayer);
					if(!(actualDomainLayer == "Stations")) {
						console.log(overlays[actualDomainLayer]);
						map.addLayer(overlays[actualDomainLayer]);
					}
					//map.fitBounds(panToRegion[actualDomainLayer]);
					
					
				});
















			}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
				//isDefault = true;
				if(!(actualDomainLayer == "Stations"))
					map.addLayer(defaultLanguageOverlays[actualDomainLayer]);
			});	
			
		});
		/*$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {

		});	*/
	}
	
	function loadRefocusInfo() {
		//$(document).on("languagesLoaded", function(e, jsonDirectory) {
			console.log(getDefaultLanguageDirectory() + jsonMapRefocusInfoFileName);
			$.ajax({url: getDefaultLanguageDirectory() + jsonMapRefocusInfoFileName, async: false, dataType: 'json', success: function(data) {		
				mapRefocusInfo = data.sectionsInfo;
				defaultSectionDomain = data.defaultSection;
			}});
			
		//});
	}
	
	function addGeoJsonLayersAndControls() {
		
			$.ajax({url: getDefaultLanguageDirectory() + jsonMapLayerFileName, async: false, dataType: 'json', success: function(data) {			
				geoJsonDirectory = getDefaultLanguageDirectory();
				var isFistDomain = true;
				for (var key in data) {
					var actualJsonLayer = data[key];
					panToRegion[key] = actualJsonLayer[0].properties.panTo;

					var layer = L.geoJson(actualJsonLayer, {
						onEachFeature: function (feature, layer) {
							console.log("Ssslayer!");
							html = "";
							var name = feature.properties.name;
							var url = feature.properties.url;
							var langFeatureId = feature.properties.langFeatureId;
							
							defaultFeatures.push( {name: name,
													url: url,
													langFeatureId: langFeatureId});
							

							
							//o caso em que ha' um unico projecto para a regiao, o nome e o url sao strings, senao, sao arrays de strings
							if(typeof name === "string") {
								//html += "<b>Project: "+_name+ "</b><br><a href="+_url+" target='_blank'> - link to project</a><br>";
								layer.on('click',
									function(e) {
										window.open(url, "_self");
									} );
								layer.bindTooltip("<p langFeatureId=\"" + langFeatureId + "\" style=\"font-size:16px\"><b>" + name + "</b></p>");
							} else { //tem mais que um projecto por regiao (caso do PCOMS e do PCOMS2)
								for (n = 0; n < name.length; ++n) {
									html += "<p langFeatureId=\"" + langFeatureId + "\" style=\"font-size:16px\">"
											+ "<b><a SubFeatureNo=\"" + n + "\"href="+ url[n]+" target='_blank'>"+ name[n]+ "</a></b></p>";
									layer.bindPopup(html);
								} 
							}


							layer.setStyle(defaultStyle);
							
							// Create a mouseover event
							layer.on("mouseover", function (e) {
								// Change the style to the highlighted version
								layer.setStyle(highlightStyle);
								
								// Create a popup with a unique ID linked to this record
								var popup = $("<div></div>", {
									id: "popup-" + feature.id,
									css: {
										position: "absolute",
										top: "10px",
										left: "50px",
										zIndex: 9999,
										backgroundColor: "white",
										padding: "8px",
										border: "1px solid #ccc"
									}
								});
								
								// Insert a headline into that popup
								var hed = $("<div></div>", {
									text: "Domain: " + feature.properties.name,
									css: {fontSize: "12px", marginBottom: "3px"}
								}).appendTo(popup);
								
								// Add the popup to the map
								popup.appendTo("#leafletmap");
							});
						
							// Create a mouseout event that undoes the mouseover changes
							layer.on("mouseout", function (e) {
								// Start by reverting the style back
								layer.setStyle(defaultStyle); 
								// And then destroying the popup
								$("#popup-" + feature.id).remove();
							});
			  
			  
						}
					});
			
					
					//defaultLanguageOverlays[key] = layer;
					overlays[key] = layer;

					if(isFistDomain){
						//map.addLayer(layer);
						isFistDomain = false;
						map.fitBounds(maxBounds);
						$("[navbarelementid=\"nb-maps-00\"]").addClass("active");
					}
					
					map.flyToBounds(maxBounds);
					
				}
				
				defaultLanguageOverlays = Object.assign({}, overlays);
			}});
		
		

		//});
	}
	

	
	

	
});


	