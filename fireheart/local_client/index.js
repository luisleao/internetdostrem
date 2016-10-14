var serialport = require("serialport");
var SerialPort = serialport.SerialPort;


var SensorTag = require('sensortag');


var Firebase = require('firebase');
var heart = new Firebase('https://echo-firebase.firebaseio.com/sensor/heart');
var dice = new Firebase('https://echo-firebase.firebaseio.com/sensor/dice');


var LOG_HEART_RATE = false;
var current_heart_rate = "0";



var GRAVIDADE = 4.0;
var MARGEM = 0.5;
var current_dice = "";



var serialPort = new SerialPort("/dev/cu.usbserial-AH01D4QL", {
	baudrate: 9600,
	parser: serialport.parsers.readline("\r")
});




serialPort.on("open", function () {

	heart.set("0");

	serialPort.on('data', function(data) {
	var new_heart_rate = data.split(" ")[2];
		if (data[0] == 0) {
			new_heart_rate = data.split(" ")[2];
		} else {
			new_heart_rate = "0";
    		//console.log("-");
		}
		if (current_heart_rate != new_heart_rate) {
    		if (LOG_HEART_RATE) console.log(new_heart_rate);
			current_heart_rate = new_heart_rate;
			heart.set(new_heart_rate);
			console.log("heart_rate", current_heart_rate);
		}
		serialPort.write("G1\r");

	});

	console.log('open');

	serialPort.write("S0\r");
	serialPort.write("G1\r");
});



var SensorTag = require('sensortag');

var GRAVIDADE = 4.0;
var MARGEM = 0.5;

function define_lado(x, y, z) {
  if (x > GRAVIDADE - MARGEM) return 1
  if (x < MARGEM - GRAVIDADE) return 6
  if (y > GRAVIDADE - MARGEM) return 2
  if (y < MARGEM - GRAVIDADE) return 5
  if (z > GRAVIDADE - MARGEM) return 3
  if (z < MARGEM - GRAVIDADE) return 4
  return 0

}


function onDiscover(sensorTag) {
	console.log(sensorTag.address, sensorTag.type);

	sensorTag.connectAndSetUp(function(error){
		if (error) {
			console.log("SENSORTAG ERROR: ", error);
			return;
		}

		// CC2540: period 1 - 2550 ms, default period is 2000 ms
		// CC2650: period 100 - 2550 ms, default period is 1000 ms
		sensorTag.setAccelerometerPeriod(250, function(error){});
		sensorTag.notifyAccelerometer(function(error){});
		sensorTag.enableAccelerometer(function(error){});

		sensorTag.on('accelerometerChange', function(x, y, z){
			var new_dice = define_lado(x, y, z);
			// var is_shaking = Math.abs(x) > GRAVIDADE + MARGEM || Math.abs(y) > GRAVIDADE + MARGEM || Math.abs(z) > GRAVIDADE + MARGEM;
			// if (is_shaking && current_dice != "shaking") {
			// 	current_dice = "shaking";
			// 	dice.set("shaking");
			// } else
			if (current_dice != new_dice && new_dice != 0) {
				current_dice = new_dice;
				dice.set(new_dice);
				console.log("dice ", new_dice);
			}

			//console.log(new_dice, '\t', x, y, z);
		});



	});
	sensorTag.once('disconnect', function(){
		console.log("SensorTag DISCONNECTED!");
		//SensorTag.discoverAll(onDiscover);
		SensorTag.discover(onDiscover);

	});

}

SensorTag.discover(onDiscover);


