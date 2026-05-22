import ssl
import paho.mqtt.client as mqtt


BROKER = "8ec8c59dd3594ba08a4089ad1c10c20f.s1.eu.hivemq.cloud"
PORT = 8883

USERNAME = "HomeCareHub"
PASSWORD = "YqV7G7sDAemZy2R"


client = mqtt.Client()


def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Connected to HiveMQ")
    else:
        print(f"Failed connection: {rc}")


client.username_pw_set(
    USERNAME,
    PASSWORD
)

client.tls_set(
    tls_version=ssl.PROTOCOL_TLS
)

client.on_connect = on_connect

client.connect(BROKER, PORT)

client.loop_start()


def publish_message(topic, message):
    result = client.publish(topic, message)

    return result.rc == mqtt.MQTT_ERR_SUCCESS