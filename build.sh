#!/bin/bash 

# Installazione dei moduli nesessari per far funzionare lo script
#curl -L http://xrl.us/installperlosx | bash # O trovare un altro metodo per installare Perl
#npm install -g javascript-obfuscator
#npm install -g html-minifier
#npm install -g uglify-es
#npm install -g postcss-cli
#npm install -g cssnano
#npm install -g electron-packager
#npm install -g electron-installer-dmg

#npm install -g javascript-obfuscator html-minifier uglify-es postcss-cli cssnano electron-packager electron-installer-dmg

electronVersion="3.1.7"

version="1.2"
subversion="0"
completeVersion="${version}.${subversion}"
versionPath=$(echo "$completeVersion" | sed 's/\./_/g')
applicationName="Ammissione";
applicationNameWithVersion="${applicationName}_${versionPath}"

companyName="TestAmmissione S.R.L."
autor=$companyName
legalCopyright="Copyright © 2019 ${companyName} All rights reserved."

currentDirectory="$(pwd | rev | cut -d'/' -f1 | rev)"
releaseDirectory="$(echo $currentDirectory)_${versionPath}"


rm -rf "../${releaseDirectory}.zip"
rm -rf "../${releaseDirectory}/"
mkdir "../$releaseDirectory/"

for i in {1..150}
do
   echo " "
done

clear

echo "CREATED RELEASE DIRECTORY: ../$releaseDirectory/"

for filename in $(find ./ -name '*.js' ! -name '*.min.js' ! -path '*node_modules*' ! -path '*release-builds*' -type f)
do
    extension="$(cut -d'.' -f3 <<<"$filename")"
    if [ "$extension" == "js" ]
    then
        filepath=$(dirname $filename)
        filepath1=$(echo "$filepath" | sed 's/^\.\//\./g')
        filepath=$(echo "$filepath" | sed 's/^\.\///g' | sed 's/^\.//g')
        filename=$(basename $filename)

        if [ ! -d "../$releaseDirectory$filepath" ]; then
            mkdir "../$releaseDirectory$filepath"
            echo "" && echo "CREATE DIRECTORY: ../$releaseDirectory$filepath"
        fi

        name=$(basename $filename .js)
    
        uglifyjs --rename --output "../$releaseDirectory$filepath/$filename" --mangle --toplevel -- "$filepath1/$filename" 

        # npm install -g javascript-obfuscator
        if [[ $filepath1 == "./js" ]]
        then
            echo "BROWSER BROWSER"
            #javascript-obfuscator "../$releaseDirectory$filepath/$filename" --output "../$releaseDirectory$filepath/$filename" --compact=true --control-flow-flattening=true \
            #--control-tlow-tlattening-threshold=1 --dead-code-injection=true --dead-code-injection-threshold=1 --debug-protection=false --debug-protection-interval=false \
            #--disable-console-output=false --identifier-names-generator='hexadecimal' --log=true --rename-globals=false --rotate-string-array=false --self-defending=false --string-array=false \
            #--string-array-encoding=false --string-array-threshold=1 --transform-object-keys=true --unicode-escape-sequence=false
            javascript-obfuscator "../$releaseDirectory$filepath/$filename" --output "../$releaseDirectory$filepath/$filename" --compact=true --control-flow-flattening=true --control-tlow-tlattening-threshold=1 \
            --targhet='browser'
        else
            echo "NODE NODE"
            #javascript-obfuscator "../$releaseDirectory$filepath/$filename" --output "../$releaseDirectory$filepath/$filename" --compact=true --control-flow-flattening=true \
            #--control-tlow-tlattening-threshold=1 --dead-code-injection=true --dead-code-injection-threshold=1 --debug-protection=false --debug-protection-interval=false \
            #--disable-console-output=false --identifier-names-generator='hexadecimal' --log=true --rename-globals=false --rotate-string-array=false --self-defending=false --string-array=false \
            #--string-array-encoding=false --string-array-threshold=1 --transform-object-keys=true --unicode-escape-sequence=false
            javascript-obfuscator "../$releaseDirectory$filepath/$filename" --output "../$releaseDirectory$filepath/$filename" --compact=true --control-flow-flattening=true --control-tlow-tlattening-threshold=1 \
            --targhet='node'
        fi

        echo "" && echo "INPUT PRETTY: $filepath/$filename - OUTPUT UGLFYED: ../$releaseDirectory$filepath/$filename"
    fi
