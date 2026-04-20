# Prueba Técnica - Gestión de Usuarios con Doble Persistencia (SQL & NoSQL)

## 🚀 Descripción

Esta aplicación es una API REST desarrollada con **NestJS** diseñada para gestionar usuarios y sus historiales de cambios. El sistema destaca por utilizar una arquitectura de **doble persistencia**, sincronizando la información en tiempo real entre una base de datos relacional (**MySQL**) y una no relacional (**MongoDB**).

## 🛠️ Stack Tecnológico

- **Framework:** NestJS
- **ORM (SQL):** TypeORM con MySQL
- **ODM (NoSQL):** Mongoose con MongoDB
- **Notificaciones:** Twilio API
- **Validación:** Class-validator y Class-transformer

## 🧠 Arquitectura y Decisiones Técnicas

### 1. Estrategia de Sincronización (Efecto Espejo)

Para garantizar que la información sea consistente, el sistema implementa una lógica de **Doble Escritura**. Cada vez que se realiza una acción (Crear, Actualizar o Eliminar), el `UserService` coordina ambas bases de datos para que contengan la misma información. Esto asegura una alta disponibilidad de los datos.

### 2. Especialización de Bases de Datos

Aunque ambas bases de datos contienen la misma información, se integraron bajo los siguientes criterios de especialidad:

- **MySQL:** Se utiliza como la fuente de verdad principal para los datos de usuario, aprovechando su estructura rígida para evitar duplicados y mantener la integridad.
- **MongoDB:** Se utiliza para el almacenamiento del historial. Dado que los logs crecen rápidamente y son datos de "solo lectura", un motor NoSQL ofrece mejor escalabilidad para manejar grandes volúmenes de registros de auditoría.

### 3. Historial Automático de Cambios (Diffing)

Se implementó una lógica personalizada para detectar cambios. Al actualizar un usuario, el sistema compara el estado anterior con el nuevo y guarda únicamente los campos modificados.

- **Ejemplo de log:** `{ antes: { telefono: "123" }, despues: { telefono: "456" } }`

### 4. Integración con Twilio

El proyecto incluye un servicio de notificaciones que permite enviar mensajes SMS reales a los usuarios registrados, integrando la API de Twilio de forma directa en el flujo de trabajo.

## 5. Arquitectura del proyecto

El proecto fue desarrollado utilizando el framework NestJS, siguiendo una arquitectura modular que garantiza la escalabilidad el mantenimiento limpio del codigo

- **Organiazacíon del codigo:** Se implemento una estructura de MODULOS, donde cada entidad (User) encapsula su propia logica, controladores servicios.

- **Separación de lógica de negocio (service laered):** se aplico el principio de responsabilidad unica para la cual cada una de las partes de la entidad se encarga de lo que corresponde, por ejemplo: El controller de user se encarga unicamente de manejar las peticiones HTTP y retornar las respuestas, en el service se encuentra la lógica de negocio donde el mismo gestiona la comunicacion entre las bases de datos la integracion con el servicio de Twilio

## 📦 Instalación

1.  Clonar el repositorio:
    ```bash
    git clone https://github.com/LucasEP20/PruebaTecnica-Palacios
    ```
2.  Instalar las dependencias:
    ```bash
    npm install
    ```
3.  Configurar las variables de entorno en un archivo `.env` (ver sección de Configuración).
4.  Crear la base de datos en MySQL manualmente (ejemplo: `CREATE DATABASE nombre_db;`).

## ⚙️ Configuración (.env)

Es necesario contar con las siguientes variables para el correcto funcionamiento:

```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_password
DB_NAME=nombre_de_tu_db

# MongoDB
MONGO_URI=mongodb://localhost:27017/nombre_de_tu_db

# Twilio
TWILIO_ACCOUNT_SID=tu_sid
TWILIO_AUTH_TOKEN=tu_token
TWILIO_PHONE_NUMBER=tu_numero_twilio
```
### 📡 Endpoints de la API

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| **POST** | `/api/users` | Crea un nuevo usuario en **MySQL** y sincroniza con **MongoDB**. |
| **GET** | `/api/users` | Lista todos los usuarios registrados en el sistema. |
| **GET** | `/api/users/:id` | Obtiene el detalle completo de un usuario específico por su ID. |
| **PUT** | `/api/users/:id` | Actualiza los datos y genera automáticamente el **historial de cambios**. |
| **DELETE** | `/api/users/:id` | Elimina al usuario de ambos sistemas de base de datos. |
| **GET** | `/api/users/:id/historial` | Consulta la bitácora de cambios y auditoría en **MongoDB**. |
| **POST** | `/api/users/:id/notify` | Envía una notificación **SMS real** al usuario vía **Twilio**. |


## 6. Desafios y soluciones

1. Sincronizacion de bases de datos: se implemento dentro de cada operacion inportante del sistema (escritura, lectura, etc) donde cada operacion en MYSQL es seguida por la creacion de documento en MongoDB. Si la operacion principal falla, el sistema lanza una excepcion evitando registros huerfanos

2. Normalizacion de formatos entre SQL y NoSQL: MySQL utiliza IDs numericos autoincrementales(number) mientras que Mongodb genera por defecto OBJECTIDs complejos. Para solucionar esto se diseño un modelo de datos en mongo que acepta el userID como un string o number proveniente de MySQL para mantener la referencia cruzada. Se utilizaron DTOs para transformar y limpiar los objetos antes de ser persistidos

3. Integracion con Twilio: Nunca antes habia utilizado esta integracion, por la cual tuve que leer documentacion, foros y un video para entender como es que funcionaba. Ademas al usar una cuenta Trial las funciones a las cuales podia acceder eran limitadas por lo que cada cambio en el codigo lo tenia que pensar minimo 10 veces antes de probar.
