import glob, os
rootPath="/var/www/html/vanApp/public/files/temp/crons/"
pemLocation="/home/ubuntu/vanappdb.pem"

for file in glob.glob(rootPath+"*.txt"):
	if not os.path.exists(rootPath+"running.txt"):
		f = open(file, "r")
		a = f.read().split(" ")
		os.system("touch "+rootPath+"running.txt")
		os.system("rsync -avzr -e 'ssh -i "+pemLocation+"' "+a[0]+" ubuntu@10.0.0.7:"+a[1])
		os.system("rm "+rootPath+"running.txt")
		os.system("rm "+file)
