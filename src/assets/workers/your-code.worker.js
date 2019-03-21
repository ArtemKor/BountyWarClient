addEventListener("message", function (e) {
  built ? massageToBuilt(e) : build(e.data);
});

function massageToBuilt(e) {
  const data = e.data;
  if (data['__is__object__for__fn']) {
    const response = built[data.functionName].apply(built, data.request);
    postMessage({response, id: data.id});
  } else {
    built.message(e.data);
  }
}

function build({object}) {
  const anyClass = eval(`( ${object} )`);
  built = new anyClass();
}

let built = null;
