var jsonStationsAll;
var jsonStationsObs;
var jsonStaCenter;
var jsonParameters;
var parametersOtherLang;
var propertiesOtherLang;
var jsonProperties;
var stationsParamM;
var stationsParamO;
var selectedStations = [];
var jsonLangStationsFileName = "stationsPropertiesLanguageChangeableText.json";
var jsonLangFileName = "stationsLanguageChangeableText.json";
var jsonStationRefocusInfoFileName = "station-refocus-info.json";
var actualTableElements;
var allStationsOverlayer;

$(document).ready(function(){

//falta a definição de erros...

	//get possible parameters by station and observation
	$.ajax({ url: "http://forecast.maretec.org/stations/incphp/getParamNew.php", async: false, dataType: 'json',
		success: function(jsondata){		
			stationsParamM = jsondata["M"];
			stationsParamO = jsondata["O"];
		},
		error: function(){		}		
	});
	

	
	maxnday = 7;

	
	// #### Map		
	
	var stations   = [];

	
	// get jsonStations all
	
	$.ajax({
		url: "http://forecast.maretec.org/stations/ajax/getStations.php?type=all", async: false, dataType: 'json',
		success: function(jsondata){		
			jsonStationsAll  = jsondata.stations;			
			if(jsondata.hasOwnProperty('center')){
			   jsonStaCenter = jsondata.center;
			   jsonStaBounds = jsondata.bounds;
			}			
		},
		error: function(){	}		
	});
	
		// get jsonStations obs
	
	$.ajax({
		url: "http://forecast.maretec.org/stations/ajax/getStations.php?type=obs", async: false, dataType: 'json',
		success: function(jsondata){		
			jsonStationsObs  = jsondata;			
		},
		error: function(){	}		
	});


	// get parameters 	
	$.ajax({
		url: "http://forecast.maretec.org/stations/incphp/parameters.json",	async: false, dataType: 'json',
		success: function(jsondata){		
			jsonParameters = jsondata;
		},
		error: function(){	}		
	});	
	
	// get properties Model/Obs			
	$.ajax({
		url: "http://forecast.maretec.org/stations/incphp/properties.json",	async: false, dataType: 'json',
		success: function(jsondata){		
			jsonProperties = jsondata;			
		},
		error: function(){	}		
	});
	
	
	//#### map 	
	//$('#leafletmap').height($('#leafletmap').width()*0.6);
	
	var map;
	var center = [40.2, -9.13];
	var iniZoom = 5;	
	//limites usados no bounds e preciso activar mais em baixo tb
	//var southWest = L.latLng(30, -35); 
    //var northEast = L.latLng(50, 0);
    //var bounds = L.latLngBounds(southWest, northEast);
		

	var actualStationType;
	var overLayers = {};
	
	

	map = getMap();
	loadFocusInfo(getDefaultLocalLanguageDirectory() + jsonStationRefocusInfoFileName); // full-map 
	// if private stations, zoom to it!
	if (typeof jsonStaCenter !== 'undefined' ) {
		if(typeof jsonStaBounds !== 'undefined'){
    		iniZoom = map.getBoundsZoom(jsonStaBounds);		
		}else{
			iniZoom = 9;	
		}
		center = [jsonStaCenter[0],jsonStaCenter[1]];
		
		map.setZoom(iniZoom);
		map.setView(center);
		map.setMinZoom(4);
		map.setMaxZoom(8);
		
	}
	
	


	//L.control.mousePosition({ separator: ', '}).addTo(map);	
	
	var factorSelectedStationRadius = 1.4;
	
	var geojsonDefaultStyle  = {
	    radius: map.getZoom(),
	    fillColor: "#000", // replace to stations file fill color
	    weight: 10,
	    opacity: 0,
	    color: "#000",
	    fillOpacity: 0.8
	};	
	var geojsonHighlightStyle = {
	    radius: map.getZoom(),
	    fillColor: "#555",
	    weight: 10,
	    opacity: 0,
	    color: "#555",    
	    fillOpacity: 0.8
	};

	var nMaxSelectedStat = 6;		
	var geojsonSelectedStyleList = [
		{radius: factorSelectedStationRadius * map.getZoom(),fillColor: "#ff9900",color: "#000",weight: 1,opacity: 1,fillOpacity: 0.8},
		{radius: factorSelectedStationRadius * map.getZoom(),fillColor: "#003300",color: "#000",weight: 1,opacity: 1,fillOpacity: 0.8},
		{radius: factorSelectedStationRadius * map.getZoom(),fillColor: "#ff0000",color: "#000",weight: 1,opacity: 1,fillOpacity: 0.8},
		{radius: factorSelectedStationRadius * map.getZoom(),fillColor: "#000066",color: "#000",weight: 1,opacity: 1,fillOpacity: 0.8},
		{radius: factorSelectedStationRadius * map.getZoom(),fillColor: "#ccff99",color: "#000",weight: 1,opacity: 1,fillOpacity: 0.8},
		{radius: factorSelectedStationRadius * map.getZoom(),fillColor: "#cc0099",color: "#000",weight: 1,opacity: 1,fillOpacity: 0.8},
	];
	
		
	/*$(document).on("languagesLoaded", function(e, jsonDirectory) {
		loadLanguageItens(jsonDirectory);
		loadStationLayers(jsonDirectory, true);
		actualJsonDirectory = jsonDirectory;
	});*/
	$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {
		//unloadStationLayers();
		//console.log("sads: " + actualStationType);
		loadLanguageItens(jsonDirectory);
		//console.log("sdas: " + actualStationType);
		loadStationLayers(jsonDirectory, isDefaultLanguage);
		//console.log("sdas: " + actualStationType);
		actualJsonDirectory = jsonDirectory;
		
		if(!isDefaultLanguage)
			$.ajax({			// get parameters 	
				url: jsonDirectory + "parameters.json",
				async: false,
				dataType: 'json',
				success: function(jsondata){		
					parametersOtherLang = jsondata;
				},
				error: function(){		}		
			});	
			
			$.ajax({			// get properties	
				url: jsonDirectory + "properties.json",
				async: false,
				dataType: 'json',
				success: function(jsondata){		
					propertiesOtherLang = jsondata;
				},
				error: function(){		}		
			});	

	});

	//setInitialLanguage();
	  
	window.removeStation = function removeStation(stationName) {
	
		// Retirar das selected stations a estação correspondente
		for(var i=0; i < selectedStations.length; i++)
			if(selectedStations[i].feature.properties.name == stationName) {
				selectedStations.splice(i, 1);
				break;
			}
		
		// Depois de retirada, reorganizar as cores de cada uma das selected stations.
		for(var i=0; i < selectedStations.length; i++) {
			selectedStations[i].setStyle(geojsonSelectedStyleList[i]);
			selectedStations[i].selectedStyle = geojsonSelectedStyleList[i];
		}
		
		//https://stackoverflow.com/questions/35351353/missing-visible-and-hidden-in-bootstrap-v4
		// Retiar a cor das estação removida, no mapa, e adicionar a default
		zoom = map.getZoom();
		for (var i = 0; i < stations.length; i++) {
			if(stations[i].feature.properties.name == stationName) {
				var geojsonOptions;
				if(stations[i].statusNow != "onmouse") {
					geojsonOptions = geojsonDefaultStyle;
					geojsonOptions.fillColor = stations[i].defaultOptions.fillColor;
					stations[i].statusNow = 'default';
				} else {
					geojsonOptions = geojsonHighlightStyle;
					geojsonOptions.fillColor = geojsonHighlightStyle.fillColor;
					stations[i].statusBefore = 'default';
				}
				
				geojsonOptions.radius = map.getZoom();
				stations[i].setStyle(geojsonOptions); 
				break;
			}
		}
		
		// se ja nao ha mais estaçoes seleccionadas, desactiva o botão.
		if(selectedStations.length == 0) {
			$("#nSelParamList").html('');
		//	$("#selParamList").attr('disabled', true).html('').trigger("chosen:updated");
			//$('#btn-makeChart').attr('disabled','disabled');
			$('#selected-stations-button > button').attr('disabled','disabled');
			$('#clear-general-button > button').attr('disabled','disabled');
			$('#exampleModal').modal('hide');
		}
		
		$('#chartCanvas').empty().hide();
		$("#chartCanvas").removeClass('site');
		
		$('#bottomRight').hide();		
		$('#chartStatistic').empty();

		range = $('#range').html();	
		
		
		actionSelectedStations();
		$.uniform.update();


		
		$('#leafletmap').focus();

	}
	  

	  
	//apenas para experimentar
	window.clickStation = function clickStation(station) {
		
					$('#selected-stations-button > button').removeAttr('disabled');
					$('#clear-general-button > button').removeAttr('disabled');
			//A)		
					//$('.clickSelectSta').click(function(){ // Para nao ser preciso clicar.
					//	if(selectedStations.length >= nMaxSelectedStat){
						//	$("#errorMaxStationsSelectedModal").modal('show');;
							//alert("Can only pick a maximum of "+nMaxSelectedStat+" stations");
					//	} else {
							if($.inArray(station, selectedStations) < 0) {
								if(selectedStations.length < nMaxSelectedStat) {
									station.setStyle(geojsonSelectedStyleList[selectedStations.length]);
									station.selectedStyle = geojsonSelectedStyleList[selectedStations.length];
									station.statusBefore = 'selected';
									station.setRadius(factorSelectedStationRadius * map.getZoom());
									//station.statusNow = não muda porque, agora quando esta seleccionado, esta sempre mouseover
									//station.statusBefore = station.statusNow;
									//station.statusNow = 'selected';
									station.statusBefore = 'selected'; // para permitir depois volta para selected...
									selectedStations.push(station);	
									actionSelectedStations();
									$.uniform.update();
									//console.log("mouseover. Before: " + station.statusBefore + "now: " + station.statusNow);	
								} else
									$("#errorMaxStationsSelectedModal").modal('show');
							} else {
								//$("#errorAlreadySelectedStationModal").show();
								//alert("This stations is already selected");
								removeStation(station.feature.properties.name);
							}
					//	}
						//map.closePopup(popup);
					//});
					
			

						//map.closePopup(popup);
					//});
					
					
					
					
					
					// Vamos mudar.... Comentamos o click here, para so aparecer as informações.
					// Vamos comentar o click handle do mesmo, para aquilo fazer, quando seja. sempre.
	

		
		
		
		
		
	}
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	window.loadLanguageItens = function loadLanguageItens(jsonLangDirectory) {
		var langText;
		$.ajax({url: jsonLangDirectory + jsonLangFileName, async: false, dataType: 'json', success: function(jsondata) {		
			langText = jsondata;
			console.log(langText);
		}});
		
		
		if(!langText) {
			$.ajax({url: getDefaultLanguageDirectory() + jsonLangFileName, async: false, dataType: 'json', success: function(jsondata) {		
				langText = jsondata;
				console.log(langText);
			}});
		}
		
		for (var key in langText){ //falta ver se existe e se não existe, add o default
			//$("body").load(function(){	
				console.log($('[lang-id="' + key + '"]').html(langText[key]));
				//console.log(langText[key]);
			//});
		}
		
		actualTableElements = [langText["name_txt"],langText["obs_txt"]];
	}
		
		
	/*function unloadStationLayers() {
		var typeBeforeReload = actualStationType;
		removeStationsLayers();
		actualStationType = typeBeforeReload;
		stations = [];
		overLayers = {};
	}*/
		
	//$(document).on("languagesLoaded", function(jsonDirectory) {	
	function loadStationLayers(jsonLangDirectory, isDefaultLanguage) {
		stations = [];
		overLayers = {};
		//console.log("Def: "+ isDefaultLanguage);
		var langProps;
		
		$.ajax({url: jsonLangDirectory + jsonLangStationsFileName, async: false, dataType: 'json', success: function(jsondata) {		
			langProps = jsondata;
		}});
		
		if(!langProps) {
			$.ajax({url: getDefaultLanguageDirectory() + jsonLangStationsFileName, async: false, dataType: 'json', success: function(jsondata) {		
				langProps = jsondata;
			}});
		}
		
		$('.btn-clearAllData').click();
		var typeBeforeReload = actualStationType;
		//removeStationsLayers();
		actualStationType = typeBeforeReload;
		
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
					//console.log("check 4");
					stations.push(station);
					station.setRadius(map.getZoom());
					station.statusNow 	= 'default';
					station.statusBefore = 'default';
					
					//html = "<b>Station: "+feature.properties.name+ "</b>";					
					//station.bindPopup(html);
					
					//window.open(feature.properties.url);
					


				//right click or hold tap (mobile case)
					station.on('contextmenu', function(e) {
						var msg = '<div><b style="font-size: 1.3em">' +feature.properties.name_alt+'</b>';
						msg += '<ul style="padding-left: 10px">';

						msg += '<li><b> ' + langProps["Coordinates"] + ': </b>'+(feature.geometry.coordinates[0]).toFixed(4)+', '+(feature.geometry.coordinates[1]).toFixed(4)+'</li>';
						if(!isDefaultLanguage) {
							var fatt = feature.properties;
							for (var att in fatt) {
								if (att !== 'name' && att !== 'name_alt') {
															//console.log(att);
															//console.log(langProps);
															//console.log(langProps[att]);
									msg += '<li><b>'+langProps[att]+': </b>'+fatt[att]+'</li>';	
								}						
							}		
						} else {
							var fatt = feature.properties;
							for (var att in fatt) {
								if (att !== 'name' && att !== 'name_alt') {
									msg += '<li><b>'+att+': </b>'+fatt[att]+'</li>';	
								}						
							}	
						}
						//msg += '<img src="img/buoy.jpg" width=150px style="padding:10px 0">';
						msg += '</ul>';
						var stationName = station.feature.properties.name;

						msg += '</div>';	
					  
					  
					  
					  var popup = L.popup()
					   .setLatLng(e.latlng) 
					   .setContent(msg)
					   .openOn(map);

					});



					// Create a mouseover event
					station.on("mouseover", function (e) {
						station.statusBefore = station.statusNow;
						station.statusNow = 'onmouse';							
					
						if(station.statusBefore != 'selected') {
							// Change the style to the highlighted version
							var geojsonOptions = geojsonHighlightStyle;					

							geojsonOptions.radius = map.getZoom() * ((station.statusBefore == 'selected')? factorSelectedStationRadius : 1.0);													
							station.setStyle(geojsonOptions);
							//console.log("mouseover. Before: " + station.statusBefore + "now: " + station.statusNow);
							//$("#mapinfo").append(msg);
						}

						
					});
					
					

					

					
								
					// Create a mouseout event that undoes the mouseover changes
					station.on("mouseout", function (e) {
						console.log("mouseout");
						
						// Change the style to the default version
							
						
						if(station.statusBefore != 'selected'){		
							var geojsonOptions = this.defaultOptions;					
							geojsonOptions.radius = map.getZoom();								
							station.setStyle(geojsonOptions); 
						//ja nao vai ser preciso
						} /*else if(station.statusNow == 'selected') {
							var geojsonOptions = this.selectedStyle;					
							geojsonOptions.radius = factorSelectedStationRadius * map.getZoom();
							station.setStyle(geojsonOptions); 
						}*/
						station.statusNow = station.statusBefore;
						station.statusBefore = 'onmouse';
						
						console.log("mouseover. Before: " + station.statusBefore + "now: " + station.statusNow);		
						// And then destroying the msg
						/*$("#msg-" + feature.id).remove();*/
					});
					

					
					
					station.on("click", function (e) {
						console.log("Here is the station:");
						console.log(station);
						clickStation(station);

																
					
					});
					


					
				}				
			});
			overLayers[key] = layer;
			console.log("load layer: ");
			console.log(layer);
			//map.addLayer(layer);
		}	 
		console.log(actualStationType);
		//if(actualStationType)
			//addStationsLayer(actualStationType);
	//});
		showLayerAndFocusInitialization(overLayers);
	}


