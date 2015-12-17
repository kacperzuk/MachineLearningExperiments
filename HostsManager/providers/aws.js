"use strict";

const AWS = require("aws-sdk");
const ec2 = new AWS.EC2({
    region: 'eu-west-1',
    apiVersion: '2015-12-17'
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
      Values: ["running"]
  });
}

function instanceFilter(instance) {
  return {
    Filters: [{
        Name: "instance-id",
        Values: [instance]
    }]
  };
}

let instances = [];

module.exports = {
  init: function(cb) {
    console.log("Starting all instances");
    ec2.startInstances(scannersFilter()).send();
    ec2.waitFor("instanceRunning", scannersFilter(), (err, data) => {
      if (err) console.log(err);

      instances = [].concat.apply([],
        data.Reservations.map(r => r.Instances)
      ).reduce((o, i) => {
        o[i.PublicDnsName] = i;
        return o;
      }, {});

      cb(Object.keys(instances));
    });
  },

  destroyInstance: function(h, cb) {
    let id = instances[h].InstanceId;
    console.log("Stopping instance", id, h);
    ec2.stopInstances({ InstanceIds: [id] }).send();
    ec2.waitFor("instanceStopped", instanceFilter(id), (err) => {
      if(err) throw err;
      instances[h] = {
        InstanceId: id,
        State: { Name: "stopped" }
      };
      cb();
    });
  },

  createInstance: function(cb) {
    ec2.describeInstances(stoppedScannersFilter(), (err, data) => {
      if(err) throw err;
      let i = data.Reservations[0].Instances[0];
      let id = i.InstanceId;
      console.log("Starting instance", id);
      ec2.startInstances({ InstanceIds: [id] }).send();
      ec2.waitFor("instanceRunning", instanceFilter(id), (err, data) => {
        if(err) throw err;
        let i = data.Reservations[0].Instances[0];
        let id = i.InstanceId;
        instances[i.PublicDnsName] = i;
        cb(i.PublicDnsName);
      });
    });
  }
};
