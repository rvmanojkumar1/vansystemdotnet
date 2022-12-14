var workspace = "vanapp";
var mapOnClickKey;
var elem;

var center = $('#mapPreview').data('center');

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
		zoom: 10
	})
});
map.addLayer(osmLayer);
map.addControl(mousePositionControl);
map.addControl(scaleLine);
loadLayer('division_master', baseurl, 'division_master', create_by);
//getBounds('division_master', baseurl);
loadLayer('dynamic_range', baseurl, 'dynamic_range',create_by);
loadLayer('plot_master', baseurl, 'plot_master',create_by);

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
	getXy = evt.pixel;
	bbox = map.getView().calculateExtent(map.getSize());
	bbox = ol.proj.transformExtent(bbox, ol.proj.get('EPSG:3857'), ol.proj.get('EPSG:4326'));
	//console.log(bbox);
	var view = map.getView();
    var viewResolution = (view.getResolution());
    Object.values(['plot_master']).forEach(function (layer) {
		url = baseurl+"?LAYERS="+workspace+"%3A"+layer+"&QUERY_LAYERS=vanapp%3A"+layer
				+"&STYLES=&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&BBOX="+bbox
				+"&FEATURE_COUNT=50&HEIGHT="+$(window).height()+"&WIDTH="+$(window).width()
				+"&FORMAT=image%2Fpng&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326";
		if (url) 
		{
			$('#loader').show();
			$.ajax({
				url: url+"&X="+getXy[0]+"&Y="+getXy[1],
				type: 'get',
				success: function(response){
					var table = response.split('<body>').pop().split('</body>').shift();
					featureInfoContent.html(table);
					$('#loader').hide();
				},
				error: function(e){
					layerElemId = layer.replace(/ /g, '__');
					featureInfoContent = $('#'+layerElemId+'collapse .featureInfo div');
					featureInfoContent.html("Error: coudn't fetch details. Please contact site administrator.");
				}
			});
			$('#loader').hide();
		}
	});
}

function loadLayer(layerName, baseurl, layerId, create_by, fid=null)
{
	filterVal = (layerName=='dynamic_plot_survey_geom') ? create_by_ranges : "'"+create_by+"'";	
	query = fid != null ? "create_by in (" + filterVal + ") and f_id = "+fid : "create_by in (" + filterVal + ")";
	layerAdded[layerId] = new ol.layer.Tile ({
		source: new ol.source.TileWMS({      
			url: baseurl,
			params: {
				'LAYERS': layerName, 
				'TILED': true, 
				'CRS' : 4326,
				'cql_filter': query
			}
		})
	});
	map.addLayer(layerAdded[layerId]);
}

function getBounds(layerName, baseurl)
{
	var url = baseurl+'?request=GetCapabilities&service=WMS&version=1.1.1';
	var parser = new ol.format.WMSCapabilities();
	$.ajax(url).then(function (response) {
    	var result = parser.read(response);
        var Layers = result.Capability.Layer.Layer;
        var extent;
        var notFound = 0;
        for (var i = 0, len = Layers.length; i < len; i++) {
			var layerobj = Layers[i];
            if (layerobj.Name == layerName)
            {
            	extent = layerobj.BoundingBox[0].extent;
            	extent = ol.proj.transformExtent(extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));
            	map.getView().fit(extent, map.getSize());
            	map.getView().setZoom(7);
            	notFound++;
            }
        }
        if(!notFound)
        {
        	alert("Layer not found in server.");
        }
    });
}