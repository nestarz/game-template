import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

function save(blob, filename) {
  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link);
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  link.remove();
}

function saveArrayBuffer(buffer, filename) {
  save(new Blob([buffer], { type: "application/octet-stream" }), filename);
}

const exporter = obj => {
  const exporter = new STLExporter();
  const result = exporter.parse(obj, { binary: true });
  saveArrayBuffer(result, "obj.stl");
};

export const gltfExporterPath = async (path, gltfFile) => {
  const loader = new GLTFLoader().setPath(path);
  const gltf = await new Promise(r => loader.load(gltfFile, r));
  exporter(gltf.scene);
};

export default exporter;
