import mqtt from "mqtt";
const client = mqtt.connect(
    "wss://8ec8c59dd3594ba08a4089ad1c10c20f.s1.eu.hivemq.cloud:8884/mqtt",
    {
        username: "HomeCareHub",
        password: "YqV7G7sDAemZy2R"
    }
);


client.on("connect", () => {
    console.log("Connected to HiveMQ");

    client.subscribe("home/pi/data");
});

client.on("message", (topic, message) => {
    console.log(topic + " : " + message.toString());
});


export function sendCommand() {
    client.publish("home/app/cmd", "OPEN_DOOR");
}