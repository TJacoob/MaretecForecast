
$(document).ready(function() {
	/**
	 *	This is a local context.
	 *
	 *  To present and to manipulate a full-page map.
	 *  A div with class "full-map" must be added to HTML.
	 */
	var jsonStationsFileName = "stations.json";
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
	var overStationsLayers = {};
	var defaultLanguageOverlays = {};
	var jsonStationsAll; // vai conter as estações provenientes do json
	var stations = [];
	var panToRegion = {};
	var geoJsonDirectory;
	var isDefault = true;
	var actualDomainLayer = "Hydrodynamic";
	
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
	
	
	createAndAddMap();
	addStationsButton();
	addGeolocationButtonAndEvent();
	addTileLayersAndSelectionButton();
	addResetZoomButtonAndEvent();
	addLanguageEvents();
	addStyleToMapButtons();
	addGeoJsonLayersAndControls();
	loadStationsGeoJsonInfo();
	reloadGeoJsonLayers(); //Quando muda de linguagem, é necessário fazer o reload das camadas
	//presentStations();
	
	
	$(document).ajaxStop(function() {
		map.setMaxBounds(panToRegion["Hydrodynamic"]);
		

		
		
		
		$("[navbarelementid=\"nb-maps-00\"] a").click(function () {
			
			removeStationsLayers();
			
			

			map.setMaxBounds(maxBounds);
			for (var key in overStationsLayers)
				map.removeLayer(overStationsLayers[key]);
			
				for (var key in overlays) {
				map.removeLayer(overlays[key]);
				map.removeLayer(defaultLanguageOverlays[key]);
			}
			actualDomainLayer = "Hydrodynamic";
			map.addLayer((isDefault)? defaultLanguageOverlays["Hydrodynamic"] : overlays["Hydrodynamic"]);
			//map.fitBounds(panToRegion["Hydrodynamic"]);

			map.flyToBounds(panToRegion["Hydrodynamic"]);
			//map.setMaxBounds(panToRegion["Hydrodynamic"]);
			
					//Quando termina zoom, experimentar
					
			var zoomendfunction = function() { map.setMaxBounds(panToRegion["Hydrodynamic"]); map.off("zoomend", zoomendfunction);  }
			map.on("zoomend", zoomendfunction);
			
		});
		
		//console.log($("[navbarelementid=\"nb-maps-01\"]").html());
		
		$("[navbarelementid=\"nb-maps-01\"]").click(function () {
			removeStationsLayers();
			
			
			
			map.setMaxBounds(maxBounds);
			for (var key in overStationsLayers)
				map.removeLayer(overStationsLayers[key]);
			
					for (var key in overlays) {
			map.removeLayer(overlays[key]);
			map.removeLayer(defaultLanguageOverlays[key]);
			}
			actualDomainLayer = "Waves";
			map.addLayer((isDefault)? defaultLanguageOverlays["Waves"] : overlays["Waves"]);
			//map.fitBounds(panToRegion["Waves"]);

			map.flyToBounds(panToRegion["Waves"]);
			//map.setMaxBounds(panToRegion["Waves"]);
								//Quando termina zoom, experimentar

			var zoomendfunction = function() { map.setMaxBounds(panToRegion["Waves"]); map.off("zoomend", zoomendfunction); }
			map.on("zoomend", zoomendfunction);
			
		});
		
			
		$("[navbarelementid=\"nb-maps-02\"] a").click(function () {
			removeStationsLayers();
			
			
			
			map.setMaxBounds(maxBounds);
			for (var key in overStationsLayers)
				map.removeLayer(overStationsLayers[key]);
			
			
					for (var key in overlays) {
			map.removeLayer(overlays[key]);
			map.removeLayer(defaultLanguageOverlays[key]);
			}
			actualDomainLayer = "Watersheds";
			map.addLayer((isDefault)? defaultLanguageOverlays["Watersheds"] : overlays["Watersheds"]);
			//map.fitBounds(panToRegion["Watersheds"]);

			map.flyToBounds(panToRegion["Watersheds"]);

			var zoomendfunction = function() { map.setMaxBounds(panToRegion["Watersheds"]); map.off("zoomend", zoomendfunction); }
			map.on("zoomend", zoomendfunction);
		});
		
		
		
		
		
		
		/////////////// CHARTS
		$("[navbarelementid=\"nb-charts-02\"] a").click(function () {
		//map.off('zoomend');
			for (var key in overStationsLayers)
				map.removeLayer(overStationsLayers[key]);
			for (var key in overlays) {
				map.removeLayer(overlays[key]);
				map.removeLayer(defaultLanguageOverlays[key]);
			}
			//for (var key in overStationsLayers)
				//map.addLayer(overStationsLayers[key]);
			addStationsLayer("All");
			
			actualDomainLayer = "Stations";
			//map.addLayer((isDefault)? defaultLanguageOverlays["Watersheds"] : overlays["Watersheds"]);
			//map.fitBounds(panToRegion["Watersheds"]);
			console.log(panToRegion);
			map.flyToBounds(panToRegion["Hydrodynamic"]);
			
			var zoomendfunction = function() { map.setMaxBounds(panToRegion["Watersheds"]); map.off("zoomend", zoomendfunction); }
			map.on("zoomend", zoomendfunction);
			console.log(map);
		});
		
		$("[navbarelementid=\"nb-charts-01\"] a").click(function () {
		//map.off('zoomend');
			for (var key in overStationsLayers)
				map.removeLayer(overStationsLayers[key]);
			for (var key in overlays) {
				map.removeLayer(overlays[key]);
				map.removeLayer(defaultLanguageOverlays[key]);
			}
			
			//map.addLayer(overStationsLayers["Land"]);
			addStationsLayer("Land");

			actualDomainLayer = "Stations";
			//map.addLayer((isDefault)? defaultLanguageOverlays["Watersheds"] : overlays["Watersheds"]);
			//map.fitBounds(panToRegion["Watersheds"]);
			console.log(panToRegion);
			map.flyToBounds(panToRegion["Hydrodynamic"]);
			
			var zoomendfunction = function() { map.setMaxBounds(panToRegion["Watersheds"]); map.off("zoomend", zoomendfunction); }
			map.on("zoomend", zoomendfunction);
			console.log(map);
		});
		
		$("[navbarelementid=\"nb-charts-00\"] a").click(function () {
		//map.off('zoomend');
			for (var key in overStationsLayers)
				map.removeLayer(overStationsLayers[key]);
			for (var key in overlays) {
				map.removeLayer(overlays[key]);
				map.removeLayer(defaultLanguageOverlays[key]);
			}
			//map.addLayer(overStationsLayers["Water"]);
			addStationsLayer("Water");

			actualDomainLayer = "Stations";
			//map.addLayer((isDefault)? defaultLanguageOverlays["Watersheds"] : overlays["Watersheds"]);
			//map.fitBounds(panToRegion["Watersheds"]);
			console.log(panToRegion);
			map.flyToBounds(panToRegion["Hydrodynamic"]);
			
			var zoomendfunction = function() { map.setMaxBounds(panToRegion["Watersheds"]); map.off("zoomend", zoomendfunction); }
			map.on("zoomend", zoomendfunction);
			console.log(map);
		});
		
	});
	
	
	
	/**
	 * Functions
	 */
	
	function createAndAddMap() {
		$(".full-map").append("<div id=\"map-content\"></div>");
		map = L.map("map-content", { maxBounds: maxBounds, maxBoundsViscosity: 1.0 });//.fitWorld(); //substituir por setView(das coordenadas lidas do JSON)
		map.attributionControl.setPrefix(""); // Para não apresentar o texto Leaflet nas atribuições.
		map.setMinZoom(minMapZoom);
		map.setMaxZoom(maxMapZoom);
	}

	window.getMap = function getMap() {
		return map;
	}
	
	function addResetZoomButtonAndEvent() {
		$(".full-map").append("<div id=\"zoom-reset\">"
							+ "<button type=\"button\" class=\"map-btn\">"
							+ "<span class=\"glyphicon glyphicon glyphicon-refresh\" />"
							+ "</button>"
							+ "</div>");
							
		$("#zoom-reset button").click(function(e) {
			map.flyToBounds(panToRegion[actualDomainLayer]);
			$(this).blur();
			$(this).removeClass("active");
			e.preventDefault();
		});
	}
	
	function addGeolocationButtonAndEvent() {
		$(".full-map").append("<div id=\"geolocation\">"
							+ "<button type=\"button\" class=\"map-btn\">"
							+ "<span class=\"glyphicon glyphicon-map-marker\" />"
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
		$(document).on("languagesLoaded", function(jsonDirectory) {
			$.getJSON(getDefaultLanguageDirectory() + jsonFileName, function(data) { 
				var htmlToAppend = "<div id=\"map-tile-layers\">"
									+ "<div class=\"btn-group\">"
									+ "<button type=\"button\" class=\"map-btn dropdown-toggle\" data-toggle=\"dropdown\">"
									+ "<span class=\"glyphicon glyphicon-globe\" />"
									+ "</span>"
									+ "</button>"
									+ "<ul class=\"dropdown-menu dropdown-menu-right dropdown-menu-form\" role=\"menu\">";

				htmlToAppend += storeMapLayers(data.allLayers);
				
				htmlToAppend += "</ul>"
								+ "</div>"
								+ "</div>";
								
				$(".full-map").append(htmlToAppend);
				
				addEventToMapLayers();
				
				addStyleToMapButtons();
				addInitialLayers();
			});
		});
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
				
				htmlToReturn += "<li class=\"activable\" name=\""
								+ allLayerArray[i].idPrefix
								+ "\" id=\"" + allLayerArray[i].idPrefix + j
								+ "\" langMapId=\"" + allLayerArray[i].layersInfo[j].langMapId + "\">"
								+ "<a href=\"#\">"
								+ "<input name=\""
								+ allLayerArray[i].idPrefix
								+ "\" type=\"radio\"><span class=\"language-changeable-text\"> "
								+ allLayerArray[i].layersInfo[j].name
								+ "</span></a></li>";
			}
			
			mapLayers[i] = { idPrefix: allLayerArray[i].idPrefix,
								layersInfo:  layersArray,
								activeLayer: 0 };
			
			htmlToReturn += "<li class=\"divider\" />";	
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
		$(".map-btn").addClass("btn btn-primary btn-md");
	}
	
	
	function reloadGeoJsonLayers() {
		$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) { //REGISTAR EVENTO
		
			//apagar as que estão. é preciso
		for (var key in overlays)
			map.removeLayer(overlays[key]);

		console.log("mudou");
		
		if(isDefaultLanguage) {console.log("mudou para default");
			console.log(defaultLanguageOverlays);
			//overlays = defaultLanguageOverlays; pq estava a dar erro, pois estava a mudar as referencias. Alterava a linguagem e nada mais (quando ia para default ja n voltava pois o objecto tinha sido alterado)
			isDefault = true;
			map.addLayer(defaultLanguageOverlays[actualDomainLayer]);
			//map.fitBounds(panToRegion[actualDomainLayer]);

		} else
			$.getJSON(jsonDirectory + jsonMapLayerFileName, function(data2) { 


			isDefault = false;








				$.getJSON(geoJsonDirectory + jsonMapLayerFileName, function(data) {

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
											window.open(url);
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
					
					map.addLayer(overlays[actualDomainLayer]);
					//map.fitBounds(panToRegion[actualDomainLayer]);
					
					
				});
















			}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
				//overlays = defaultLanguageOverlays; pq estava a dar erro, pois estava a mudar as referencias. Alterava a linguagem e nada mais (quando ia para default ja n voltava pois o objecto tinha sido alterado)
				map.addLayer(defaultLanguageOverlays[actualDomainLayer]);
				//map.fitBounds(panToRegion[actualDomainLayer]);
				isDefault = true;
			});	
			
		});
		/*$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {

		});	*/
	}
	
	
	function addGeoJsonLayersAndControls() {
		$(document).on("languagesLoaded", function(e, jsonDirectory) {
			$.getJSON(jsonDirectory + jsonMapLayerFileName, function(data) {
				geoJsonDirectory = jsonDirectory;
				var isFistDomain = true;
				for (var key in data) {
					var actualJsonLayer = data[key];
					panToRegion[key] = actualJsonLayer[0].properties.panTo;

					var layer = L.geoJson(actualJsonLayer, {
						onEachFeature: function (feature, layer) {

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
										window.open(url);
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
						map.addLayer(layer);
						isFistDomain = false;
			map.fitBounds(panToRegion["Hydrodynamic"]);
			$("[navbarelementid=\"nb-maps-00\"]").addClass("active");
					}
					
					map.flyToBounds(panToRegion["Hydrodynamic"]);
					
				}
				
				//var ddd = {};
				defaultLanguageOverlays = Object.assign({}, overlays);
				
			});
		});
	}
	
	
	
	function loadStationsGeoJsonInfo() {
		$(document).on("languagesLoaded", function(e, jsonDirectory) {
			$.getJSON(jsonDirectory + jsonStationsFileName, function(jsondata) {
				jsonStationsAll  = jsondata;	
				panToRegion["Stations"] = panToRegion["Watersheds"];
			});
		});
	}
	
	function presentStations() {
		
		
	var geojsonDefaultStyle  = {
	    radius: 7,
	    fillColor: "#000", // replace to stations file fill color
	    weight: 10,
	    opacity: 0,
	    color: "#000",
	    fillOpacity: 0.8
	};	
	var geojsonHighlightStyle = {
	    radius: 7,
	    fillColor: "#555",
	    weight: 10,
	    opacity: 0,
	    color: "#555",    
	    fillOpacity: 0.8
	};	
		
		
		
		
		
		
		
		
		
		
		
		
		$(document).ajaxStop(function() {
		
			
			for (var key in jsonStationsAll) {
				var geojsonFeature = jsonStationsAll[key];
				
				var layer = L.geoJson(geojsonFeature, {
					pointToLayer: function (feature, latlng) {
						var geojsonOptions = geojsonDefaultStyle;					
						geojsonOptions.fillColor = geojsonFeature[0].color;
						
						// change color for private stations
						if(feature.hasOwnProperty('private')){
							geojsonOptions.fillColor = "#FF0000";
						}
					
						return L.circleMarker(latlng, geojsonOptions);
					},
					onEachFeature: function (feature, station) {
						//stations[feature.properties.name] = station;		
						
						stations.push(station);

						station.statusNow 	= 'default';
						station.statusBefore = 'default';
						
						//html = "<b>Station: "+feature.properties.name+ "</b>";					
						//station.bindPopup(html);
						
						//window.open(feature.properties.url);
						
						// Create a mouseover event
						station.on("mouseover", function (e) {
							// Change the style to the highlighted version
							var geojsonOptions = geojsonHighlightStyle;					
							geojsonOptions.radius = map.getZoom();													
							station.setStyle(geojsonHighlightStyle);
							station.statusBefore = station.statusNow;
							station.statusNow = 'onmouse';					
							//$("#mapinfo").append(msg);
						});
									
						// Create a mouseout event that undoes the mouseover changes
						station.on("mouseout", function (e) {
							station.statusNow = station.statusBefore;
							station.statusBefore = 'onmouse';
							
							// Change the style to the default version
								
							
							if(station.statusNow == 'default'){		
								var geojsonOptions = this.defaultOptions;					
								geojsonOptions.radius = map.getZoom();								
								station.setStyle(geojsonOptions); 
							} else if(station.statusNow == 'selected') {
								var geojsonOptions = this.selectedStyle;					
								geojsonOptions.radius = map.getZoom();
								station.setStyle(geojsonOptions); 
							}
									
							// And then destroying the msg
							/*$("#msg-" + feature.id).remove();*/
						});
						
						// Create a click event thar show station info in popup
						station.on("click", function (e) {
							
							
							
							////////CONTEUDO ADICIONADO
							
							
							
							
							addStation(feature.properties.name_alt, feature.id);
							
							
							
							
							
							
							
							
							
							/////ATE AQUI
							
							
							
							
							
							
							
							
							
							
							
							var msg = '<div><b style="font-size: 1.3em">' +feature.properties.name_alt+'</b>';
							msg += '<ul style="padding-left: 15px">';
							msg += '<li><b>Coordenadas: </b>'+(feature.geometry.coordinates[0]).toFixed(4)+', '+(feature.geometry.coordinates[1]).toFixed(4)+'</li>';
							var fatt = feature.properties;
							for (var att in fatt) {
								if (att !== 'name' && att !== 'name_alt') {
									msg += '<li><b>'+att+': </b>'+fatt[att]+'</li>';	
								}						
							}					
							//msg += '<img src="img/buoy.jpg" width=150px style="padding:10px 0">';
							msg += '</ul>';
							var stationName = station.feature.properties.name;
							//msg += '<a class="clickSelectSta">Click here to select this station</a>';
							msg += '</div>';					
							
							var popup = L.popup()
								.setLatLng(e.latlng)
								.setContent(msg)
								.openOn(map);
							
							//isto não é preciso, para já....
							$('.clickSelectSta').click(function(){
								if(selectedStations.length >= nMaxSelectedStat){
									alert("Can only pick a maximum of "+nMaxSelectedStat+" stations");
								}else{
									if($.inArray(station, selectedStations) < 0){
										station.setStyle(geojsonSelectedStyleList[selectedStations.length]);
										station.selectedStyle = geojsonSelectedStyleList[selectedStations.length];
										station.statusBefore = station.statusNow;
										station.statusNow = 'selected';					
										selectedStations.push(station);	
										actionSelectedStations();
										$.uniform.update();
									}else{
										alert("This stations is already selected");
									}
								}
								map.closePopup(popup);
							});


						});
										
					}				
				});
				overStationsLayers[key] = layer;
				//map.addLayer(layer);
			}	  
		
			console.log(jsonStationsAll);
		});
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	}

	
	
	
	
	//adicionar estações.
	
	function addStationsButton() {
		//é PRECISO INICIALIZAR OS POPOVERS COM ESTA FUNÇAO
		$(function () {$('[data-toggle="popover"]').popover()})
		
		
		
		//Em vez de dizer só que contém as estações cheias, vai perguntar se quer apagar a última.
		/*$(".full-map").append("<div id=\"selected-stations\">"
							+ "<button type=\"button\" class=\"selected-stations-btn map-btn\" data-container=\"body\" data-html=\"true\" data-toggle=\"popover\""
														+ "data-placement=\"left\" data-content=\""
												+ "<div><b>Estações seleccionadas</b><ul><li>Nenhuma estação seleccionada</li></ul><button class=\'btn btn-primary btn-md\' type='button'><span class=\'glyphicon glyphicon-stats\'></span></button></div>\">"
							+ "<span class=\"glyphicon glyphicon glyphicon-th-list\"></span>"
							+ "</button>"
							+ "</div>");*/
		
		//Agora com tabela em vez de lista
		$(".full-map").append("<div id=\"selected-stations\">"
					+ "<button type=\"button\" class=\"selected-stations-btn map-btn\" data-container=\"body\" data-html=\"true\" data-toggle=\"popover\""
												+ "data-placement=\"left\" data-content=\""
										+ "<div><b>Estações seleccionadas</b>"
											+ "<table style='width:100%'><tr></tr></table>"
											+ "<p id=\'non-selected\'>Nenhuma estação foi seleccionada</p>"
											+ "<p>Parâmetros:</p>"
											+ "<div style=\'padding-bottom: 10px;\'>"
											+ "<select class=\'form-control\' style=\'z-index: 2147483647\' id=\'exampleFormControlSelect1\'>"
											+ "<option>Velocidade</option>"
											+ "<option>Nível da água</option>"
											+ "<option>Temperatura</option>"
											+ "<option>O2</option>"
											+ "</select>"
											+ "</div>"
											+ "<button class=\'btn btn-primary btn-md\' type='button' onclick=\'showChart()\'><span class=\'glyphicon glyphicon-stats\'></span></button>&nbsp;"
											+ "<button class=\'btn btn-primary btn-md\' type='button' onclick=\'selectAllSelectedStations()\'><span class=\'glyphicon glyphicon-check\'></span></button>&nbsp;"
											+ "<button class=\'btn btn-primary btn-md\' type='button' onclick=\'removeAllStations()\'><span class=\'glyphicon glyphicon-remove-sign\'></span></button></div>\">"
												+ "<span class=\"glyphicon glyphicon glyphicon-th-list\"></span>"
											+ "</button>"
										+ "</div>");
		
		
		
		
		//Criar o modal que tem a informação de atingido o numero máximo de estações seleccionadas.
		$(".full-map").append("<div class=\"modal fade\" style=\"z-index: 2147483647\" id=\"no-max-stations-modal\" role=\"dialog\">"
			+ "<div class=\"modal-dialog\">"
			  +"<div class=\"modal-content\">"
			+  "  <div class=\"modal-header\">"
			 +    " <button type=\"button\" class=\"close\" data-dismiss=\"modal\">&times;</button>"
			 +"     <h4 class=\"modal-title\">Número máximo de estações</h4>"
			 + "  </div>"
			+ "   <div class=\"modal-body\">"
		   +      " <p>O número máximo de estações foi atingido... Deseja eliminar as últimas estações?</p>"
			+ "   </div>"
			 +  " <div class=\"modal-footer\">"
			 +  "   <button id=\"remove-last-station-yes\" type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Sim</button>"
			 +  "   <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\">Fechar</button>"
		   + "    </div>"
		  +  "  </div>"    
		  +" </div>"
		 + " </div>");
		
		
				//Criar o modal que tem o chart (para já so uma imagem)
		$(".full-map").append("<div class=\"modal fade\" style=\"z-index: 2147483647\" id=\"chart-modal\" role=\"dialog\">"
			+ "<div class=\"modal-dialog\" style=\"width: 91%;\">"
			  +"<div class=\"modal-content\">"
			+  "  <div class=\"modal-header\">"
			 +    " <button type=\"button\" class=\"close\" data-dismiss=\"modal\">&times;</button>"
			 +"     <h4 class=\"modal-title\">Gráfico</h4>"
			 + "  </div>"
			+ "   <div class=\"modal-body\">"
		   +      "<img style=\"max-width: 95%\" src=\"images/example.png\" class=\"center-block\">"
			+ "   </div>"
			 +  " <div class=\"modal-footer\">"
			 +  "   <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\">Fechar</button>"
		   + "    </div>"
		  +  "  </div>"    
		  +" </div>"
		 + " </div>");
		

		
		
/*
		//Event handler
		$("#geolocation button").click(function(e) {
			map.locate({setView: true, maxZoom: zoomOnGeolocation});
			$(this).blur();
			$(this).removeClass("active");<li>
			e.preventDefault();
		});
		
		// Os erros na geolocalizacao sao emitidos num alert
		map.on("locationerror", function(e) {
			alert(e.message);
		});*/
		
	}
	
	
	function addStation(stationName, stationFeatureId) {
		var popOverHtmlContent = $(".selected-stations-btn").attr("data-content");
		
		//popOverHtmlContent = popOverHtmlContent.replace("<li>Nenhuma estação seleccionada</li>", ""); //SE EXISTIR ISTO SUBSTITUI
		
		//if(popOverHtmlContent.search("<li>" + "<span class=\"glyphicon glyphicon-remove-circle\"></span> " + stationName + "</li>") < 0) { // não está ainda seleccionada, vamos adionar
			
			
			//split("<li>").length - 1)
			
			//if(popOverHtmlContent.split("<li>").length == 5) { //quanco chega as 4 estações
				//$("#no-max-stations-modal").modal({show: true});
				//$(".selected-stations-btn").popover("hide");
			//} else {
		
				/*popOverHtmlContent = popOverHtmlContent.replace("<ul>",
															"<ul><li>"
															+ "<input type=\"checkbox\" name=\"station\" value=\"" + stationFeatureId + "\">"
																+ stationName +  "<span class=\"glyphicon glyphicon-remove-circle\"></span> " + "</li>");*/
				// AGORA COM TABELA
				//FALTA TROCAR PARA CHECKBOX DO BOOTSTRAP
				// replace faz para a primeira instância, fazer para a primeira instância do item da tabela
			
			var regex = new RegExp("<tr\\s*id=\"" + stationFeatureId + "\".*?</tr>");
			if(	popOverHtmlContent.search(regex) < 0) { //Se a estação ainda não está lá.
				
				var regex_till_exists = new RegExp("<tr\\s*id=", "g"); //tem de ser greedy para achar todas
				var match = popOverHtmlContent.match(regex_till_exists);
				
				if(!match)
					match = "";
				
				console.log(match);
				console.log(match.length);
				if(match.length < 4) {// Se já existem suficientes, nãi vai adicionar, vai abrir a caixa de diálogo
					popOverHtmlContent = popOverHtmlContent.replace(/non-selected.*hidden/, "non-selected\'");
				
				
				
				
				
					popOverHtmlContent = popOverHtmlContent.replace("id=\'non-selected\'", "id=\'non-selected\' hidden");
				
					popOverHtmlContent = popOverHtmlContent.replace("<tr",
											"<tr id=\"" + stationFeatureId + "\"><td>"
											+ "<input type=\"checkbox\" name=\"station\" value=\"" + stationFeatureId + "\"> "
												+ stationName + "</td>" +	
											"<td onclick=\"removeStation(" + stationFeatureId + ")\">" + "<span style=\"color:#cc0000; text-shadow: 1.5px 1.5px #8c8c8c\" class=\"glyphicon glyphicon-remove\"></span> " + "</td></tr><tr");
				
				
					$(".selected-stations-btn").attr("data-content", popOverHtmlContent);
				//$(".popover-content").html(popOverHtmlContent);
				//$(".selected-stations-btn").popover("hide");
					$(".selected-stations-btn").popover("show");
				//console.log(popOverHtmlContent);
				
				} else { //já são a mais
					
					$("#no-max-stations-modal").modal({show: true});
					//(".selected-stations-btn").popover("hide");
					
					$("#remove-last-station-yes").click(function () { //se clicou em yes no modal, para tirar a última estação
						console.log("yes");
						
						
						
						
						
						//copiado de remover todas
								var popOverHtmlContent = $(".selected-stations-btn").attr("data-content");
		
								//faz match a tr até ao último tr... porque´.*é qualquer caracter greedy
								popOverHtmlContent = popOverHtmlContent.replace(/non-selected.*hidden/, "non-selected\'");
								var regex = new RegExp("<tr.*</tr>");
							
								popOverHtmlContent = popOverHtmlContent.replace(regex, "<tr></tr>"); //tem de ter sempre tr, porque o add só funciona com tr lá
								
								console.log(popOverHtmlContent);
								
								
								$(".selected-stations-btn").attr("data-content", popOverHtmlContent);
								$(".selected-stations-btn").popover("show");
																		
						///até aqui
						
						
						//agora adicionar a nova, basta chamar addStation novamente (recursivo)
						addStation(stationName, stationFeatureId);
						
						
					});
					
					
				}
											
				//adiciona-se tr no fim, pois é o tr do elemento que já lá estava
				
			//}
		//}
		}
	}
	
	
	
	window.removeStation = function removeStation(stationFeatureId) {
		var popOverHtmlContent = $(".selected-stations-btn").attr("data-content");
		
		//console.log(popOverHtmlContent);
		
		var regex = new RegExp("<tr\\s*id=\"" + stationFeatureId + "\".*?</tr>");
		var regex_till_exists = new RegExp("<tr\\s*id=\"");
		
		popOverHtmlContent = popOverHtmlContent.replace(regex, "");
		
		if(popOverHtmlContent.search(regex_till_exists) < 0) // Se já não existe mais, adiciona o texto.
			popOverHtmlContent = popOverHtmlContent.replace(/non-selected.*hidden/, "non-selected\'");
		//console.log(popOverHtmlContent);
		
		
		$(".selected-stations-btn").attr("data-content", popOverHtmlContent);
		$(".selected-stations-btn").popover("show");
		
		//Remover da variável interna, quando estiver adicionada.
		
	}

	window.removeAllStations = function removeAllStations() {
		var popOverHtmlContent = $(".selected-stations-btn").attr("data-content");
		
		console.log(popOverHtmlContent);
		
		//faz match a tr até ao último tr... porque´.*é qualquer caracter greedy
		popOverHtmlContent = popOverHtmlContent.replace(/non-selected.*hidden/, "non-selected\'");
		var regex = new RegExp("<tr.*</tr>");
	
		popOverHtmlContent = popOverHtmlContent.replace(regex, "<tr></tr>"); //tem de ter sempre tr, porque o add só funciona com tr lá
		
		console.log(popOverHtmlContent);
		
		
		$(".selected-stations-btn").attr("data-content", popOverHtmlContent);
		$(".selected-stations-btn").popover("show");
		
		//Remover da variável interna, quando estiver adicionada.
		
	}
	
	window.selectAllSelectedStations = function selectAllSelectedStations() {
		var popOverHtmlContent = $(".selected-stations-btn").attr("data-content");
		
		console.log(popOverHtmlContent);
		
		//faz match a tr até ao último tr... porque´.*é qualquer caracter greedy
		popOverHtmlContent = popOverHtmlContent.replace(/<input type="checkbox".*?/g, "<input type=\"checkbox\" checked");


		

		
		
		$(".selected-stations-btn").attr("data-content", popOverHtmlContent);
		$(".selected-stations-btn").popover("show");
		
		//Remover da variável interna, quando estiver adicionada.
		
	}
	
	window.showChart = function showChart() {
		$("#chart-modal").modal({show: true});
	}
	
});


	