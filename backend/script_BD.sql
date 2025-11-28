-- Database: red_actividades

-- DROP DATABASE IF EXISTS red_actividades;

CREATE DATABASE red_actividades
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;






-- Borrar Tablas
Drop table Usuario;
Drop table Recuerdo;
Drop table Actividad;

--Crear Tablas
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150),
    email VARCHAR(150) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    fecha_nac DATE,
    sexo BOOLEAN,
    foto_perfil TEXT,
    biografia TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_conexion TIMESTAMP,
    ubicacion VARCHAR(150) --¿GEOGRAPHY / POINT?
);


CREATE TABLE Recuerdo (
    id_recuerdo SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_actividad INT ,--puede ser nulo porque se puede borrar una activdad y el recuerdo seguirá existiendo
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imagenes TEXT[]
);

CREATE TABLE Actividad (
    id_actividad SERIAL PRIMARY KEY,
    id_creador INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    titulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    ubicacion VARCHAR(150),
    publica BOOLEAN NOT NULL,
    participantes_max INT DEFAULT 0,
    imagenes TEXT[],  -- lista de rutas
   -- tags INT[4],     -- lista de 1 a 4 id_tag
    estado VARCHAR(20) CHECK (estado IN ('activa', 'finalizada', 'cancelada')) DEFAULT 'activa'
);

/*
CREATE TABLE Usuario_Actividad (
    id_usuario INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    id_actividad INT REFERENCES Actividad(id_actividad) ON DELETE CASCADE,
    PRIMARY KEY (id_usuario, id_actividad)
);
*/

CREATE TABLE Participacion(
	id_usuario INT NOT NULL,
	id_actividad INT NOT NULL,
	PRIMARY KEY (id_usuario, id_actividad),
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	aceptada BOOLEAN NOT NULL, 
	es_creador BOOLEAN NOT NULL, --no se si se quedará
	
	FOREIGN KEY (id_usuario)
    REFERENCES Usuario(id_usuario)
    ON DELETE CASCADE,

    FOREIGN KEY (id_actividad)
    REFERENCES Actividad(id_actividad)
    ON DELETE CASCADE
);

CREATE TABLE Chat_individual(
	id_chat_individual SERIAL PRIMARY KEY,
	id_usuario1 INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    id_usuario2 INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
	UNIQUE(id_usuario1, id_usuario2),
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	ultimo_mensaje INT --id del mensaje
);

CREATE TABLE Chat_actividad(
	id_chat_actividad SERIAL PRIMARY KEY,
	id_actividad INT UNIQUE REFERENCES Actividad(id_actividad) ON DELETE CASCADE,
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	ultimo_mensaje INT --id del mensaje
);

CREATE TABLE Mensaje(
	id_mensaje SERIAL PRIMARY KEY,
	id_chat_individual INT ,
    id_chat_actividad INT ,
	id_emisor INT NOT NULL,
	contenido TEXT,
	fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	leido BOOLEAN NOT NULL,

	FOREIGN KEY (id_emisor)
    REFERENCES Usuario(id_usuario)
    ON DELETE CASCADE,

  FOREIGN KEY (id_chat_individual)
    REFERENCES Chat_Individual(id_chat_individual)
    ON DELETE CASCADE,

  FOREIGN KEY (id_chat_actividad)
    REFERENCES Chat_Actividad(id_chat_actividad)
    ON DELETE CASCADE,

  CHECK (
    (id_chat_individual IS NOT NULL AND id_chat_actividad IS NULL)
    OR (id_chat_individual IS NULL AND id_chat_actividad IS NOT NULL)
  )
);

