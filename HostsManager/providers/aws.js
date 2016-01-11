"use strict";

const AWS = require("aws-sdk");
const ec2 = new AWS.EC2({
  region: "eu-west-1",
  apiVersion: "2015-12-17"
});

function scannersFilter() {
  return {
    Filters: [{
      Name: "tag:Service",
      Values: ["nastyhosts-scanners"]
    }]
  };
}

function stoppedScannersFilter() {
  let f = scannersFilter();
  f.Filters.push({
    Name: "instance-state-name",
    Values: ["stopped"]
  });
  return f;
}

function instancesFilter(instances) {
  if(!(instances instanceof Array)) {
    instances = [instances];
  }

  return {
    Filters: [{
      Name: "instance-id",
      Values: instances
    }]
  };
}

let started_instances = {};
let stopped_instances = [];

module.exports = {
  init: function(cb) {
    console.log("Starting stopped instances");
    ec2.describeInstances(stoppedScannersFilter(), (err, data) => {
      let ids = [].concat.apply([],
        data.Reservations.map(r => r.Instances)
      ).map(i => i.InstanceId);

      ec2.startInstances({ InstanceIds: ids }).send();
      ec2.waitFor("instanceRunning", scannersFilter(), (err, data) => {
        if (err) console.log(err);

        started_instances = [].concat.apply([],
          data.Reservations.map(r => r.Instances)
        ).reduce((o, i) => {
          if(i.PublicDnsName && i.State.Name == "running")
            o[i.PublicDnsName] = i.InstanceId;
          return o;
        }, {});

        if(cb)
          cb(Object.keys(started_instances));
      });
    });
  },
  listInstances: function(cb) {
    ec2.describeInstances(scannersFilter(), (err, data) => {
      started_instances = [].concat.apply([],
        data.Reservations.map(r => r.Instances)
      ).reduce((o, i) => {
        if(i.PublicDnsName && i.State.Name == "running")
          o[i.PublicDnsName] = i.InstanceId;
        return o;
      }, {});
      if(cb)
        cb(Object.keys(started_instances));
    });
  },
  destroyInstance: function(h, cb) {
    let id = started_instances[h];
    delete started_instances[h];
    stopped_instances.push(id);

    console.log("Stopping instance", id, h);
    ec2.stopInstances({ InstanceIds: [id] }).send();
    ec2.waitFor("instanceStopped", instancesFilter(id), (err) => {
      if(err) throw err;
      if(cb) cb();
    });
  },

  createInstance: function(cb) {
    if(stopped_instances.length == 0) {
      throw new Error("No stopped instances to start!!");
    }

    let id = stopped_instances.pop();

    console.log("Waiting for instance", id, "to fully stop before restarting");
    ec2.waitFor("instanceStopped", instancesFilter(id), (err) => {
      if(err) throw err;

      console.log("Starting instance", id);
      ec2.startInstances({ InstanceIds: [id] }).send();
      ec2.waitFor("instanceRunning", instancesFilter(id), (err, data) => {
        if(err) throw err;
        let i = data.Reservations[0].Instances[0];
        started_instances[i.PublicDnsName] = i.InstanceId;
        if(cb) cb(i.PublicDnsName);
      });
    });
  }
};
