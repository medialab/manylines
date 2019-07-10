PREFIX="/manylines/"

function prefixPaths() {
  sed -i '' "s@href=\"/\([^/]\)@href=\"$PREFIX\1@g" $1;
}

echo "Cleanup..."
rm -rf build
mkdir build

echo "Copying files..."
cp -r static/* build/

echo "Bootstrapping archived data"
sed -i '' 's/<body>/<body archived="true">/' build/embed.html

echo "Building HTML architecture..."
cp build/site.html build/index.html
mkdir build/app
mkdir build/embed
cp build/app.html build/app/index.html
cp build/embed.html build/embed/index.html

echo "Grabbing presentations..."
find ./presentations -type d ! -name index.html -depth 1 -exec cp -r {} build/ \;

echo "Prefixing paths..."
prefixPaths build/app.html
prefixPaths build/embed.html
prefixPaths build/site.html
