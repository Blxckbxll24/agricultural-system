// Script para configurar colecciones y índices en MongoDB
// Base de datos: agricultural_sensors

// Importar el objeto db desde el contexto de MongoDB
const db = db.getSiblingDB("agricultural_sensors")

// Crear colección de datos de sensores con validación de esquema
db.createCollection("sensor_readings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["parcel_id", "sensor_type", "value", "timestamp"],
      properties: {
        parcel_id: {
          bsonType: "int",
          description: "ID de la parcela asociada",
        },
        sensor_type: {
          enum: ["temperature", "humidity", "rain", "solar_radiation"],
          description: "Tipo de sensor",
        },
        value: {
          bsonType: "double",
          description: "Valor de la lectura del sensor",
        },
        unit: {
          bsonType: "string",
          description: "Unidad de medida",
        },
        timestamp: {
          bsonType: "date",
          description: "Timestamp de la lectura",
        },
        quality: {
          bsonType: "string",
          enum: ["good", "fair", "poor"],
          description: "Calidad de la lectura",
        },
        metadata: {
          bsonType: "object",
          description: "Metadatos adicionales",
        },
      },
    },
  },
})

// Crear índices para optimizar consultas
db.sensor_readings.createIndex({ parcel_id: 1, timestamp: -1 })
db.sensor_readings.createIndex({ sensor_type: 1, timestamp: -1 })
db.sensor_readings.createIndex({ timestamp: -1 })
db.sensor_readings.createIndex({ parcel_id: 1, sensor_type: 1, timestamp: -1 })

// Crear índice TTL para auto-eliminar datos antiguos (opcional, después de 90 días)
db.sensor_readings.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 })

// Crear colección para agregaciones y estadísticas
db.createCollection("sensor_statistics", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["parcel_id", "sensor_type", "date", "stats"],
      properties: {
        parcel_id: {
          bsonType: "int",
          description: "ID de la parcela",
        },
        sensor_type: {
          enum: ["temperature", "humidity", "rain", "solar_radiation"],
          description: "Tipo de sensor",
        },
        date: {
          bsonType: "date",
          description: "Fecha de las estadísticas",
        },
        stats: {
          bsonType: "object",
          properties: {
            min: { bsonType: "double" },
            max: { bsonType: "double" },
            avg: { bsonType: "double" },
            count: { bsonType: "int" },
          },
        },
      },
    },
  },
})

db.sensor_statistics.createIndex({ parcel_id: 1, sensor_type: 1, date: -1 })

// Insertar datos de ejemplo
db.sensor_readings.insertMany([
  {
    parcel_id: 1,
    sensor_type: "temperature",
    value: 25.5,
    unit: "°C",
    timestamp: new Date(),
    quality: "good",
    metadata: { sensor_id: "TEMP-001", location: "center" },
  },
  {
    parcel_id: 1,
    sensor_type: "humidity",
    value: 65.2,
    unit: "%",
    timestamp: new Date(),
    quality: "good",
    metadata: { sensor_id: "HUM-001", location: "center" },
  },
  {
    parcel_id: 2,
    sensor_type: "temperature",
    value: 24.8,
    unit: "°C",
    timestamp: new Date(),
    quality: "good",
    metadata: { sensor_id: "TEMP-002", location: "center" },
  },
])

print("MongoDB collections and indexes created successfully!")
