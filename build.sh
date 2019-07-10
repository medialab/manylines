echo "Cleanup..."
rm -rf build
mkdir build

echo "Copying files..."
cp -r static/* build/

echo "Building HTML architecture..."
cp build/site.html build/index.html
mkdir build/app
mkdir build/embed
cp build/app.html build/app/index.html
cp build/embed.html build/embed/index.html

echo "Grabbing presentations..."
find ./presentations -type d ! -name index.html -depth 1 -exec cp -r {} build/ \;
