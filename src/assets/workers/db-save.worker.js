function saveDB({db, nameDB}) {
  return {json: JSON.stringify(db), nameDB};
}

addEventListener('message', ({data}) => {
  postMessage(saveDB(data));
  data.close && close();
});
