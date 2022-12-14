var state_layer, district_layer, tehsil_layer, village_layer;

$(document).ready(function(){
	//getMapofSelectedRegion(1);
	$(".legendRow").hide();
	$("#legendContent").hide();
});

var view = new ol.View({
	center:  ol.proj.fromLonLat([84.25,23.92]),
	zoom: 12
});
var layerName;
var layersByName = {};
var osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});

var googleLayer = new olgm.layer.Google();

 var mousePositionControl = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(4),
	projection: 'EPSG:4326',
	// comment the following two lines to have the mouse position
	// be placed within the map.
	className: 'custom-mouse-position',
	target: document.getElementById('latlonInfo'),
	undefinedHTML: '&nbsp;'
});

 var scaleLine = new ol.control.ScaleLine({
	minWidth: 100
  });

var map = new ol.Map({
    target: 'map',
    interactions: olgm.interaction.defaults()
});
map.setView(view);
map.addLayer(googleLayer);
map.addControl(mousePositionControl);
map.addControl(scaleLine);
var olGM = new olgm.OLGoogleMaps({map: map});
olGM.activate();
var layerList = {};
var layerFilters = {};

function loadLayer(layerName, store, baseurl, layerId, elemname, cql_filter_field, cql_filter_region, cql_filter_sc_id)
{
	var fieldFilter="";
	if(cql_filter_field != ""){
		fieldFilter = ';' + cql_filter_field + "='yes'";
	}
	layerFilters[layerId] = {};
	layerFilters[layerId]['cql_filter_field'] = fieldFilter;
	layerFilters[layerId]['cql_filter_region'] = cql_filter_region;
	layerFilters[layerId]['cql_filter_sc_id'] = cql_filter_sc_id;
    layerList[layerId] = new ol.layer.Tile({
        source : new ol.source.TileWMS({
            // crossOrigin : "anonymous",
            params : {
                'LAYERS' : store+":"+layerName,
				'cql_filter': selectedRegion_type+'_code=' + cql_filter_region + ';sc_id='+ cql_filter_sc_id + fieldFilter
            },
            url : baseurl
        })
    });
	layerList[layerId].set('Name', layerName);
    map.addLayer(layerList[layerId]);
    //getBounds(layer1, baseurl);
    layersByName[layerName] = layerList[layerId];
	$("#legendContent").show();
	$(".legendRow").show();
	/*var legendHTML = '<div class="legendRow row" id="legendRow_'+ layerId +'">';
	legendHTML += '<div class="medium-12 small-12 columns legendRowTitle">'+elemname+'</div>';
	legendHTML += '<div class="medium-12 small-12 columns"><img src="' + baseurl + '?Service=WMS&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=12&HEIGHT=12&LAYER=' + store + ':' + layerName + '" /></div>';
	legendHTML += '</div>';
	$("#legendContent").html( legendHTML + $("#legendContent").html());
	*/
	//$('#legend').attr('src',baseurl+'?Service=WMS&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=12&HEIGHT=12&LAYER='+store+':'+layerName);
    source = layerList[layerId].getSource();
    map.on('singleclick', function(evt) {
        $("#featureInfoContent").html('');
        var view = map.getView();
        var viewResolution = /** @type {number} */ (view.getResolution());
        Object.keys(layerList).forEach(function (layer) {
			if(typeof layerList[layer] != "undefined"){
				if (layerList[layer].getVisible() && layerList[layer].get('Name')!='Basemap') {
					var url = layerList[layer].getSource().getGetFeatureInfoUrl(
						evt.coordinate, viewResolution, view.getProjection(),
						{'INFO_FORMAT': 'text/html', 'FEATURE_COUNT': 100, 'VERSION':'1.1.0'});
					var temp = '(' + selectedRegion_type + '\\_code\\%3D)([\\w\\s]+)(\\%3B)';
					var regExp = new RegExp(temp,"ig"); 
					//regex['source'] = temp;
					url = url.replace(regExp, "");
					if (url) {
						$.ajax({
							url: url+"&X=50&Y=50",
							type: 'get',
							success: function(response){
								$("#featureInfo").show();
								var table = response.split('<body>').pop().split('</body>').shift();
								$("#featureInfoTitle").html("Feature info");
								var regex = /(\<caption class\=\"featureInfo\"\>)([\w\s]+)(\<\/caption\>)/ig; 
								table = table.replace(regex, "<caption>"+elemname+"</caption>");
								$("#featureInfoContent").html($("#featureInfoContent").html()+'<br />' + table);
							},
							error: function(e){
								$("featureInfo").html("Error: coudn't fetch details. Please contact site administrator.");
								//$("#errorECSubmit").show();
							}
						});
					 // document.getElementById('info').innerHTML = '<iframe width="100%" height="200px" seamless src="' + url + '&X=50&Y=50"></iframe>';
					}
				}
			}
		});
    });
}

function getBounds(layer, baseurl)
{
	// var featurePrefix = '***';
	// var featureType = '***';
	var url = baseurl+'?request=GetCapabilities&service=WMS&version=1.1.1';
    // var url = 'http://db2.biota.in:8080/geoserver/geet/wms?request=GetCapabilities&service=WMS&version=1.1.1';
	var parser = new ol.format.WMSCapabilities();
	$.ajax(url).then(function (response) {
        //window.alert("word");

        var result = parser.read(response);
        // console.log(result);
        var Layers = result.Capability.Layer.Layer;
        var extent;
        for (var i = 0, len = Layers.length; i < len; i++) {
            var layerobj = Layers[i];
            if (layerobj.Name == layer.get('Name'))
            {
            	extent = layerobj.BoundingBox[0].extent;
            	map.getView().fit(extent, map.getSize());
            }
        }
    });
}

function changeLayerOpacity(elemid, value){
	//elemid.split("_");
	//var layerId = temp[1]+"_"+temp[2]+"_"+temp[3]+"_"+temp[4]+"_"+temp[5];
	var layerId = elemid.replace("layerOpacitySlider_","");
	layerList[layerId].setOpacity(Number(value));
}

function updateCQL(type, code){
	for (var lyr in layerList) {
		layerList[lyr].getSource().updateParams({'cql_filter': type+'_code=' + code + ';sc_id='+ layerFilters[lyr]['cql_filter_sc_id'] + layerFilters[lyr]['cql_filter_field']}); 
	}  
}

function removeLayer(layerId)
{
	map.removeLayer(layerList[layerId]);
	$("#layerRow_"+layerId).remove();
	$("#legendRow_"+layerId).remove();
	layerList[layerId] = (function () { return; })();
	delete $("#layerOpacitySlider_"+layerId);
}