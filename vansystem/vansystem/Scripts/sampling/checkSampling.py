#!/usr/bin/python
import glob
import os

rootPath = "/var/www/html/vanApp/"
# rootPath = "/mnt/522f1012-c4b0-4083-9429-38548bfd5423/WebServer/html/vanapp/"

mainPath="public/scripts/sampling/"
path="public/files/sampling/*/newRun.txt"

files=glob.glob(rootPath+path)
gridRun=""
samplingRun=""

def generateCommand(fileName):
	command=""
	with open(fileName) as f:
		command = f.readline()
	return command

for i in range(len(files)):
	dirActive=files[i].replace('newRun.txt','')
	grids=files[i].replace('newRun.txt','grids.txt')
	sampling=files[i].replace('newRun.txt', 'sampling.txt')
	gridRun = rootPath+mainPath+"grids.py "+generateCommand(grids)+" "+dirActive
	samplingRun = rootPath+mainPath+"sampling.py "+generateCommand(sampling)+" "+dirActive
	if os.path.exists(dirActive+"newRun.txt"):
		os.remove(dirActive+"newRun.txt")
		open(dirActive+"running.txt", 'a').close()
		print(gridRun)
		os.system("python3 "+gridRun)
		print(samplingRun)
		os.system("python3 "+samplingRun)
		os.remove(dirActive+"running.txt")
		open(dirActive+"completed.txt", 'a').close()
