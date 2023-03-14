import { Message } from 'azure-iot-common';
import { Gateway } from 'azure-iot-multiplexing-gateway';
var gateway: Gateway;
import { Registry } from 'azure-iothub';
var registry: Registry;

const connectionString: string | undefined = process.env.CONNECTION_STRING || 'HostName=lucamsft.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=PJrASGxx3zA359wcUVMu3v0u8CHg3n10OI5arDJ1ST0=';
if (connectionString === undefined) {
    console.error('CONNECTION_STRING environment variable not set');
    process.exit(1);
}

interface Device {
    deviceId: string,
    tags: {}
}
var deviceIds: string[] = [], devices: Device[] = [], addDevicePromises: any = [];


export const setTags = async (device: Device): Promise<string> => {
    let result = 'ok'
    try {
        let twin = await registry.getTwin(device.deviceId);
        let etag = twin.responseBody.etag;
        let patch: any = { tags: device.tags };
        await registry.updateTwin(device.deviceId, patch, etag)
        deviceIds.push(device.deviceId);
        devices.push(device);
        return result
    } catch (err: any) {
        result = err.toString();
        return result;
    }
}

export const registerDevice = async (deviceId: string, payload: {}): Promise<string> => {
    let result = 'ok';
    var newDevice: Device = {
        deviceId,
        tags: payload
    }
    try {
        console.time(`Registering device: ${newDevice.deviceId} took: `);
        await registry.create({ deviceId, status: 'enabled' });
        await setTags(newDevice);

        await gateway.open(connectionString);
/*
        addDevicePromises.push(gateway.addDevice(deviceId));
        console.log(addDevicePromises)
        await Promise.all(addDevicePromises);
        addDevicePromises = [];
        */
        await gateway.addDevice(deviceId);
        console.timeEnd(`Registering device: ${newDevice.deviceId} took: `);
        return result;
    } catch (err: any) {
        result = err.toString();
        console.log(err)
        return result;
    }
}

export const getDevices = async (): Promise<any> => {
    return devices
}

export const sendMessage = (deviceId: string, payload: object): void => {
    var message: any = new Message(JSON.stringify(payload));
    gateway.sendMessage(deviceId, message);
}

/*
* Query IoT Hub Registry and get information on devices
* Cache deviceIds and device tags locally 
*/
const fetchTwins = async (): Promise<void> => {
    try {
        let queryString: string = 'select * from devices';
        let pageSize: number = 1000
        let query: any = registry.createQuery(queryString, pageSize);
        let twins = await query.nextAsTwin();
        twins.result.forEach((twin: any) => {
            let deviceId = twin.deviceId;
            twin.tags.deviceId = deviceId;
            devices.push({deviceId, tags: twin.tags});
            deviceIds.push(deviceId);
        })
    } catch (e: any) {
        console.error(e.toString());
    }
}

export const initProxy = async () => {
    console.time('Init Proxy took');

    registry = Registry.fromConnectionString(connectionString);
    await fetchTwins();

    try {
        gateway = new Gateway();
        await gateway.open(connectionString);

        if (deviceIds.length > 0) {
            deviceIds.forEach((deviceId) => {
                addDevicePromises.push(gateway.addDevice(deviceId));
            });
            await Promise.all(addDevicePromises);
            addDevicePromises = [];

        } else {
            console.log('No devices found');
        }
    } catch (e: any) {
        console.error(e.toString())
    }

    console.timeEnd('Init Proxy took');
}