/*
	window.addStationsLayer = function addStationsLayer(type) {
		setTimeout(function(){ 
			removeStationsLayers();

			actualStationType = type;
			if(type == "All") {
				for (var key in overLayers)
					map.addLayer(overLayers[key]);
			} else {
				console.log(overLayers);
				console.log(type);
				map.addLayer(overLayers[type]);
			}
			//$(".station-calendar").fadeIn();
			//$("#selected-stations-button").fadeIn();
			//$("#clear-general-button").fadeIn();
		}, 500);
	}*/
		

	
	/*window.removeStationsLayers = function removeStationsLayers() {
		actualStationType = null;
		//$(".station-calendar").fadeOut();
		//$("#selected-stations-button").fadeOut();
		//$("#clear-general-button").fadeOut();
		if(overLayers)
			for (var key in overLayers)
				map.removeLayer(overLayers[key]);
	}	*/		
		
	

	
	
	
	
	
	
		
		
	// Use boxzoomend to select stations
	map.on("boxzoomend", function(e) {
							$('#selected-stations-button > button').removeAttr('disabled');
					$('#clear-general-button > button').removeAttr('disabled');
		for (var i = 0; i < stations.length; i++) {
			// verify if is in zoombox and active in map and not selected			
			if (e.boxZoomBounds.contains(stations[i]._latlng) && stations[i]._map && selectedStations.indexOf(stations[i]) == -1) {
				if(selectedStations.length >= nMaxSelectedStat){
					$("#errorMaxStationsSelectedModal").modal('show');;
					//alert("Can only pick a maximum of "+nMaxSelectedStat+" stations");
					break;
				}else{										
					stations[i].setStyle(geojsonSelectedStyleList[selectedStations.length]);
					stations[i].selectedStyle = geojsonSelectedStyleList[selectedStations.length];
					stations[i].statusBefore = stations[i].statusNow;
					stations[i].statusNow = 'selected';					
					selectedStations.push(stations[i]);
				}
			}
		}
		
		if(selectedStations.length > 0){
			actionSelectedStations();
			$.uniform.update();
		}
	});	

		
	function clearStationList() {
		//passámos o que estava em map.on(click) para awqui... pq nao queremos apagar quando faz click em qq lado.
		selectedStations = [];
		nSelectedStations = [];
		zoom = map.getZoom();
		for (var i = 0; i < stations.length; i++) {
			var geojsonOptions = geojsonDefaultStyle;
			geojsonOptions.fillColor = stations[i].defaultOptions.fillColor;								
			geojsonOptions.radius = zoom;
			stations[i].setStyle(geojsonOptions); 
			stations[i].statusNow = 'default';
			stations[i].statusBefore = 'default';
			stations[i].selectedStyle = '';			
		}
		$('#selStaList').empty();
		$("#nSelParamList").html('');
	//	$("#selParamList").attr('disabled', true).html('').trigger("chosen:updated");
		//$('#btn-makeChart').attr('disabled','disabled');
		$('#selected-stations-button > button').attr('disabled','disabled');
		$('#clear-general-button > button').attr('disabled','disabled');
		$('#exampleModal').modal('hide');
		//$('#btn-clearAllData').attr('disabled','disabled');
	}
	
	map.on("click", function(e) {
	/*	selectedStations = [];
		nSelectedStations = [];
		zoom = map.getZoom();
		for (var i = 0; i < stations.length; i++) {
			var geojsonOptions = geojsonDefaultStyle;
			geojsonOptions.fillColor = stations[i].defaultOptions.fillColor;								
			geojsonOptions.radius = zoom;
			stations[i].setStyle(geojsonOptions); 
			stations[i].statusNow = 'default';
			stations[i].statusBefore = 'default';
			stations[i].selectedStyle = '';			
		}
		$('#selStaList').empty();
		$("#selParamList").attr('disabled', true).html('').trigger("chosen:updated");
				
		$('#btn-makeChart').attr('disabled','disabled');
		//$('#btn-clearAllData').attr('disabled','disabled');	*/
	});	
	
	map.on("zoomend", function(e){
		zoom = map.getZoom();
		
		for(var i = 0 ; i < geojsonSelectedStyleList.length; i++)
			geojsonSelectedStyleList[i].radius = factorSelectedStationRadius * map.getZoom();
		
		for (var i = 0; i < stations.length; i++) {
			var geojsonOptions = stations[i].options;
			//alterado para fazer sempre set ao zoom de acordo com se está seleccionado ou não, estava a por todas do mesmo tamanho,.
			geojsonOptions.radius = map.getZoom() * (((stations[i].statusNow == 'selected') || (stations[i].statusBefore == 'selected'))? factorSelectedStationRadius : 1.0);
			//geojsonOptions.radius = zoom;											
			stations[i].setStyle(geojsonOptions);
			//console.log(stations[i].options)
		}
		
		
		
		
	});
	
	
	
	$('#leafletmap').focus();
	$('#leafletmap').keydown(function (e) {
	    if (e.keyCode == 16) {
	        $('#leafletmap').css('cursor','crosshair');
	    }
	});
	$('#leafletmap').keyup(function (e) {
	    if (e.keyCode == 16) {
	        $('#leafletmap').css('cursor','');
	    }
	});
	
	//L.control.layers(baseLayers, overLayers).addTo(map);
	
	/*
	$(window).on("resize", function() {
    	$("#leafletmap").width($('#container').width());
		$('#leafletmap').height($('#leafletmap').width()*0.6);
    	map.invalidateSize();
	}).trigger("resize");
	*/
	
	
	$('.btn-clearAllData').click(function(){
		$('#selStaList').empty();
		$('#selStaList').text('');
		
		//map.fire('click');
		clearStationList();
		
		$('#chartCanvas').empty().hide();
		$("#chartCanvas").removeClass('site');
		
		$('#bottomRight').hide();		
		$('#chartStatistic').empty();

		range = $('#range').html();	
		
		$('#leafletmap').focus();
		
	});	
	
	//$('.leaflet-control-container').append('<div class="leaflet-top leaflet-left" style="left: 50px; top: 10px"><span class="glyphicon glyphicon-info-sign"></span> Use <img src="'+URL_HOST_DIR+'/img/shift.png" alt="shift key"> to select stations</div>');
	
	
	
	// ############### FUNCTIONS ###############
	
	function actionSelectedStations(){
		$('#selStaList').empty();
		//$('#btn-makeChart').attr('disabled','disabled');
		

		
		
		// selected station list
		var divSelSta = '<table style="margin: 10px 0 5px 5px; font-size: 0.9em"><col width="20"><col width="20"><col width="180">';	
		divSelSta += '<tr><th></th><th></th><th lang-id="name_txt">Name</th><th lang-id="obs_txt">Observations</th></tr>';	
		//divSelSta += '<tr><td></td><td></td><td><label for="chbox_ObsAll"><input type="checkbox" id="chbox_ObsAll"><span id="lbCkbAll">all</span></td></tr>';	tirar o all		
		//divSelSta += '<tr><td></td><td></td><td><label for="chbox_ObsAll"><input type="checkbox" id="chbox_ObsAll"><span id="lbCkbAll">all</span></label></td></tr>';			
		for (var i = 0; i < selectedStations.length; i++) {
			
			var stationName = selectedStations[i].feature.properties.name;
			var stationName_alt = selectedStations[i].feature.properties.name_alt;
			var stationColor = selectedStations[i].selectedStyle.fillColor;
					
			divSelSta += '<tr style="height:19px">';
			divSelSta += '<td><a href="#" onclick="removeStation(\'' + stationName + '\');"><i class="fa fa-times" style="color:red"></i></a></td>'
			divSelSta += '<td><input type="checkbox" name="' + stationName + '" checked></td>'
			divSelSta += '<td><div class="dot" style="background-color: '+stationColor+'"></div> '+stationName_alt+'</td>';
			
			var indexOfstaObs = $.inArray(stationName, jsonStationsObs);
			if(indexOfstaObs != -1) {
				divSelSta += '<td style="text-align: center"><input type="checkbox" class="chbox_Obs" obsof="' + stationName + '" id="chbox_Obs' + i + '"  checked /> </td>';				
			}else{
				//divSelSta += '<td>no observation</td>';
				//divSelSta += '<td><input type="checkbox" class="disabled_chbox_Obs" id="chbox_Obs' + i + '"  disabled /> </td>';				
				divSelSta += '<td style="text-align: center">—</td>';
			}
			
			divSelSta += '</tr>';
		}
		divSelSta += '</table>';
				
		$('#selStaList').append(divSelSta);
		
		$('[lang-id="name_txt"]').html(actualTableElements[0]);
		$('[lang-id="obs_txt"]').html(actualTableElements[1])
		
		for (var i = 0; i < selectedStations.length; i++) {
			$('input[name="' + selectedStations[i].feature.properties.name + '"]').change({ stationName: selectedStations[i].feature.properties.name }, function(e) {
			   if ( ! this.checked)
				   $('input[obsof="' + e.data.stationName + '"]').attr("disabled", true);
			   else
				   $('input[obsof="' + e.data.stationName + '"]').attr("disabled", false);
			});
		}
		
		$("input:radio,input:checkbox").uniform();
		
		


		

		var paramsAvailable = [];
		var propAvailable = [];
		for (var i = 0; i < selectedStations.length; i++) {
			stationParamM = stationsParamM[selectedStations[i].feature.properties.name];
			stationParamO = stationsParamO[selectedStations[i].feature.properties.name];			
			//console.log(stationParamM);
			//console.log(stationParamO);
			  
			// # Merge both arrays only with same param in all	
			if(typeof stationParamM != "undefined"){
				paramsAvailable = (paramsAvailable.concat(stationParamM));
			}
			if(typeof stationParamO != "undefined"){
				paramsAvailable = (paramsAvailable.concat(stationParamO));
			}
		}
		paramsAvailable.sort();
		paramsAvailable.unique();
		
		
		for (var i = 0; i < paramsAvailable.length; i++) {
			var p = paramsAvailable[i].split(".");
			propAvailable[i] = p[0];			
		}


		// edit obs propertie to correct obs.parameter
		// edit land propertie to correct Land.parameter
		for (var i = 0; i < paramsAvailable.length; i++) {
			var p1 = paramsAvailable[i].split(".");
			// process Land parameters
			if(p1[0] == 'Land'){				
				for (var iii = 0; iii < paramsAvailable.length; iii++) {
					if(paramsAvailable[iii].indexOf('obs.') == -1 && paramsAvailable[iii].indexOf('Land.') == -1){
						var p2 = paramsAvailable[iii].split(".");
						if(p2[1] == p1[1]){
							paramsAvailable[i] = paramsAvailable[iii];
							propAvailable[i] += ','+p2[0];
							break;
						}
					}
				}
			}
			// process obs parameters
			else if(p1[0] == 'obs'){				
				for (var ii = 0; ii < paramsAvailable.length; ii++) {
					if(paramsAvailable[ii].indexOf('obs.') == -1){
						var p3 = paramsAvailable[ii].split(".");
						if(p3[1] == p1[1]){
							paramsAvailable[i] = paramsAvailable[ii];
							propAvailable[i] += ','+p3[0];
							break;
						}
					}
				}
			}
			
		}
		
		sortWithIndeces(paramsAvailable);
		var indeces = paramsAvailable.sortIndices;
		paramsAvailable.unique();
		
		
//console.log(paramsAvailable)
//console.log(propAvailable)
//console.log(indeces)

		var _prop = '-';
		var isfirstParamList = true;		
		var selParamList = "";//= '<option value=""></option>';
		for (var i = 0; i<paramsAvailable.length; i++) {
			var p = paramsAvailable[i].split(".");
			if(jsonParameters[p[1]].online == true){				
				var prop = p[0];
								
				if(prop !== _prop){
					if(isfirstParamList == true){
						isfirstParamList = false;
					}else{
						selParamList += '</optgroup>';	
					}	

					//outra ling
					if(!isDefaultLanguage() && propertiesOtherLang[prop])
						selParamList += '<optgroup label="'+propertiesOtherLang[prop]+'">';
					else selParamList += '<optgroup label="'+jsonProperties[prop]+'">';
				}
								
				/*
				staWithParam = '';
				for (var ii = 0; ii < selectedStations.length; ii++) {
					var stationName = selectedStations[ii].feature.properties.name;
					var stationColor = selectedStations[ii].selectedStyle.fillColor;

					//obs			
					var parmsStaObsSelected = stationsParamO[selectedStations[ii].feature.properties.name];					
					var parmName = jsonParameters[paramsAvailable[i]].name;
					
					if(typeof parmsStaObsSelected !== 'undefined') {
						var indexOfparamObs = $.inArray(parmName, parmsStaObsSelected);	
						if(indexOfparamObs != -1) {
							//staWithParam += '<div class="dot" style="background-color: '+stationColor+'"></div>';
							staWithParam += selectedStations[ii].feature.id;
						}
					}
				}
				*/
				
				if(!isDefaultLanguage() && parametersOtherLang[p[1]])
					selParamList += '<option value="'+jsonParameters[p[1]].name+'">'+parametersOtherLang[p[1]]+'</option>';
				else
					selParamList += '<option value="'+jsonParameters[p[1]].name+'">'+jsonParameters[p[1]].name_alt+'</option>';
				
				_prop = prop;
			}
			

			
		}
		
	//	$('#selParamList').html('');
		//$('#selParamList').append(selParamList);
		//$("#selParamList").attr('disabled', false);
		//$("#selParamList").trigger("chosen:updated");
		//$("#selParamList").chosen().change(function(){
			//$('#btn-makeChart').removeAttr('disabled');
		//});
		
		$('#nSelParamList').html('');
		$('#nSelParamList').append(selParamList);
		$("#nSelParamList").attr('disabled', false);
		//$("#selParamList").trigger("chosen:updated");
	//	$("#selParamList").chosen().change(function(){
		//	$('#btn-makeChart').removeAttr('disabled');
	//	});
		
		

	}
	
	
	Array.prototype.unique = function() {
	    var a = this;
	    for(var i=0; i<a.length; ++i) {
	        for(var j=i+1; j<a.length; ++j) {
	            if(a[i] === a[j])
	                a.splice(j--, 1);
	        }
	    }
	    return a;
	};
	
	function intersection(x, y){
	    var ret = [];
	    for (var i = 0; i < x.length; i++) {
	        for (var z = 0; z < y.length; z++) {
	            if (x[i] == y[z]) {
	                ret.push(x[i]);
	                break;
	            }
	        }
	    }
	    return ret;            
	}
	
	function sortWithIndeces(toSort) {
	  for (var i = 0; i < toSort.length; i++) {
	    toSort[i] = [toSort[i], i];
	  }
	  toSort.sort(function(left, right) {
	    return left[0] < right[0] ? -1 : 1;
	  });
	  toSort.sortIndices = [];
	  for (var j = 0; j < toSort.length; j++) {
	    toSort.sortIndices.push(toSort[j][1]);
	    toSort[j] = toSort[j][0];
	  }
	  return toSort;
	}
		
		
		
		
	//veio para o fim... já esta tudo loadado ... isto é o inicio.
