function destroyInstance(h, cb) {
  console.log("Destroying instance", h);
  cb(null);
}

function createInstance(h, cb) {
  console.log("Creating instance", h);
  cb(null);
}

module.exports = { destroyInstance, createInstance };
