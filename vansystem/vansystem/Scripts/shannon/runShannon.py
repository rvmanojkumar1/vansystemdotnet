#!/usr/bin/python
import glob
import os

rootPath = "/var/www/html/vanApp/"
# rootPath = "/mnt/522f1012-c4b0-4083-9429-38548bfd5423/WebServer/html/vanapp/"

mainPath = "public/scripts/shannon/"
path = "public/files/shannonRun/*/newRun.txt"

files = glob.glob(rootPath+path)

def generateCommand(fileName):
	command=""
	with open(fileName) as f:
		command = f.readline()
	return command

for i in range(len(files)):
    dirActive = files[i].replace('newRun.txt', '')
    shannonRun = rootPath+mainPath+"shannon.py "+generateCommand(files[i])+" "+dirActive
    if os.path.exists(dirActive+"newRun.txt"):
        os.remove(dirActive+"newRun.txt")
        open(dirActive+"running.txt", 'a').close()
        os.system("python3 "+shannonRun)
        os.remove(dirActive+"running.txt")
        open(dirActive+"completed.txt", 'a').close()
