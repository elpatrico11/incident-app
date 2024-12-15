const mongoose = require("mongoose");
const Incident = require("./models/Incident");
const dotenv = require("dotenv");

dotenv.config();

const URI = process.env.MONGO_URI;

mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Połączono z MongoDB");

    const allowedCategories = [
      "Akty wandalizmu",
      "Dzikie wysypiska śmieci",
      "Grupowanie się małoletnich zagrożonych demoralizacją",
      "Kłusownictwo",
      "Miejsca niebezpieczne na wodach",
      "Miejsce niebezpiecznej działalności rozrywkowej",
      "Nielegalna wycinka drzew",
      "Nielegalne rajdy samochodowe",
      "Nieprawidłowe parkowanie",
      "Niestrzeżone przejście przez tory",
      "Niestrzeżony przejazd kolejowy",
      "Niewłaściwa infrastruktura drogowa",
      "Niszczenie zieleni",
      "Osoba bezdomna wymagająca pomocy",
      "Poruszanie się po terenach leśnych quadami",
      "Przekraczanie dozwolonej prędkości",
      "Spożywanie alkoholu w miejscach niedozwolonych",
      "Używanie środków odurzających",
      "Wałęsające się bezpańskie psy",
      "Wypalanie traw",
      "Zdarzenia drogowe z udziałem zwierząt leśnych",
      "Znęcanie się nad zwierzętami",
      "Zła organizacja ruchu drogowego",
      "Żebractwo",
      "Inne",
    ];

    const incidents = await Incident.find({
      category: { $nin: allowedCategories },
    });
    console.log(
      `Znaleziono ${incidents.length} incydentów z nieprawidłową kategorią.`
    );

    for (let incident of incidents) {
      incident.category = "Inne"; // Ustawienie na jedną z dozwolonych wartości
      await incident.save();
      console.log(
        `Incydent ID: ${incident._id} zaktualizowany do kategorii "Inne".`
      );
    }

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Błąd połączenia z MongoDB:", err);
  });