/*

//peripheral discovered (8c7c2f73eccf4997886268afb2b4d41c with address <b4:99:4c:64:b4:68, unknown>, connectable true, RSSI -66:
//peripheral discovered (fc02dbfd3e2848c19d0612f20616cc85 with address <unknown, unknown>, connectable true, RSSI -39:


var devices = ["8c7c2f73eccf4997886268afb2b4d41c", "fc02dbfd3e2848c19d0612f20616cc85"];

var services = [];


var noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});








noble.on('discover', function(peripheral) {
	if (devices.indexOf(peripheral.uuid) < 0)
		return;

	console.log("sensortag", peripheral.uuid);

	peripheral.on('disconnect', function(){
		noble.startScanning(); //when disconnect, start scanning again
	});



	// peripheral.once('servicesDiscover', function(services){
	// 	console.log("servicesDiscover");
	// 	console.log(services);
	// 	console.log("******");
	// 	console.log("******");
	// 	console.log("******");

	// 	for (service_idx in services) {
	// 		var service = services[service_idx];
	// 		service.discoverCharacteristics(); // any characteristic UUID

	// 		var characteristicUUIDs = [];
	// 		service.discoverCharacteristics(characteristicUUIDs, function(error, characteristics){
	// 			console.log("discoverCharacteristics"),
	// 			//console.log(characteristics);
	// 			console.log("******");
	// 			console.log("******");


	// 			for (var idx in characteristics) {
	// 				var characteristic = characteristics[idx];

	// 				console.log(characteristic);
	// 				characteristic.discoverDescriptors(function(error, descriptors){
	// 					console.log();
	// 					console.log();
	// 					console.log("*** descriptors ***", descriptors);
	// 					console.log();
	// 					console.log();
	// 				});

	// 				// characteristic.read(function(error, data){
	// 				// 	console.log("*** DATA: ", data);
	// 				// 	console.log("******");
	// 				// })
	// 			}

	// 		}); // particular UUID's


		


	// 	}
	// });


	peripheral.connect(function(err) {

	  	console.log("Connected", err);
	  	if (err) {
	  		return;
	  	}

		//TODO: enviar comando para ativar acelerometro e definir intervalo
		//TODO: tratar retorno do acelerometro


		peripheral.discoverServices(['f000aa1004514000b000000000000000'], function(error, services) {
			var accellService = services[0];
			console.log('discovered device information service');

			accellService.discoverCharacteristics([], function(error, characteristics) {
				for (var idx in characteristics) {
					var c = characteristics[idx];
					//c.read(function(error, data) {
					//	// data is a buffer
					//	console.log(error, ': ', data.toString('utf8'));
					//});
					console.log(c.uuid);

					switch(c.uuid) {

						//acelerometro
						case "f000aa1104514000b000000000000000":

							c.on('read', function(data, isNotification) {

								console.log('accell is now: ', data[0], data[1], data[2]);
							});

							// true to enable notify
							c.notify(true, function(error) {
								console.log('accell notification on');
							});

							// c.read(function(error, data) {
							// 	// data is a buffer
							// 	console.log('acell: ' + data.toString());
							// });
							break;

						//config
						case "f000aa1204514000b000000000000000":
							c.write(new Buffer([0x01]), true, function(error){});
							break;

						//period
						case "f000aa1304514000b000000000000000":
							c.write(new Buffer([0x0A]), true, function(error){});
							break;


		// peripheral.writeHandle(0x31, new Buffer([0x01]), false, function(error){}); //12
		// peripheral.writeHandle(0x34, new Buffer([0x0A]), false, function(error){}); //13
		// peripheral.writeHandle(0x2E, new Buffer([0x0100]), false, function(error){}); //11

					}
				}

			});
		});




		// peripheral.writeHandle(0x31, new Buffer([0x01]), false, function(error){});
		// peripheral.writeHandle(0x34, new Buffer([0x0A]), false, function(error){});
		// peripheral.writeHandle(0x2E, new Buffer([0x0100]), false, function(error){});

	  	//peripheral.discoverServices(["f000aa1004514000b000000000000000"]);




//accell: f000aa1104514000b000000000000000 0x01
//config: f000aa1204514000b000000000000000 0x01
//interv: f000aa1304514000b000000000000000 0x2e




	});



	// setInterval(function(){
	// 	//console.log("a");
	// }, 1000);


});




function calculateDistance(rssi) {
  
  var txPower = -59 //hard coded power value. Usually ranges between -59 to -65
  
  if (rssi == 0) {
    return -1.0; 
  }

  var ratio = rssi*1.0/txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio,10);
  }
  else {
    var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    return distance;
  }
} 
*/
