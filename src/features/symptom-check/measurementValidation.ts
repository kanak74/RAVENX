import type {
  HealthMeasurementsState,
  MeasuredTemperatureInput,
  TemperatureUnit,
  ValidatedBloodPressureResult,
  ValidatedHeartRateResult,
  ValidatedMeasurementsSummary,
  ValidatedSpo2Result,
  ValidatedTemperatureResult,
} from './types'

export function toCelsius(value: number, unit: TemperatureUnit): number {
  const c = unit === 'F' ? ((value - 32) * 5) / 9 : value
  return Math.round(c * 10) / 10
}

export function toFahrenheit(value: number, unit: TemperatureUnit): number {
  const f = unit === 'C' ? (value * 9) / 5 + 32 : value
  return Math.round(f * 10) / 10
}

/**
 * Validates human body temperature measurements strictly.
 * Rejects nonsensical/impossible readings and warns on room-air-range entries (< 34.0°C / 93.2°F)
 * so ambient air temperatures are never mistaken for body temperature readings.
 */
export function validateTemperatureInput(
  input?: MeasuredTemperatureInput,
): ValidatedTemperatureResult {
  const raw = input?.value?.trim() ?? ''
  if (!raw) {
    return { provided: false, valid: true }
  }

  const unit: TemperatureUnit = input?.unit === 'F' ? 'F' : 'C'
  const num = Number(raw)
  if (!Number.isFinite(num) || raw.includes(' ')) {
    return {
      provided: true,
      valid: false,
      rawValue: raw,
      unit,
      error: `Enter a numeric temperature (e.g. ${unit === 'C' ? '37.5' : '99.5'}).`,
    }
  }

  const celsius = toCelsius(num, unit)
  const fahrenheit = toFahrenheit(num, unit)

  if (celsius >= 10.0 && celsius < 34.0) {
    return {
      provided: true,
      valid: false,
      rawValue: raw,
      unit,
      celsius,
      fahrenheit,
      site: input?.site,
      isLikelyAmbientError: true,
      error:
        'This value looks like ambient or room temperature rather than core human body temperature (typically 36.5°C–37.3°C / 97.7°F–99.1°F). Please re-measure on the body with a thermometer.',
    }
  }

  const minBound = unit === 'C' ? 30.0 : 86.0
  const maxBound = unit === 'C' ? 44.0 : 111.2
  if (num < minBound || num > maxBound) {
    return {
      provided: true,
      valid: false,
      rawValue: raw,
      unit,
      error: `Entered ${raw}°${unit} is outside valid thermometer range (${minBound}°${unit}–${maxBound}°${unit}). Please check the unit or reading.`,
    }
  }

  let classification: ValidatedTemperatureResult['classification'] = 'normal'
  let note =
    'Within typical adult resting range (~36.5°C–37.3°C / 97.7°F–99.1°F, MedlinePlus reference).'

  if (celsius < 35.0) {
    classification = 'hypothermia-risk'
    note =
      'Below 35.0°C (95.0°F) can indicate abnormally low body temperature (hypothermia) and warrants urgent evaluation if confirmed.'
  } else if (celsius < 36.1) {
    classification = 'below-normal'
    note =
      'Slightly below the usual ~36.5°C–37.3°C average; re-check positioning if measured under the arm or forehead.'
  } else if (celsius >= 40.0) {
    classification = 'very-high-fever'
    note =
      'At or above 40.0°C (104.0°F) is a very high fever that needs prompt medical evaluation.'
  } else if (celsius >= 39.4) {
    classification = 'high-fever'
    note =
      'At or above 39.4°C (103.0°F) is a high fever; medical consultation is advisable, especially if persistent or with other symptoms.'
  } else if (celsius >= 38.0) {
    classification = 'fever'
    note =
      'At or above 38.0°C (100.4°F) meets standard CDC / MedlinePlus thresholds for a measured fever.'
  } else if (celsius > 37.3) {
    classification = 'mildly-elevated'
    note =
      'Slightly above typical resting average (37.4°C–37.9°C / 99.3°F–100.2°F); monitor over the next few hours.'
  }

  return {
    provided: true,
    valid: true,
    celsius,
    fahrenheit,
    unit,
    rawValue: raw,
    site: input?.site,
    classification,
    note,
  }
}

