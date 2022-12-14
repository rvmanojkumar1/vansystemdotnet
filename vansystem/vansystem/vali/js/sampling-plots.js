var currentStatus = 0;
$(document).ready(function(){
    
    $('#gridNumber').hide();
    $('#checkStatus').click();

    var checkStatusInterval = window.setInterval(function(){
        $('#checkStatus').click();
    }, 5000);

    $('.downloadFiles').hide();
    
    $('#confLevel').on('change', function(){
        confLevel = $(this).val();
        if(confLevel != 'Select')
        {
            confLevel = parseInt(confLevel);
            $('#errLevel').val(100-confLevel);
        }else{
            $('#errLevel').val("");
        }
    });
    $('#dynamiCheck').on('click', function(){
        if($('#dynamiCheck').prop('checked'))
        {
            $('#gridNumber').show();
        }else{
            $('#gridNumber').hide();
        }
    });
    
    $('#checkStatus').on('click', function(){
        $.ajax({
            url : "/DataUpload/checkStatus",
            success : function(response)
            {
                response = $.parseJSON(response);
                currentStatus = response.status_code;
                if(response.status_code == 1)
                {
                    $('#messageStatus').removeClass('badge-warning badge-success badge-danger');
                    $('#messageStatus').addClass('badge-info');
                } else if(response.status_code == 2) {
                    $('#messageStatus').removeClass('badge-success badge-info badge-danger');
                    $('#messageStatus').addClass('badge-warning');
                }else if(response.status_code == 3){
                    $('#messageStatus').removeClass('badge-warning badge-info badge-danger');
                    $('#messageStatus').addClass('badge-success');
                    //Show download buttons
                    $('.downloadFiles').show();
                    clearInterval(checkStatusInterval);
                    $('#downloadKML').attr('href', "/DataUpload/downloadKML");
                    $('#downloadShapeFile').attr('href', "/DataUpload/downloadSHP");
                    $('#downloadCSV').attr('href', "/DataUpload/downloadCSV");

                    updateMap();

                }else if(response.status_code == 4){
                    $('#messageStatus').removeClass('badge-warning badge-info badge-success');
                    $('#messageStatus').addClass('badge-danger');
                } else if(response.status_code == 5){
                    $('#messageStatus').removeClass('badge-warning badge-success badge-danger');
                    $('#messageStatus').addClass('badge-info');
                }
                $('#messageStatus').html(response.message);
            }
        });
    });
});

var layerAdded = [];
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
var scaleLine = new ol.control.ScaleLine({
    minWidth: 100
});
var map = new ol.Map({
    target: 'mapPreview',
    view : new ol.View({
        center:  ol.proj.fromLonLat(center),
        zoom: 11
    })
});
map.addLayer(osmLayer);
map.addControl(mousePositionControl);
map.addControl(scaleLine);
loadLayer('division_master', baseurl, 'division_master', create_by);
loadLayer('compartment_master', baseurl, 'compartment_master', create_by);
loadLayer('division_grids', baseurl, 'division_grids', create_by);
loadLayer('sample_plots_generated', baseurl, 'sample_plots_generated', create_by);

function updateMap() {
    map.removeLayer(layerAdded['division_grids']);
    map.removeLayer(layerAdded['sample_plots_generated']);

    loadLayer('division_grids', baseurl, 'division_grids',create_by);
    loadLayer('sample_plots_generated', baseurl, 'sample_plots_generated', create_by);
}

function loadLayer(layerName, baseurl, layerId) {
    filterVal = "'"+create_by+"'";	
    query = "create_by in (" + filterVal + ")";
    layerAdded[layerId] = new ol.layer.Tile({
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