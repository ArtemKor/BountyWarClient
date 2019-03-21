function loadDB({json}) {
  if (json) { return JSON.parse(json); } else { return Object.create(null); }
}

addEventListener('message', ({data}) => {
  postMessage(loadDB(data));
});
