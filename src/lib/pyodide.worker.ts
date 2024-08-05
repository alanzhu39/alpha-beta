import { loadPyodide } from 'pyodide';

let pyodide;
async function loadPyodideAndPackages() {
  console.log('Loading pyodide...');
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full'
  });
  console.log('Loading micropip...');
  await pyodide.loadPackage('micropip');
  const micropip = pyodide.pyimport('micropip');
  console.log('Loading packages...');
  await micropip.install('lzma');
  await micropip.install('/instaloader-4.12.1-py3-none-any.whl');
  console.log('Done!');
}
const pyodideReadyPromise = loadPyodideAndPackages();

const getScript = (postUrl) => `
  from instaloader import *
  L = instaloader.Instaloader()
  post = Post.from_shortcode(L.context, '${postUrl}')
  post.video_url
`;

self.onmessage = async (event) => {
  // make sure loading is done
  await pyodideReadyPromise;

  console.log(event);

  // Don't bother yet with this line, suppose our API is built in such a way:
  const python = getScript(event.data);
  console.log(python);

  // Now is the easy part, the one that is similar to working in the main thread:
  await pyodide.loadPackagesFromImports(python);
  const results = await pyodide.runPythonAsync(python);
  self.postMessage(results);
};
