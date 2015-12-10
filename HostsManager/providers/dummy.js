function destroyInstance(h) {
  console.log("Destroying instance", h);
}

function createInstance(h) {
  console.log("Creating instance", h);
}

module.exports = { destroyInstance, createInstance };
