const provider = require("./aws");

provider.init((instances) => {
  provider.destroyInstance(instances[0], () => {
    provider.createInstance((i) => {console.log("Created", i)});
  });
});
