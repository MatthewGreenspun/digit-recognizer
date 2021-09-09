wasm-pack build --out-dir ../frontend/src/wasm
cd ../frontend/src/wasm
rm ./.gitignore ./package.json
echo -e "/* eslint-disable */\n$(cat ./image_processing_bg.js)" > image_processing_bg.js
sed -i 1d ./image_processing.js
sed -i 's/Array<any>/[number, number, number, number]/g' ./image_processing.d.ts
echo "build complete"