CREATE TABLE Tag (
    id_tag SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Actividad_Tag (
    id_actividad INT REFERENCES Actividad(id_actividad) ON DELETE CASCADE,
    id_tag INT REFERENCES Tag(id_tag) ON DELETE CASCADE,
    PRIMARY KEY (id_actividad, id_tag)
);

CREATE TABLE Solicitud_Amistad (
    PRIMARY KEY (id_emisor, id_receptor),
    id_emisor INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    id_receptor INT REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
	fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')) DEFAULT 'pendiente'
);

CREATE TABLE Amistad(
	PRIMARY KEY (id_usuario1, id_usuario2),
	id_usuario1 INT NOT NULL,
    id_usuario2 INT NOT NULL,
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (id_usuario1)
    REFERENCES Usuario(id_usuario)
    ON DELETE CASCADE,

    FOREIGN KEY (id_usuario2)
    REFERENCES Usuario(id_usuario)
    ON DELETE CASCADE,

  CHECK (id_usuario1 <> id_usuario2)
);

CREATE TABLE Notificacion (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario_receptor INT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(30) CHECK (
        tipo IN (
            'solicitud_amistad',
            'chat',
            'union_actividad',
            'creacion_actividad',
            'actualizacion_actividad',
			'solicitud_union_actividad',
            'posibilidad_recuerdo',
            'creacion_recuerdo'
        )
    ) NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    id_referencia INT --(id_actividad, id_chat_individual, id_chat_actividad, idEmisor_de_solicitud_amistad)
);

CREATE TABLE Comentario(
	id_comentario SERIAL PRIMARY KEY,
	id_usuario INT NOT NULL,
	id_recuerdo INT NOT NULL,
	mensaje TEXT NOT NULL,
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario)
    REFERENCES Usuario(id_usuario)
    ON DELETE CASCADE,

    FOREIGN KEY (id_recuerdo)
    REFERENCES Recuerdo(id_recuerdo)
    ON DELETE CASCADE
);

CREATE TABLE Like_Megusta(
	id_like SERIAL PRIMARY KEY,
	id_usuario INT NOT NULL,
	id_comentario INT,
	id_recuerdo INT,
	fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	

	FOREIGN KEY (id_usuario)
    REFERENCES Usuario(id_usuario)
    ON DELETE CASCADE,

    FOREIGN KEY (id_comentario)
    REFERENCES Comentario(id_comentario)
    ON DELETE CASCADE,

    FOREIGN KEY (id_recuerdo)
    REFERENCES Recuerdo(id_recuerdo)
    ON DELETE CASCADE,
	
	  CHECK (
	    (id_comentario IS NOT NULL AND id_recuerdo IS NULL)
	    OR (id_comentario IS NULL AND id_recuerdo IS NOT NULL),
	  )
	  
	  
	UNIQUE (id_usuario, id_comentario),
	UNIQUE (id_usuario, id_recuerdo)
);



--Relaciones

-- Usuario 1:N Recuerdo. Un usuario puede tener muchos recuerdos.
ALTER TABLE Recuerdo
ADD CONSTRAINT fk_recuerdo_usuario
FOREIGN KEY (id_usuario)
REFERENCES Usuario (id_usuario)
ON DELETE CASCADE;
--Usuario 1:N Notificacion.
ALTER TABLE Notificacion
ADD CONSTRAINT fk_notificacion_usuario
FOREIGN KEY (id_usuario_receptor) REFERENCES Usuario(id_usuario)
ON DELETE CASCADE;
--Usuario 1:N Like_Megusta
ALTER TABLE Like_Megusta
ADD CONSTRAINT fk_like_usuario
FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
ON DELETE CASCADE;
--Usuario 1:N Actividad (crear)
ALTER TABLE Actividad
ADD CONSTRAINT fk_actividad_creador
FOREIGN KEY (id_creador)
REFERENCES Usuario (id_usuario)
ON DELETE CASCADE;
--Usuario 1:N solicitud (emisor) envia varias solicitudes
ALTER TABLE Solicitud_Amistad
ADD CONSTRAINT fk_emisor
  FOREIGN KEY (id_emisor)
  REFERENCES Usuario(id_usuario)
  ON DELETE CASCADE,
