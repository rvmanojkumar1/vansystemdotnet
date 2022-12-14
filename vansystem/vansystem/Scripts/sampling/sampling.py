# Modules Required
import psycopg2
import osgeo.ogr
import shapely
import geopandas as gpd
from geopandas import GeoDataFrame
from matplotlib import pyplot as plt
import os, sys
import ogr
from math import floor
import pandas as pd
from zipfile import ZipFile 
from dotenv import load_dotenv
import subprocess
os.environ['SHAPE_ENCODING'] = "utf-8"
'''
Sample CLI run command
-----------------------
python sampling.py file.xlsx ifmt_user ifmtuser@fes 192.168.14.86 5432 ifmt_dev Udaipur division_master udaipur@fes
-----------------------
requires database user, password, host, port, database, division (name|id), table name of division & session user to run
-----------------------
expected output in point sample data
'''

# Fetching presample plot datasheets
# Read excel sheets! Excel sheet should be of the same format as of the template. 
# This template can be downloaded or viewed from the site. 
# if only single sheet is present in the excel.

load_dotenv()

params = {
    'host': os.getenv('PGL_HOST'),
    'database': os.getenv('PGL_DATABASE'),
    'user': os.getenv('PGL_USERNAME'),
    'password': os.getenv('PGL_PASSWORD'),
    'port': os.getenv('PGL_PORT')
}

coeff_var = float(sys.argv[1]) # 0.5

#aoiState = sys.argv[7] # Udaipur
division = sys.argv[2] # Udaipur
divisionMasterTable = sys.argv[3] # division_master
userId= sys.argv[4] # udaipur@fes
# totalPlots = sys.argv[5] # 1000
allowedError = float(sys.argv[5]) # 0.1
outputFolder = sys.argv[6]

# coeff_var = 0.7

# division = "Gaya"
# divisionMasterTable = "division_master"
# userId= "gaya@fes"
# allowedError = 0.1
# outputFolder = "/mnt/522f1012-c4b0-4083-9429-38548bfd5423/WebServer/html/vanapp/public/files/sampling/gaya/"

#df = pd.read_excel(preSampleData) 
#(use "r" before the path string to address special character, such as '\'). 
# Don't forget to put the file name at the end of the path + '.xlsx'
# print (df)

## if multiple sheets are present in the excel file
## from openpyxl import load_workbook
## excel = load_workbook('D:/ForestPlus_2/sampling/Assam Sampling+Sample locationVersion1.xlsx')
## sheet = excel.get_sheet_by_name('Aie-Valley')#extract specific sheet by passing division name !

# Volume calculation
# volume = pd.DataFrame(df, columns= ['Volume'])
# mean = volume.mean()

# Standard deviation calculation
# sd = volume.std()
# # Coefficient of variation calculation
# # CV = (SD/Mean)
# coeff_var = (sd/mean)
# print(coeff_var)
# Define the variables
# t-value for infinite entries of degrees of freedom = 1.96
# tv = 1.96 as of now!!
t_value = 1.96 # default
# allow_err = float(allowedError) # and confidence interval = 95%
# print(allow_err)
# total_plotno = int(totalPlots) #depends on the data (N)

# Sampling size formula as per NWPC 2014
co_sqr = (coeff_var/allowedError)**2
sample_size = (t_value**2)*co_sqr
sample_size = floor(sample_size)
# print("sample size =",sample_size)
# sample_size is the number of sample points as per the presampled data

# DB Connection
# Add grids of different dimensions into database - "grids here"
# Add boundaries of forest division, range/ reserve forest/ compartments/ block into database - "boundaries here"
# Give unique IDs or names to each grids.

# Connect DB of Grids

try:
    connection = psycopg2.connect(**params)
    cursor = connection.cursor()
    print("You are connected to grids ")

except (Exception, psycopg2.Error) as error :
    print ("Error while connecting to PostgreSQL", error)

# Specify sql query
#sql1 = "SELECT * FROM grid_auto_master where division='"+division+"';"
#sql2 = "SELECT * FROM grid_auto_master where division='"+division+"';"
sql3 = "SELECT * FROM grid_auto_master where create_by='"+userId+"' and grid_type = '25';"
# Read data from PostGIS
# Replace by Indian Grids
#assam_int_1_25min = gpd.read_postgis(sql=sql1, con=connection) #visualisation/overlay over basemap
#assam_int_15min = gpd.read_postgis(sql=sql2, con=connection) #visualisation/overlay over basemap
grid_25 = gpd.read_postgis(sql=sql3, con=connection) #Sampling point generation

# Connect DB of Forest Division/ range/reserve forest/ compartments
try:
    connection1 = psycopg2.connect(**params)
    cursor = connection.cursor()
    print("You are connected to boundary ")

except (Exception, psycopg2.Error) as error :
    print ("Error while connecting to PostgreSQL", error)

