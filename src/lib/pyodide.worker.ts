import { loadPyodide } from 'pyodide';

let pyodide;
async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  await pyodide.loadPackage([]);
}
const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  // make sure loading is done
  await pyodideReadyPromise;

  // Don't bother yet with this line, suppose our API is built in such a way:
  const python = event.data;

  // Now is the easy part, the one that is similar to working in the main thread:
  await pyodide.loadPackagesFromImports(python);
  const results = await pyodide.runPythonAsync(python);
  self.postMessage(results);
};
