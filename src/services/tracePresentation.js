import { getLocalizedDidactic } from '../content/stepContent';

export function localizeSteps(steps = [], t, locale) {
  return steps.map((step) => ({
    ...step,
    label: t(`step.${step.id}.label`),
    description: step.id === 'attention'
      ? t(`step.${step.id}.description.${step.payload?.available ? 'available' : 'unavailable'}`)
      : t(`step.${step.id}.description`),
    didactic: getLocalizedDidactic(step.id, locale),
  }));
}