done

for filename in $(find ./  \( -name '*.min.js' -o -name '*.html' -o -name '*.css' -o -name 'package.json' -o -name '*.icns' \) ! -path '*node_modules*' ! -path '*release-builds*' -type f)
do
    filepath=$(dirname $filename)
    filepath=$(echo "$filepath" | sed 's/^\.\///g' | sed 's/^\.//g')
    filename=$(basename $filename)

    if [ ! -d "../$releaseDirectory$filepath" ]; then
        mkdir "../$releaseDirectory$filepath"
        echo "" && echo "CREATE DIRECTORY: ../$releaseDirectory$filepath"
    fi

    cp ".$filepath/$filename" "../$releaseDirectory$filepath/$filename"

    echo "" && echo "COPY: .$filepath/$filename TO ../$releaseDirectory$filepath/$filename"

    #perl -pi -e 's/(?<!\.min)\.js/\.min\.js/g' "../$releaseDirectory$filepath/$filename"
    
    extension="$(echo "$filename" | rev | cut -d'.' -f1 | rev)"
    #echo "EXTENSION: $extension"
    if [ "$extension" == "html" ] # || [ "$extension" == "css" ]
    then
        #npm install html-minifier -g
        echo "" && echo "HTML MINIFY: ../$releaseDirectory$filepath/$filename"
        html-minifier --html5 --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace \
        --use-short-doctype --minify-css=true --minify-js=true  "../$releaseDirectory$filepath/$filename" -o "../$releaseDirectory$filepath/$filename"
    fi

    # npm install cssnano --save-dev
    # npm install postcss-preset-env --save-dev
    # npm install postcss-cli --global
    if [ "$extension" == "css" ]
    then
        echo "" && echo "CSS MINIFY: ../$releaseDirectory$filepath/$filename"
        postcss  --use cssnano --output "../$releaseDirectory$filepath/$filename" "../$releaseDirectory$filepath/$filename"
        #postcss --output "../$releaseDirectory$filepath/$filename" "../$releaseDirectory$filepath/$filename"
        #perl -pi -e 's/\/\*\#.*\*\///g' "../$releaseDirectory$filepath/$filename"
    fi
    #echo "jquery-3.3.1.min.js pippo.min.js cane.js  ga.js ga.min.js gamin.js .js" | perl -pe 's/(?<!\.min)\.js/\.min\.js/g'
done

rm "../$releaseDirectory$filepath/index.html"
rm "../$releaseDirectory$filepath/themes.css"

echo "" && echo "NPM INSTALL"
cd "../$releaseDirectory/"

npm install

echo "" && echo "CREATE OSX PACKAGE"

electron-packager . $applicationNameWithVersion --overwrite --asar --platform=darwin --arch=x64 --icon=icon.icns \
--prune=true --out=release-builds  \
--version-string.LegalCopyright="${companyName}" \
--version-string.CompanyName="${companyName}" --version-string.FileDescription="${applicationName} ${version}" \
--version-string.ProductName="${version}" --app-copyright="${legalCopyright}" \
--app-version="${completeVersion}" --executable-name="${applicationName}" --win32metadata.VersionInfo.InternalName="${applicationName} ${version}" \
--win32metadata.VersionInfo.OriginalFilename="${applicationName}" --win32metadata.VersionInfo.FileVersion="${completeVersion}" \
--win32metadata.VersionInfo.FileDescription="${applicationName} ${version}" --win32metadata.VersionInfo.Product="${applicationName} ${version}" \
--win32metadata.VersionInfo.ProductVersion="${version}" --win32metadata.CompanyName="${companyName}" \
--win32metadata.Autor="${autor}" --win32metadata.InternalName="$applicationName ${version}" \
--win32metadata.OriginalFilename="${applicationName}" --win32metadata.FileVersion="${completeVersion}" --win32metadata.FileDescription="${applicationName} ${version}" \
--win32metadata.Product="${applicationName} ${version}" \
--win32metadata.ProductVersion="${version}" --electron-version="${electronVersion}"

