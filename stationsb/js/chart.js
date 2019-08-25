$(document).ready(function(){
	var months;
	var daysOfWeek;
	var jsonCalendarLangFilename = "calendarLang.json";

	$.ajax({url: getDefaultLanguageDirectory() + jsonCalendarLangFilename, async: false, dataType: 'json', success: function(data) {
		Highcharts.setOptions({
			lang: {
				shortMonths: data.months,
				weekdays: data.daysOfWeek,
				thousandsSep: ""
			},		
			credits: {enabled: false},
			exporting: {enabled:true}
		});
	}});
	
	$(document).on("languageChange", function(e, langId, jsonDirectory, isDefaultLanguage) {
		$.ajax({url: jsonDirectory + jsonCalendarLangFilename, async: false, dataType: 'json', success: function(data) {
			Highcharts.setOptions({
				lang: {
					shortMonths: data.months,
					weekdays: data.daysOfWeek,
					thousandsSep: ""
				},		
				credits: {enabled: false},
				exporting: {enabled:true}
			});
					
		}}).fail(function(d) { //deu erro (nao encontrou json da linguagem, p. ex.), poe linguagem default
			$.ajax({url: getDefaultLanguageDirectory() + jsonCalendarLangFilename, async: false, dataType: 'json', success: function(data) {
				Highcharts.setOptions({
					lang: {
						shortMonths: data.months,
						weekdays: data.daysOfWeek,
						thousandsSep: ""
					},		
					credits: {enabled: false},
					exporting: {enabled:true}
				});
			}});
		});
	});
	
	
	$('#btn-makeChart').click(function(){
		var aStaSelectName = [];
		var aStaSelectName_alt = [];
		var aStaSelectColor = [];
		var aStaSelectChboxObs = [];
		for (var i = 0; i < selectedStations.length; i++) {
			console.log(selectedStations[i].feature.properties.name);
			if($("input[name='"+ selectedStations[i].feature.properties.name + "']" ).is(':checked')) {
				aStaSelectName.push(selectedStations[i].feature.properties.name);
				aStaSelectName_alt.push(selectedStations[i].feature.properties.name_alt);
				
				var selectColor = (selectedStations[i].selectedStyle.fillColor).replace('#','');
				aStaSelectColor.push(selectColor);
				
				idChbox = '#chbox_Obs'+i;
				aStaSelectChboxObs.push($(idChbox).is(':checked'));
			}
		}				
		var staSelectName = aStaSelectName.join(';');
		var aStaSelectName_alt = aStaSelectName_alt.join(';');
		//var varSelect   = $("#selParamList").val();
		var varSelect   = $("#nSelParamList").val();
		//var range = $('#range').html();
		//var dates = range.split(" - ");
		//var dateStr = new Date(dates[0]);
		//var dateEnd = new Date(dates[1]);

		//novo
		var dateStr = $('#datetimepickerA').data("DateTimePicker").viewDate().toDate();
		var dateEnd = $('#datetimepickerB').data("DateTimePicker").viewDate().toDate();

		
		var dateMonthStr = dateStr.getMonth() + 1;
		var dateMonthEnd = dateEnd.getMonth() + 1;
		dateStr = dateStr.getFullYear()+'-'+dateMonthStr+'-'+dateStr.getDate();
		dateEnd = dateEnd.getFullYear()+'-'+dateMonthEnd+'-'+dateEnd.getDate();	
		var staSelectColor = aStaSelectColor.join(';')
		var staSelectChboxObs = aStaSelectChboxObs.join(';')
		
		var dataURL = 'station='+staSelectName+'&name='+aStaSelectName_alt+'&var='+varSelect+'&start='+dateStr+'&end='+dateEnd+'&colors='+staSelectColor+'&obs='+staSelectChboxObs;
		console.log(dataURL);
		$.ajax({
			url: "http://forecast.maretec.org/stations/ajax/getDataChart.php",
			dataType: 'json',
			data: dataURL,			
			beforeSend: function(){
				// url: "http://forecast.maretec.org/stationsService/ajax/getDataChart.php", notar que.... informar que não funciona
				$('#btn-makeChart > i').removeClass('fa-bar-chart');
				$('#btn-makeChart > i').addClass('fa-spinner fa-spin');
				
				$('#chartRow').fadeOut("slow");
				
				$("#chartCanvas").removeClass('site');
				//  .show() must to be here because!!
				$('#chartCanvas').empty().show();
				
				$('#bottomRight').hide();
				$('#chartStatistic').empty();
			},
			success: function( jsondata ){	
				console.log(jsondata);			
				createChart(jsondata);
				createDownloadData(staSelectName,aStaSelectName_alt,varSelect,dateStr,dateEnd,staSelectChboxObs);
				
				var chartInfo = '';
				/*
				//statistics (min & max))
				if(jsondata['min'] != 9999999 && jsondata['max'] != -9999999){
					var minDate = new Date(jsondata['minDate']);
					var maxDate = new Date(jsondata['maxDate']);
					var options = {					
							year:"numeric",
							month:"2-digit",
							day:"2-digit",
							hour:"numeric",
							minute:"numeric"
					};
					
					chartInfo += '<div class="settings">';					
					chartInfo += '<h3>Statistics model: </h3>';
					chartInfo += '<dl><dt><b>min:</b> '+jsondata['min'].toFixed(jsonParameters[jsondata.param].ndecimal)+' '+jsonParameters[jsondata.param].units+" ("+minDate.toLocaleDateString("pt-PT",options)+")</dt>";
					chartInfo += "<dt><b>max:</b> "+jsondata['max'].toFixed(jsonParameters[jsondata.param].ndecimal)+' '+jsonParameters[jsondata.param].units+" ("+maxDate.toLocaleDateString("pt-PT",options)+')</dt>';
					chartInfo += '</dl></div>';
				}
				*/
				
				// model source
				if(jsondata['model']){					
					var objSource = new Object();
					
					var series = jsondata.series;
					var patt = new RegExp('model|forecast');
					for(var i = 0; i < series.length; i++) {
						var staChart = series[i];
						
						var matchModel = patt.test(staChart.name);
						
						if(matchModel && staChart.hasOwnProperty('modelSource')) {
							var staChartName  = staChart.name
							var staChartColor = staChart.color
							var modelSourceName = staChart.modelSource.name												
							
							if (objSource.hasOwnProperty(modelSourceName)) { 
								(objSource[modelSourceName]['stations']).push(staChartName);
								(objSource[modelSourceName]['colors']).push(staChartColor);
							}else{
								objSource[modelSourceName] = new Object();
								
								objSource[modelSourceName]['name'] = modelSourceName;
								objSource[modelSourceName]['urlImg'] = staChart.modelSource.urlImg;
								
								objSource[modelSourceName]['stations'] = new Array();
								(objSource[modelSourceName]['stations']).push(staChartName);
								objSource[modelSourceName]['colors'] = new Array();
								(objSource[modelSourceName]['colors']).push(staChartColor);
							}
						}
					}
					chartInfo += '<div class="settings">';
					//chartInfo += '<h3>Model data source: </h3><dl>';
					for(var sourceName in objSource){
 						chartInfo += '<dt> - '+ objSource[sourceName]['name']+': ';
						chartInfo += '<dt>';
						chartInfo += '<img src="'+topPathnamePrefix+objSource[sourceName]['urlImg']+'" alt="'+objSource[sourceName]['name']+'" width=180px style="margin: 10px 0px 5px;"></dt>';
						
						var stationsName  = objSource[sourceName]['stations'];					
						var stationsColor = objSource[sourceName]['colors'];
						var arrayStations = new Array();	
						for(var i = 0; i < stationsName.length; i++) {
							//console.log(stationsName[i]);
							stationsName[i] = stationsName[i].replace(/\s*model|\s*_forecast/g, "");
							var indexOff = arrayStations.indexOf(stationsName[i]);  // para não aparecer duas vezes repetido ("station model" e "station_forecast"))
							if(indexOff < 0){
								arrayStations.push(stationsName[i]);
								chartInfo += '<dd><div class="trace" style="background-color: '+stationsColor[i]+'"></div> '+stationsName[i]+'</dd>'	
							}
												
						}
					}
										
					chartInfo += '</dl></div>';
				}
				
				// observations source
				if(jsondata['obs']){					
					var objSource = new Object();
					
					var series = jsondata.series;
					var patt = new RegExp(' obs');
					for(var i = 0; i < series.length; i++) {
						var staChart = series[i];
						
						var matchObs = patt.test(staChart.name);
						
						if(matchObs && staChart.hasOwnProperty('obsSource')) {
							var staChartName = staChart.name
							var staChartColor = staChart.color
							var obsSourceName = staChart.obsSource.name												
							
							if (objSource.hasOwnProperty(obsSourceName)) { 
								(objSource[obsSourceName]['stations']).push(staChartName);
								(objSource[obsSourceName]['colors']).push(staChartColor);
							}else{
								objSource[obsSourceName] = new Object();
								
								objSource[obsSourceName]['name'] = obsSourceName;
								objSource[obsSourceName]['urlImg'] = staChart.obsSource.urlImg;
								
								objSource[obsSourceName]['stations'] = new Array();
								(objSource[obsSourceName]['stations']).push(staChartName);
								objSource[obsSourceName]['colors'] = new Array();
								(objSource[obsSourceName]['colors']).push(staChartColor);
							}
						}
					}
					chartInfo += '<div class="settings">';
					chartInfo += '<h3>Observation data source: </h3><dl>';
					for(var sourceName in objSource){
 						chartInfo += '<dt> - '+ objSource[sourceName]['name']+': ';
						chartInfo += '<dt>';
						chartInfo += '<img src="'+topPathnamePrefix+objSource[sourceName]['urlImg']+'" alt="'+objSource[sourceName]['name']+'" width=180px style="margin: 10px 0px 5px;"></dt>';
						
						var stationsName  = objSource[sourceName]['stations'];	
						var stationsColor = objSource[sourceName]['colors'];					
						for(var i = 0; i < stationsName.length; i++) {
							stationsName[i] = stationsName[i].replace(/\s+obs/g, "");
							chartInfo += '<dd><div class="dot" style="background-color: '+stationsColor[i]+'"></div> '+stationsName[i]+'</dd>'						
						}
					}
										
					chartInfo += '</dl></div>';
				}				
				
				
				$("#chartCanvas").addClass('site');
				
				console.log(chartInfo);
								
				//mudado atrenção
				$(".chartInfo").html('').append(chartInfo);
				$('#bottomRight').show();
				
				$('#chartRow').fadeIn("slow");
				
				//$('html,body').animate({
        			//scrollTop: $(window).scrollTop() + 150
    			//});
				$('#btn-makeChart > i').removeClass('fa-spinner fa-spin');				
				$('#btn-makeChart > i').addClass('fa-bar-chart');
					
					
					//mudado
					console.log("Ja ta");
					$('#exampleModal').modal('hide');
					$('#exampleModal2').modal('show');
			},
			complete: function(){
	
				
				
				$('#btn-makeChart > i').removeClass('fa-spinner fa-spin');				
				$('#btn-makeChart > i').addClass('fa-bar-chart');
				
				//setTimeout(function(){
					//window.dispatchEvent(new Event('resize')); //arranjar outra solução
				//}, 200);
			},
			error: function(){
				$('#btn-makeChart > i').removeClass('fa-bar-chart');				
				$('#btn-makeChart > i').addClass('fa-spinner fa-spin');
				$('#exampleModal').modal('hide');
				$('#errorGettingChartModal').modal('show');
				//window.location.replace(URL_HOST_DIR+"/error.php?type=getDataChart");
				//throw new Error('error getData');
			}
			
		});
		
	});	

	// reset input form when close modal
	$('#modalDownloadData').on('hidden.bs.modal', function (e) {
    	//$('#downloadForm').trigger("reset");
		$("#downloadForm textarea").val('');
		$.uniform.update();
	});
		
				

	
	
	// ##################################### //
	// ########## functions ############### //
	// #################################### //	
	

	//** highchart **//	
	function createChart(data) {
		console.log(data);
		paramName = data.param;
		

		//Corrigir (eliminar nulls) que vem na resposta json do PHP, 
		for(var j = 0; j < data.series.length; j++)
			for(var i = 0; i < data.series[j].data.length; i++)
				if(!data.series[j].data[i][1]) {
					data.series[j].data.splice(i, 1);
					i--;
				}

		//se é percentagem, tem de multiplicar tudo por 100.
		if(jsonParameters[paramName].units == "\%") {
			data.max *= 100;
			data.min *= 100;
			for(var j = 0; j < data.series.length; j++)
				for(var i = 0; i < data.series[j].data.length; i++)
					data.series[j].data[i][1] *= 100;
		}
			
		//console.log(paramName);
		/*	spacing: [5, 5, 0, 0],
				marginTop: 35,
				marginBottom: 75,*/
		
		console.log($('#chartCanvas').highcharts({
			
			chart: {
				events: { "load": function() {this.update({});} }, // foi necessário por causa da solução do mesmo número de casas decimais
				spacing: ($(window).width() < 490 || $(window).height() < 490)? [5, 5, 15, 0] : [10, 10, 15, 10],
				marginTop: ($(window).width() < 490 || $(window).height() < 490)? 40 : undefined,
				//marginBottom: ($(window).width() < 490 || $(window).height() < 490)? 75 : undefined,
				renderTo: 'chartCanvas',
				type: 'spline',
				zoomType: 'xy'
			},
			
			plotOptions: {
				series: {
					events: {
						legendItemClick: function(event) {
							// search for "obs"
							var patt = /\s+obs$/;
							var result = patt.test(this.chart.series[this.index].name);
							if(result){
								var thisSerie  = this.chart.series[this.index];
								
								if (thisSerie.visible == true) {
									thisSerie.hide();
								}
								else {
									thisSerie.show();
								}
							}else{
								var thisSerie  = this.chart.series[this.index];
								var thisSerie2 = this.chart.series[this.index + 1];
								
								if (thisSerie.visible == true) {
									thisSerie.hide();
									thisSerie2.hide();
								}
								else {
									thisSerie.show();
									thisSerie2.show();
								}
							}
							
							return false;
						}
					},
					marker: {
						radius: 3,
						lineWidth: 1
					}
				},
				softThreshold: false
			},
			
			exporting: {
	            buttons: {
	                contextButton: {
						menuItems: [
				        {
				          textKey: 'downloadPNG',
				          onclick: function () {
				            this.exportChart();
				          }
				        },
						/*{
				          textKey: 'downloadJPEG',
				          onclick: function () {
				            this.exportChart({
				              type: 'image/jpeg'
				            });
				          }
				        }
						*/
						{
				          textKey: 'downloadPDF',
				          onclick: function () {
				            this.exportChart({
				              type: 'application/pdf'
				            });
				          }
				        }, 
						{
				          textKey: 'downloadSVG',
				          onclick: function () {
				            this.exportChart({
				              type: 'image/svg+xml'
				            });
				          }
				        },
						{
				          text: 'Download CSV ',
				          onclick: function () {
				            $('#modalDownloadData').modal('show');
				          }
				        }
				      ]
			       }
	            }
	        },
		
			title: {
				text: ((!isDefaultLanguage() && parametersOtherLang[paramName])? parametersOtherLang[paramName] : jsonParameters[paramName].name_alt) + " (" + jsonParameters[paramName].units + ")",
				align: 'left',
				style: ($(window).width() < 400 || $(window).height() < 400)? { "fontSize": "14px" } : { "fontSize": "18px" }
			},
			
			subtitle: {
				text: data.daterange,
				align: 'right',
				y: ($(window).width() < 400 || $(window).height() < 400)? 27 : 15,
				x: ($(window).width() < 400 || $(window).height() < 400)? -30 : -50,
				style: ($(window).width() < 400 || $(window).height() < 400)? { "fontSize": "9px" } : { "fontSize": "11px" }
			},			
			
			xAxis: {
				type: 'datetime',			
				gridLineWidth: 1,
				gridLineColor: '#F0F0F0',
				startOnTick: false,
				endOnTick: false,
				minPadding: 0,
				maxPadding: 0,
				offset: 20,
				showLastLabel: true,
				labels: {
					//formatter: function(){
						//return Highcharts.dateFormat('%H', this.value);
					 //}
				},
				plotLines: [{
					color: '#7f7f7f',
					label: "now",
					width: 2,
					value: new Date().getTime(),
					zIndex: 10000
				}]
  
			},		
			
			yAxis: { 
				title: {
					text: null
				},
				type: data.yaxistype,
				events: {
					afterSetExtremes: function(e) {
console.log(e);
						//function checks how many decimal places has a number
						var countDecimals = function(value) {
							if ((value % 1) != 0)
								return value.toString().split(".")[1].length;
							return 0;
						};

						var chart = this,
						ticks = this.chart.yAxis[0].tickPositions,
						howManyDecimal = 0;
												console.log(chart);
						//loop looks for the largest number of decimal places
						ticks.forEach(function(tick) {
							if (countDecimals(tick) > howManyDecimal) {
								howManyDecimal = countDecimals(tick);
							}
						})
						//update labels so they have the same number of decimal places
						this.chart.update({
							yAxis: [{
								labels: {
									format: '{value:,.' + howManyDecimal + 'f}',
								}
							}]
						}, true, true)

					}
			},
				labels: {
					//formatter: function() {
						// ja nao e preciso, pq ja estava a devolver o valor normal... E isso faz por default
					//	return this.value;
						//return this.isLast ? jsonParameters[paramName].units : this.value; // skip numberFormat
					//},
					style: {
						fontSize: '11px',
						color: Highcharts.getOptions().colors[1]
					},
					x: -5
				},
				max: (jsonParameters[paramName].units == "\%")? 100 : null,
				startOnTick: true
			},
			
 			tooltip: {
                shared: true,
				crosshairs: { width: 0.5,color: "#666"},
				borderColor: "#fff",
				borderRadius: 3,
				borderWidth: 0,				
				valueDecimals: jsonParameters[paramName].ndecimal,
				valueSuffix: ' '+jsonParameters[paramName].units
            },
			
			legend: {
				enabled: true,
				//borderWidth: 0, align:'center',verticalAlign:'bottom',floating:true,y: 10
			},			
						
			series: data.series,
			
			noData: {
	            style: {    
	                fontWeight: 'bold',     
	                fontSize: '15px',
	                color: '#303030'        
	            }
	        }
						
		}));
		

		
	}
	
	/******************************* download chart data  **********************/
	function createDownloadData(staSelectName,aStaSelectName_alt,varSelect,dateStr,dateEnd,staSelectChboxObs){
				
		/*if(userInfo.islogged == 'true'){
			$('#name').val(userInfo.name).prop('disabled', true);
			$('#email').val(userInfo.email).prop('disabled', true);
			$('#organization').val(userInfo.organization).prop('disabled', true);
			$('#message').val('').prop('disabled', false);*/
			$.uniform.update();
		//}else{
			$('#name').val('').prop('disabled', false);
			$('#email').val('').prop('disabled', false);
			$('#organization').val('').prop('disabled', false);
			$('#message').val('').prop('disabled', false);
			$.uniform.update();
		//}
		
		$("#downloadForm input, #downloadForm textarea").jqBootstrapValidation("destroy");
		$("#downloadForm input, #downloadForm textarea").jqBootstrapValidation({
			 preventSubmit: true,
			 submitError: function(form, event, errors) {
			  // something to have when submit produces an error ?
			  // Not decided if I need it yet
			},
			submitSuccess: function(form, event) {
				event.preventDefault(); // prevent default submit behaviour
				// get values from FORM
				var name = $("input#name").val();  
				var email = $("input#email").val(); 
				var organization = $("input#organization").val(); 				
				var message = $("textarea#message").val();
				
				var filename = '';
				if($("#inputDownloadRes").val() == ''){
					filename = $("#inputDownloadRes").attr( "placeholder" );				 
					//filename = filename.replace("data", $("#selParamList").val());
					filename = filename.replace("data", $("#nSelParamList").val());
					filename = filename.replace(/[\\\/:*?"<>]+|\s+/g, "_");					 
				}else{
					filename = $("#inputDownloadRes").val();
					// replace spacial character and all blanks to "_"
					filename = filename.replace(/[\\\/:*?"<>]+|\s+/g, "_");
				}
				
								
				dataURL = 'station='+staSelectName+'&name_alt='+aStaSelectName_alt+'&param='+varSelect+'&start='+dateStr+'&end='+dateEnd+'&obs='+staSelectChboxObs;
				dataURL +='&name='+name+'&email='+email+'&organization='+organization+'&message='+message+'&filename='+filename
			
				$.download('http://forecast.maretec.org/stationsService/ajax/getDataDownload.php',dataURL, 'post' );
							
				$('#btnCloseDownloadModal').click();
			},
			 filter: function() {
				return $(this).is(":visible");
			 },
		});
	}
	
	
	jQuery.download = function(url, data, method){
		 //url and data options required
		 if( url && data ){ 
		  //data can be string of parameters or array/object
		  data = typeof data == 'string' ? data : jQuery.param(data);
		  //split params into form inputs
		  var inputs = '';
		  jQuery.each(data.split('&'), function(){ 
		   var pair = this.split('=');
		   inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />'; 
		  });
		  //send request
		  jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
		  .appendTo('body').submit().remove();
		 };
	};
	
	 

});


