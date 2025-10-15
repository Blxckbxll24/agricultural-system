// Shared in-memory storage for sensor data across API routes
export let sensorDatabase: any[] = []

export function addSensorRecords(records: any[]) {
  sensorDatabase = [...sensorDatabase, ...records]
  return sensorDatabase.length
}

export function getSensorRecords() {
  return sensorDatabase
}

export function clearSensorRecords() {
  const count = sensorDatabase.length
  sensorDatabase = []
  return count
}

export function getSensorStats() {
  if (sensorDatabase.length === 0) {
    return null
  }

  const temps = sensorDatabase.map((r) => r.temperature)
  const humidities = sensorDatabase.map((r) => r.humidity)
  const rains = sensorDatabase.map((r) => r.rain)
  const radiations = sensorDatabase.map((r) => r.solar_radiation)

  return {
    count: sensorDatabase.length,
    avgTemperature: temps.reduce((a, b) => a + b, 0) / temps.length,
    avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
    totalRain: rains.reduce((a, b) => a + b, 0),
    avgSolarRadiation: radiations.reduce((a, b) => a + b, 0) / radiations.length,
  }
}