rm ../$releaseDirectory/release-builds/$applicationNameWithVersion-darwin-x64/LICENS*
rm ../$releaseDirectory/release-builds/$applicationNameWithVersion-darwin-x64/version
electron-installer-dmg ./release-builds/$applicationNameWithVersion-darwin-x64/$applicationNameWithVersion.app $applicationNameWithVersion --overwrite --out ./release-builds/$applicationNameWithVersion-darwin-x64/ --icon=icon.icns

echo "" && echo "CHANGE ICON FORMAT:"

cd "../$currentDirectory/"
for filename in $(find ./  \( -name '*.ico'  \) ! -path '*node_modules*' ! -path '*release-builds*' -type f)
do
    filepath=$(dirname $filename)
    filepath=$(echo "$filepath" | sed 's/^\.\///g' | sed 's/^\.//g')
    filename=$(basename $filename)

    cp ".$filepath/$filename" "../$releaseDirectory$filepath/$filename"

    echo "" && echo "COPY: .$filepath/$filename ../$releaseDirectory$filepath/$filename"
done


cd "../$releaseDirectory/"
for filename in $(find ./  \( -name '*.icns' \) ! -path '*node_modules*' ! -path '*release-builds*' -type f)
do
    filepath=$(dirname $filename)
    filepath=$(echo "$filepath" | sed 's/^\.\///g' | sed 's/^\.//g')
    filename=$(basename $filename)

    cp ".$filepath/$filename" "../$currentDirectory$filepath/$filename"

    echo "COPY: .$filepath/$filename ../$currentDirectory$filepath/$filename"
done

echo "" && echo "CREATE WINDOWS PACKAGE"

electron-packager . $applicationNameWithVersion --overwrite --asar --platform=win32 --arch=ia32 --icon=icon.ico --prune=true \
--out=release-builds  --version-string.LegalCopyright="${legalCopyright}" \
--version-string.CompanyName="${companyName}" --version-string.FileDescription="${applicationName} ${version}" \
--version-string.ProductName="${version}" --app-copyright="${companyName}" \
--app-version="${completeVersion}" --executable-name="${applicationName}" --win32metadata.VersionInfo.InternalName="${applicationName} ${version}" \
--win32metadata.VersionInfo.OriginalFilename="${applicationName}" --win32metadata.VersionInfo.FileVersion="${completeVersion}" \
--win32metadata.VersionInfo.FileDescription="${applicationName} ${version}" --win32metadata.VersionInfo.Product="${applicationName} ${version}" \
--win32metadata.VersionInfo.ProductVersion="${version}" --win32metadata.CompanyName="${companyName}" \
--win32metadata.Autor="${autor}" --win32metadata.InternalName="${applicationName} ${version}" \
--win32metadata.OriginalFilename="${applicationName}" --win32metadata.FileVersion="${completeVersion}" \
--win32metadata.FileDescription="${applicationName} ${version}" --win32metadata.Product="${applicationName} ${version}" \
--win32metadata.ProductVersion="${version}"  --electron-version="${electronVersion}"

echo "" && echo "CREATE ZIP"

cp ../$releaseDirectory/release-builds/$applicationNameWithVersion-darwin-x64/$applicationNameWithVersion.dmg ../$releaseDirectory/release-builds/
cp -r ../$releaseDirectory/release-builds/$applicationNameWithVersion-darwin-x64/$applicationNameWithVersion.app ../$releaseDirectory/release-builds/

rm -rf "../$releaseDirectory/release-builds/${applicationNameWithVersion}-darwin-x64"

mv -f "../$releaseDirectory/release-builds/${applicationNameWithVersion}-win32-ia32" "../$releaseDirectory/release-builds/${applicationNameWithVersion}"

rm -rf "../$releaseDirectory/release-builds/${applicationNameWithVersion}-win32-ia32"

mv -f "../$releaseDirectory/release-builds" "../release-builds"
cd "../"
rm -rf "./$releaseDirectory/"
mv -f "./release-builds" "./${releaseDirectory}"
zip -r "./${releaseDirectory}.zip" "./$releaseDirectory"
rm -rf "./$releaseDirectory/"
