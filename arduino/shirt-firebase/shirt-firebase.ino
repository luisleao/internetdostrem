// criado por Luis Leao - 2016-10-08
// utiliza o WioNode (ESP8266) montado em uma camiseta que é acionada por um Amazon Echo
// firebase no modo stream. A cada nova alteração ele recebe o dado atualizado e ativa/desativa o relé

#include <ESP8266WiFi.h>
#include <FirebaseArduino.h>


#define FIREBASE_HOST "echo-firebase.firebaseio.com" 
#define FIREBASE_AUTH "ssbFuyPpddo5uIPpJozR7gYxznpB0BRcu5wENvvV"
#define WIFI_SSID "LeaoExpress" 
#define WIFI_PASSWORD "internet"




const int buttonPin = 13;
int button;

int leds[] = {4, 2, 5, 14, 12};



void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  delay(100);
  
  button = digitalRead(buttonPin);

  Serial.begin(9600);
  Serial.print("CHIP ID: ");
  Serial.println(ESP.getChipId());


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




  Firebase.stream("/devices/shirt/");  
  if (Firebase.success()) {
    Serial.println("STREAMING /releasing");
  }


  //apenas para indicar que o hardware iniciou e esta conectado a internet
  for (int i=0; i<5; i++) {
    pinMode(leds[i], OUTPUT);
    digitalWrite(leds[i], HIGH);
    delay(150);
    digitalWrite(leds[i], STREAM ? LOW : HIGH);
  }
}

float light = 0.0;
int cycles = 0;



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
       Serial.print("data: ");
       Serial.println(event.getBool("data"));

       int status = event.getBool("data") ? HIGH : LOW;

       for (int i=0; i<5; i++) {
         digitalWrite(leds[i], status);
         delay(50);
       }
//       for (int i=0; i<5; i++) {
//         digitalWrite(leds[i], !status);
//         delay(50);
//       }

     }
  }   
}

