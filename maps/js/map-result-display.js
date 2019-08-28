$(document).ready(function() {
	
	var domainsNameLangJsonFilename = "domains.json";
	var mapResultLanguageChangeableTextJsonFilename = "mapResultLanguageChangeableText.json";
	var variablesJsonFilename = "mapVariables.json";
	var mapDomainPropertiesJsonFilename = "domains.json";
	var region = getParameterByName("region");
	var langFeatureId;
	var imagePrefixURL;
	var defaultPossibleVariables; //todas as variáveis possíveis, no par id -> nome da variavel, na linguagem Default
	var availableVariables;
	var actualVariable;
	var d = new Date(); //vai conter sempre a data actual
	var dAnterior = new Date(); //vai conter o momento da imagem que estava antes;
	var dAux; // para a busca para a frente
	var dMin;
	var dMax;
	var dailyBasis = false;
	var interval = 1; // vai conter o valor do intervalo definido para o play.
	var intervalFunc; // vai conter o handler da função que faz o play, passando as imagens
	var minDate;
	var maxDate;
	var playerHidden = false;
	var isPlaying = false; // se esta a fazer play.
	var img; //vai conter o objecto da imagem a adicionar
	var firstImageErrorOccured = false;
	var actualImageLoaded = false;
	var drift;
	var $dtp = $("#datetimepicker1");
	var threddsServerDataLink;
	var firstLoad = true;
	var defaultRegionName;
	var regionInfo, regionIndex;
	
	var hoursNotFound = 0;
	var daysNotFound = 0;

	// Map Part Variables
    //var createdMap = false;
    var leaflet_map;
    var color_layer;
    var vector_layer;
    var first_data;
    var second_data;
    var magnitudePropertiesJsonFilename = "magnitudes.json";
    var magnitude_properties ;
    var mapExists;
    var movedToJSONTime;

    //$(function () {
	//					$dtp.datetimepicker();
		//			});
	//$(document).trigger("readyNavbar");
	loadRegionDomainInfoAndInitializeItems();
	loadDefaultPossibleVariables();
	presentVarSetAndRegisterEventOfVariableChange();

	registLoadFirstImageEvents();
    if (jsonAvailable())
        createMap();

    registPlayerButtonEvents();


	//Sets às funções dos botões são feitos no handler de load da primeira imagem, pois só podem ser feitos após tal.
	setInitialLanguage();
	//$("[langid='pt']").click();
	//addLanguageEvents();
	
	function loadRegionDomainInfoAndInitializeItems() {
		//$(document).on("languagesLoaded", function(jsonDirectory) {

        $.ajax({url: getDefaultLanguageDirectory() + mapResultLanguageChangeableTextJsonFilename, async: false, dataType: 'json', success: function(data) {
        //$.getJSON(getDefaultLanguageDirectory() + mapResultLanguageChangeableTextJsonFilename, function(data) {
            $("#page-title").html("> "+ data.mapNamePage_txt + " > ");

            //Este é o unico que tem que ficar
            for(var key in data)
                $('[lang-id="' + key + '"]').html(data[key])


            //Botões horas e dias.

            var dayBasisItens = $(".interval-player .day-basis");
            var hourBasisItens = $(".interval-player .hour-basis");

            for(var i = 0 ; i < dayBasisItens.length; i++)
                dayBasisItens[i].innerHTML = dayBasisItens[i].getAttribute("interval") + " " +((parseInt(dayBasisItens[i].getAttribute("interval")) == 1)? data.day_txt : data.days_txt);
            for(var i = 0 ; i < hourBasisItens.length; i++)
                hourBasisItens[i].innerHTML = hourBasisItens[i].getAttribute("interval") + " " +((parseInt(hourBasisItens[i].getAttribute("interval")) == 1)? data.hour_txt : data.hours_txt);


        }});


        $.ajax({url: getDefaultLocalLanguageDirectory() + mapDomainPropertiesJsonFilename, async: false, dataType: 'json', success: function(data) {
        //	$.getJSON(getDefaultLocalLanguageDirectory() + mapDomainPropertiesJsonFilename, function(data) {


            for(var key in data)
                for(var keyAux in data[key][0].features) {
                    var internalName = data[key][0].features[keyAux].properties.internalName;
                    if(Array.isArray(internalName)) {
                        for(var keyAuxName in internalName) {
                            if(internalName[keyAuxName] === region) {
                                regionInfo = data[key][0].features[keyAux].properties;
                                regionIndex = keyAuxName;
                            }
                        }
                    } else {
                        if(internalName === region)
                            regionInfo = data[key][0].features[keyAux].properties;
                    }
                }
        }});

        // Load Magnitude Properties
        $.ajax({
            url: getDefaultLocalLanguageDirectory() + magnitudePropertiesJsonFilename,
            async: false,
            dataType: 'json',
            success: function(data) {
                //console.log(data);
                magnitude_properties = data;
            }});

        //var regionInfo = data[region];
        var defaultRegionName = (typeof regionIndex === 'undefined')? regionInfo.name : regionInfo.name[regionIndex];

        //$("#domain-text").html($("#domain-text").html() + "<span id='region-name'>" + defaultRegionName + "</span>");
        //console.log(regionInfo);
        //console.log(defaultRegionName);
        addElementToTitle("<span id='region-name'>" + defaultRegionName + "</span>");
        langFeatureId = regionInfo.langFeatureId;
        imagePrefixURL = (typeof regionIndex === 'undefined')? regionInfo.imagePrefixURL : regionInfo.imagePrefixURL[regionIndex];

        availableVariables = (typeof regionIndex === 'undefined')? regionInfo.availableVariables : regionInfo.availableVariables[regionIndex];

        threddsServerDataLink = (typeof regionIndex === 'undefined')? regionInfo.threddsServerDataLink : regionInfo.threddsServerDataLink[regionIndex];

        var movedToJSONParser = (typeof regionIndex === 'undefined')? regionInfo.movedToJSONTime.split("-") : regionInfo.movedToJSONTime[regionIndex].split("-");
        movedToJSONTime = new Date(parseInt(movedToJSONParser[0]), parseInt(movedToJSONParser[1]) - 1, parseInt(movedToJSONParser[2]), 0);

        var startTimeSplitted = (typeof regionIndex === 'undefined')? regionInfo.startTime.split("-") : regionInfo.startTime[regionIndex].split("-");

        dMin = new Date(parseInt(startTimeSplitted[0]), parseInt(startTimeSplitted[1]) - 1, parseInt(startTimeSplitted[2]), 0);

        if(((typeof regionIndex === 'undefined')? regionInfo.finishTime : regionInfo.finishTime[regionIndex])) { //Se a região tem um campo com finishTime, vamos po-lo em dMax
            var finishTimeSplitted = (typeof regionIndex === 'undefined')? regionInfo.finishTime.split("-") : regionInfo.finishTime[regionIndex].split("-");;

            dMax = new Date(parseInt(finishTimeSplitted[0]), parseInt(finishTimeSplitted[1]) - 1, parseInt(finishTimeSplitted[2]), 0);
            //d = dMax;
            d.setTime(dMax.getTime());

        } else if(((typeof regionIndex === 'undefined')? regionInfo.maxNextDaysAllowed : regionInfo.maxNextDaysAllowed[regionIndex])) { //Se não, se a região tem um campo com maximo de dias permitidos para a frente, calculamos a data maxima e pomos
            dMax = new Date();
            dMax.setHours(0);
            dMax.setDate(dMax.getDate() + parseInt(((typeof regionIndex === 'undefined')? regionInfo.maxNextDaysAllowed : regionInfo.maxNextDaysAllowed[regionIndex])));


        } //Senao, vai ter de ser visto caso a caso.

        var dateFormat;
        var useCurrentUnit;

        //Se tem uma base diária, vamos desactivar os controlos horários

        if(parseInt(((typeof regionIndex === 'undefined')? regionInfo.timeHourBasis : regionInfo.timeHourBasis[regionIndex])) > 23) {
            $(".hour-basis").addClass("disabled");
            dailyBasis = true;
            d.setHours(0,0,0);
            $(".interval-player .day-basis[interval=1]").addClass("active");
            dateFormat = 'YYYY-MM-DD';
            useCurrentUnit = 'day';
        } else {
            $(".interval-player .hour-basis[interval=1]").addClass("active");
            dateFormat = 'YYYY-MM-DD HH:00';
            useCurrentUnit = 'hour';
        }

        //inicializaçao do datetimepicker, com os parametros obtidos
        $dtp.datetimepicker({
            ignoreReadonly: true,
            useCurrent: useCurrentUnit,
            format: dateFormat,
            locale: getDefaultLanguage(),
            defaultDate: d,
            minDate: dMin,
            maxDate: dMax
        });

        $dtp.on("change.datetimepicker", function(e) { //evento para função chamada cada vez que se muda a data ou hora no calendario
        //	console.log($dtp.data("DateTimePicker").date());
            //console.log();
            //console.log($dtp.datetimepicker('viewDate'));
            //$('#datetimepicker').datetimepicker("date", d);
            if( $dtp && $dtp.datetimepicker('viewDate') ) //Para verificar, se não sao undefined , o que acontecia, por usar defaultDate
                changeDateTimeOnPicker($dtp.datetimepicker('viewDate'));
        });

        //Registar evento mudança de linguagem no calendario e no título e nos botões
        $(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {
            //$('#datetimepicker').datetimepicker("locale"
        //	$dtp.datetimepicker("date", langId);
            $dtp.datetimepicker('locale', langId);
        //	$dtp.data("DateTimePicker").locale(langId);	 //mudar calendário

            $.getJSON(jsonDirectory + mapResultLanguageChangeableTextJsonFilename, function(data) {
                $("#page-title").html("> "+ data.mapNamePage_txt + " > ");

                //botões
                var dayBasisItens = $(".interval-player .day-basis");
                var hourBasisItens = $(".interval-player .hour-basis");

                for(var i = 0 ; i < dayBasisItens.length; i++)
                    dayBasisItens[i].innerHTML = dayBasisItens[i].getAttribute("interval") + " " +((parseInt(dayBasisItens[i].getAttribute("interval")) == 1)? data.day_txt : data.days_txt);

                for(var i = 0 ; i < hourBasisItens.length; i++)
                    hourBasisItens[i].innerHTML = hourBasisItens[i].getAttribute("interval") + " " +((parseInt(hourBasisItens[i].getAttribute("interval")) == 1)? data.hour_txt : data.hours_txt);

            });


            //mudar o nome da região para a língua
            if(isDefaultLanguage)
                addElementToTitle("<span id='region-name'>" + defaultRegionName + "</span>");
            else
                $.getJSON(jsonDirectory + domainsNameLangJsonFilename, function(data) { // ELIMINAR DOMAINSLANG.JSON
                    var langDomainName = ((typeof regionIndex === 'undefined')? data[langFeatureId] : data[langFeatureId][regionIndex]);
                    if(langDomainName)
                        addElementToTitle("<span id='region-name'>" + langDomainName + "</span>");
                    else
                        addElementToTitle("<span id='region-name'>" + defaultRegionName + "</span>");
                });



        });

        $dtp.click(function(e){
            e.preventDefault();
            //console.log($(".bootstrap-datetimepicker-widget"));
            $dtp.datetimepicker("hide");
        } /*$dtp. e.preventDefault();console.log($dtp); }*/);

        //Carregar threddsServerData
        if(threddsServerDataLink == "")
            $("#threddsServerData").hide();
        else
            $("#threddsServerData").click(function () {
                window.location.href = threddsServerDataLink;
            });






        //trigger para evento a dizer que a informação foi toda carregada
        //$(document).trigger("regionDomainInfoLoaded", []);
			
			
		//});
	}
	
	//Para fazer load de todas as variáveis
	function loadDefaultPossibleVariables() {
		// Deixa de ser necessário fazer isto. Pois, deste modo agora, estou a dizer a ordem pelo qual os elementos devem ser
		// loaded. as DefaultPossibleVariables só são loaded depois de regionDomainInfoLoaded, que por sua vez só ocorre depois de languagesLoaded
		//$(document).on("languagesLoaded", function(jsonDirectory) {
		//$(document).on("regionDomainInfoLoaded", function() {
			$.ajax({url: getDefaultLanguageDirectory() + variablesJsonFilename, async: false, dataType: 'json', success: function(data) {	
			//$.getJSON(getDefaultLanguageDirectory() + variablesJsonFilename, function(data) {

				defaultPossibleVariables = data;
				//trigger para evento a dizer que a informação sobre todas as variáveis foi toda carregada
				//$(document).trigger("defaultPossibleVariablesLoaded", []);
			}});
		//});
	}
	
	//Para mostrar as variáveis possíveis para esta região e registar o evento de, quando mudamos de variável, ele ter a variável actual escolhida.
	function presentVarSetAndRegisterEventOfVariableChange() {
		//$(document).on("defaultPossibleVariablesLoaded", function() {
			//Começa-se por fazer o set a primeira variável, a variável activa. Por isso active and activable
			actualVariable = availableVariables[0];
			//$("#var-text-display").html(defaultPossibleVariables[actualVariable]);

			//var htmlList = "<li id=\"" + actualVariable + "\" class=\"variable-item active activable\" name=\"varset\"><a href=\"#\">" + defaultPossibleVariables[actualVariable] + "</a></li>";
			var htmlList = "<a href=\"#\" id=\"" + actualVariable + "\" class=\"dropdown-item variable-item active activable\" name=\"varset\">" + defaultPossibleVariables[actualVariable] + "</a>";
			
			for(n = 1; n < availableVariables.length; n++)
				htmlList += "<a href=\"#\" id=\"" + availableVariables[n] + "\" class=\"dropdown-item variable-item activable\" name=\"varset\">" + defaultPossibleVariables[availableVariables[n]] + "</a>";	
			//htmlList += "<li id=\"" + availableVariables[n] + "\" class=\"variable-item activable\" name=\"varset\" ><a href=\"#\">" + defaultPossibleVariables[availableVariables[n]] + "</a></li>";
			
			$("#varChoose > .dropdown-menu").html(htmlList);
			
			//Quando clico numa variável, actualiza a variável actual
			$(".variable-item").click(function () {
				actualVariable = $(this).attr("id");
				actualizeImgSrc();
				//$("#var-text-display").html(defaultPossibleVariables[actualVariable]);
			});
			
			
			//Adicionar eventos de mudança de linguagem
			$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {			
				if(isDefaultLanguage)
					for(i = 0; i < availableVariables.length; i++)
						$("#" + availableVariables[i]).html(defaultPossibleVariables[availableVariables[i]]);
				else {
					$.getJSON(jsonDirectory + variablesJsonFilename, function(data) {
						for(i = 0; i < availableVariables.length; i++) {
							var elementOnLanguage = data[availableVariables[i]];
							$("#" + availableVariables[i]).html((elementOnLanguage)? elementOnLanguage : defaultPossibleVariables[availableVariables[i]]);
						}
					}).fail(function(d) {
						for(i = 0; i < availableVariables.length; i++)
							$("#" + availableVariables[i]).html(defaultPossibleVariables[availableVariables[i]]);
					});
				}
				
				
				
				
				
				
			});	
			
			
		//});
	}
	
	


	// **** MAP Functions ****

    // Checks the region Info to decide if it serves an image or a map
    function jsonAvailable(){

	    //console.log(d);

	    if( movedToJSONTime === ""  )
	        return false;

	    if ( movedToJSONTime >= d )  // movedtoJSON might need to be parsed
	        return false;

	    return true;
    }

    function createMap(){

	    //console.log(regionInfo);
        leaflet_map = L.map('leaflet_map').setView([41.2, -8.5], 8);   // TODO: Get Domain Coordinates

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            minZoom: 5,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoidGphY29iIiwiYSI6ImNqbmwwM3YzNjBqd24zd21odmJzZWtvdjIifQ.nxSKNkLbSsGPs-uALoJqVw'
        }).addTo(leaflet_map);

        //registPlayerButtonEvents();

        //loadGeoJSON();
        while ( !mapExists && jsonAvailable() )
        {
            //changeDay(-1)
            ///*
            if(!dailyBasis && (hoursNotFound <= 24)) { //base horaria e ainda nao passaram 24 horas
                hoursNotFound++;
                changeHour(-1);
            } else if((dailyBasis || (hoursNotFound > 24)) &&  (daysNotFound <= 8)) { //base diária ou base horária e ja passaram 24 horas, mas ainda não 8 dias
                daysNotFound++
                changeDay(-1);
            } else if ((daysNotFound > 8) && (daysNotFound <= 60)) {
                daysNotFound+=8;
                changeDay(-8);
            } else if (daysNotFound > 60) {
                daysNotFound+=30;
                changeDay(-30);
            }
            //*/
        }

        // If something goes wrong and no Map is available till JSON Started, then change for regular Image
        if ( !jsonAvailable() )
        {
            $("#leaflet_map").hide();
            $("#currentImage-wrap").show();
            //registLoadFirstImageEvents();

        }

    }

    function loadGeoJSON(){

        //console.log(regionInfo);
	    //console.log(actualVariable);
	    //console.log(magnitude_properties[actualVariable.toUpperCase()]);
	    if ( magnitude_properties[actualVariable.toUpperCase()].showTogether !== "" )
        {
            var second_variable = magnitude_properties[actualVariable.toUpperCase()].showTogether;
            console.log(second_variable);
            $.ajax({
                dataType: "json",   // Not supported by IE10 and IE11
                async: false,
                url: getActualMapPath(second_variable),
                success: function(data) {
                    second_data = data;
                    console.log(second_data);
                },
                error: function(err){
                    //mapExists = false;
                }
            });
        }
        else
            second_data = undefined;

        $.ajax({
            dataType: "json",   // Not supported by IE10 and IE11
            async: false,
            url: getActualMapPath(actualVariable),
            success: function(data) {
                first_data = data;
                $(".loader-wrap").hide();
                mapExists = true;
                drawMap();
            },
            error: function(err){
                mapExists = false;
            }
        });
    }
    
    function drawMap() {

	    if ( color_layer !== undefined )
            leaflet_map.removeLayer(color_layer);

        if ( vector_layer !== undefined )
            leaflet_map.removeLayer(vector_layer);

        var varInfo = magnitude_properties[actualVariable.toUpperCase()];
	    var colorScale = varInfo.colorScale;
        function areaColor(feature) {
            //console.log(feature);
            return {
                fillColor: colorScale[feature.properties[actualVariable]],
                weight: 0,
                opacity: 0,
                color: colorScale[feature.properties[actualVariable]],
                dashArray: '3',
                fillOpacity: 1
            };
        }
        color_layer = new L.geoJson(first_data,{
            style: areaColor,
        });
        color_layer.addTo(leaflet_map);

        // Clear Previous Scales
        $(".colorScaleOverlay").empty();
        // Create Color Scale
        $(".colorScaleOverlay").append("<span class='dateText'>"+d.getDay()+"/"+d.getMonth()+"/"+d.getFullYear()+" - "+d.getHours()+":00</span>");
        $(".colorScaleOverlay").append("<span class='unitText'>"+varInfo['unit']+"</span>");
        colorScale.forEach(function(color, index){
            let size = 100/(colorScale.length);
            $(".colorScaleOverlay").append("<div id='color-"+index+"' class='scaleStep' style='background-color:"+color+"; width: "+size+"%; left:"+(index*size)+"%'></div>");
            if ( index === 0 )
                $("#color-0").append("<span class='scaleText'>" + varInfo["minValue"] + "</span>");
            if ( index === colorScale.length-1 )
                $("#color-"+(colorScale.length-1)).append("<span class='scaleText'>" + varInfo["maxValue"] + "</span>");
        });

        if ( second_data === undefined )
            return;

        function icons(feature){
            return L.icon({
                iconUrl: '../img/arrow.png',
                iconSize: [32, 32],
                //iconAnchor: [22, 94],
                //popupAnchor: [-3, -76],
                className: "rotation"
            });
            //return console.log(feature);
        }

        vector_layer = L.geoJSON(second_data, {
            pointToLayer: function (feature, latlng) {
                //console.log(feature);
                return L.marker(latlng, {icon: icons(feature), rotationAngle: feature.properties["Velocity Direction"]});
            },
            //onEachFeature: onEachFeature //Can be Used For Filters
        });
        vector_layer.addTo(leaflet_map);
        var newzoom = '' + (2*(leaflet_map.getZoom())) +'px';
        $('#leaflet_map .rotation').css({'width':newzoom,'height':newzoom});

        // Resize Icons on Zoom
        leaflet_map.on('zoomend', function() {
            var newzoom = '' + (2*(leaflet_map.getZoom())) +'px';
            $('#leaflet_map .rotation').css({'width':newzoom,'height':newzoom});
        });
    }




	
	// **** ------- IMAGE EVENTS ------ ****
	
	// *** FIRST IMAGE ***
	
	// Vai ser a função para o handler se a primeira imagem não é encontrada, vai recuando até encontrar uma que exista.
	function firstImageNotFound() {
		//$(".loader-wrap").show();
		
		
		
		//algoritmo para apresentar imagens para trás. Ainda tem um problema: que é o facto de andar para trás e apresentar a imagem, em que está, mas pode haver mais para a frente.
		if(!dailyBasis && (hoursNotFound <= 24)) { //base horaria e ainda nao passaram 24 horas
			hoursNotFound++;
			changeHour(-1);
		} else if((dailyBasis || (hoursNotFound > 24)) &&  (daysNotFound <= 8)) { //base diária ou base horária e ja passaram 24 horas, mas ainda não 8 dias
			daysNotFound++
			changeDay(-1);
		} else if ((daysNotFound > 8) && (daysNotFound <= 60)) {
			daysNotFound+=8;
			changeDay(-8);
		} else if (daysNotFound > 60) {
			daysNotFound+=30;
			changeDay(-30);
		}	
			
		img.src = getActualPath();
		firstImageErrorOccured = true;
	};

	// Vai ser a função para o handler do load da primeira imagem, em que vai fazer set ao estilo de como a imagem vai ser apresentada.
	// remove os handlers actuais também,. O novo load, já não precisa de estar constantemente a fazer set a estas coisas e é mais simples.
	// Por último, regista os novos load e errors events para as imagens, a partir de agora.
	function firstImageLoad() {
		$("#currentImage-wrap").append(img);
		
		
		//console.log("dd");
		
		img.className = "img-fluid";
		img.id = "currentImage";
		img.alt = "";
		img.style.maxHeight = "100%"; 
		img.style.maxWidth = "100%";
		img.style.verticalAlign = "middle";
		$("#currentImage").attr("data-zoom", getActualPath());
		
		drift = new Drift(document.querySelector("#currentImage"), {
			paneContainer: document.querySelector("div"),
			inlinePane: true,
			inlineOffsetY: -85,
			containInline: true,
			zoomFactor: 2,
			hoverBoundingBox: false
		});
		
		
		
		$(".loader-wrap").hide();
		
		img.removeEventListener("load", firstImageLoad);
		img.removeEventListener("error", firstImageNotFound);
		
		if(firstImageErrorOccured) { // Se ocorreu pelo menos um erro de não encontrar a imagem, significa que há necessidade de recuar o dMax
			dMax.setTime(d.getTime());
			//$dtp.data("DateTimePicker").maxDate();
			$dtp.datetimepicker("maxDate", dMax);
			//console.log(dMax);
			//console.log("fez");
		}
		
		registNewImageLoadEvents();
		
		//so aqui pode surgir os calendars e fazer sets
		//registPlayerButtonEvents();
		
		if(firstImageErrorOccured)
			findAndSetCorrectMaxDate();

	};

	function findAndSetCorrectMaxDate() {
		var imgMAX = new Image();
		imgMAX.addEventListener('load', function() { // falta por a funcionar com dias e eficientar
			//var dNextTime = d.getTime() + 3600000; //+ 1 hora
				console.log(getPathByDate(new Date(dAux.getTime() + 3600000)));
				dMax.setTime(dAux.getTime());
				$dtp.datetimepicker("maxDate", dMax);
				dAux = new Date(dAux.getTime() + 3600000);
				imgMAX.src = getPathByDate(dAux);
		});
		


		dAux = new Date(d.getTime());
		imgMAX.src = getPathByDate(dAux);
	}

	function registLoadFirstImageEvents() { // Se a imagem actual
		//$(document).on("defaultPossibleVariablesLoaded", function() {
			
			if(dMax)
				if(dMax.getTime() < d.getTime()) {
					d.setTime(dMax.getTime());
					dAnterior.setTime(dMax.getTime());
				}
				
			img = new Image();
			var div = $("#currentImage-wrap");
			
			img.addEventListener('error', firstImageNotFound);
			img.addEventListener('load', firstImageLoad);
			
			img.src = getActualPath();
			
		//});
	}

	// *** IMAGE EVENTS AFTER FIRST IMAGE
	
	function registNewImageLoadEvents() {
		firstLoad = false;
		img.addEventListener('load', function() {
			$(".loader-wrap").hide();
			actualImageLoaded = true;
		});
		
		// Se a imagem actual não existe, faz replace pela imagem que estava antes e devolve o erro de que não dispõe da imagem actual, mudar para modal.
		img.addEventListener('error', function() {
			$('#errorNoMapImageModal').modal('show')
			//alert("Não existem imagens para este momento."); // a substituir por um modal
			if(isPlaying) play();
			d.setTime(dAnterior.getTime());
			actualizeImgSrc();
		});
	}
	
	
	// **** BUTTON EVENT REGISTER
	
	function registPlayerButtonEvents() {
		$("#day-backward-button").click(function () { console.log("fez"); changeDay(-1); });
		$("#hour-backward-button").click(function () { changeHour(-1); });
		$("#hour-forward-button").click(function () { console.log("fez2"); changeHour(1); });
		$("#day-forward-button").click(function () { changeDay(1); });
		$("#plButton").click(function () { play(); });
		$(".interval-player .day-basis").click(function () { setIntervalValue(true, parseInt($(this).attr("interval"))); });
		$(".interval-player .hour-basis:not(.disabled)").click(function () { setIntervalValue(false, parseInt($(this).attr("interval"))); });
		
		$("#showHide > button").click(function () { 
			if(playerHidden) {
				$("#player-group-button").fadeIn();
				$("#showHide > button").addClass("active");
				$("#showHide > button").html("<span class=\"fa fa-chevron-right\"></span>");
			} else {
				$("#player-group-button").fadeOut();
				$("#showHide > button").removeClass("active");
				$("#showHide > button").html("<span class=\"fa fa-chevron-left\"></span>");
			}
				
			playerHidden = !playerHidden;
		});

        $( "#showHideScale > button" ).click(function() {
            $( "#scale" ).fadeToggle( 300, function() {
                $("#showHideScale > button").toggleClass("active");
                $("#showHideScale > button > i").toggleClass("fa-chevron-left fa-chevron-right");
            });

        });
	}
	
	
	// **** INTERNAL FUNCTION
	
	function setIntervalValue(db, val) {
		dailyBasis = db;
		interval = val;
		if(isPlaying) {//Vamos adicionar opção de que se possa alterar a base, enquanto se está a fazer play
			play(); // uma vez para parar o play e tirar a função que se está a usar (day/hour)
			play(); // outra vez para por a nova função e fazer play
		}
	}
	
	function changeHour(val) {
		//Pois o setTime utiliza o numero de milisegundos desde 1 Jan 1970, para a frente ou para trás.
		//Por isso, tem de se ir buscar a data actual e adicionar tal valor
		//console.log(val);
		//console.log(dMax);

		var dNextTime = d.getTime() + val*3600000;
		//console.log(dNextTime);
		if(!dateTest(dNextTime)) {
			$('#errorNoMapImageModal').modal('show')
			//alert("Não existem imagens para este momento. +");
			if(isPlaying) play();
			//console.log(dMax);
			return;
		}

		dAnterior.setTime(d.getTime());
		d.setTime(dNextTime);

		//É preciso fazer também actualizar o calendário
		synchronizeTimeOnCalendar();

		//E, por fim, o nome do ficheiro
		actualizeImgSrc(d);
	}

	//Change Day precisa de ser distinto de change hours, por causa de aspectos como, por exemplo, mudança da hora que acrescenta hora inadevertidamente
	// e deixa de funcionar, se fizessemos changeHour(24), podia dar uma hora diferente do dia seguinte.
	function changeDay(val) {

		//a necessidade de Change Day tem a ver com situações de mudança horaria
		var nextDate = new Date(d.getTime());
		//console.log(nextDate);
		nextDate.setDate(nextDate.getDate()+val);
		//console.log(nextDate);
		//Necessario, por causa da mudanca da hora. No dia em que mudava a hora, e preciso mudar ou 23 ou 25 horas (consoante solsticio ou equinocio),
		//por isso fazemos simplesmente set da hora anterior.
		nextDate.setHours(d.getHours());
	
		var dNextTime = nextDate.getTime();
		
		if(!dateTest(dNextTime)) {
			$('#errorNoMapImageModal').modal('show')
			//alert("Não existem imagens para este momento. +");
			if(isPlaying) play();
			return;
		}
		
		dAnterior.setTime(d.getTime());
		d.setTime(dNextTime);
		
		//É preciso fazer também actualizar o calendário
		synchronizeTimeOnCalendar();
		
		//E, por fim, o nome do ficheiro
		actualizeImgSrc(d);
	}
	
	// Função que trata do play, fazendo passar as imagens
	function play() {

		var funcToUse = (dailyBasis)? changeDay : changeHour;
		var delay = 1000; //em milisegundos, o tempo para mudar.
		isPlaying = !isPlaying;

		if(isPlaying) { //Se se quer playing, vai iniciar timer;

		    //console.log(funcToUse);
			//é necessário criar função anónima, pois necessitavamos passar argumentos e a funcao passada como argumento, nao pode ter
			intervalFunc = setInterval( function() {
                funcToUse(interval)//funcToUse(1); quando so mudava um dia ou uma hora...
            }, delay);
			$("#plButton").html("<span class=\"fas fa-pause\"></span>");
			$("#plButton").addClass("active");
		} else {
			clearInterval(intervalFunc);
			$("#plButton").html("<span class=\"fas fa-play\"></span>");
			$("#plButton").removeClass("active");
		}
	}
	
	// testa se passa dos limites temporais teóricos.
	// false, se segundo o dateTest a data não for possível, so segundo o teste logico. Nao verifica a existencia do ficheiro correspondente.
	function dateTest(newDate) {

		if(newDate < dMin.getTime())//Se o tempo, é menor que o mínimo
			return false;
		else if(dMax) //Se dMax existir
			if(newDate > dMax.getTime())
				return false;
		
		return true;
	}
	
	function synchronizeTimeOnCalendar() {
		//Não fuunciona
		//$dtp.data("DateTimePicker").date().set(moment(d).toObject());

		//Vamos fazer a mão

		//$dtp.data("DateTimePicker").date(d);
		//$dtp.datetimepicker('viewDate')
		$dtp.datetimepicker("date", d);

	}
		
	//Função relativa à mudança do Date Time no Calendário, vai actualizar tudo o resto (imagem).
	function changeDateTimeOnPicker(timeObject) {
	
		d = timeObject.toDate();
		actualizeImgSrc();
		
	}
	
	function actualizeImgSrc() {
	    //console.log("Atualizando o Tempo");
        if ( jsonAvailable() )
        {
            //console.log("Using MAP");
            $("#leaflet_map").show();
            $("#currentImage-wrap").hide();
            loadGeoJSON();
        }
        else
        {
            //console.log("Using IMAGE");

            $("#leaflet_map").hide();
            $("#currentImage-wrap").show();

            actualImageLoaded = false;
            $("#currentImage").attr("src", getActualPath());
            $("#currentImage").attr("data-zoom", getActualPath());
            if(drift) drift.setZoomImageURL(getActualPath());

            // Check a propriedade complete. Porque se o load está logo complete,
            // é pq a imagem já está disponível. Provavelmente, já foi feito o load anteriormente e está na cache.
            // Assim, nem, vamos pôr o ecrã de load (loader-wrap). Se não está, então pomos.
            // É retirado, quando faz onload, ou seja, Quando o load fica completo. Mediante evento registado
            // nas primeiras funções.
            if(!$("#currentImage").prop("complete") && !firstLoad) {
                // agora vai fazer esperar 0,5 segundos, antes de mostrar o loader. Só após 0,5 segundos é que mostra.
                // decidiu-se isso, precisamente por causa do play, às vezes há casos em que a imagem carrega logo a seguir e
                // aparece logo o ecrã de load.
                setTimeout(function(){
                    if(!actualImageLoaded)
                        $(".loader-wrap").show();
                }, 500);

            }
        }
			
	}
	
	// Devolve o caminho actual para a imagem, segundo  d (dateTime actual)
	function getActualPath() {
		//return "https://picsum.photos/200/300/?random=" + Math.floor(Math.random() * 300); // imagens random
		return imagePrefixURL + actualVariable + '/0/' + getActualFileName(d);
	}

    // Devolve o caminho actual para a imagem, segundo  d (dateTime actual)
    function getActualMapPath(variable) {
        //return "https://picsum.photos/200/300/?random=" + Math.floor(Math.random() * 300); // imagens random
        //return imagePrefixURL + actualVariable + '/0/' + getActualFileName(d);
        //console.log(actualVariable);
        //console.log(defaultRegionName);
        //console.log(regionInfo["name"][regionIndex]);
        //console.log(imagePrefixURL);
        //console.log(getActualFileName(d));
        //console.log(imagePrefixURL);
        let date = d.getFullYear() +"-"+ getTwoDigitNumber(d.getMonth()+1) +"-"+  getTwoDigitNumber(d.getDate())
        let time = getTwoDigitNumber(d.getHours())+"00";
        return "../data/"+regionInfo["name"][regionIndex]+"/"+variable+"/"+date+"/"+magnitude_properties[variable.toUpperCase().replace(/ /g,"_")].outputName+"_"+time+".json";
    }
	
	// Da o nome que o ficheiro deve ter em função de d (o dateTime actual)
	function getActualFileName(dateObject) {
		return dateObject.getFullYear() + getTwoDigitNumber(dateObject.getMonth()+1) + getTwoDigitNumber(dateObject.getDate()) + '-' + getTwoDigitNumber(dateObject.getHours()) + "00"+ ".png";
	}
	
	function getPathByDate(dateObject) {
		return imagePrefixURL + actualVariable + '/0/' + getActualFileName(dateObject);
	}
	
	// da o numero em função de string, e se ele for < 10, poe um 0 atras. (ex: 1 -> 01)
	function getTwoDigitNumber(value) {
		return ((value < 10)? '0' : '') + value.toString();
	}
	

	
	
	
});
