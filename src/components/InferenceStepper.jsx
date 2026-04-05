import { Card, CardContent, Step, StepButton, Stepper, Typography } from '@mui/material';
import { useI18n } from '../i18n/I18nProvider';

export default function InferenceStepper({ steps, activeStep, onStepChange }) {
  const { t } = useI18n();

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>{t('steps.title')}</Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.id} completed={index < activeStep}>
              <StepButton color="inherit" onClick={() => onStepChange(index)}>
                {step.label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
}
