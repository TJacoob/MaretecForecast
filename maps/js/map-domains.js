
$(document).ready(function() {

	
	

	/**
	 *	This is a local context.
	 *
	 *  To present and to manipulate a full-page map.
	 *  A div with class "full-map" must be added to HTML.
	 */

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
	var isDefault = true;
	var actualDomainLayer = "Hydrodynamic";
	var mapRefocusInfo;
	var defaultSectionDomain;
	
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
	var inactiveStyle = {
	    color: "grey", 
	    weight: 3,
	    opacity: 0.5,
	    fillOpacity: 0.3,
	    fillColor: '#D0D0D0'
	};
	
	
	map = getMap();
	
	loadFocusInfo(getDefaultLocalLanguageDirectory() + jsonMapRefocusInfoFileName); // full-map 
	addGeoJsonLayersAndControls();
	reloadGeoJsonLayers(); //Quando muda de linguagem, é necessário fazer o reload das camadas
	//showLayerAndFocusInitialization(defaultLanguageOverlays, overlays);
	setInitialLanguage();


	
	
	
	/**
	 * Functions
	 */
	
	window.getDefaultSectionDomain = function getDefaultSectionDomain() {
		return defaultSectionDomain;
	}
	





	

	
	function addLanguageEvents() {
		$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {

			
			
			
			
			
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
	
	

	
	function reloadGeoJsonLayers() {
		$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) { //REGISTAR EVENTO
		console.log(jsonDirectory);
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
				showLayerAndFocusInitialization(defaultLanguageOverlays);
				//map.addLayer(defaultLanguageOverlays[actualDomainLayer]);

		} else
			$.getJSON(jsonDirectory + jsonMapLayerFileName, function(data2) { 

				isDefault = false;

				addGeoJsonLayersAndControls(data2);
				






			}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
				//isDefault = true;
				//if(!(actualDomainLayer == "Stations"))
				//	map.addLayer(defaultLanguageOverlays[actualDomainLayer]);
			});	
			
		});
		/*$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {

		});	*/
	}
	
	
	function addGeoJsonLayersAndControls(otherLangData) {
		
			$.ajax({url: getDefaultLocalLanguageDirectory() + jsonMapLayerFileName, async: false, dataType: 'json', success: function(data) {			

				var isFistDomain = true;
				for (var key in data) {
					var actualJsonLayer = data[key];
					//panToRegion[key] = actualJsonLayer[0].properties.panTo;

					var layer = L.geoJson(actualJsonLayer, {
						onEachFeature: function (feature, layer) {
							console.log("Ssslayer!");
							html = "";
							var name = feature.properties.name;
							var url = feature.properties.url;
							var langFeatureId = feature.properties.langFeatureId;
							
							if(typeof otherLangData !== "undefined") // esta a substituir linguagem
								name = otherLangData[langFeatureId];
							
							var active, allInactive = true;
							if(typeof feature.properties.startTime === "string") {
								active = (feature.properties.startTime !== "");
								//if (!active)
									//return;
							}
							else {
								active = [];
								for (n = 0; n < feature.properties.startTime.length; n++)
									active.push((feature.properties.startTime[n] !== ""));
							}
							
							defaultFeatures.push( {name: name,
													url: url,
													langFeatureId: langFeatureId,
													active: active});
							

							//o caso em que ha' um unico projecto para a regiao, o nome e o url sao strings, senao, sao arrays de strings
							if(typeof name === "string") {
								//html += "<b>Project: "+_name+ "</b><br><a href="+_url+" target='_blank'> - link to project</a><br>";
								if(active) {
									layer.on('click',
										function(e) {
											window.open(url, "_self");
										} );
									layer.bindTooltip("<p langFeatureId=\"" + langFeatureId + "\" style=\"font-weight: bold; font-size:16px\">" + name + "</p>");
								}
							} else { //tem mais que um projecto por regiao (caso do PCOMS e do PCOMS2)
								for (n = 0; n < name.length; ++n) {
									if(active[n]) {
										allInactive = allInactive & !active[n];
										html += "<p langFeatureId=\"" + langFeatureId + "\" style=\"font-weight: bold; font-size:16px\">"
												+ "<a SubFeatureNo=\"" + n + "\"href="+ url[n]+">"+ name[n]+ "</a></p>";
									} else {
										html += "<p langFeatureId=\"" + langFeatureId + "\" style=\"color: grey; text-decoration: line-through; font-weight: bold; font-size:16px\">"
												+ name[n]+ "</p>";
										//html += "<p langFeatureId=\"" + langFeatureId + "\" style=\"color: grey; font-size:16px\">"
											//	+ "<b><span SubFeatureNo=\"" + n + ">"+ name[n]+ "</span></b></p>";
									}
									layer.bindPopup(html);
								} 
							}

							if (active || !allInactive)
								layer.setStyle(defaultStyle);
							else {
								layer.setStyle(inactiveStyle);
								return;
							}
							
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
					
					if(typeof otherLangData === "undefined") { // e load de linguagem padrao no inicio
						if(isFistDomain){
							//map.addLayer(layer);
							isFistDomain = false;
							map.fitBounds(maxBounds);
							$("[navbarelementid=\"nb-maps-00\"]").addClass("active");
						}
						
						map.flyToBounds(maxBounds);
					}
				}
				
				if(typeof otherLangData === "undefined") // e load de linguagem padrao no inicio
					defaultLanguageOverlays = Object.assign({}, overlays);
			}});
		
		showLayerAndFocusInitialization(defaultLanguageOverlays, overlays);

		//});
	}
	

	
	

	
});


	