export function validateBloodPressureInput(input?: {
  systolic: string
  diastolic: string
}): ValidatedBloodPressureResult {
  const sysRaw = input?.systolic?.trim() ?? ''
  const diaRaw = input?.diastolic?.trim() ?? ''

  if (!sysRaw && !diaRaw) {
    return { provided: false, valid: true }
  }

  if (!sysRaw || !diaRaw) {
    return {
      provided: true,
      valid: false,
      error: 'Enter both top (systolic) and bottom (diastolic) blood pressure numbers.',
    }
  }

  const systolic = Number(sysRaw)
  const diastolic = Number(diaRaw)

  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) {
    return {
      provided: true,
      valid: false,
      error: 'Blood pressure numbers must be valid whole digits (e.g. 118 / 76).',
    }
  }

  if (systolic < 50 || systolic > 260 || diastolic < 30 || diastolic > 160) {
    return {
      provided: true,
      valid: false,
      error:
        'Blood pressure appears out of realistic human range (systolic 50–260, diastolic 30–160 mmHg).',
    }
  }

  if (systolic <= diastolic) {
    return {
      provided: true,
      valid: false,
      error:
        'Top number (systolic) should be higher than bottom number (diastolic).',
    }
  }

  let classification: ValidatedBloodPressureResult['classification'] = 'normal'
  let note =
    'Within typical adult resting range (~90/60 to below 120/80 mmHg, MedlinePlus reference).'

  if (systolic >= 180 || diastolic >= 120) {
    classification = 'crisis-range'
    note =
      'Very elevated reading (180/120 mmHg or above). Seek immediate medical help if accompanied by headache, chest pain, breathlessness, or vision changes.'
  } else if (systolic >= 130 || diastolic >= 80) {
    classification = 'high'
    note =
      'Above typical resting levels; repeated elevated readings should be discussed with a doctor.'
  } else if (systolic >= 120 && diastolic < 80) {
    classification = 'elevated-stage'
    note = 'Mildly elevated above 120/80 mmHg; context such as pain, stress, or fever can affect temporary readings.'
  } else if (systolic < 90 || diastolic < 60) {
    classification = 'low'
    note =
      'Below 90/60 mmHg (low blood pressure range); especially meaningful if causing dizziness, faintness, or weakness.'
  }

  return {
    provided: true,
    valid: true,
    systolic: Math.round(systolic),
    diastolic: Math.round(diastolic),
    classification,
    note,
  }
}

export function validateHeartRateInput(
  rawValue?: string,
): ValidatedHeartRateResult {
  const raw = rawValue?.trim() ?? ''
  if (!raw) {
    return { provided: false, valid: true }
  }

  const bpm = Number(raw)
  if (!Number.isFinite(bpm)) {
    return {
      provided: true,
      valid: false,
      error: 'Enter a valid numeric heart rate in beats per minute (bpm).',
    }
  }

  if (bpm < 25 || bpm > 240) {
    return {
      provided: true,
      valid: false,
      error: 'Heart rate must be between 25 and 240 bpm.',
    }
  }

  let classification: ValidatedHeartRateResult['classification'] = 'normal'
  let note = 'Within usual adult resting range of 60–100 bpm (MedlinePlus reference).'

  if (bpm >= 130) {
    classification = 'high-resting'
    note =
      'Markedly elevated resting heart rate (130 bpm or above); urgent assessment is advised if it persists at rest or occurs with discomfort.'
  } else if (bpm > 100) {
    classification = 'elevated'
    note =
      'Above 100 bpm; fever, discomfort, anxiety, or exertion can raise heart rate temporarily.'
  } else if (bpm < 50) {
    classification = 'low'
    note =
      'Below 50 bpm; can be normal in trained athletes, but important to check with a clinician if feeling dizzy or fatigued.'
  }

  return {
    provided: true,
    valid: true,
    bpm: Math.round(bpm),
    classification,
    note,
  }
}

export function validateSpo2Input(rawValue?: string): ValidatedSpo2Result {
  const raw = rawValue?.trim() ?? ''
  if (!raw) {
    return { provided: false, valid: true }
  }

  const percent = Number(raw)
  if (!Number.isFinite(percent)) {
    return {
      provided: true,
      valid: false,
      error: 'Enter oxygen saturation as a percentage (e.g. 98).',
    }
  }

  if (percent < 50 || percent > 100) {
    return {
      provided: true,
      valid: false,
      error: 'Oxygen saturation (SpO2) must be between 50% and 100%.',
    }
  }

  let classification: ValidatedSpo2Result['classification'] = 'normal'
  let note = 'Within typical room-air pulse oximeter range of 95%–100%.'

  if (percent < 90) {
    classification = 'critical-low'
    note =
      'Below 90% is critically low oxygen saturation — seek emergency medical evaluation immediately.'
  } else if (percent < 95) {
    classification = 'low-caution'
    note =
      'Below typical 95%–100% baseline; re-check warm finger placement and seek prompt medical advice, especially if short of breath.'
  }

  return {
    provided: true,
    valid: true,
    percent: Math.round(percent),
    classification,
    note,
  }
}

export function validateAllMeasurements(
  measurements: HealthMeasurementsState,
): ValidatedMeasurementsSummary {
  const temperature = validateTemperatureInput(measurements.temperature)
  const bloodPressure = validateBloodPressureInput(measurements.bloodPressure)
  const heartRate = validateHeartRateInput(measurements.heartRate)
  const spo2 = validateSpo2Input(measurements.spo2)

  const hasAnyEntered =
    temperature.provided ||
    bloodPressure.provided ||
    heartRate.provided ||
    spo2.provided

  const hasErrors =
    !temperature.valid ||
    !bloodPressure.valid ||
    !heartRate.valid ||
    !spo2.valid

  return {
    hasAnyEntered,
    hasErrors,
    temperature,
    bloodPressure,
    heartRate,
    spo2,
  }
}
