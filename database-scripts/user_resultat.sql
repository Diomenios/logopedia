CREATE TABLE User(
  numero_patient INT AUTO_INCREMENT NOT NULL,
  nom VARCHAR(30) NOT NULL,
  prenom VARCHAR(30) NOT NULL,
  email VARCHAR(100) NOT NULL,
  PRIMARY KEY(numero_patient)
);

CREATE TABLE Resultats(
  id_sauvegarde INT AUTO_INCREMENT NOT NULL,
  numero_patient INT NOT NULL,
  resultat_image INT NOT NULL,
  nombre_image INT NOT NULL,
  feedback VARCHAR(1500) NOT NULL,
  date_activite DATETIME NOT NULL,
  id_activites INT NOT NULL,
  PRIMARY KEY(id_sauvegarde),
  FOREIGN KEY(numero_patient)
    REFERENCES User(numero_patient)
    ON UPDATE CASCADE ON DELETE RESTRICT
);