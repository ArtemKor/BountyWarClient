const typeEvent = {
  Create: 'create',
  Put: 'put',
  Delete: 'delete',
  Get: 'get',
  Init: 'init',
  Save: 'save',
  Load: 'load',
  Response: 'response'
};

var db = Object.create(null);
var nameDB = 'default_async_db_user';
const loadWorker = new Worker('db-load.worker.js');
const saveWorker = new Worker('db-save.worker.js');
loadWorker.addEventListener('message', ({data}) => {
  db = data;
});
saveWorker.addEventListener('message', ({data}) => {
  postMessage({... data, typeEvent: typeEvent.Save});
});

function inMessage(e) {
  const event = e.data;
  switch (event.typeEvent) {
    case typeEvent.Create: {
      createInDB(event);
      break;
    }
    case typeEvent.Put: {
      putInDB(event);
      break;
    }
    case typeEvent.Delete: {
      deleteInDB(event);
      break;
    }
    case typeEvent.Get: {
      postMessage({ id: event.id, data: getInDB(event), typeEvent: typeEvent.Response });
      break;
    }
    case typeEvent.Init: {
      init && init(event);
      break;
    }
    case typeEvent.Load: {
      load(event);
      break;
    }
  }
}

function createInDB({path}) {
  db[path] = {};
}

function putInDB({path, keys, data}) {
  var obj = db[path];

  keys.split('.').forEach((key, i, array) => {
    if (array.length - 1 === i) {
      Array.isArray(obj[key]) ? obj[key].push(data) : obj[key] = data;
    } else {
      obj = obj[key];
    }
  });
}

function deleteInDB({path, keys, data}) {
  var obj = db[path];

  keys.split('.').forEach((key, i, array) => {
    if (array.length - 1 === i) {
      data ? deleteInArray(obj[key], data) : delete obj[key];
    } else {
      obj = obj[key];
    }
  });
}

function deleteInArray({array, data}) {
  for (var i = array.length; i >= 0; i--) {
    const item = array[i];
    var next = false;

    for (var field in data) {
      if (item[field] !== data[field]) { next = true; break; }
    }

    if (next) { continue; } else { array.splice(i, 1); }
  }
}

function getInDB({path, keys, params}) {
  var obj = db[path];

  keys.split('.').forEach((key, i, array) => {
    if (array.length - 1 === i) {
      return Array.isArray(obj[key]) ? getByParams(obj[key], params) : obj[key];
    } else {
      obj = obj[key];
    }
  });
}

function getByParams(array, params) {
  const isFilter = params['db_array_filter'];
  delete params['db_array_filter'];

  if (isFilter) {
    return array.filter(item => checkParams(item, params));
  } else {
    return array.find(item => checkParams(item, params));
  }
}

function checkParams(item, params) {
  for (var field in params) {
    if (params[field] !== item[field]) { return false; }
  }
  return true;
}

function init({name}) {
  nameDB = name + '_async_db_user';

  loadWorker.addEventListener('message', ({data}) => { db = data; });
  postMessage({nameDB, typeEvent: typeEvent.Load});

  setInterval(() => { save(); }, 5000);

  init = null;
}

function save(close) {
  saveWorker.postMessage({db, nameDB, close});
}

function load({json}) {
  loadWorker.postMessage({json});
}

addEventListener('message', inMessage);
