from osgeo import gdal
import os, sys
from dotenv import load_dotenv

load_dotenv()

xmin = float(sys.argv[1])
xmax = float(sys.argv[2])
ymin = float(sys.argv[3])
ymax = float(sys.argv[4])

division = sys.argv[5].lower()
outputFolder = sys.argv[7]
userId = sys.argv[6]

gdal.UseExceptions()

gdalGridOptions = gdal.GridOptions(
    format = 'GTiff', 
    zfield = 'Shannon',
    outputBounds = [xmin, ymin, xmax, ymax],
    outputType = gdal.GDT_Float64
)

gdal.Grid(outputFolder+'shannon_'+division+'.tiff', outputFolder+'shannon_'+division+'.vrt', options = gdalGridOptions)

dbConn = "PG:host="+os.getenv('PGL_HOST')+" port="+os.getenv('PGL_PORT')+" user='"+os.getenv('PGL_USERNAME')+"' password='"+os.getenv('PGL_PASSWORD')+"' dbname='"+os.getenv('PGL_DATABASE')+"'"
gdalWarpOptions = gdal.WarpOptions(
    format = "GTiff",
    cutlineDSName = dbConn,
    cutlineSQL = "select geom from division_master where create_by = '"+userId+"'",
    cropToCutline = True,
    srcNodata = 0,
    srcAlpha = False,
    resampleAlg = gdal.GRIORA_CubicSpline
)

gdal.Warp(outputFolder+'shannon_'+division+'_clipped.tiff', outputFolder+'shannon_'+division+'.tiff', options = gdalWarpOptions)