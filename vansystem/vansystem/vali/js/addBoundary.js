var workspace = "vanapp";
var view = new ol.View({
	center:  ol.proj.transform([78.96, 21.59], 'EPSG:4326', 'EPSG:3857'),
	zoom: 4,
	projection: 'EPSG:3857'
});
var elem;
var osmLayer = new ol.layer.Tile({
	source: new ol.source.OSM()
});	

var googleLayer = new olgm.layer.Google();

var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: ol.coordinate.createStringXY(4),
		projection: 'EPSG:3857',
		className: 'custom-mouse-position',
		target: document.getElementById('latlonInfo'),
		undefinedHTML: '&nbsp;'
});

var scaleLine = new ol.control.ScaleLine({
	minWidth: 100
});

map = new ol.Map({
	target: 'mapPreview',
	interactions: olgm.interaction.defaults()
});
map.setView(view);
map.addLayer(osmLayer);
map.addControl(mousePositionControl);
map.addControl(scaleLine);
/**
 * Adding geojson
 */
var image = new ol.style.Circle({
    radius: 3,
    fill: new ol.style.Fill({
        color: 'green'
      }),
    stroke: new ol.style.Stroke({color: 'red', width: 1})
});
var styles = {
    'Point': new ol.style.Style({
      image: image
    })
};

var styleFunction = function(feature) {
    return styles[feature.getGeometry().getType()];
};
var layerAdded = [];

$('#pointLayers .toggle input[type="checkbox"]').on('change',function(){
	if($(this).is(":checked"))
	{
		uniLyrNm = $(this).parent().parent().parent().prev().text().trim() + parseInt(Math.random()*100);
		$(this).attr('data-lyrNm',uniLyrNm);
		// get geoJSON
		geoJSON = '{"type" : "FeatureCollection","crs": {"type": "name","properties": {"name":"EPSG:2857"}}}';
		arrId = $(this).attr('data-attr-id');
		arr = JSON.parse(getLocationData(arrId));
		arr = JSON.parse(arr[0].location_info);
		geoJSON = JSON.parse(geoJSON);
		features =[];
		$.each(arr, function(i,v){
			if(i==0){return;}
			prop = v[0];
			lat = v[1];
			long = v[2];
			points = ol.proj.transform([parseFloat(long), parseFloat(lat)], 'EPSG:4326','EPSG:3857');
			features.push({
	          'type': 'Feature',
	          'geometry': {
	            'type': 'Point',
	            'coordinates': [points[0],points[1]],
	            'properties' : {"name":prop}
	          }
        	});
		});
		geoJSON.features = features;
		vectorSource = new ol.source.Vector({
	       features: (new ol.format.GeoJSON()).readFeatures(geoJSON)
	    });
	    vectorSource.addFeature(new ol.Feature(new ol.geom.Circle([5e6, 7e6], 1e6)));
	    layerAdded[uniLyrNm] = new ol.layer.Vector({
	        source: vectorSource,
	        style: styleFunction
	    });
	    map.addLayer(layerAdded[uniLyrNm]);

	    /*
	    Additional nothing related
	    */
	    var pointsFeatures = geoJSON.features;
	}
	if($(this).is(":checked") === false)
	{
		lyrname = $(this).attr('data-lyrNm');
		map.removeLayer(layerAdded[lyrname]);
		delete layerAdded[lyrname];
	}
	var pointsArray = [];
	for(var i = 0;i<pointsFeatures.length;i++){
	  pointsArray.push(pointsFeatures[i].geometry.coordinates);
	}
	pointsArray.push(pointsFeatures[0].geometry.coordinates);
	var feat = new ol.Feature({
	    geometry: new ol.geom.Polygon(pointsArray)
	})
});

