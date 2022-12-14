var workspace = "vanapp";
var baseurl = dpurl + "/" + workspace +"/wms";
var layerList=[];
var map, extent;
var shannonStatus = false;

// var http = new XMLHttpRequest();
// http.open('HEAD',baseurl, false);
// http.send();

// if(http.status == 200)
// {
	$(document).ready(function () {
		if(verifiedStatus == 0){
			var seconds = 11;
			function decrementSeconds() {
				seconds -= 1;
				$("#secCounter").html(seconds);
			}
			window.setTimeout(function(){
				window.location.href = "/DataUpload/ForestAdminBoundaries";
			}, 10000);
			setInterval(decrementSeconds, 1000);
		} else{
			var view = new ol.View({
				center:  ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857'),
				zoom: 10,
				projection: 'EPSG:3857'
			});

			var osmLayer = new ol.layer.Tile({
				source: new ol.source.OSM()
			});

			var mousePositionControl = new ol.control.MousePosition({
					coordinateFormat: ol.coordinate.createStringXY(4),
					projection: 'EPSG:3857',
				// comment the following two lines to have the mouse position
				// be placed within the map.
				className: 'custom-mouse-position',
				target: document.getElementById('latlonInfo'),
				undefinedHTML: '&nbsp;'
			});

			var scaleLine = new ol.control.ScaleLine({
				minWidth: 100
			});


			map = new ol.Map({
				target: 'map'
			});
			map.setView(view);
			map.addLayer(osmLayer);
			map.addControl(mousePositionControl);
			map.addControl(scaleLine);
			$.ajax({
				url : "/GisDashboard/getLayerList",
				type: 'get',
				success : function(list) {
					parsedList = JSON.parse(list);
					var layerCtr = document.createElement('div');
					layerCtr.className = 'list-group';
					for(i=0;i<parsedList.length;i++){
						if(parsedList[i]['h_order'] == 999){
							baseurl = dpurl + "/" + parsedList[i]['workspace'] + "/wms";
							layerList[i] = new ol.layer.Tile({
								source : new ol.source.TileWMS({
						            // crossOrigin : "anonymous",
						            params : {
						            	'LAYERS' : parsedList[i]['workspace']+":"+parsedList[i]['layername'],
						            	'cql_filter': "create_by='" + username + "'"
						            },
						            url : baseurl
						        })
							});
						} else if(parsedList[i]['h_order'] == 111){
							layerList[i] = new ol.layer.Tile({
								source : new ol.source.TileWMS({
						            // crossOrigin : "anonymous",
						            params : {
						            	'LAYERS' : "vanapp:"+parsedList[i]['layername']
						            },
						            url : baseurl
						        })
							});	
						} else {
							layerList[i] = new ol.layer.Tile({
								source : new ol.source.TileWMS({
						            // crossOrigin : "anonymous",
						            params : {
						            	'LAYERS' : "vanapp:"+parsedList[i]['layername'],
						            	'cql_filter': "create_by='" + username + "'"
						            },
						            url : baseurl
						        })
							});	
						}
						layerList[i].set('Name', parsedList[i]['name']);
						map.addLayer(layerList[i]);

						if(i!=0){
		 					layerList[i].setVisible(false);
		 				}

		 				var legendRow = document.createElement('div');
		 				legendRow.id = 'row_'+i;
		 				legendRow.className = 'legendRow';
		 				var img = document.createElement('img');
		 				img.src = baseurl + '?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER='+ workspace +':'+ parsedList[i]['layername'] +'';
		 				var label = document.createElement('div');
		 				label.className = 'label';
		 				label.innerHTML = parsedList[i]['name'];
		 				legendRow.appendChild(label);
		 				legendRow.appendChild(img);
		 				document.getElementById('legendContent').appendChild(legendRow);

		 				$('#layerCtrInput_'+i).click(function(){
		 					var i = $(this).val(); //console.log(i);
		 					if (this.checked){
		 						layerList[i].setVisible(true);
		 					} else {
		 						layerList[i].setVisible(false);
		 					}
						 });
					}
				},
				error: function() {
					swal("","Error: Fetching layers list failed. Contact site administrator","error");
				}
			});
			/*var popup = new ol.Overlay.Popup;
			popup.setOffset([0, -55]);
			map.addOverlay(popup);
			//Feature info
			map.on('click', function(evt) {
				var f = map.forEachFeatureAtPixel(
					evt.pixel,
					function(ft, layer){return ft;}
					);
				if (f && f.get('type') == 'click') {
					var geometry = f.getGeometry();
					var coord = geometry.getCoordinates();

					var content = '<p>'+f.get('desc')+'</p>';

					popup.show(coord, content);

				} else { popup.hide(); }

			});*/
		}

		window.setInterval(function() {
			if(shannonStatus === false) checkStatus();
		}, 10000);
	});

	function checkStatus() {
		$.ajax({
			url : "/GisDashboard/checkStatus",
			success : function(response)
			{
				response = $.parseJSON(response);
				if(response.status_code == 1) {
					$('#generateShannon').removeClass('badge-warning badge-success badge-danger');
				} else if(response.status_code == 2) {
					$('#generateShannon').removeClass('badge-warning badge-success badge-danger');
				}else if(response.status_code == 3){
					$('#generateShannon').removeAttr('onclick');
					shannonStatus = true;
				}else if(response.status_code == 4){
					$('#generateShannon').removeClass('badge-warning badge-success badge-danger');
				}else if(response.status_code == 5){
					$('#generateShannon').removeClass('badge-warning badge-success badge-danger');
				}
			}
		});
	}

	$('#addBoundary').on('click',function(){
		
	});
// }else{
// 	alert("Maintenance is going on your patience is appreciated.");
// }