# Specify sql query
# User defined boundary to be updated instead of 'Aie Valley'
# sql4 = "SELECT geom, name as compartment_name FROM compartment_master WHERE create_by = '"+userId+"';"

sql4 = """SELECT cm.geom, cm.name as comp_name, bm.name as block_name, rm.name as range_name 
        FROM compartment_master as cm 
        INNER JOIN block_master as bm 
            ON bm.id = cm.parent_id 
        INNER JOIN range_master as rm 
            ON rm.id = bm.parent_id 
        WHERE cm.create_by = '"""+userId+"""';"""

# Read data from PostGIS
forest_boundary = gpd.read_postgis(sql=sql4, con=connection1)
connection1.close()

#print(assam_int_1_25min.head())
#print(assam_int_15min.head())
#print(assam_int_25sec.head())
#print(aie_valley)

#assam_int_15min.plot(figsize=(8,8))
#assam_int_1_25min.plot(figsize=(8,8))
#assam_int_25sec.plot(figsize=(10,10))
#aie_valley.plot(figsize=(8,8))

#plt.show()


# Intersection of grids and boundary
intersection = gpd.overlay(forest_boundary, grid_25, how='intersection')

#Remove remaining cells (irregular boundary creates irregularly shaped grids at boundaries)

#selected_area = intersection[intersection.geometry.area >= 0.000048]#Area of 25" * 25" grid.
selected_area = intersection # (as per changes by vishnu IORA 11/10/2019)

count = len(selected_area) #to get the maximum possible number of grids
# sample_size is the number of sample points as per the presampled data
cell_gap = floor(count/sample_size) #or 3 #or 5
# Cell_gap can be defined to 3 or 5 if the user needed to generate points in every 3 alternate cells
cell_gap = int(cell_gap)

# sampling point generation
user = []
div = []
rnge = []
block = []
comp = []
p = 1
plots = []
x = []
y = []
if count > sample_size:
    for i in range(0, count-1, cell_gap):
        current_grid = selected_area.iloc[i] 
        # print(current_grid)
        centroid = current_grid.geometry.centroid
        x.append(centroid.x)
        y.append(centroid.y)
        div.append(division)
        rnge.append(current_grid['range_name'])
        block.append(current_grid['block_name'])
        comp.append(current_grid['comp_name'])
        plots.append(p)
        user.append(userId)
        p = p+1
else:
    print("sampling point intensity", sample_size, "is greater than number of grids in the selected region",count)

# defining projection (CRS) for sampling points
sample_pts = pd.DataFrame(list(zip(user, div, rnge, block, comp, plots, x, y)), columns = ['create_by', 'division', 'range', 'block', 'compartment', 'id', 'lon', 'lat'])
sample_points = gpd.GeoDataFrame(sample_pts, geometry = gpd.points_from_xy(sample_pts.lon, sample_pts.lat))
sample_points.crs = {'init' :'epsg:4326'}

# plot function
# base = intersection.plot(color='white', edgecolor='black',figsize=(12, 12))
# sample_points.plot(ax=base, marker='o', color='green', markersize=10)

cmd = 'PGPASSWORD='+params['password']+' psql -c "delete from sample_plots_auto_master where create_by = \''+userId+'\'" -d '+params['database']+' -U '+params['user']+' -h '+params['host']
subprocess.call(cmd, shell=True)

# Exporting to shapefile
sample_points.to_file(outputFolder+"sample_points.shp")
files=[outputFolder+"sample_points.shp", outputFolder+"sample_points.shx", outputFolder+"sample_points.dbf", outputFolder+"sample_points.prj"]
with ZipFile(outputFolder+'sample_points.zip','w') as zip:
    for file in files:
        absname = os.path.abspath(os.path.join(outputFolder, file))
        arcname = absname[len(outputFolder):]
        zip.write(absname, arcname)

cmd = 'shp2pgsql -I -a -s 4326 '+outputFolder+'sample_points.shp sample_plots_auto_master | PGPASSWORD='+params['password']+' psql -q -d '+params['database']+' -U '+params['user']+' -h '+params['host']
subprocess.call(cmd, shell=True)

intersection.to_file(outputFolder+"intersection.shp")
files=[outputFolder+"intersection.shp", outputFolder+"intersection.shx", outputFolder+"intersection.dbf", outputFolder+"intersection.prj"]
with ZipFile(outputFolder+'intersection.zip','w') as zip:
    for file in files:
        absname = os.path.abspath(os.path.join(outputFolder, file))
        arcname = absname[len(outputFolder):]
        zip.write(absname, arcname)

# Exporting to CSV
sample_points.to_csv(outputFolder+"sample_points.csv")

cmd ="ogr2ogr -f KML "+outputFolder+"sample_points.kml "+outputFolder+"sample_points.shp"
subprocess.call(cmd, shell=True)
