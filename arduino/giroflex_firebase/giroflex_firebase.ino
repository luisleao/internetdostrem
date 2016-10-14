// criado por Luis Leao - 2016-10-08
// utiliza o WioNode (ESP8266) conectado a um módulo de relé que aciona um giroflex e é acionado por um Amazon Echo
// firebase no modo stream. A cada nova alteração ele recebe o dado atualizado e ativa/desativa o relé

#include <FirebaseArduino.h>
#include <ESP8266WiFi.h>



#define FIREBASE_HOST "echo-firebase.firebaseio.com" 
#define FIREBASE_AUTH "ssbFuyPpddo5uIPpJozR7gYxznpB0BRcu5wENvvV"
#define WIFI_SSID "LeaoExpress" 
#define WIFI_PASSWORD "internet"


void setup() {
  Serial.begin(9600);

  // connect to wifi.
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("connecting");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("connected: ");
  Serial.println(WiFi.localIP());

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.stream("/devices/siren");


  //apenas para indicar que o hardware iniciou e esta conectado a internet
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);

  //pino 2 utilizado em alguns casos para alimentar algum device
  pinMode(2, OUTPUT);
  digitalWrite(2, HIGH);
}

void loop() {

  if (Firebase.failed()) {
    Serial.println("streaming error");
    Serial.println(Firebase.error());
  }

  if (Firebase.available()) {
    FirebaseObject event = Firebase.readEvent();
    String eventType = event.getString("type");
    eventType.toLowerCase();

    Serial.print("event: ");
    Serial.println(eventType);
    if (eventType == "put") {
      String path = event.getString("path");
      bool data = event.getBool("data");
      
      Serial.print("data: ");
      Serial.print(event.getString("path"));
      Serial.print(" - ");
      Serial.println(data ? "TRUE" : "FALSE");

      digitalWrite(13, data == true ? HIGH : LOW);
      
    }
  }
}
