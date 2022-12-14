# Import libraries
import psycopg2
import shapely
import shapely.wkt
import pandas as pd
import geopandas as gpd
from matplotlib import pyplot as plt
import numpy as np
from math import ceil
import os, sys
from osgeo import ogr
from osgeo import osr
from math import floor
from zipfile import ZipFile 
import subprocess
'''
Sample run
python dynamic_sampling.py ifmt_user ifmtuser@fes 192.168.14.86 5432 ifmt_dev Udaipur division_master udaipur@fes 
output_folder Nos file.xlsx 1000 0.1 
'''
# this script is divided into 3 sections
''' 1. Calling a Forest division layer from the database (Postgres here)
    2. Computation of grid size and generating them
    3. Filtering of generated grids. Area > 50% of square grid's area is filtered to new geodataframe
'''
dbUser = sys.argv[1]
dbPassword = sys.argv[2]
dbHost = sys.argv[3]
dbPort = sys.argv[4]
dbDatabase = sys.argv[5]
division = sys.argv[6]
divisionMasterTable = sys.argv[7]
userId = sys.argv[8]
outputFolder = sys.argv[9]
gridNumbers = sys.argv[10]
preSampleData = sys.argv[11]
# N 
totalPlots = sys.argv[12] if len(sys.argv) >= 13 else 1000
allowedError = sys.argv[13] if len(sys.argv) >= 14 else 0.1

# Section 1: Calling polygon from DB:
try:
    connection = psycopg2.connect(user = dbUser,
                                  password = dbPassword,
                                  host = dbHost,
                                  port = dbPort,
                                  database = dbDatabase)

    cursor = connection.cursor()
    # Print PostgreSQL version
    cursor.execute("SELECT version();")
    record = cursor.fetchone()
    print("You are connected to - ", record,"\n")

except (Exception, psycopg2.Error) as error :
    print ("Error while connecting to PostgreSQL", error)

# Specify sql query
sql = "SELECT * FROM "+divisionMasterTable+" WHERE name = '"+division+"';"

# Read data from PostGIS
#data variable consists of the forest division/range polygon
data = gpd.read_postgis(sql=sql, con=connection)
#print(data)
# Section 2: Data preprocessing and grid size computations:
datanew = data.to_crs({'init':'epsg:4326'}) #Reprojecting to UTM
# # spatial extents new
bounds = datanew.bounds
xmin = float(bounds.minx)
xmax = float(bounds.maxx)
ymin = float(bounds.miny)
ymax = float(bounds.maxy)

# Computation of grid size
# calculate area
poly_area = datanew.area
#print(poly_area)

# grid_nos will be the user entered variable. It will say the minimum number of grids to be made 
# in the selected region

#required number of grids,This is kept static needs to get dynamic from the user defined input.
grid_nos = int(gridNumbers)
grid_nos += grid_nos*0.1 #approximation: 10% addition in the grid numbers for a safer side

# divide poly_area by required number of grids
grid_area = poly_area/grid_nos
#print(grid_area)

# edge dimension of the grid
grid_dim = grid_area**0.5
#print(grid_dim)

gridWidth = float(grid_dim)
gridHeight = float(grid_dim)

# Grid size

#Output filepath
outputGridfn = "grid.shp"

#create grid around the selected area
# function grid generation

def main(outputGridfn,xmin,xmax,ymin,ymax,gridHeight,gridWidth):
    
    # get rows
    rows = ceil((ymax-ymin)/gridHeight)
    # get columns
    cols = ceil((xmax-xmin)/gridWidth)

    # start grid cell envelope
    ringXleftOrigin = xmin
    ringXrightOrigin = xmin + gridWidth
    ringYtopOrigin = ymax
    ringYbottomOrigin = ymax-gridHeight

    # create output file
    outDriver = ogr.GetDriverByName('ESRI Shapefile')
    if os.path.exists(outputGridfn):
        os.remove(outputGridfn)
    outDataSource = outDriver.CreateDataSource(outputGridfn)
    
    # create the spatial reference, WGS84
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)
    
    outLayer = outDataSource.CreateLayer(outputGridfn,srs,geom_type=ogr.wkbPolygon )
    featureDefn = outLayer.GetLayerDefn()

    # create grid cells
    countcols = 0
    while countcols < cols:
        countcols += 1

        # reset envelope for rows
        ringYtop = ringYtopOrigin
        ringYbottom =ringYbottomOrigin
        countrows = 0

        while countrows < rows:
            countrows += 1
            ring = ogr.Geometry(ogr.wkbLinearRing)
            ring.AddPoint(ringXleftOrigin, ringYtop)
            ring.AddPoint(ringXrightOrigin, ringYtop)
            ring.AddPoint(ringXrightOrigin, ringYbottom)
            ring.AddPoint(ringXleftOrigin, ringYbottom)
            ring.AddPoint(ringXleftOrigin, ringYtop)
            poly = ogr.Geometry(ogr.wkbPolygon)
            poly.AddGeometry(ring)

            # add new geom to layer
            outFeature = ogr.Feature(featureDefn)
            outFeature.SetGeometry(poly)
            outLayer.CreateFeature(outFeature)
            outFeature = None

            # new envelope for next poly
            ringYtop = ringYtop - gridHeight
            ringYbottom = ringYbottom - gridHeight

        # new envelope for next poly
        ringXleftOrigin = ringXleftOrigin + gridWidth
        ringXrightOrigin = ringXrightOrigin + gridWidth

    # Save and close DataSources
    outDataSource = None


