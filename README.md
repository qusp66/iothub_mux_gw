# IoT HuB Mux Gateway

This app creates an AMQPs tunnel to IoT Hub. 
It can be used to provision devices on IoT Hub and to send messages on behalf of devices.  

Requires the iothubowner connection string:  
``` bash
EXPORT CONNECION_STRING=<iothubowner connection string>
```

It is possible to limit the scope of the gateway to a single type of device. You can do that by setting an environmental ENV  
``` bash
EXPORT DEVICE_TYPE=<my device type>
```
  
## API  
  
```
GET /devices - list current devices in IoT Hub.  
  
GET /devices/{deviceType} - list current devices in IoT Hub. Can be filtered by adding a deviceType param in case the DEVICE_TYPE ENV was not set. Note that this param needs to match a tag on the device.  
  
POST /{deviceI} - attempts to create a device. You can add device tags as body  
e.g. curl -X POST -H "Content-Type: application/json" -d '{"url":"rtsp://192.168.1.92:554/streeam2", "codec": "mp4"}' localhost/lucarv  
   
POST /message/{deviceId} - attempts to send a message on behalf of a device. You can add a message payload as body  
e.g. curl -X POST -H "Content-Type: application/json" -d '{"temperature": 22}' localhost/message/lucarv
```
