var workspace = "vanapp";
var mapOnClickKey;
var elem;
var osmLayer = new ol.layer.Tile({
	source: new ol.source.OSM()
});	
var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: ol.coordinate.createStringXY(4),
		projection: 'EPSG:4326',
		className: 'custom-mouse-position',
		target: document.getElementById('latlonInfo'),
		undefinedHTML: '&nbsp;'
});
var featureInfoContent = $('#featureInfo');
var scaleLine = new ol.control.ScaleLine({
	minWidth: 100
});
var featureInfoContent = $('#featureInfo');
var layerAdded = [];
var map = new ol.Map({
    target: 'mapPreview',
    view : new ol.View({
		center:  ol.proj.fromLonLat(center),
		zoom: 8
	})
});
map.addLayer(osmLayer);
map.addControl(mousePositionControl);
map.addControl(scaleLine);
loadLayer('state_divisions', baseurl, 'state_divisions', uuid);

mapOnClickKey != undefined ? map.un('singleclick', getFeatureInfo) : "";
mapOnClickKey = map.on('singleclick', getFeatureInfo);
/*
legendHTML = "<div>\
				<div class='title'>"+layerName+"</div>\
				<div class='imgLegend'>\
					<img src='"+baseurl+"?TRANSPARENT=true&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&FORMAT=image/gif&EXCEPTIONS=application/vnd.ogc.se_xml&LAYER="+store+":"+layerName+"'/>\
				</div>\
			</div>";
legendContent.append(legendHTML);
*/
function getFeatureInfo(evt) {
	var viewResolution = /** @type {number} */ (map.getView().getResolution());
	var url = layerAdded['state_divisions'].getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', {'INFO_FORMAT': 'application/json'});
	if (url) {
		fetch(url)
		.then(function (response) { return response.text(); })
		.then(function (json) {
			content = JSON.parse(json);

			if(typeof(content.features[0]) != 'undefined') {

				var id = content.features[0].properties.id; //console.log(id);

				$.ajax({
					type: "POST",
					url: "/User/viewUser",
					data: "id="+id,
					cache: true,
					statusCode: {
						404: function() {
							$('#info').show();
							$('#info .info-body').html('ERROR! Not able to view details');
						}
					}
				}).then(function(response, status, xhr) { console.log(response);
					if(response.status == 'success') {
						window.location = '/Home/dashboard';
					}
				});
			}
		});
	}
}

function loadLayer(layerName, baseurl, layerId, uuid)
{
	layerAdded[layerId] = new ol.layer.Tile ({
		source: new ol.source.TileWMS({      
			url: baseurl,
			params: {
				'LAYERS': workspace+':'+layerName, 
				'TILED': true, 
				'CRS' : 4326,
				'viewparams': "uuid:"+encodeURI(uuid)
			}
		})
	});
	map.addLayer(layerAdded[layerId]);
}