--Usuario 1:N solicitud (receptor) recive varias solicitudes
ADD CONSTRAINT fk_receptor
  FOREIGN KEY (id_receptor)
  REFERENCES Usuario(id_usuario)
  ON DELETE CASCADE;


--Actividad 1:N Recuerdo
ALTER TABLE Recuerdo
ADD CONSTRAINT fk_recuerdo_actividad
FOREIGN KEY (id_actividad)
REFERENCES Actividad (id_actividad)
ON DELETE SET NULL;











--Datos
--Usuarios
INSERT INTO Usuario (
  nombre_usuario, nombre, apellidos, email, contraseña,
  fecha_nac, sexo, foto_perfil, biografia, fecha_registro,
  ultima_conexion, ubicacion
)
VALUES 
(
  'juanma23',
  'Juan Manuel',
  'Pérez García',
  'juanma23@example.com',
  'hashed_password_123',  -- normalmente se guarda un hash (bcrypt)
  '1999-04-15',
  TRUE,  -- TRUE = hombre, FALSE = mujer (según tu diseño)
  'https://example.com/img/juanma23.jpg',
  'Apasionado del deporte y la tecnología. Me gusta organizar partidos los fines de semana.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'Madrid'
),
(
  'laura_sport',
  'Laura',
  'Fernández López',
  'laura.sport@example.com',
  'hashed_password_456',
  '2001-11-02',
  FALSE,
  'https://example.com/img/laura_sport.jpg',
  'Me encanta correr y conocer gente nueva. Busco actividades cerca del centro.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  'Barcelona'
);


--Actividades

INSERT INTO Actividad (
  id_creador, titulo, descripcion, fecha_creacion, fecha_inicio, fecha_fin,
  ubicacion, publica, participantes_max, imagenes, estado
)
VALUES (
  1,
  'Partido de fútbol 7 en Retiro',
  'Organizo un partido de fútbol 7 este sábado en el parque del Retiro. Nivel intermedio.',
  CURRENT_TIMESTAMP,
  '2025-11-09 10:00:00',
  '2025-11-09 12:00:00',
  'Madrid - Parque del Retiro',
  TRUE,
  14,
  ARRAY['https://example.com/img/futbol1.jpg', 'https://example.com/img/futbol2.jpg'],
--  ARRAY[1, 2, 3],  -- suponiendo que existen tags con id 1=deporte, 2=futbol, 3=aire libre
  'activa'
),
 (
  2,
  'Café y charla sobre tecnología',
  'Encuentro informal para hablar sobre IA y desarrollo web. Abierto a todos los niveles.',
  CURRENT_TIMESTAMP,
  '2025-11-10 18:00:00',
  NULL,
  'Barcelona - Café Central',
  TRUE,
  10,
  ARRAY['https://example.com/img/cafe1.jpg'],
--  ARRAY[4, 5, 6],  -- ejemplo de tags: 4=social, 5=tecnología, 6=charla
  'activa'
);


--Participaciones
INSERT INTO Participacion (id_usuario, id_actividad,fecha_creacion, aceptada, es_creador)
VALUES
(1, 1, CURRENT_TIMESTAMP, TRUE, TRUE ),   -- Juan crea la actividad 1
(2, 1, CURRENT_TIMESTAMP, FALSE, FALSE),  -- Laura se une a la actividad 1
(2, 2, CURRENT_TIMESTAMP, TRUE, TRUE);   -- Laura crea la actividad 2


--Tag
INSERT INTO Tag (nombre)
VALUES
('Aire libre'),   
('Sendero'), 
('Naturaleza'),   
('Deporte'), 
('Juego en equipo'),   
('Fit'), 
('Aventura');   

--Actividad tag

INSERT INTO Actividad_Tag (id_actividad, id_tag)
VALUES
(1, 1),   
(1, 3),
(1, 4),   
(2, 7),
(2, 1),
(2, 4);   


