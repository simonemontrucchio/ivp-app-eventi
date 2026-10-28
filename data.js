
const eventData = {
  "event": {
    "title": "Barolo & Friends",
    "subtitle": "Oslo, August 31st 2026",
    "venue": "Gamle Logen, Oslo",
    "slogan": "Piedmont: where wine is history and history is wine."
  },
  "producers": [
    {
      "id": "p1", "desk": "1", "name": "460 Casina Bric", "region": "Piedmont", "city": "Serralunga d'Alba",
      "market": "seeking", "importer": null, "contactName": "Gianluca Viberti", "email": "gianluca.viberti@casinabric-barolo.it", "icons": ["vineyard"],
      "wines": [
        {"id": "w1_1", "name": "Nebbiolo Spumante Blanc De Noir Zèro Dosage", "vintage": "NV", "type": "Sparkling"},
        {"id": "w1_2", "name": "Nebbiolo Spumante Rosè De Noir Extra Brut", "vintage": "2022", "type": "Sparkling"},
        {"id": "w1_3", "name": "Langhe DOC Arneis Tenuta Parco", "vintage": "2025", "type": "White"},
        {"id": "w1_4", "name": "Barolo DOCG del Comune di Serralunga", "vintage": "2020", "type": "Red"}
      ]
    },
    {
      "id": "p2", "desk": "2", "name": "Boschis Francesco", "region": "Piedmont", "city": "Dogliani",
      "market": "imported", "importer": "Gaia Wine & Spirits AS", "contactName": "Francesco Boschis", "email": "info@boschisfrancesco.it", "icons": ["vineyard"],
      "wines": [
        {"id": "w2_1", "name": "Langhe DOC Freisa Bosco Delle Cicale", "vintage": "2025", "type": "Red"},
        {"id": "w2_2", "name": "Piemonte DOC Grignolino", "vintage": "2025", "type": "Red"},
        {"id": "w2_3", "name": "Barbera d'Alba DOC Superiore Vigna Le Masserie", "vintage": "2022", "type": "Red"},
        {"id": "w2_4", "name": "Dogliani DOCG Pianezzo", "vintage": "2024", "type": "Red"}
      ]
    },
    {
      "id": "p3", "desk": "3", "name": "Carlo Revello & Figli", "region": "Piedmont", "city": "La Morra",
      "market": "seeking", "importer": null, "contactName": "Carlo Revello", "email": "info@carlorevello.com", "icons": [],
      "wines": [
        {"id": "w3_1", "name": "Dolcetto d'Alba", "vintage": "2025", "type": "Red"},
        {"id": "w3_2", "name": "Langhe DOC Nebbiolo", "vintage": "2025", "type": "Red"},
        {"id": "w3_3", "name": "Barolo DOCG", "vintage": "2022", "type": "Red"},
        {"id": "w3_4", "name": "Barolo DOCG Giachini", "vintage": "2021", "type": "Red"}
      ]
    },
    {
      "id": "p4", "desk": "4", "name": "Cascina La Barbatella", "region": "Piedmont", "city": "Nizza Monferrato",
      "market": "imported", "importer": "Barbatella As", "contactName": "Export Desk", "email": "cascina@labarbatella.com", "icons": [],
      "wines": [
        {"id": "w4_1", "name": "Monferrato DOC Bianco Noè", "vintage": "2024", "type": "White"},
        {"id": "w4_2", "name": "Piemonte DOC Chardonnay", "vintage": "2024", "type": "White"},
        {"id": "w4_3", "name": "Barbera d'Asti DOCG La Barbatella", "vintage": "2024", "type": "Red"},
        {"id": "w4_4", "name": "Nizza Riserva DOCG La Vigna Dell'Angelo", "vintage": "2022", "type": "Red"}
      ]
    },
    {
      "id": "p5", "desk": "5", "name": "Castello di Neive", "region": "Piedmont", "city": "Neive",
      "market": "imported", "importer": "Frauna Wine & Dine", "contactName": "Export Desk", "email": "info@castellodineive.it", "icons": [],
      "wines": [
        {"id": "w5_1", "name": "Langhe DOC Arneis Montebertotto", "vintage": "2025", "type": "White"},
        {"id": "w5_2", "name": "Barbera d'Alba DOC Superiore", "vintage": "2022", "type": "Red"},
        {"id": "w5_3", "name": "Barbaresco DOCG Gallina", "vintage": "2023", "type": "Red"}
      ]
    },
    {
      "id": "p6", "desk": "6", "name": "Claudio Mariotto", "region": "Piedmont", "city": "Tortona",
      "market": "seeking", "importer": null, "contactName": "Claudio Mariotto", "email": "info@claudiomariotto.it", "icons": [],
      "wines": [
        {"id": "w6_1", "name": "Colli Tortonesi DOC Derthona Timorasso Piccolo", "vintage": "2025", "type": "White"},
        {"id": "w6_2", "name": "Colli Tortonesi DOC Barbera Monleale", "vintage": "2022", "type": "Red"}
      ]
    },
    {
      "id": "p7", "desk": "7", "name": "Domenico Clerico", "region": "Piedmont", "city": "Monforte d'Alba",
      "market": "seeking", "importer": null, "contactName": "Export Desk", "email": "info@domenicoclerico.com", "icons": [],
      "wines": [
        {"id": "w7_1", "name": "Barbera d'Alba DOC Trevigne", "vintage": "2023", "type": "Red"},
        {"id": "w7_2", "name": "Barolo DOCG Ginestra Pajana", "vintage": "2022", "type": "Red"}
      ]
    },
    {
      "id": "p11", "desk": "11", "name": "Giovanni Rosso", "region": "Piedmont", "city": "Serralunga d'Alba",
      "market": "imported", "importer": "Gaia Wine & Spirits AS", "contactName": "Sofia", "email": "sofia@giovannirosso.com", "icons": ["vineyard"],
      "wines": [
        {"id": "w11_1", "name": "Roero Arneis DOCG", "vintage": "2025", "type": "White"},
        {"id": "w11_2", "name": "Barolo DOCG Serralunga", "vintage": "2022", "type": "Red"},
        {"id": "w11_3", "name": "Barolo DOCG Cerretta", "vintage": "2022", "type": "Red"}
      ]
    },
    {
      "id": "p15", "desk": "15", "name": "Malvirà", "region": "Piedmont", "city": "Canale",
      "market": "imported", "importer": "Moestue Grape Selections AS", "contactName": "Roberto Damonte", "email": "malvira@malvira.com", "icons": ["accommodation", "vineyard", "restaurant", "pool"],
      "wines": [
        {"id": "w15_1", "name": "Roero Arneis DOCG", "vintage": "2025", "type": "White", "organic": true},
        {"id": "w15_2", "name": "Roero DOCG Riserva Vigna Mombeltramo", "vintage": "2016", "type": "Red", "organic": true},
        {"id": "w15_3", "name": "Roero DOCG Riserva Renesio", "vintage": "2011", "type": "Red", "organic": true}
      ]
    },
    {
      "id": "p23", "desk": "23", "name": "Travaglini", "region": "Piedmont", "city": "Gattinara",
      "market": "imported", "importer": "Fondberg", "contactName": "Cinzia Travaglini", "email": "azienda@travaglinigattinara.it", "icons": [],
      "wines": [
        {"id": "w23_1", "name": "Vino Spumante Nebole 48 Mesi", "vintage": "2020", "type": "Sparkling"},
        {"id": "w23_2", "name": "Gattinara DOCG", "vintage": "2022", "type": "Red"},
        {"id": "w23_3", "name": "Gattinara DOCG Trevigne", "vintage": "2019", "type": "Red"}
      ]
    },
    {
      "id": "p24", "desk": "24", "name": "Vinory", "region": "Piedmont", "city": "Nizza Monferrato",
      "market": "imported", "importer": "Vino Import", "contactName": "Export Desk", "email": "info@vinory.com", "icons": [],
      "wines": [
        {"id": "w24_1", "name": "Barbera d'Asti DOCG Chèrna", "vintage": "2024", "type": "Red"},
        {"id": "w24_2", "name": "Nizza DOCG Bricco", "vintage": "2022", "type": "Red"},
        {"id": "w24_3", "name": "Barolo DOCG Bricco San Pietro", "vintage": "2021", "type": "Red"}
      ]
    }
  ],
  "masterclasses": [
    {
      "id": "mc1",
      "time": "13:00–14:00",
      "title": "The terroirs of Piedmont",
      "speaker": "Francesco Marzola (Nordic Champion Sommelier)",
      "wines": [
        { "id": "w15_1", "producerId": "p15", "producerName": "Malvirà", "name": "Roero Arneis DOCG", "vintage": "2025" },
        { "id": "w23_2", "producerId": "p23", "producerName": "Travaglini", "name": "Gattinara DOCG", "vintage": "2022" },
        { "id": "w3_3", "producerId": "p3", "producerName": "Carlo Revello & Figli", "name": "Barolo DOCG", "vintage": "2022" }
      ]
    }
  ]
};