//	console.log("segundo");
		loadLanguageItens(getDefaultLanguageDirectory());
		loadStationLayers(getDefaultLanguageDirectory(), true); //ja inclui showLayer
	
		actualJsonDirectory = getDefaultLanguageDirectory();
		//atenç\ao precisa de ser revisto para ver se nao da erro
		
		//Tem de vir depois da linguagem defaukt. Nao faz mal ser repetido, pois a segunda chamada nao faz nada 
	//not yet!!
	setInitialLanguage(); //da erro, sxobreposicao bolas e mapa
	//window.scrollTo(0, 1);
	   //   document.body.requestFullscreen();

		
});





$(window).load(function(){
for (var key in jsonStationsAll) {
		var geojsonFeature = jsonStationsAll[key];
		
		var layer = L.geoJson(geojsonFeature, {
			pointToLayer: function (feature, latlng) {
				
				
				
				
					var geojsonDefaultStyle  = {
	    radius: 5,
	    fillColor: "#000", // replace to stations file fill color
	    weight: 10,
	    opacity: 0,
	    color: "#000",
	    fillOpacity: 0.8
	};	
	var geojsonHighlightStyle = {
	    radius: 5,
	    fillColor: "#555",
	    weight: 10,
	    opacity: 0,
	    color: "#555",    
	    fillOpacity: 0.8
	};
				
				
				
				
				
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

				
				station.on("click", function (e) {
					//console.log("Here is the dsfssfsstation:");
					console.log(station);
					clickStation(station);
				});
			}
		});
	}

});