$('#vectorLayers .toggle input[type="checkbox"]').on('change',function(){
	if($(this).is(":checked"))
	{
		lyr = $(this).attr('data-attr-lyr');
		loadLayer(lyr, baseurl, lyr);
		elem = $(this);
		elem.parents().eq(3).next().find('input').attr('data-lyr-nm',lyr);
		/*
		r = Math.floor(Math.random() * (255 - 0 + 1)) + 0;
		g = Math.floor(Math.random() * (255 - 0 + 1)) + 0;
		b = Math.floor(Math.random() * (255 - 0 + 1)) + 0;
		var kmlStyles = {
			'MultiPolygon': new ol.style.Style({
		      stroke: new ol.style.Stroke({
		        color: 'black',
		        width: 1
		      }),
		      fill: new ol.style.Fill({
		        color: 'rgba('+r+','+g+','+b+')'
		      })
		    }),
		    'Polygon': new ol.style.Style({
		      stroke: new ol.style.Stroke({
		        color: 'black',
		        width: 1
		      }),
		      fill: new ol.style.Fill({
		        color: 'rgba('+r+','+g+','+b+')'
		      })
		    })
		};
		var kstyleFunction = function(feature) {
			return kmlStyles[feature.getGeometry().getType()];
		};
		uniLyrNm = $(this).parent().parent().parent().prev().text().trim() + parseInt(Math.random()*100);
		$(this).parents().eq(3).next().find('input').attr('data-lyr-nm',uniLyrNm);
		$(this).attr('data-lyrNm',uniLyrNm);
		kmlFilePath = $(this).attr('data-attr-path');
		layerAdded[uniLyrNm] = new ol.layer.Vector({
	        source: new ol.source.Vector({
	          url: kmlFilePath,
	          format: new ol.format.KML({extractStyles: false})
	        }),
	        style: kstyleFunction
    	});
		map.addLayer(layerAdded[uniLyrNm]);
		*/
	}
	if($(this).is(":checked") === false)
	{
		lyrname = $(this).attr('data-attr-lyr');
		map.removeLayer(layerAdded[lyrname]);
		delete layerAdded[lyrname];
	}
});

$('#rasterLayers .toggle input[type="checkbox"]').on('change',function(){
	if($(this).is(":checked"))
	{
		lyr = $(this).attr('data-attr-lyr');
		loadLayer(lyr, baseurl, lyr);
		elem = $(this);
		elem.parents().eq(3).next().find('input').attr('data-lyr-nm',lyr);
	}
	if($(this).is(":checked") === false)
	{
		lyr = $(this).attr('data-attr-lyr');
		map.removeLayer(layerAdded[lyr]);
		delete layerAdded[lyr];
	}
});

function getLocationData(id)
{
	response=null;
	$.ajax({
		async: false,
		url : "/GisDashboard/getLocationData",
		data : "id="+id,
		success:function(resp)
		{
			response = resp;
		}
	});
	return response;
}

/**
 * Verify Checked Layer
 * @param  {N/A}   If current checkbox is checked save is as verified
 * @return {none}  Updates the table user_point_data or user_gis_data
 */
$('.chkVerify input[type="checkbox"]').on('change',function(){
	val = $(this).is(":checked") ? true : false;
	table = $(this).attr('data-attr-table');
	id = $(this).attr('data-attr-id');
	$.ajax({
		url: "/GisDashboard/setVerifyPointVectorLayerUpload",
		data : "id="+id+"&table="+table+"&val="+val,
		success : function()
		{
			return true;
		}
	});
});

function loadLayer(layerName, baseurl, layerId)
{
	layerAdded[layerId] = new ol.layer.Tile ({
		source: new ol.source.TileWMS({      
		url: baseurl,
		params: {
				'LAYERS': layerName, 
				'TILED': true, 
				'CRS' : 3857
				}
		})
	});
	map.addLayer(layerAdded[layerId]);
	layerName = layerName.replace(workspace+":","");
	getBounds(layerName,baseurl);
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
            	notFound++;
            }
        }
        if(!notFound)
        {
        	alert("Layer not found in server.");
        }
    });
}