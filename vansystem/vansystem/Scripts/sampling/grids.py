import psycopg2
import geopandas as gpd
from math import ceil
import os, sys
from osgeo import ogr
from osgeo import osr
from shapely.geometry import MultiPolygon
import subprocess
from dotenv import load_dotenv
os.environ['SHAPE_ENCODING'] = "utf-8"
'''
Sample CLI run command
-----------------------
python grids.py ifmt_user ifmtuser@fes 192.168.14.86 5432 ifmt_dev Udaipur division_master udaipur@fes
-----------------------
requires database user, password, host, port, database, division (name|id), table name of division & session user to run
-----------------------
expected output in grid_auto_master table is stored within the same database
'''

load_dotenv()

params = {
    'host': os.getenv('PGL_HOST'),
    'database': os.getenv('PGL_DATABASE'),
    'user': os.getenv('PGL_USERNAME'),
    'password': os.getenv('PGL_PASSWORD'),
    'port': os.getenv('PGL_PORT')
}

division = sys.argv[1]
divisionMasterTable = sys.argv[2]
userId = sys.argv[3]
outputFolder = sys.argv[8]

# spatial extents
xmin = float(sys.argv[4])
xmax = float(sys.argv[5])
ymin = float(sys.argv[6])
ymax = float(sys.argv[7])


def main(outputGridfn,xmin,xmax,ymin,ymax,grid_height,grid_width):

    # number of rows and columns
    rows = ceil((ymax-ymin)/grid_height)
    cols = ceil((xmax-xmin)/grid_width)

    # grid cell orgin
    left_x = xmin
    right_x = xmin + grid_width
    top_y = ymax
    bottom_y = ymax - grid_height

    # create output file
    outDriver = ogr.GetDriverByName('ESRI Shapefile')
    outDataSource = outDriver.CreateDataSource(outputGridfn)

    # create the spatial reference, WGS84
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)

    outLayer = outDataSource.CreateLayer(outputGridfn,srs,geom_type=ogr.wkbPolygon )
    featureDefn = outLayer.GetLayerDefn()

    # create grid cells
    # Column-wise numbering or Column-wise generated

    countcols = 0
    while countcols < cols:
        countcols += 1

        # reset envelope for rows
        ringYtop = top_y
        ringYbottom =bottom_y
        countrows = 0

        while countrows < rows:
            countrows += 1
            ring = ogr.Geometry(ogr.wkbLinearRing)
            ring.AddPoint(left_x, ringYtop)
            ring.AddPoint(right_x, ringYtop)
            ring.AddPoint(right_x, ringYbottom)
            ring.AddPoint(left_x, ringYbottom)
            ring.AddPoint(left_x, ringYtop)
            poly = ogr.Geometry(ogr.wkbPolygon)
            poly.AddGeometry(ring)

            # adding the created geometry to Shapefile or layer
            outFeature = ogr.Feature(featureDefn)
            outFeature.SetGeometry(poly)
            outLayer.CreateFeature(outFeature)
            outFeature = None

            # new envelope for next poly
            ringYtop = ringYtop - grid_height
            ringYbottom = ringYbottom - grid_height

        # new envelope for next poly
        left_x = left_x + grid_width
        right_x = right_x + grid_width

    # Save and close DataSources
    outDataSource = None

grids = {
        '1_15': 0.02083333, 
        '15': 0.25000000, 
        '25': 0.00694444
}
cmd = 'PGPASSWORD='+params['password']+' psql -c "delete from grid_auto_master where create_by = \''+userId+'\'" -d '+params['database']+' -U '+params['user']+' -h '+params['host']
subprocess.call(cmd, shell=True)
for grid_val in grids:
    grid_width = grids[grid_val]  #1.25 minutes # longitude
    grid_height = grids[grid_val] #1.25 minutes # latitude	
    main(outputFolder+'table_'+grid_val+'.shp', xmin, xmax, ymin, ymax, grid_height, grid_width)
    driver = ogr.GetDriverByName('ESRI Shapefile')
    dataSource = driver.Open(outputFolder+'table_'+grid_val+'.shp', 1)
    #userId = userId.encode('utf-8')
    if dataSource is None:
        print("ERROR: could not open '%s' as shapefile!"%(outputFolder+'table_'+grid_val+'.shp'))
        sys.exit(1)
    layer = dataSource.GetLayer()
    layer.CreateField(ogr.FieldDefn("create_by", ogr.OFTString))
    layer.CreateField(ogr.FieldDefn("division", ogr.OFTString))
    layer.CreateField(ogr.FieldDefn("grid_type", ogr.OFTString))
    feature = layer.GetNextFeature()
    while feature:
        feature.SetField("create_by", userId)
        feature.SetField("division", division)
        feature.SetField("grid_type", grid_val)
        layer.SetFeature(feature)
        feature = layer.GetNextFeature()
    # cmd = 'ogrinfo '+outputFolder+'table_'+grid_val+'.shp -dialect SQLite -sql "update table_'+grid_val+' set create_by = \''+userId+'\' where create_by is null"'
    # subprocess.call(cmd, shell=True)
    # cmd = 'ogrinfo '+outputFolder+'table_'+grid_val+'.shp -dialect SQLite -sql "update table_'+grid_val+' set division = \''+division+'\' where division is null"'
    # subprocess.call(cmd, shell=True)
    # cmd = 'ogrinfo '+outputFolder+'table_'+grid_val+'.shp -dialect SQLite -sql "update table_'+grid_val+' set grid_type = \''+grid_val+'\' where grid_type is null"'
    # subprocess.call(cmd, shell=True)
    cmd = 'shp2pgsql -I -a -s 4326 '+outputFolder+'table_'+grid_val+'.shp grid_auto_master | PGPASSWORD='+params['password']+' psql -q -d '+params['database']+' -U '+params['user']+' -h '+params['host']
    subprocess.call(cmd, shell=True)