#grid generated by calling the function    
# static_code 
# main('grid.shp',xmin,xmax,ymin,ymax,gridHeight,gridWidth)
# ends
main(outputFolder+'table_grids.shp',xmin,xmax,ymin,ymax,gridHeight,gridWidth)
#call the generated grid:

grid_generated = gpd.read_file(outputFolder+'table_grids.shp')
# grid_generated.plot(color='white', edgecolor='black')
# plt.show()

# intersection between generated grids and forest division polygon

res_intersection = gpd.overlay(datanew, grid_generated ,how='intersection')
# Filtering of the grids
selected_area = res_intersection[res_intersection.geometry.area >= (float(grid_area)*0.50)]
#Those grids above half the area of complete square grid will be selected to the final grids list

'''
#Just for ploting the layers
#fig, ax = plt.subplots()
fig, (ax1,ax2) = plt.subplots(nrows=1, ncols=2, figsize=(20, 16))
#ax.set_aspect('equal')
res_intersection.plot(ax=ax1, color='white', edgecolor='black')
selected_area.plot(ax=ax1, color='white', edgecolor='red')
res_intersection.plot(ax=ax2, color='red', edgecolor='black')
plt.show()
'''
res_intersection.to_file(outputFolder+"original.shp")
# Save selected area to shapefile
selected_area.to_file(outputFolder+"selected.shp")

# Read pre sample data
df = pd.read_csv(preSampleData)
volume = pd.DataFrame(df, columns= ['Volume'])
mean = volume.mean()
sd = volume.std()
coeff_var = (sd/mean)
t_value = 1.96 # default
allow_err = float(allowedError) # and confidence interval = 95%
total_plotno = int(totalPlots) #depends on the data (N)
count = len(selected_area) #to get the maximum possible number of grids

sample_size = (t_value**2)*((coeff_var/allow_err)**2)/(1+((1/total_plotno)*((coeff_var/allow_err)**2)))
sample_size = floor(sample_size)

# sample_size is the number of sample points as per the presampled data
cell_gap = floor(count/sample_size) #or 3 #or 5

# Cell_gap can be defined to 3 or 5 if the user needed to generate points in every 3 alternate cells
cell_gap = int(cell_gap)

# sampling point generation
x = []
y = []
if count > sample_size:
    for i in range(0,count-1,cell_gap):
        current_grid = selected_area.iloc[i]
        centroid = current_grid.geometry.centroid
        x.append(centroid.x)
        y.append(centroid.y)
else:
    print("sampling point intensity", sample_size, "is greater than number of grids in the selected region",count)

# defining projection (CRS) for sampling points
sample_pts = pd.DataFrame(list(zip(x,y)),columns =['lon', 'lat'])
sample_points = gpd.GeoDataFrame(sample_pts, geometry=gpd.points_from_xy(sample_pts.lon, sample_pts.lat))
sample_points.crs = {'init' :'epsg:4326'}

# Exporting to shapefile
sample_points.to_file(outputFolder+"sample_points.shp")
files=[outputFolder+"sample_points.shp", outputFolder+"sample_points.shx", outputFolder+"sample_points.dbf", outputFolder+"sample_points.prj"]
with ZipFile(outputFolder+'sample_points.zip','w') as zip:
    for file in files:
        zip.write(file)

# Exporting to CSV
sample_points.to_csv(outputFolder+"sample_points.csv")

cmd ="ogr2ogr -f KML "+outputFolder+"sample_points.kml "+outputFolder+"sample_points.shp"
subprocess.call(cmd, shell=True)
