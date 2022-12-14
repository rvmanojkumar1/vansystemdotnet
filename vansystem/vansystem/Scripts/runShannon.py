import glob, os
rootPath="/var/www/html/vanApp/public/files/shannonRun/"

for file in glob.glob(rootPath+"*.sh"):
    if not os.path.exists(rootPath+"running.txt"):
        with open(file, 'r') as content:
            data = content.read().replace('\n', '')
        os.system("touch "+rootPath+"running.txt")
        os.system('/usr/bin/gdal_grid '+data)
        os.system("rm "+rootPath+"running.txt")