var workspace = "vanapp";
var baseurl = dpurl + "/" + workspace +"/wms";
var layerList=[];
var map, extent;

$(document).ready(function () {

	if(uploadStatus == 0){
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
			zoom: 10.5,
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
		    target: 'map',
		    interactions: olgm.interaction.defaults()
		});
		map.setView(view);
		map.addLayer(osmLayer);
		map.addControl(mousePositionControl);
		map.addControl(scaleLine);

		$.ajax({
			url : "/DataVerification/getLayerList",
			type: 'get',
			success : function(list) {
				parsedList = JSON.parse(list);
				var layerCtr = document.createElement('div');
				layerCtr.className = 'list-group';
				for(i=0;i<parsedList.length;i++){
					    layerList[parsedList[i]['id']] = new ol.layer.Tile({
				        source : new ol.source.TileWMS({
				            params : {
				                'LAYERS' : "vanapp:"+parsedList[i]['layername'],
								'cql_filter': "create_by='" + username + "'"
				            },
				            url : baseurl
				        })
				    });
					layerList[parsedList[i]['id']].set('Name', parsedList[i]['name']);
					map.addLayer(layerList[parsedList[i]['id']]);

					if(i!=0) {
						layerList[parsedList[i]['id']].setVisible(false);
					}

				    var legendRow = document.createElement('div');
				    legendRow.id = 'row_'+parsedList[i]['id'];
				    var img = document.createElement('img');
					img.src = baseurl + '?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER='+ workspace +':'+ parsedList[i]['layername'] +'';
					var label = document.createElement('div');
					label.className = 'label';
					label.innerHTML = parsedList[i]['name'];
					legendRow.appendChild(label);
					legendRow.appendChild(img);
					document.getElementById('legendContent').appendChild(legendRow);

					var layerCtrR = document.createElement('div');
					layerCtrR.id = 'labelCtr_'+parsedList[i]['id'];
					if(parsedList[i]['is_verified']){
						layerCtrR.className = 'list-group-item row verified';
					} else{
						layerCtrR.className = 'list-group-item row';	
					}
					layerCtrDiv1 = document.createElement('div');
					layerCtrDiv1.innerHTML = parsedList[i]['name'];
					layerCtrDiv1.className = 'col-md-8 lyrCtrLeft';
					var layerCtrShowHideC = document.createElement('div');
					layerCtrShowHideC.className = 'material-switch pull-right';
					layerCtrShowHideC.title = 'Set layer visibility';
					var layerCtrI = document.createElement('input');
					layerCtrI.id = 'layerCtrInput_'+parsedList[i]['id'];
					layerCtrI.name = 'layerCtrInput_'+parsedList[i]['id'];
					layerCtrI.type = 'checkbox';
					if(i==0){
						layerCtrI.checked = true;
					}
					layerCtrI.onclick = function(){
						var id = this.id.split("_");
						if (this.checked){
						    layerList[id[1]].setVisible(true);
						} else {
						    layerList[id[1]].setVisible(false);
						}
					}
					var layerCtrL = document.createElement('label');
					layerCtrL.setAttribute ('for', 'layerCtrInput_'+parsedList[i]['id']);
					//layerCtrL.for = 'layerCtrInput'+parsedList[i]['id'];
					layerCtrL.className = 'label-success';

					var layerCtrDiv2 = document.createElement('div');
					layerCtrDiv2.className = 'col-md-4 lyrCtrRight';
					layerCtrDiv2.id = 'div_'+parsedList[i]['id'];
					if(!parsedList[i]['is_verified']){
						var layerCtrV = document.createElement('button');
						layerCtrV.className = 'btn btn-light';
						layerCtrV.innerHTML='<i class="fa fa-fw fa-lg fa-check-circle"></i>Verify';
						layerCtrV.id = 'btn_'+parsedList[i]['id'];
						layerCtrV.setAttribute ('name', parsedList[i]['name']);
						layerCtrV.onclick = function(){
							if(this.innerHTML != 'Verified'){
								var id = this.id.split("_");
								$.ajax({
									url : "/DataVerification/submitVerification",
									type: 'get',
									data: {'q': id[1]},
									success : function(status) {
										var response = JSON.parse(status);
										var id = response['id'];
										if(response['responseType'] === '1'){
											swal("","Success: "+ this.name +" boundaries verified successfully","success");
											$("#labelCtr_"+id).addClass('verified');
											$("#btn_"+id).css('display','none');
											$("#div_"+id).html('<i class="fa fa-fw fa-lg fa-check-circle"></i>Uploaded');
											$("#div_"+id).addClass('divVerified');
										} else if(response['responseType'] === '-2'){
											swal("","Error: Missing parameter(s)","error");
										} else{
											swal("","Error: Coudn't submit your verification request. Contact site administrator","error");
										}
										if(response['verified'] == 1){
											$("#deleteBnd").attr("disabled", true);
											$("#deleteBnd")[0].onclick = null;
											$("#deleteBnd").click(function(){
												swal("","Error: You cannot delete boundaries once they are verified.","error");
											});
										}
									},
									error: function(){
										swal("","Error: Coudn't submit your verification request. Contact site administrator","error");
									}
								});
							}
						}
						layerCtrDiv2.appendChild(layerCtrV);
					} else{
						layerCtrDiv2.innerHTML = '<i class="fa fa-fw fa-lg fa-check-circle"></i>Uploaded';
						layerCtrDiv2.className = 'col-md-4 lyrCtrRight divVerified';
					}
					layerCtrShowHideC.appendChild(layerCtrI);
					layerCtrShowHideC.appendChild(layerCtrL);
					layerCtrDiv1.appendChild(layerCtrShowHideC);
					layerCtrR.appendChild(layerCtrDiv1);
					layerCtrR.appendChild(layerCtrDiv2);
					layerCtr.appendChild(layerCtrR);			
				}
				document.getElementById('layerController').appendChild(layerCtr);	
			},
			error: function() {
				swal("","Error: Fetching layers list failed. Contact site administrator","error");
			}
		});
	}
});
