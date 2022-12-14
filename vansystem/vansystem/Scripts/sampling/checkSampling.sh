#!/bin/bash
# outputPath="/mnt/522f1012-c4b0-4083-9429-38548bfd5423/WebServer/html/vanapp/public/files/sampling"
# scriptPath="/mnt/522f1012-c4b0-4083-9429-38548bfd5423/WebServer/html/vanapp/public/scripts/sampling"
outputPath="/var/www/html/vanApp/public/files/sampling"
scriptPath="/var/www/html/vanApp/public/scripts/sampling"
list=(`find $outputPath -name "newRun.txt"`)
for i in "${list[@]}"
do
	name=$(dirname "$i" ".txt")
	name=${name[@]//$'\n'./}
	paramsGrid=`cat "${name}/grids.txt"`
	paramsSampling=`cat "$name/sampling.txt"`
	if [ -f "$name/newRun.txt" ]; then
	    rm -rf "$name/newRun.txt" 
	    touch "$name/running.txt"
	    python3 $scriptPath/grids.py $paramsGrid $name/
	    python3 $scriptPath/sampling.py $paramsSampling $name/
	    rm -rf "$name/running.txt"
	    touch "$name/completed.txt"
	fi
		
done
